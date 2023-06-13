import { BigNumber, BigNumberish, utils } from 'ethers';
import { l2Networks } from '@arbitrum/sdk/dist/lib/dataEntities/networks';
import { NodeInterface__factory } from '@arbitrum/sdk/dist/lib/abi/factories/NodeInterface__factory';
import { EventFetcher, L2TransactionReceipt } from '@arbitrum/sdk';
import { RollupUserLogic__factory } from '@connext/smart-contracts';

import { RootMessage, type InitialSetupProcessFromRoot, type ProcessFromRootParams } from '../../utils/types';

const NODE_INTERFACE_ADDRESS = '0x00000000000000000000000000000000000000C8';

export const getProcessFromArbitrumRootArgs = async (
  { sent_transaction_hash: sendHash }: RootMessage,
  { arbProvider, provider, environment }: InitialSetupProcessFromRoot
): Promise<ProcessFromRootParams> => {
  // // // Things that are needed:
  // // uint64 _nodeNum, x
  // // bytes32 _sendRoot, x
  // // bytes32 _blockHash, x
  // // bytes32[] calldata _proof, x
  // // uint256 _index, x
  // // L2Message calldata _message x
  // // get the tx
  const tx = await arbProvider.getTransactionReceipt(sendHash);
  const l2TxnReceipt = new L2TransactionReceipt(tx);
  // @ts-ignore
  const dataIsOnL1 = await l2TxnReceipt.isDataAvailable(spokeJsonProvider);
  if (!dataIsOnL1) {
    throw new Error('No root available');
  }
  // get the proof
  const [reader] = await l2TxnReceipt.getL2ToL1Messages(provider);
  const msg = (reader as any).nitroReader;
  if (!msg?.event) {
    throw new Error(`Could not find event for message in ${sendHash}`);
  }
  // get the index
  const index = msg.event.position;
  // construct the l2 message information
  const l2Message = {
    l2Sender: msg.event.caller,
    to: msg.event.destination,
    l2Block: msg.event.arbBlockNum,
    l1Block: msg.event.ethBlockNum,
    l2Timestamp: msg.event.timestamp,
    value: msg.event.callvalue,
    callData: msg.event.data,
  };
  // get the node number by finding the node created event with matching send
  // root.
  // a node is the bit of data that includes the l2 state that will eventually
  // get posted into an outbox (where the messages are proven against once the
  // fraud period elapses). because the node is not directly user facing, there are
  // not many utility methods for accessing it. you can get the node num in two ways:
  // 1. Find the `NodeCreated` event where the currentInboxSize > the l2->l1 message
  //    sequence number. Sample of finding this event can be seen here:
  //    https://github.com/OffchainLabs/arbitrum-sdk/blob/0151a79ed37a65033991bb107d6e1072bfc052c0/src/lib/message/L2ToL1Message.ts#L397-L455
  //    NOTE: this was the original method tried, but failed to find the correct node
  //    created event (it was failing when verifying the sendRoot in the connector)
  // 2. (not used) Calculate the send root and the item hash using the `Outbox.sol` interface, then
  //    find the event emitted after the `ethBlockNum` of the message containing a matching
  //    sendRoot. Find the nodeNum from this event, and submit to chain (seen below)
  const arbNetwork = l2Networks[environment === 'mainnet' ? 42161 : 421613];
  const latest = await provider.getBlockNumber();
  const fetcher = new EventFetcher(provider);
  const logs = await fetcher.getEvents(RollupUserLogic__factory as any, (t) => t.filters.NodeCreated(), {
    fromBlock: msg.event.ethBlockNum.toNumber(),
    toBlock: latest,
  });

  if (logs.length === 0) {
    throw new Error('ArbitrumNodeCreatedEventsNotFound');
  }

  // use binary search to find the first node with sendCount > this.event.position
  // default to the last node since we already checked above
  let foundLog = logs[logs.length - 1];
  let left = 0;
  let right = logs.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const log = logs[mid];
    const block = await msg.getBlockFromNodeLog(arbProvider, log);
    const sendCount = BigNumber.from(block.sendCount);
    if (sendCount.gt(msg.event.position as BigNumberish)) {
      foundLog = log;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  const earliestNodeWithExit = foundLog.event.nodeNum;
  const rollup = RollupUserLogic__factory.getContract(arbNetwork.ethBridge.rollup, RollupUserLogic__factory.abi);
  const foundBlock = await msg.getBlockFromNodeNum(rollup.connect(provider), earliestNodeWithExit, arbProvider);

  // verify confirm data to ensure the node is correct
  const rollupLogic = RollupUserLogic__factory.connect(arbNetwork.ethBridge.rollup, provider);
  const node = await rollupLogic.getNode(earliestNodeWithExit);

  const confirmData = node.confirmData.toLowerCase() as string;
  const encoded = utils.keccak256(utils.defaultAbiCoder.encode(['bytes32', 'bytes32'], [foundBlock.hash, foundBlock.sendRoot])).toLowerCase();
  if (confirmData !== encoded) {
    throw new Error('ConfirmDataDoesNotMatch');
  }

  if (node.stakerCount.toNumber() == 0 || node.childStakerCount.toNumber() == 0) {
    throw new Error('RollUpNodeStaked');
  }

  // get the proof
  const params = await NodeInterface__factory.connect(NODE_INTERFACE_ADDRESS, arbProvider).constructOutboxProof(
    foundBlock.sendCount.toNumber() as number,
    msg.event.position.toNumber() as number
  );

  // generate the args to submit
  const encodedData = utils.defaultAbiCoder.encode(
    [
      'tuple(bytes32,bytes32,bytes32[],uint256,tuple(address l2Sender,address to,uint256 l2Block,uint256 l1Block,uint256 l2Timestamp,uint256 value,bytes callData))',
    ],
    [[earliestNodeWithExit, foundBlock.sendRoot, foundBlock.hash, params.proof, index, l2Message]]
  );

  return { encodedData };
};

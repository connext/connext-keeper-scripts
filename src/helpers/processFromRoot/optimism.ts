import {CrossChainMessenger, MessageStatus} from '@eth-optimism/sdk';
import {utils} from 'ethers';
import {type InitialSetupProcessFromRoot, type ProcessFromRootParameters, type RootMessage} from '../../utils/types';

export const getProcessFromOptimismRootArgs = async (
  {sent_transaction_hash: sendHash}: RootMessage,
  {optProvider, provider, environment}: InitialSetupProcessFromRoot,
): Promise<ProcessFromRootParameters> => {
  // When processing from root on optimism, you need the following information:
  //   address _target, -> connector
  //   address _sender, -> mirror connector
  //   bytes memory _message, -> calldata
  //   uint256 _messageNonce, -> ?
  //   L2MessageInclusionProof memory _proof -> taken from sdk

  // create the messenger
  const messenger = new CrossChainMessenger({
    l2ChainId: environment === 'mainnet' ? 10 : 420,
    l2SignerOrProvider: optProvider,
    l1ChainId: environment === 'mainnet' ? 1 : 5,
    l1SignerOrProvider: provider,
    bedrock: true,
  });

  // Handle bedrock proof
  const status = await messenger.getMessageStatus(sendHash);
  if (status !== MessageStatus.READY_TO_PROVE) {
    throw new Error(`Optimism message status is not ready to prove: ${status}`);
  }

  // Get the message
  const resolved = await messenger.toCrossChainMessage(sendHash);
  const {messageNonce: nonce, sender, target, value, message: data, minGasLimit: gasLimit} = await messenger.toLowLevelMessage(resolved);

  // Get the tx
  const tx = {
    nonce: nonce.toString(),
    sender,
    target,
    value,
    gasLimit,
    data,
  };

  // Get the proof
  const proof = await messenger.getBedrockMessageProof(sendHash);
  if (!proof) {
    throw new Error('NoRootAvailable');
  }

  const {l2OutputIndex, outputRootProof, withdrawalProof} = proof;

  // Format arguments
  const encodedData = utils.defaultAbiCoder.encode(
    [
      'tuple(tuple(uint256 nonce,address sender,address target,uint256 value,uint256 gasLimit,bytes data),uint256,tuple(bytes32 version,bytes32 stateRoot,bytes32 messagePasserStorageRoot,bytes32 latestBlockhash),bytes[])',
    ],
    [[tx, l2OutputIndex, outputRootProof, withdrawalProof]],
  );
  return {encodedData};
};

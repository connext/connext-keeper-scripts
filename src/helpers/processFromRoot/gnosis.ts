import {utils} from 'ethers';
import {getGnosisSdk} from '@dethcrypto/eth-sdk-client';
import {type InitialSetupProcessFromRoot, type ProcessFromRootParameters, type RootMessage} from '../../utils/types';

export const getProcessFromGnosisRootArgs = async (
  {block_number: blockNumber}: RootMessage,
  {gnoProvider}: InitialSetupProcessFromRoot,
): Promise<ProcessFromRootParameters> => {
  const sdk = getGnosisSdk(gnoProvider);

  const events = await sdk.amb.queryFilter('UserRequestForSignature' as any, blockNumber, blockNumber);
  const userRequestForSignatureEvt = events[0];
  const log = sdk.amb.interface.parseLog(userRequestForSignatureEvt);

  const {encodedData} = log.args;
  const signature = await sdk.ambHelper.getSignatures(encodedData);
  const data = utils.defaultAbiCoder.encode(['tuple(bytes,bytes)'], [[encodedData, signature]]);
  return {encodedData: data};
};

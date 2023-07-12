import {utils} from 'ethers';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {type ExtraPropagateParameters, type InitialSetup} from 'src/utils/types';

export const getPropagateParameters = async ({txSigner, provider}: InitialSetup): Promise<ExtraPropagateParameters> => {
  const mainnetSdk = getMainnetSdk(txSigner);
  const ambAddress = await mainnetSdk.bnbHubConnector.AMB();

  // See: https://github.com/connext/monorepo/blob/e28db100e55d28d8a9d509959d603f9ced58de25/packages/agents/lighthouse/src/tasks/propagate/helpers/bnb.ts#L54-L57
  const gasLimit = '200000';
  const fee = await mainnetSdk.bnbHubConnector.quoteEVMDeliveryPrice(gasLimit, ambAddress);
  const encodedData = utils.defaultAbiCoder.encode(['uint256'], [gasLimit]);

  return {connector: '', fee: fee.toString(), encodedData};
};

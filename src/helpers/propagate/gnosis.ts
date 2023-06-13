import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {Contract, utils} from 'ethers';
import {type ExtraPropagateParameters, type InitialSetupPropagate} from 'src/utils/types';

export const getPropagateParameters = async ({txSigner, provider}: InitialSetupPropagate): Promise<ExtraPropagateParameters> => {
  const mainnetSdk = getMainnetSdk(txSigner);
  const ambAddress = await mainnetSdk.gnosisHubConnector.AMB();
  const ambContract = new Contract(ambAddress, ['function maxGasPerTx() external view returns (uint256)'], provider);
  const maxGasPerTx = await ambContract.maxGasPerTx();
  const encodedData = utils.defaultAbiCoder.encode(['uint256'], [maxGasPerTx as string]);

  return {connector: '', fee: '0', encodedData};
};

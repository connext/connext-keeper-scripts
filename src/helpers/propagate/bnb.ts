import {Contract} from 'ethers';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {type ExtraPropagateParameters, type InitialSetupPropagate} from 'src/utils/types';

export const getPropagateParameters = async ({txSigner, provider}: InitialSetupPropagate): Promise<ExtraPropagateParameters> => {
  const mainnetSdk = getMainnetSdk(txSigner);
  const ambAddress = await mainnetSdk.bnbHubConnector.AMB();

  const ambContract = new Contract(
    ambAddress,
    ['function calcSrcFees(string calldata _appID, uint256 _toChainID, uint256 _dataLength) external view returns (uint256)'],
    provider,
  );
  const fee = await ambContract.calcSrcFees('', 56, 32);

  return {connector: '', fee, encodedData: '0x'};
};

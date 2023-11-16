import {utils} from 'ethers';
import {type ExtraPropagateParameters} from 'src/utils/types';

export const getPropagateParameters = async (): Promise<ExtraPropagateParameters> => {
  const fee = utils.parseEther('0.01').toString();

  return {connector: '', fee, encodedData: '0x'};
};

import {L1ToL2MessageGasEstimator} from '@arbitrum/sdk/dist/lib/message/L1ToL2MessageGasEstimator';
import {getBaseFee} from '@arbitrum/sdk/dist/lib/utils/lib';
import {getArbitrumOneSdk, getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {BigNumber, constants, utils} from 'ethers';
import {type ExtraPropagateParameters, type InitialSetupPropagate} from 'src/utils/types';

// Example at https://github.com/OffchainLabs/arbitrum-tutorials/blob/master/packages/greeter/scripts/exec.js
export const getPropagateParameters = async ({txSigner, arbProvider, provider}: InitialSetupPropagate): Promise<ExtraPropagateParameters> => {
  const mainnetSdk = getMainnetSdk(txSigner);

  const arbSdk = getArbitrumOneSdk(arbProvider);
  const l1ToL2MessageGasEstimate = new L1ToL2MessageGasEstimator(arbProvider);

  // Example encoded payload: 0x4ff746f6000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000207465737400000000000000000000000000000000000000000000000000000000
  // length = 200 not including 0x = 100 bytes
  const gasPriceBid = await provider.getGasPrice();

  const baseFee = await getBaseFee(provider);
  const callData = arbSdk.spokeConnector.interface.encodeFunctionData('processMessage', [
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  ]);
  const l1ToL2MessageGasParameters = await l1ToL2MessageGasEstimate.estimateAll(
    {
      from: mainnetSdk.arbitrumHubConnector.address,
      to: arbSdk.spokeConnector.address,
      data: callData,
      l2CallValue: constants.Zero,
      callValueRefundAddress: arbSdk.spokeConnector.address,
      excessFeeRefundAddress: arbSdk.spokeConnector.address,
    },
    baseFee,
    provider,
  );

  const gasLimitForAutoRedeem = l1ToL2MessageGasParameters.gasLimit.mul(5);

  const submissionPriceWei = l1ToL2MessageGasParameters.maxSubmissionCost.mul(5).toString();
  // Multiply gasLimit by 15 to be successful in auto-redeem
  const maxGas = gasLimitForAutoRedeem.toString();
  const callValue = BigNumber.from(submissionPriceWei).add(gasPriceBid.mul(maxGas)).toString();

  const encodedData = utils.defaultAbiCoder.encode(['uint256', 'uint256', 'uint256'], [submissionPriceWei, maxGas, gasPriceBid]);

  return {connector: '', fee: callValue, encodedData};
};

import {BigNumber} from 'ethers';
import {type InitialSetup, type ExtraPropagateParameters} from 'src/utils/types';
import {LineaSDK} from '@consensys/linea-sdk';

export const getPropagateParameters = async ({lineaProvider, provider, environment}: InitialSetup): Promise<ExtraPropagateParameters> => {
  // Postman Fee = target layer gas price * (gas estimated + gas limit surplus) * margin.
  // The target layer gas price is eth_gasPrice on the target layer, gas estimated = 100,000, gas limit surplus = 6000, and margin = 2.
  const sdk = new LineaSDK({
    l1RpcUrl: provider.connection.url, // L1 rpc url
    l2RpcUrl: lineaProvider.connection.url, // L2 rpc url
    network: environment === 'mainnet' ? 'linea-mainnet' : 'linea-goerli', // Network you want to interact with (either linea-mainnet or linea-goerli)
    mode: 'read-only', // Contract wrapper class mode (read-only or read-write), read-only: only read contracts state, read-write: read contracts state and claim messages
  });
  const l2Messenger = sdk.getL2Contract();
  const {maxFeePerGas: gasPrice} = await l2Messenger.get1559Fees();

  // On linea-goerli claimMessage gasLimit was 83717
  // Source: https://goerli.lineascan.build/tx/0x4c477dfcbc22cd99b461cfe714a6ad60796331d3c13e55a74a6de51c3cd9aab6
  const gasLimit = BigNumber.from('120000');
  const margin = BigNumber.from(1);

  const fee = gasPrice.mul(gasLimit).mul(margin).toString();

  return {connector: '', fee, encodedData: '0x'};
};

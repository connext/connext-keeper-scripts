import {BigNumber} from 'ethers';
import {InitialSetup, type ExtraPropagateParameters} from 'src/utils/types';
import {LineaSDK} from "@consensys/linea-sdk";

export const getPropagateParameters = async ({lineaProvider, provider, environment}: InitialSetup): Promise<ExtraPropagateParameters> => {
  // Postman Fee = target layer gas price * (gas estimated + gas limit surplus) * margin
  // where target layer gas price is eth_gasPrice on the target layer, gas estimated = 100,000, gas limit surplus = 6000, and margin = 2.
  const sdk = new LineaSDK({
    l1RpcUrl: provider.connection.url, // L1 rpc url
    l2RpcUrl: lineaProvider.connection.url, // L2 rpc url
    network: environment === "mainnet" ? "linea-mainnet" : "linea-goerli", // network you want to interact with (either linea-mainnet or linea-goerli)
    mode: "read-only", // contract wrapper class mode (read-only or read-write), read-only: only read contracts state, read-write: read contracts state and claim messages
  });
  const gasPrice = (await sdk.getL2Contract().get1559Fees()).maxFeePerGas;

  // On linea-goerli claimMessage gasLimit was 83717
  // https://goerli.lineascan.build/tx/0x4c477dfcbc22cd99b461cfe714a6ad60796331d3c13e55a74a6de51c3cd9aab6
  const gasLimit = BigNumber.from("120000");
  const margin = BigNumber.from(1);

  const fee = gasPrice.mul(gasLimit).mul(margin).toString();

  return {connector: '', fee, encodedData: '0x'};
};

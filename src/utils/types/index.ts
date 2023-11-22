import type {providers, Wallet} from 'ethers';

export type InitialSetup = {
  provider: providers.JsonRpcProvider | providers.WebSocketProvider;
  arbProvider: providers.JsonRpcProvider | providers.WebSocketProvider;
  lineaProvider: providers.JsonRpcProvider | providers.WebSocketProvider;
  txSigner: Wallet;
  bundleSigner: Wallet;
  environment: 'staging' | 'testnet' | 'mainnet';
  listenerIntervalDelay: number;
  listenerBlockDelay: number;
};

export type ExtraPropagateParameters = {
  connector: string;
  fee: string;
  encodedData: string;
};

export type ParametersForDomains = {
  connectors: string[];
  encodedData: string[];
  fees: string[];
};

export type Environment = 'staging' | 'testnet' | 'mainnet';

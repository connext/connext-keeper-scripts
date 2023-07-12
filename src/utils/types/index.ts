import type {providers, Wallet} from 'ethers';

export type InitialSetupPropagate = {
  provider: providers.JsonRpcProvider | providers.WebSocketProvider;
  arbProvider: providers.JsonRpcProvider | providers.WebSocketProvider;
  txSigner: Wallet;
  bundleSigner: Wallet;
  environment: 'staging' | 'testnet' | 'mainnet';
  listenerIntervalDelay: number;
  listenerBlockDelay: number;
};

export type InitialSetupProcessFromRoot = {
  provider: providers.JsonRpcProvider | providers.WebSocketProvider;
  arbProvider: providers.JsonRpcProvider | providers.WebSocketProvider;
  optProvider: providers.JsonRpcProvider | providers.WebSocketProvider;
  polyProvider: providers.JsonRpcProvider | providers.WebSocketProvider;
  gnoProvider: providers.JsonRpcProvider | providers.WebSocketProvider;
  txSigner: Wallet;
  bundleSigner: Wallet;
  environment: 'staging' | 'testnet' | 'mainnet';
  listenerIntervalDelay: number;
  listenerBlockDelay: number;
};

export type Environment = 'staging' | 'testnet' | 'mainnet';

export type {ExtraPropagateParameters, ParametersForDomains} from './propagate';
export type {RootMessage, ProcessFromRootParameters} from './process-from-root';

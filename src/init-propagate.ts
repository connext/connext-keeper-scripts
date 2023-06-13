import process from 'node:process';
import {getMainnetSdk, getGoerliSdk} from '@dethcrypto/eth-sdk-client';
import {providers, Wallet} from 'ethers';
import {FlashbotsBundleProvider} from '@flashbots/ethers-provider-bundle';
import {FlashbotsBroadcastor, getEnvVariable, MempoolBroadcastor} from '@keep3r-network/keeper-scripting-utils';
import {type RelayerProxyHub} from '.dethcrypto/eth-sdk-client/esm/types/mainnet';
import {runPropagate} from './shared/run-propagate';
import {type Environment, type InitialSetupPropagate} from './utils/types';

// SETUP
const WORK_FUNCTION = 'propagateKeep3r';
const GAS_LIMIT = 2_000_000;
const PRIORITY_FEE = 2e9;

(async () => {
  // ENVIRONMENT
  const flashbotsProviderUrl = getEnvVariable('FLASHBOTS_PROVIDER_URL');
  const provider = new providers.JsonRpcProvider(getEnvVariable('RPC_HTTPS_URI'));
  const arbProvider = new providers.JsonRpcProvider(getEnvVariable('ARBITRUM_RPC_URI'));
  const txSigner = new Wallet(getEnvVariable('TX_SIGNER_PRIVATE_KEY'), provider);
  const bundleSigner = new Wallet(getEnvVariable('BUNDLE_SIGNER_PRIVATE_KEY'), provider);

  const setup: InitialSetupPropagate = {
    provider,
    arbProvider,
    txSigner,
    bundleSigner,
    environment: getEnvVariable('ENVIRONMENT') as Environment,
    listenerIntervalDelay: Number(process.env.LISTENER_INTERVAL_DELAY ?? 60_000),
    listenerBlockDelay: Number(process.env.LISTENER_BLOCK_DELAY ?? 0),
  };

  const envProxyHub: Record<Environment, RelayerProxyHub> = {
    mainnet: getMainnetSdk(txSigner).relayerProxyHub,
    testnet: getGoerliSdk(txSigner).relayerProxyHub as unknown as RelayerProxyHub,
    staging: getGoerliSdk(txSigner).relayerProxyHubStaging as unknown as RelayerProxyHub,
  };
  const proxyHub: RelayerProxyHub | undefined = envProxyHub[setup.environment];
  if (!proxyHub) throw new Error('Invalid environment');

  console.log(`Proxy Hub:`, proxyHub.address);

  if (setup.environment === 'mainnet') {
    // In ethereum mainnet, send the tx through flashbots
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, bundleSigner, flashbotsProviderUrl);
    const flashbotBroadcastor = new FlashbotsBroadcastor(flashbotsProvider as any, PRIORITY_FEE, GAS_LIMIT);
    await runPropagate(proxyHub, setup, WORK_FUNCTION, flashbotBroadcastor.tryToWorkOnFlashbots.bind(flashbotBroadcastor));
  } else {
    // In goerli, since flashbots are less reliable, send the tx through the mempool
    const mempoolBroadcastor = new MempoolBroadcastor(provider, PRIORITY_FEE, GAS_LIMIT);
    await runPropagate(proxyHub, setup, WORK_FUNCTION, mempoolBroadcastor.tryToWorkOnMempool.bind(mempoolBroadcastor));
  }
})();

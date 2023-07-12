import type {Block} from '@ethersproject/abstract-provider';
import type {BroadcastorProps} from '@keep3r-network/keeper-scripting-utils';
import {BlockListener} from '@keep3r-network/keeper-scripting-utils';
import {domainToChainId} from '@connext/nxtp-utils';
import {utils} from 'ethers';
import {type RelayerProxyHub} from '.dethcrypto/eth-sdk-client/esm/types/mainnet';
import {type RootMessage, type InitialSetupProcessFromRoot} from '../utils/types';
import {populateParametersForProcessFromRoot} from '../utils/process-from-root';

const apiURLs = {
  mainnet: 'https://postgrest.mainnet.connext.ninja',
  testnet: 'https://postgrest.testnet.connext.ninja',
  staging: 'https://postgrest.testnet.staging.connext.ninja',
};

const getUnprocessedMessages = async (baseUrl: string): Promise<RootMessage[]> => {
  const messages = await utils.fetchJson(`${baseUrl}/root_messages?processed=eq.false`);
  return messages as RootMessage[];
};

const notReadyMessages = ['Burn transaction has not been checkpointed yet', 'Optimism message status is not ready to prove', 'RollUpNodeStaked'];

export async function runProcessFromRoot(
  jobContract: RelayerProxyHub,
  setup: InitialSetupProcessFromRoot,
  workMethod: string,
  broadcastMethod: (props: BroadcastorProps) => Promise<void>,
) {
  // SETUP
  const blockListener = new BlockListener(setup.provider);

  blockListener.stream(
    async (block: Block) => {
      const messages = await getUnprocessedMessages(apiURLs[setup.environment]);
      const processedDomains: Record<string, boolean> = {};
      for (const message of messages) {
        const processed = await jobContract.processedRootMessages(domainToChainId(Number(message.spoke_domain)), message.sent_transaction_hash);
        if (!processed) {
          if (processedDomains[message.spoke_domain]) {
            console.log('Already processed a message for this domain, skipping', message.sent_transaction_hash, message.spoke_domain);
            continue;
          }

          console.log('Processing message:', message.sent_transaction_hash, message.spoke_domain);
          try {
            // Encode data for relayer proxy hub
            const {encodedData} = await populateParametersForProcessFromRoot(message, setup);

            await broadcastMethod({
              jobContract,
              workMethod,
              workArguments: [encodedData, domainToChainId(Number(message.spoke_domain)), message.sent_transaction_hash],
              block,
            });
            console.log('Message processed!!!', message.sent_transaction_hash, message.spoke_domain);
          } catch (error: unknown) {
            if (notReadyMessages.some((message_) => error instanceof Error && error.message.includes(message_))) {
              console.log("Message isn't ready to be processed yet, skipping", message.sent_transaction_hash, message.spoke_domain);
            } else {
              if (error instanceof Error) console.log(`ProcessFromRoot failed with:`, error.message);
              console.log('error:', error);
            }
          }
        }
      }
    },
    setup.listenerIntervalDelay,
    setup.listenerBlockDelay,
  );
}

import type { Block } from '@ethersproject/abstract-provider';
import type { BroadcastorProps } from '@keep3r-network/keeper-scripting-utils';
import { BlockListener } from '@keep3r-network/keeper-scripting-utils';
import { getChainData } from '@connext/nxtp-utils';
import { SubgraphReader } from '@connext/nxtp-adapters-subgraph';

import { type RelayerProxyHub } from '.dethcrypto/eth-sdk-client/esm/types/mainnet';
import { populateParametersForDomains } from '../utils/propagate';
import { type InitialSetupPropagate } from '../utils/types';

export async function runPropagate(
  jobContract: RelayerProxyHub,
  setup: InitialSetupPropagate,
  workMethod: string,
  broadcastMethod: (props: BroadcastorProps) => Promise<void>
) {
  // SETUP
  const blockListener = new BlockListener(setup.provider);
  const chainData = await getChainData();
  const subgraph = await (setup.environment === 'staging'
    ? SubgraphReader.create(chainData, 'staging')
    : SubgraphReader.create(chainData, 'production'));

  const rootManagerMeta = await (setup.environment === 'mainnet'
    ? subgraph.getRootManagerMeta('6648936')
    : subgraph.getRootManagerMeta('1735353714'));
  const domains = rootManagerMeta.domains;

  blockListener.stream(
    async (block: Block) => {
      const isWorkable = await jobContract.callStatic.propagateWorkable();
      if (!isWorkable) {
        console.log(`Propagate not workable`);
        return;
      }

      try {
        // Encode data for relayer proxy hub
        const { connectors, encodedData, fees } = await populateParametersForDomains(domains, rootManagerMeta, setup);

        await broadcastMethod({ jobContract, workMethod, workArguments: [connectors, fees, encodedData], block });
      } catch (error: unknown) {
        if (error instanceof Error) console.log(`Propagate failed with:`, error.message);
      }
    },
    setup.listenerIntervalDelay,
    setup.listenerBlockDelay
  );
}

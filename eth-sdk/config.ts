import { defineConfig } from '@dethcrypto/eth-sdk';

export default defineConfig({
  contracts: {
    mainnet: {
      relayerProxyHub: '0x9e4C8BC2A9Dc9295EF96c0CFE9520cc2FdED4DB0',
      arbitrumHubConnector: '0xd151C9ef49cE2d30B829a98A07767E3280F70961',
      bnbHubConnector: '0xfaf539a73659feaec96ec7242f075be0445526a8',
      gnosisHubConnector: '0x245F757d660C3ec65416168690431076d58d6413',
    },
    arbitrumOne: {
      spokeConnector: '0xFD81392229b6252cF761459d370C239Be3aFc54F',
    },
    bsc: {
      spokeConnector: '0x126A99af70eC62921C07E67943aCF61bF304Ef55',
    },
    goerli: {
      relayerProxyHub: '0x9E3A86De3330DFA2b8284638D632aA2B4B5eaaB9',
      relayerProxyHubStaging: '0x8a917049364cdD6DBEb2E6b5d0111180AC72a55a',
      arbitrumHubConnector: '0x58d3464e5AAb9c598A7059d182720a04aD59b01F',
      arbitrumHubConnectorStaging: '0x7Cc2798d6f7C00E19F6DA0eFD9e4a0c5497FD928',
    },
    arbitrumTestnet: {
      spokeConnector: '0x0F4E2866D874B94fc7424d7469deB13C8aE7738F',
      spokeConnectorStaging: '0x644bbF6754527603DB30509AAB74bbeC4FD6EFaD',
    },
  },
});

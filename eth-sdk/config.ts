import { defineConfig } from '@dethcrypto/eth-sdk';

export default defineConfig({
  contracts: {
    mainnet: {
      relayerProxyHub: '0xcDbF9D438670D19d1Fb3954Abc8a13666b302b28',
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
    gnosis: {
      ambHelper: '0x7d94ece17e81355326e3359115D4B02411825EdD',
      spokeConnector: '0x771B2c910D76ecf84B100559CF3Ec4cB2e8D4aC5',
      amb: '0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59',
    },
    goerli: {
      relayerProxyHub: '0xe55162a662Abaf066D0fa6FFb720Dbe8Bc16342a',
      relayerProxyHubStaging: '0x811Aecd063da20717E885862Bcb7Dd9383F207a9',
      arbitrumHubConnector: '0x58d3464e5AAb9c598A7059d182720a04aD59b01F',
      arbitrumHubConnectorStaging: '0x7Cc2798d6f7C00E19F6DA0eFD9e4a0c5497FD928',
    },
    arbitrumTestnet: {
      spokeConnector: '0x0F4E2866D874B94fc7424d7469deB13C8aE7738F',
      spokeConnectorStaging: '0x644bbF6754527603DB30509AAB74bbeC4FD6EFaD',
    },
  },
  rpc: {
    arbitrumOne: 'https://arb1.arbitrum.io/rpc',
    bsc: 'https://bsc-dataseed.binance.org/',
    gnosis: 'https://rpc.gnosischain.com',
    arbitrumTestnet: 'https://goerli-rollup.arbitrum.io/rpc',
  },
  etherscanURLs: {
    gnosis: 'https://api.gnosisscan.io/api',
  },
});

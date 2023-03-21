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
  },
});

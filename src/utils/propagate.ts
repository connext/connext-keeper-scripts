import { type RootManagerMeta } from '@connext/nxtp-utils';
import { BigNumber, constants } from 'ethers';
import {
  getPropagateParametersArbitrum,
  getPropagateParametersBnb,
  getPropagateParametersConsensys,
  getPropagateParametersGnosis,
  getPropagateParametersZkSync,
} from '../helpers/propagate';
import { type ExtraPropagateParameters, type InitialSetupPropagate, type ParametersForDomains } from './types';

export const getParametersForDomainFn: Record<string, (setup: InitialSetupPropagate) => Promise<ExtraPropagateParameters>> = {
  // Mainnet
  '1634886255': getPropagateParametersArbitrum,
  '6450786': getPropagateParametersBnb,
  '6778479': getPropagateParametersGnosis,

  // Testnet
  '1734439522': getPropagateParametersArbitrum,
  '2053862260': getPropagateParametersZkSync,
  '1668247156': getPropagateParametersConsensys,
};

export async function populateParametersForDomains(
  domains: string[],
  rootManagerMeta: RootManagerMeta,
  setup: InitialSetupPropagate
): Promise<ParametersForDomains> {
  const connectors: string[] = [];
  const encodedData: string[] = [];
  const fees: string[] = [];
  let totalFee = constants.Zero;

  for (const domain of domains) {
    const connector = rootManagerMeta.connectors[domains.indexOf(domain)];
    connectors.push(connector);

    if (Object.keys(getParametersForDomainFn).includes(domain)) {
      const getParametersForDomain = getParametersForDomainFn[domain];
      const propagateParameter = await getParametersForDomain(setup);
      encodedData.push(propagateParameter.encodedData);
      fees.push(propagateParameter.fee);
      totalFee = totalFee.add(BigNumber.from(propagateParameter.fee));
    } else {
      encodedData.push('0x');
      fees.push('0');
    }
  }

  return {
    connectors,
    encodedData,
    fees,
  };
}

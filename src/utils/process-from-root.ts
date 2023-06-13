import {
  getProcessFromArbitrumRootArgs,
  getProcessFromGnosisRootArgs,
  getProcessFromOptimismRootArgs,
  getProcessFromPolygonRootArgs,
} from '../helpers/processFromRoot';
import {type ProcessFromRootParameters, type InitialSetupProcessFromRoot, type RootMessage} from './types';

export const getParametersForDomainFn: Record<
  string,
  (message: RootMessage, setup: InitialSetupProcessFromRoot) => Promise<ProcessFromRootParameters>
> = {
  // Mainnet
  '1634886255': getProcessFromArbitrumRootArgs,
  '6778479': getProcessFromGnosisRootArgs,
  '1869640809': getProcessFromOptimismRootArgs,
  '1886350457': getProcessFromPolygonRootArgs,

  // Testnet
};

export async function populateParametersForProcessFromRoot(
  message: RootMessage,
  setup: InitialSetupProcessFromRoot,
): Promise<ProcessFromRootParameters> {
  const getParametersForDomain = getParametersForDomainFn[message.spoke_domain];
  if (!getParametersForDomain) {
    throw new Error('No getParametersForDomain function for domain: ' + message.spoke_domain);
  }

  const parameters = await getParametersForDomain(message, setup);
  return parameters;
}

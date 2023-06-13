import { chainIdToDomain, generateExitPayload } from '@connext/nxtp-utils';

import { InitialSetupProcessFromRoot, ProcessFromRootParams, RootMessage } from '../../utils/types';

export const getProcessFromPolygonRootArgs = async (
  { sent_transaction_hash: sendHash }: RootMessage,
  { polyProvider, provider, environment }: InitialSetupProcessFromRoot
): Promise<ProcessFromRootParams> => {
  const SEND_MESSAGE_EVENT_SIG = '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036'; // keccak256(MessageSent(bytes))

  // domains should always exist at this point

  const spokeDomainId = environment === 'mainnet' ? chainIdToDomain(137).toString() : chainIdToDomain(80001).toString();
  const hubDomainId = environment === 'mainnet' ? chainIdToDomain(1).toString() : chainIdToDomain(5).toString();
  const providers = new Map<string, string[]>();
  providers.set(spokeDomainId, [polyProvider.connection.url]);
  providers.set(hubDomainId, [provider.connection.url]);
  const { payload } = await generateExitPayload(spokeDomainId, hubDomainId, sendHash, SEND_MESSAGE_EVENT_SIG, providers);

  if (!payload) {
    throw new Error('NoRootAvailable');
  }

  return { encodedData: payload };
};

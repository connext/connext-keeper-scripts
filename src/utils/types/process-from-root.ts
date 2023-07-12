export type RootMessage = {
  id: string;
  spoke_domain: string;
  hub_domain: string;
  root: string;
  sent_transaction_hash: string;
  sent_timestamp: number;
  gas_price: number;
  gas_limit: number;
  block_number: number;
  processed: boolean;
  processed_transaction_hash?: string;
  leaf_count: number;
  sent_timestamp_secs?: number;
};

export type ProcessFromRootParameters = {
  encodedData: string;
};

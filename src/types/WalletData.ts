export type WalletData = Wallet[]

export type WalletDataRes = {
  result: WalletData,
  address: string
}

export type Wallet = {
  amount: number,
  avgCost: number;
  chain: string;
  id: number;
  logo: string;
  name: string;
  rate: number;
  symbol: string;
}

export type TokenData = Data[]

export type HoldingTokenRes = {
  result: TokenData,
  address: string
}

export type Data = {
  amount: number,
  avgCost: number;
  chain: string;
  id: number;
  logo: string;
  name: string;
  rate: number;
  symbol: string;
}

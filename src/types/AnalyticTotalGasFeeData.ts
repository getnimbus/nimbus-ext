export type AnalyticTotalGasFeeRes = {
  address: string;
  result: AnalyticTotalGasFee[]
}

export type AnalyticTotalGasFee = {
  date: number,
  price: {
    contract_address: string,
    decimals: string,
    price: number,
    symbol: string,
    timestamp: string
  },
  total: number,
  value: number
}

export type AnalyticTotalGasFeeFormat = any[]
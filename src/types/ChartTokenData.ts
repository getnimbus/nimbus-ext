export type LocalChartTokenData = {
  createdAt: string;
  result: ChartTokenData
}

export type ChartTokenData = {
  market_caps: number[];
  prices: number[];
  total_volumes: number[];
}

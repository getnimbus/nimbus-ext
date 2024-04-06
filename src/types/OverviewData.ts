export type OverviewData = {
  overview: {
    assets: number;
    assetsChange: number;
    change: string;
    claimable: number;
    claimableChange: number;
    debts: number;
    debtsChange: number;
    networth: number;
    networthChange: number;
    postionNetworth: number;
    postionNetworthChange: number;
  };
  performance: PerformanceDetail[];
  portfolioChart: {
    timestamp: number,
    value: number
  }[]
  updatedAt: string;
}

export type OverviewDataRes = {
  result: OverviewData,
  address: string
}

export type PerformanceDetail = {
  btc: number;
  date: string;
  eth: number;
  portfolio: number;
}

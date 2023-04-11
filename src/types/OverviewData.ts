export type OverviewData = {
  breakdownToken: BreakdownTokenDetail[];
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
  updatedAt: string;
}

export type OverviewDataRes = {
  result: OverviewData,
  address: string
}

export type BreakdownTokenDetail = {
  id: number | string;
  amount: number;
  logo: string;
  name: string;
  symbol: string;
  value: number;
}

export type PerformanceDetail = {
  btc: number;
  date: string;
  eth: number;
  portfolio: number;
}

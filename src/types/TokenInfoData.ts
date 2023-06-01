export type TokenInfoData = {
  symbol: string;
  name: string;
  logo_url: string;
  categories: string[];
  cg_rank: number;
  cmc_rank: number;
  cmc_slug: string;
  price: {
    usd: number,
    usd_market_cap: number,
    usd_24h_vol: number,
    usd_24h_change: number
  };
  marketcap: {
    max: number,
    min: number,
    current: number
  }
};

export const colorPairs = [
  { textColor: "#49A37B", backgroundColor: "#CBFDE1" },
  { textColor: "#FF5733", backgroundColor: "#FFD3B6" },
  { textColor: "#3498DB", backgroundColor: "#D6EAF8" },
  { textColor: "#9B59B6", backgroundColor: "#EBDEF0" },
  { textColor: "#E74C3C", backgroundColor: "#FADBD8" },
  { textColor: "#2ECC71", backgroundColor: "#D5F5E3" },
  { textColor: "#1ABC9C", backgroundColor: "#D1F2EB" },
  { textColor: "#F39C12", backgroundColor: "#FDEBD0" },
  { textColor: "#D35400", backgroundColor: "#F6DDCC" },
  { textColor: "#7D3C98", backgroundColor: "#E8DAEF" },
  { textColor: "#2980B9", backgroundColor: "#D6EAF8" },
  { textColor: "#C0392B", backgroundColor: "#FADBD8" },
  { textColor: "#8E44AD", backgroundColor: "#E8DAEF" },
  { textColor: "#27AE60", backgroundColor: "#D5F5E3" },
  { textColor: "#16A085", backgroundColor: "#D1F2EB" },
  { textColor: "#F1C40F", backgroundColor: "#FCF3CF" },
  { textColor: "#E67E22", backgroundColor: "#FAE5D3" },
  { textColor: "#A93226", backgroundColor: "#F5B7B1" },
  { textColor: "#5D6D7E", backgroundColor: "#D6DBDF" },
  { textColor: "#34495E", backgroundColor: "#D5D8DC" },
  { textColor: "#F4D03F", backgroundColor: "#FCF3CF" },
  { textColor: "#C70039", backgroundColor: "#FADBD8" },
  { textColor: "#8E44AD", backgroundColor: "#EBDEF0" },
  { textColor: "#2980B9", backgroundColor: "#D6EAF8" },
];

export const netWorthFilter = [
  {
    label: "1k - 50K",
    value: "networth > 1000 AND networth < 50000",
  },
  {
    label: "50K - 100K",
    value: "networth > 50000 AND networth < 100000",
  },
  {
    label: "> 100K",
    value: "networth > 100000",
  },
];

export const sharpeRatioFilter = [
  {
    label: "< 1",
    value: "sharpeRatio < 1",
  },
  {
    label: "> 1",
    value: "sharpeRatio > 1",
  },
  {
    label: "1 - 2",
    value: "sharpeRatio > 1 AND sharpeRatio < 2",
  },
  {
    label: "> 2",
    value: "sharpeRatio > 2",
  },
];

export const volatilityFilter = [
  {
    label: "0-10%",
    value: "volatility > 0 AND volatility < 10",
  },
  {
    label: "10% - 50%",
    value: "volatility > 10 AND volatility < 50",
  },
  {
    label: "> 50%",
    value: "volatility > 50",
  },
];

export const returnsFilter = [
  {
    label: "1D > 0",
    value: "change1D > 0",
  },
  {
    label: "7D > 0",
    value: "change7D > 0",
  },
  {
    label: "30D > 0",
    value: "change30D > 0",
  },
  {
    label: "1Y > 0",
    value: "change1Y > 0",
  },
];

export const typeList = [
  {
    label: "Category",
    value: "category",
  },
  {
    label: "Sector",
    value: "sector",
  },
  {
    label: "Market Cap",
    value: "rank",
  },
];

export const typePieChart = [
  {
    label: "Tokens",
    value: "token",
  },
  {
    label: "NFTs",
    value: "nft",
  },
];

export const typeClosedHoldingTokenChart = [
  {
    label: "Value",
    value: "value",
  },
  {
    label: "Percent",
    value: "percent",
  },
];

export const filterAvgCostType = [
  {
    label: "All",
    value: "all",
  },
  // {
  //   label: "Smart money",
  //   value: "smart"
  // },
  {
    label: "Fresh wallet",
    value: "fresh",
  },
];

export const typePortfolioPage = [
  {
    id: "view-the-holding-token",
    label: "Tokens",
    value: "token",
  },
  {
    id: "view-the-nft",
    label: "NFTs",
    value: "nft",
  },
  {
    id: "view-the-defi",
    label: "DeFi",
    value: "defi",
  },
  {
    id: "view-the-points-airdrop",
    label: "Airdrops and Points",
    value: "airdropsAndPoints",
  },
  {
    id: "view-the-summary",
    label: "Summary",
    value: "summary",
  },
];

export const filterTokenValueType = [
  {
    label: "None",
    value: 0,
  },
  {
    label: "$1",
    value: 1,
  },
  {
    label: "$5",
    value: 5,
  },
  {
    label: "$10",
    value: 10,
  },
];

export const performanceTypeChartPortfolio = [
  {
    label: "Percent Change",
    value: "percent",
  },
  {
    label: "Net Worth",
    value: "networth",
  },
];

export const timeFrame = [
  {
    label: "7D",
    value: "7D",
  },
  {
    label: "30D",
    value: "30D",
  },
  {
    label: "3M",
    value: "3M",
  },
  {
    label: "1Y",
    value: "1Y",
  },
  {
    label: "ALL",
    value: "ALL",
  },
];

export const showChangeLogAnimationVariants = {
  visible: { opacity: 1, y: 0, display: "flex" },
  hidden: { opacity: 0, y: -10, display: "none" },
};

export const showOverlayAnimationVariants = {
  visible: { opacity: 1, y: 0, display: "block" },
  hidden: { opacity: 0, y: -10, display: "none" },
};


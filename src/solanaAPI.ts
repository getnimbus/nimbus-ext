import axios from "axios";

const getHoldingTokens = async (owner: string) => {
  return await axios
    .get("https://portfolio-api.sonar.watch/v1/portfolio/fetchByNetworkId", { params: { owner: owner, networkId: "solana" } })
    .then((res) => res.data);
};

const getContractAddress = async () => {
  return await axios.get("https://portfolio-api.sonar.watch/v1/token-infos/allByNetwork/solana").then((res) => res.data);
};

export const getHoldingSOL = async (owner: string) => {
  const [solContractAddress, tokenHoldings] = await Promise.all([getContractAddress(), getHoldingTokens(owner)]);
  const solContractAddressMap = new Map();
  solContractAddress?.forEach((item: any) => {
    solContractAddressMap.set(item?.address, item);
  });


  const result = tokenHoldings?.elements
    ?.filter((item: any) => item?.platformId === "wallet-tokens")
    ?.flatMap((item: any) => {
      return item?.data?.assets?.map((asset: any) => {
        const tokenInfo = solContractAddressMap.get(asset?.data?.address);
        return {
          name: tokenInfo?.name,
          symbol: tokenInfo?.symbol,
          logo: tokenInfo?.logoURI,
          amount: Number(asset?.data?.amount),
          balance: Number(asset?.value),
          contract_address: tokenInfo?.address,
          contractDecimals: tokenInfo?.decimal,
          rate: Number(asset?.data?.price),
          price: {
            price: Number(asset?.data?.price),
          },
          avgCost: 0,
          category: "Other",
          sector: "Other",
          rank: "N/A",
          positionId: tokenInfo?.symbol,
          positionType: tokenInfo?.networkId,
          chain: "SOL",
        };
      });
    });
  return result;
};

export const getOverviewSOL = async (owner: string) => {
  const holding = await getHoldingSOL(owner);
  const breakdownToken = holding?.map((item) => {
    return {
      ...item,
      value: Number(item.amount) * Number(item.price?.price || 0),
    };
  });
  return {
    updated_at: new Date(),
    overview: {
      change: "24h",
      networth: 0,
      networthChange: 0,
      claimable: 0,
      claimableChange: 0,
      assets: 0,
      assetsChange: 0,
      postionNetworth: 0,
      postionNetworthChange: 0,
      debts: 0,
      debtsChange: 0,
      cumulativeInflow: 0,
      cumulativeInflowChange: 0,
      cumulativeOutflow: 0,
      cumulativeOutflowChange: 0,
    },
    breakdownToken,
    breakdownNft: [], // TODO:
    performance: {
      date: new Date(),
      portfolio: 0,
      btc: 0,
      eth: 0,
      cost: 0,
      networth: 0,
    },
    portfolioChart: {
      timestamp: new Date(),
      value: 0,
    },
  };
};
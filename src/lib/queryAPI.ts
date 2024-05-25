import { nimbus } from "~/lib/network";

export const handleSearchToken = async (searchValue: string) => {
  const response: any = await nimbus.get(`/token/${searchValue}/info/mobula`);
  return response?.data?.data;
};

export const handleMarketTokens = async () => {
  const response: any = await nimbus.get("/tokens/coingecko");
  return response.data || [];
};

export const getReferralInvitation = async () => {
  const response: any = await nimbus.get("/referrals");
  return response.data;
};

export const getUserInfo = async () => {
  const response: any = await nimbus.get("/users/me");
  return response?.data;
};

export const getLinkData = async () => {
  const response: any = await nimbus.get("/accounts/link");
  return response;
};

export const getLootBoxStatus = async () => {
  const response: any = await nimbus.get("/v2/rewards/lootbox/status");
  return response;
}

export const handleValidateAddress = async (address: string) => {
  const response: any = await nimbus.get(`/v2/address/${address}/validate`).catch((e) => {
    console.error(e)
    return {
      address: "",
      type: "",
    }
  });
  return (
    response?.data || {
      address: "",
      type: "",
    }
  );
};

export const getVirtualPortfolioProfile = async (address: string, createdOwner: string) => {
  const response: any = await nimbus.get(`/address/${address}/personalize/virtual-portfolio-profile?createdOwner=${createdOwner}`);
  return response;
}

export const getVirtualPortfolio = async (address: string, portfolioProfileId: string) => {
  const response = await nimbus.get(
    `/address/${address}/personalize/virtual-portfolio?portfolioProfileId=${portfolioProfileId}`
  );
  return response;
};

export const getVirtualPortfolioPerformance = async (address: string, portfolioProfileId: string) => {
  const response = await nimbus.get(
    `/address/${address}/personalize/virtual-portfolio/performance?portfolioProfileId=${portfolioProfileId}`
  );
  return response;
}

export const getListAddress = async () => {
  const response: any = await nimbus.get("/accounts/list");
  return response?.data;
};

export const getTradingStats = async (address) => {
  const response: any = await nimbus.get(
    `/v2/analysis/${address}/trading-stats`
  );
  return response?.data;
};

export const getPositionList = async (address) => {
  const response: any = await nimbus.get(
    `/v2/address/${address}/positions-prepare`
  );
  return response?.data;
};

export const getPositions = async (address, protocol) => {
  const response: any = await nimbus.get(
    `/v2/address/${address}/positions?protocol=${protocol}`
  );
  return response?.data;
};

export const getOverview = async (wallet, chain, validatedAccount) => {
  let addressChain = chain;

  if (addressChain === "ALL") {
    addressChain = validatedAccount?.type;
  }

  const response: any = await nimbus.get(
    `/v2/address/${wallet}/overview?chain=${addressChain === "BUNDLE" ? "" : addressChain
    }`
  );
  return response.data;
};

export const getHoldingToken = async (wallet, chain, validatedAccount) => {
  let addressChain = chain;

  if (addressChain === "ALL") {
    addressChain = validatedAccount?.type;
  }

  const response: any = await nimbus.get(
    `/v2/address/${wallet}/holding?chain=${addressChain === "BUNDLE" ? "" : addressChain
    }`
  );
  return response.data;
};

export const getVaults = async (wallet, chain, validatedAccount) => {
  let addressChain = chain;

  if (addressChain === "ALL") {
    addressChain = validatedAccount?.type;
  }

  const response: any = await nimbus.get(
    `/v2/investment/${wallet}/vaults?chain=${addressChain === "BUNDLE" ? "" : addressChain
    }`
  );
  return response?.data;
};

export const getHoldingNFT = async (wallet, chain, validatedAccount) => {
  let addressChain = chain;

  if (addressChain === "ALL") {
    addressChain = validatedAccount?.type;
  }

  const response: any = await nimbus.get(
    `/v2/address/${wallet}/nft-holding?chain=${addressChain === "BUNDLE" ? "" : addressChain
    }`
  );
  return response.data;
};

export const handleGetListQuest = async () => {
  const response: any = await nimbus.get("/v2/checkin/quest");
  return response.data || [];
};

export const handleGetDataDailyCheckin = async () => {
  const response: any = await nimbus.get("/v2/checkin");
  return response.data;
};

export const handleGetDataLeaderboard = async () => {
  const response: any = await nimbus.get("/v2/checkin/leaderboard");
  return response.data;
};

export const handleGetDataRewards = async (address) => {
  const response: any = await nimbus.post(`/v2/reward`, {
    address,
  });
  return response.data;
};

export const getCampaignReferrals = async () => {
  const response: any = await nimbus.get("/v2/campaign/sui-unlock/referral");
  return response.data;
};

export const getCampaignQuestsBoard = async () => {
  const response: any = await nimbus.get("/v2/campaign/sui-unlock/quest-board");
  return response.data;
};

export const getCampaignPartnerList = async () => {
  const response: any = await nimbus.get("/v2/campaign/sui-unlock/partners");
  return response.data;
};

export const getCampaignPartnerDetail = async (id) => {
  const response: any = await nimbus.get(`/v2/campaign/${id}/quest-board`);
  return response.data;
};

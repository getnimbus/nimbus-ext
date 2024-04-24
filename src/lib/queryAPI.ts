import { nimbus } from "~/lib/network";

export const handleValidateAddress = async (address: string) => {
  const response = await nimbus.get(`/v2/address/${address}/validate`);
  return (
    response?.data || {
      address: "",
      type: "",
    }
  );
};

export const getTradingStats = async (address) => {
  const response: any = await nimbus.get(
    `/v2/analysis/${address}/trading-stats`
  );
  return response?.data;
};

export const getHoldingToken = async (wallet, chain, validatedAccount) => {
  let addressChain = chain;

  if (addressChain === "ALL") {
    addressChain = validatedAccount?.type;
  }

  const response: any = await nimbus
    .get(
      `/v2/address/${wallet}/holding?chain=${addressChain === "BUNDLE" ? "" : addressChain
      }`
    )
    .then((response) => response?.data);
  return response;
};


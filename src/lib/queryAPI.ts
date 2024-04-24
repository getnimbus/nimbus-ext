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


<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import dayjs from "dayjs";
  import Loading from "~/components/Loading.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { nimbus } from "~/lib/network";
  import { user } from "~/store";

  export let selectedAddress;

  let netWorth = 0;
  let unRealizedProfit = 0;
  let set30DayPnl = 0;
  let winRate = 0;
  let totalCost = 0;

  const handleFilter30Day = (item) => {
    const date = dayjs(item?.last_transferred_at);
    const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000;
    return (
      thirtyDaysInMilliseconds - dayjs(dayjs()).diff(date, "millisecond") > 0
    );
  };

  const formatDataHoldingToken = (dataTokenHolding) => {
    const formatData = dataTokenHolding
      .map((item) => {
        return {
          ...item,
          value:
            Number(item?.amount) * Number(item?.price?.price || item?.rate),
        };
      })
      .sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

    netWorth = formatData.reduce((prev, item) => prev + item.value, 0);

    const formatWinRate = formatData
      .filter((item) => item?.profit?.realizedProfit)
      .filter(handleFilter30Day)
      .map((item) => {
        return {
          ...item,
          realizedProfit: item?.profit?.realizedProfit,
          percentRealizedProfit:
            (item?.avgCost || 0) === 0
              ? 0
              : (Number(item?.profit?.realizedProfit) /
                  Number(Math.abs(item?.avgCost))) *
                100,
        };
      });

    winRate =
      (formatWinRate.filter((item) => item?.profit?.realizedProfit > 0).length /
        formatWinRate.length) *
      100;
  };

  const getTradingStats = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/trading-stats`
    );
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  const getHoldingToken = async (address) => {
    const response = await nimbus
      .get(`/v2/address/${address}/holding?chain=ALL`)
      .then((response) => response.data);
    return response;
  };

  $: queryTradingStats = createQuery({
    queryKey: ["trading-stats", selectedAddress],
    queryFn: () => getTradingStats(selectedAddress),
    staleTime: Infinity,
    retry: false,
    enabled: selectedAddress?.length !== 0 && Object.keys($user).length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedAddress],
    queryFn: () => getHoldingToken(selectedAddress),
    staleTime: Infinity,
    enabled: selectedAddress?.length !== 0 && Object.keys($user).length !== 0,
  });

  $: profit =
    $queryTradingStats?.data !== undefined
      ? $queryTradingStats?.data?.latestStats?.unrealizedProfit +
        $queryTradingStats?.data?.latestStats?.totalRealizedProfit
      : 0;

  $: {
    if (
      !$queryTokenHolding.isError &&
      $queryTokenHolding.data &&
      $queryTokenHolding?.data !== undefined
    ) {
      formatDataHoldingToken($queryTokenHolding.data);
    }
  }

  $: {
    if ($queryTradingStats?.data) {
      const tradingStatsMeta = $queryTradingStats?.data?.metadata.filter(
        (e) => e.startTrade < 2592000000
      );

      unRealizedProfit = tradingStatsMeta?.reduce(
        (prev, item) => prev + Number(item.unrealizedProfit),
        0
      );

      totalCost = tradingStatsMeta?.reduce(
        (prev, item) => prev + Number(item.cost),
        0
      );

      if (unRealizedProfit === 0 && profit === 0) {
        set30DayPnl = 0;
      } else {
        set30DayPnl = unRealizedProfit + profit - totalCost / totalCost;
      }
    }
  }

  $: totalToken = $queryTradingStats?.data?.metadata?.length || 0;
</script>

<div
  class="col-span-4 grid xl:grid-cols-6 grid-cols-3 gap-5 border border_0000001a rounded-xl p-6"
>
  <div class="flex flex-col gap-2 justify-between">
    <span class="text-xl xl:text-xs font-medium text_00000099">Balance</span>
    <span class="xl:text-base text-lg">
      <TooltipNumber number={netWorth} type="value" />
    </span>
  </div>
  <div class="flex flex-col gap-2 justify-between">
    <span class="text-xl xl:text-xs font-medium text_00000099">
      30D Unrealized PnL
    </span>
    <span
      class={`xl:text-base text-lg ${
        unRealizedProfit < 0
          ? "text-red-500"
          : unRealizedProfit > 0
          ? "text-green-400"
          : ""
      }`}
    >
      <TooltipNumber number={unRealizedProfit} type="value" />
    </span>
  </div>
  <div class="flex flex-col gap-2 justify-between">
    <span class="text-xl xl:text-xs font-medium text_00000099">
      30D Realized PnL
    </span>
    <div class="xl:text-base text-lg">
      <div
        class={`${
          profit !== 0 ? (profit >= 0 ? "text-green-400" : "text-red-500") : ""
        }`}
      >
        <TooltipNumber number={Math.abs(profit)} type="value" />
      </div>
    </div>
  </div>
  <div class="flex flex-col gap-2 justify-between">
    <span class="text-xl xl:text-xs font-medium text_00000099">30D PnL</span>
    <span
      class={`${
        set30DayPnl > 0
          ? "text-green-400"
          : set30DayPnl < 0
          ? "text-red-500"
          : ""
      }`}
    >
      <TooltipNumber number={set30DayPnl} type="percent" />%
    </span>
  </div>
  <div class="flex flex-col gap-2 justify-between">
    <span class="text-xl xl:text-xs font-medium text_00000099">
      Trade Tokens
    </span>
    <span class="xl:text-base text-lg">
      {totalToken}
    </span>
  </div>
  <div class="flex flex-col gap-2 justify-between">
    <span class="text-xl xl:text-xs font-medium text_00000099">Winrate</span>
    <span class="xl:text-base text-lg">
      <TooltipNumber number={winRate} type="percent" />%
    </span>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

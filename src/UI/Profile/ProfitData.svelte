<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { nimbus } from "~/lib/network";
  import { user } from "~/store";

  export let selectedAddress;

  let netWorth = 0;
  let unRealizedProfit = 0;
  let set30DayPnl = 0;
  let winRate = 0;
  let totalCost = 0;

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
      const data = $queryTokenHolding?.data?.filter(
        (item) => Number(item?.amount) !== 0 && Number(item.price.price) !== 0
      );

      const formatData = data.map((item) => {
        return {
          ...item,
          value: Number(item.amount) * Number(item.price.price),
        };
      });

      netWorth = formatData.reduce((prev, item) => prev + item.value, 0);
    }
  }

  $: {
    if ($queryTradingStats?.data) {
      const tradingStats = $queryTradingStats?.data.filter(
        (e) => e.startTrade < 2592000000
      );
      winRate =
        tradingStats.lfStats?.totalTrade &&
        Number(tradingStats.lfStats?.totalTrade) !== 0
          ? (Number(tradingStats.lfStats?.winTrade) /
              Number(tradingStats.lfStats?.totalTrade)) *
            100
          : 0;

      unRealizedProfit = tradingStats.metadata.reduce(
        (prev, item) => prev + Number(item.unrealizedProfit),
        0
      );

      totalCost = tradingStats.metadata.reduce(
        (prev, item) => prev + Number(item.cost),
        0
      );

      set30DayPnl = unRealizedProfit + profit - totalCost / totalCost;
    }
  }
</script>

<div
  class="col-span-4 grid grid-cols-5 gap-3 border border_0000001a rounded-xl p-6"
>
  <div class="col-span-3 grid grid-cols-3 gap-3">
    <div class="flex flex-col gap-2 items-center justify-between">
      <span class="text-xl xl:text-xs font-medium text_00000099">Balance</span>
      <span class="xl:text-base text-lg">
        <TooltipNumber number={netWorth} type="value" />
      </span>
    </div>
    <div class="flex flex-col gap-2 items-center justify-between">
      <span class="text-xl xl:text-xs font-medium text_00000099">
        30D Unrealized
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
    <div class="flex flex-col gap-2 items-center justify-between">
      <span class="text-xl xl:text-xs font-medium text_00000099">
        30D Realized Profit
      </span>
      <div class="xl:text-base text-lg">
        <div
          class={`${
            profit !== 0
              ? profit >= 0
                ? "text-green-400"
                : "text-red-500"
              : ""
          }`}
        >
          <TooltipNumber number={Math.abs(profit)} type="value" />
        </div>
      </div>
    </div>
  </div>
  <div class="grid grid-cols-2 col-span-2 gap-3">
    <div class="flex flex-col gap-2 items-center justify-between">
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
    <div class="flex flex-col gap-2 items-center justify-between">
      <span class="text-xl xl:text-xs font-medium text_00000099">Winrate</span>
      <span class="xl:text-base text-lg">
        <TooltipNumber number={winRate} type="percent" />%
      </span>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

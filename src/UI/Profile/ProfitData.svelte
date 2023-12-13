<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import dayjs from "dayjs";
  import { nimbus } from "~/lib/network";
  import { user } from "~/store";

  import Loading from "~/components/Loading.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let selectedAddress;
  export let isSync = false;
  export let enabledFetchAllData = false;

  let balance = 0;
  let unRealizedProfit = 0;
  let set30DayPnl = 0;
  let winRate = 0;
  let totalCost = 0;
  let totalToken = 0;
  let realizedProfit = 0;

  $: isFetch = isSync ? enabledFetchAllData : true;

  const getTradingStats = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/trading-stats`
    );
    return response?.data;
  };

  const getHoldingToken = async (address) => {
    const response = await nimbus
      .get(`/v2/address/${address}/holding?chain=ALL`)
      .then((response) => response.data);
    return response;
  };

  const formatDataHoldingToken = (dataTokenHolding) => {
    const formatData = dataTokenHolding
      .map((item) => {
        return {
          ...item,
          value: Number(item?.amount) * Number(item?.price?.price),
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

    balance = formatData.reduce((prev, item) => prev + item.value, 0);

    const format30D = formatData
      .filter((item) => item?.profit?.realizedProfit)
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
      (format30D.filter((item) => item?.profit?.realizedProfit > 0).length /
        format30D.length) *
      100;

    totalToken = format30D.length;
  };

  const formatDataTradingStats = (data) => {
    const tradingStatsMeta = data?.metadata.filter(
      (item) => dayjs().subtract(30, "day").valueOf() < item.lastTrade * 1000
    );

    unRealizedProfit = tradingStatsMeta?.reduce(
      (prev, item) => prev + Number(item.unrealizedProfit),
      0
    );

    realizedProfit = tradingStatsMeta.reduce(
      (prev, item) => prev + Number(item.realizedProfit),
      0
    );

    totalCost = tradingStatsMeta?.reduce(
      (prev, item) => prev + Number(item.cost),
      0
    );

    if (unRealizedProfit === 0 && realizedProfit === 0) {
      set30DayPnl = 0;
    } else {
      set30DayPnl =
        ((unRealizedProfit + realizedProfit - totalCost) / totalCost) * 100;
    }
  };

  $: queryTradingStats = createQuery({
    queryKey: ["trading-stats", selectedAddress],
    queryFn: () => getTradingStats(selectedAddress),
    staleTime: Infinity,
    retry: false,
    enabled: selectedAddress?.length !== 0 && isFetch,
  });

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedAddress],
    queryFn: () => getHoldingToken(selectedAddress),
    staleTime: Infinity,
    enabled: selectedAddress?.length !== 0 && isFetch,
  });

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
    if (
      !$queryTradingStats.isError &&
      $queryTradingStats.data &&
      $queryTradingStats?.data !== undefined
    ) {
      formatDataTradingStats($queryTradingStats.data);
    }
  }
</script>

<div class="col-span-4 border border_0000001a rounded-xl p-6">
  {#if $queryTokenHolding.isFetching && $queryTradingStats.isFetching}
    <div class="h-full flex items-center justify-center">
      <Loading />
    </div>
  {:else}
    <div class="grid xl:grid-cols-5 grid-cols-3 gap-5">
      <div class="flex flex-col gap-2 justify-between">
        <div class="text-xl xl:text-xs font-medium text_00000099">
          Portfolio Value
        </div>
        <div class="xl:text-base text-lg">
          <TooltipNumber number={balance} type="value" />
        </div>
      </div>

      <div class="flex flex-col gap-2 justify-between">
        <div class="text-xl xl:text-xs font-medium text_00000099">
          30D Unrealized PnL
        </div>
        <div
          class={`flex items-center xl:text-base text-lg ${
            unRealizedProfit !== 0
              ? unRealizedProfit >= 0
                ? "text-[#00A878]"
                : "text-red-500"
              : ""
          }`}
        >
          {#if unRealizedProfit < 0}-{/if}
          <TooltipNumber number={Math.abs(unRealizedProfit)} type="value" />
        </div>
      </div>

      <div class="flex flex-col gap-2 justify-between">
        <div class="text-xl xl:text-xs font-medium text_00000099">
          30D Realized PnL
        </div>
        <div
          class={`flex items-center xl:text-base text-lg ${
            realizedProfit !== 0
              ? realizedProfit >= 0
                ? "text-[#00A878]"
                : "text-red-500"
              : ""
          }`}
        >
          {#if realizedProfit < 0}-{/if}
          <TooltipNumber number={Math.abs(realizedProfit)} type="value" />
        </div>
      </div>

      <!-- <div class="flex flex-col gap-2 justify-between">
        <div class="text-xl xl:text-xs font-medium text_00000099">30D PnL</div>
        <div
          class={`flex items-center xl:text-base text-lg ${
            set30DayPnl !== 0
              ? set30DayPnl >= 0
                ? "text-[#00A878]"
                : "text-red-500"
              : ""
          }`}
        >
          {#if set30DayPnl < 0}-{/if}
          <TooltipNumber
            number={Math.abs(set30DayPnl)}
            type={Math.abs(Number(set30DayPnl)) > 100 ? "balance" : "percent"}
          />%
        </div>
      </div> -->

      <div class="flex flex-col gap-2 justify-between">
        <div class="text-xl xl:text-xs font-medium text_00000099">
          Trade Tokens
        </div>
        <div class="xl:text-base text-lg">
          {totalToken}
        </div>
      </div>

      <div class="flex flex-col gap-2 justify-between">
        <div class="text-xl xl:text-xs font-medium text_00000099">Winrate</div>
        <div class="xl:text-base text-lg">
          <TooltipNumber number={winRate} type="percent" />%
        </div>
      </div>
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>

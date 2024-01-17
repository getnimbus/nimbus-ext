<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import dayjs from "dayjs";
  import { nimbus } from "~/lib/network";
  import { user } from "~/store";

  import Loading from "~/components/Loading.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";

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
  let badPerf = {};
  let goodPerf = {};

  $: isFetch = isSync ? enabledFetchAllData : true;

  const getTradingStats = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/trading-stats`
    );
    return response?.data;
  };

  const handleValidateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      return response?.data;
    } catch (e) {
      console.error(e);
      return {
        address: "",
        type: "",
      };
    }
  };

  const getHoldingToken = async (address) => {
    const validateAccount = await handleValidateAddress(address);

    const response = await nimbus
      .get(
        `/v2/address/${address}/holding?chain=${
          validateAccount?.type === "EVM" ? "ALL" : validateAccount?.type
        }`
      )
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
    const formatData = data?.metadata
      .filter(
        (item) => dayjs().subtract(30, "day").valueOf() < item.lastTrade * 1000
      )
      .map((item) => {
        return {
          ...item.holding,
          value:
            Number(item?.holding?.amount || 0) *
            Number(item?.holding?.price?.price || item?.holding?.rate),
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

    let listProfitToken = [];
    let listLossToken = [];

    formatData
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
      })
      .map((item) => {
        if (item.realizedProfit < 0) {
          listLossToken.push(item);
        } else {
          listProfitToken.push(item);
        }
      });

    goodPerf =
      listProfitToken.sort((a, b) => b.realizedProfit - a.realizedProfit)[0] ||
      {};

    badPerf =
      listLossToken.sort((a, b) => a.realizedProfit - b.realizedProfit)[0] ||
      {};
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
    <div class="flex flex-col gap-4">
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
          <div class="text-xl xl:text-xs font-medium text_00000099">
            Winrate
          </div>
          <div class="xl:text-base text-lg">
            <TooltipNumber number={winRate} type="percent" />%
          </div>
        </div>
      </div>
      {#if (goodPerf && Object.keys(goodPerf)?.length !== 0) || (badPerf && Object.keys(badPerf)?.length !== 0)}
        <div class="grid grid-cols-2 gap-5">
          {#if goodPerf}
            <div class="rounded-[20px] flex-1 bg_fafafbff px-4 pb-3 pt-5">
              <div class="xl:text-base text-xl text-[#6E7787FF] relative">
                <div
                  class="border border-[#00A878] absolute -top-1 left-0 w-[40px]"
                />
                Biggest win
              </div>

              {#if Object.keys(goodPerf).length !== 0}
                <div class="text-3xl xl:text-2xl">{goodPerf?.symbol}</div>

                <div class="flex flex-col">
                  <div
                    class={`flex text-2xl xl:text-lg ${
                      0 >= 0 ? "text-[#00A878]" : "text-red-500"
                    }`}
                  >
                    $<TooltipNumber
                      number={Math.abs(goodPerf?.realizedProfit || 0)}
                      type="balance"
                    />
                  </div>
                  <div class="flex items-center gap-1 text-2xl xl:text-lg">
                    <img
                      src={goodPerf?.percentRealizedProfit >= 0
                        ? TrendUp
                        : TrendDown}
                      alt="trend"
                      class="mb-1"
                    />
                    <div
                      class={`${
                        goodPerf?.percentRealizedProfit >= 0
                          ? "text-[#00A878]"
                          : "text-red-500"
                      }`}
                    >
                      <TooltipNumber
                        number={Math.abs(goodPerf?.percentRealizedProfit || 0)}
                        type="percent"
                      />
                      %
                    </div>
                  </div>
                </div>
              {:else}
                <div
                  class="h-full flex justify-center items-center pb-8 xl:text-base text-lg"
                >
                  There is no biggest win
                </div>
              {/if}
            </div>
          {/if}

          {#if badPerf}
            <div class="rounded-[20px] flex-1 bg_fafafbff px-4 pb-3 pt-5">
              <div class="xl:text-base text-xl text-[#6E7787FF] relative">
                <div
                  class="border border-red-500 absolute -top-1 left-0 w-[40px]"
                />
                Worse lose
              </div>

              {#if Object.keys(badPerf).length !== 0}
                <div class="text-3xl xl:text-2xl">{badPerf?.symbol}</div>

                <div class="flex flex-col">
                  <div
                    class={`flex text-2xl xl:text-lg ${
                      0 >= 0 ? "text-[#00A878]" : "text-red-500"
                    }`}
                  >
                    $<TooltipNumber
                      number={Math.abs(badPerf?.realizedProfit || 0)}
                      type="balance"
                    />
                  </div>
                  <div class="flex items-center gap-1 text-2xl xl:text-lg">
                    <img
                      src={badPerf?.percentRealizedProfit >= 0
                        ? TrendUp
                        : TrendDown}
                      alt="trend"
                      class="mb-1"
                    />
                    <div
                      class={`${
                        badPerf?.percentRealizedProfit >= 0
                          ? "text-[#00A878]"
                          : "text-red-500"
                      }`}
                    >
                      <TooltipNumber
                        number={Math.abs(badPerf?.percentRealizedProfit || 0)}
                        type="percent"
                      />
                      %
                    </div>
                  </div>
                </div>
              {:else}
                <div
                  class="h-full flex justify-center items-center pb-8 xl:text-base text-lg"
                >
                  There is no worse lose
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>

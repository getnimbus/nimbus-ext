<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { user, isDarkMode } from "~/store";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import type { HoldingTokenRes } from "~/types/HoldingTokenData";
  import dayjs from "dayjs";

  export let selectedAddress;

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let biggestWin = {};
  let worseLose = {};
  let winRate = 0;

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

    const formatWinRate = formatData
      .filter(
        (item) =>
          Number(item.price.price) !== 0 &&
          item?.profit?.realizedProfit !== undefined
      )
      .filter(handleFilter30Day);

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
    const response: HoldingTokenRes = await nimbus
      .get(`/v2/address/${address}/holding?chain=ALL`)
      .then((response) => response.data);
    return response;
  };

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedAddress],
    queryFn: () => getHoldingToken(selectedAddress),
    staleTime: Infinity,
    enabled:
      selectedAddress?.length !== 0 && Object.keys(userInfo).length !== 0,
  });

  $: queryTradingStats = createQuery({
    queryKey: ["trading-stats", selectedAddress],
    queryFn: () => getTradingStats(selectedAddress),
    staleTime: Infinity,
    retry: false,
    enabled:
      selectedAddress?.length !== 0 && Object.keys(userInfo).length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: profit =
    $queryTradingStats?.data !== undefined
      ? $queryTradingStats?.data?.latestStats?.unrealizedProfit +
        $queryTradingStats?.data?.latestStats?.totalRealizedProfit
      : 0;

  $: {
    if ($queryTradingStats?.data !== undefined) {
      const formatData = $queryTradingStats?.data?.metadata
        .filter((item) => item.startTrade < 2592000000)
        .map((item) => {
          return {
            ...item,
            profit: Number(item.realizedProfit) + Number(item.unrealizedProfit),
          };
        });

      if (formatData.length !== 0) {
        biggestWin = formatData.reduce((maxObject, currentObject) => {
          if (currentObject.profit > maxObject.profit) {
            return currentObject;
          } else {
            return maxObject;
          }
        });

        worseLose = formatData.reduce((maxObject, currentObject) => {
          if (currentObject.profit < maxObject.profit) {
            return currentObject;
          } else {
            return maxObject;
          }
        });
      }
    }
  }

  $: {
    if (
      !$queryTokenHolding.isError &&
      $queryTokenHolding.data &&
      $queryTokenHolding?.data !== undefined
    ) {
      formatDataHoldingToken($queryTokenHolding.data);
    }
  }

  $: totalToken = $queryTradingStats?.data?.metadata?.length || 0;
</script>

<div class="col-span-4 border border_0000001a rounded-xl flex flex-col">
  <div
    class="flex justify-start text-3xl font-medium xl:text-xl px-6 pb-3 pt-6"
  >
    Trading Stats 30D
  </div>

  {#if $queryTradingStats.isFetching}
    <div class="flex items-center justify-center px-6 pb-6 flex-1 h-[365px]">
      <LoadingPremium />
    </div>
  {:else}
    <div class="h-full relative">
      {#if $queryTradingStats.isError}
        <div
          class="h-full flex justify-center items-center xl:text-base text-lg h-[365px]"
        >
          Empty
        </div>
      {:else}
        <div class="h-full">
          {#if $queryTradingStats.data && $queryTradingStats.data !== undefined && $queryTradingStats?.data?.metadata.length === 0}
            <div
              class="h-full flex justify-center items-center xl:text-base text-lg h-[365px]"
            >
              There are no trading stats
            </div>
          {:else}
            <div class="flex flex-col gap-3 mt-2 px-6 pb-6">
              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-star text-2xl xl:text-base">
                    Trade make in last 30 days
                  </div>
                </div>
                <div
                  class="flex items-center justify-end xl:text-base text-2xl col-span-1"
                >
                  {$queryTradingStats?.data?.latestStats?.totalTrade || 0}
                </div>
              </div>

              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-base">
                    Win rate
                  </div>
                </div>
                <div
                  class="flex items-center justify-end xl:text-base text-2xl col-span-1"
                >
                  <TooltipNumber number={winRate} type="percent" />%
                </div>
              </div>

              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-base">
                    No. of Tokens
                  </div>
                </div>
                <div
                  class={`flex items-center justify-end gap-1 xl:text-base text-2xl col-span-1`}
                >
                  {totalToken}
                </div>
              </div>

              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-base">
                    Total profit
                  </div>
                </div>
                <div
                  class={`flex items-center justify-end gap-1 xl:text-base text-2xl col-span-1`}
                >
                  <div
                    class={`${
                      profit !== 0
                        ? profit >= 0
                          ? "text-[#00A878]"
                          : "text-red-500"
                        : "text_00000099"
                    }`}
                  >
                    <TooltipNumber number={Math.abs(profit)} type="value" />
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                {#if worseLose && Object.keys(worseLose).length !== 0}
                  <div class="rounded-[20px] flex-1 bg_fafafbff px-4 pb-3 pt-5">
                    <div class="xl:text-base text-xl text-[#6E7787FF] relative">
                      <div
                        class="border border-red-500 absolute -top-1 left-0 w-[40px]"
                      />
                      Worse trade
                    </div>
                    <div class="text-3xl xl:text-2xl">
                      {worseLose?.holding?.symbol}
                    </div>
                    <div class="text-2xl xl:text-lg text-[#f25f5d]">
                      <TooltipNumber
                        number={Math.abs(worseLose?.profit)}
                        type="value"
                      />
                    </div>
                  </div>
                {/if}

                {#if biggestWin && Object.keys(biggestWin).length !== 0}
                  <div class="rounded-[20px] flex-1 bg_fafafbff px-4 pb-3 pt-5">
                    <div class="xl:text-base text-xl text-[#6E7787FF] relative">
                      <div
                        class="border border-[#00A878] absolute -top-1 left-0 w-[40px]"
                      />
                      Best trade
                    </div>
                    <div class="text-3xl xl:text-2xl">
                      {biggestWin?.holding?.symbol}
                    </div>
                    <div class="text-2xl xl:text-lg text-[#05a878]">
                      <TooltipNumber
                        number={Math.abs(biggestWin?.profit)}
                        type="value"
                      />
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global>
</style>

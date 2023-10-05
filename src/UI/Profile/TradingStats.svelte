<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { user, isDarkMode } from "~/store";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

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

  const getTradingStats = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/trading-stats`
    );
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  $: queryTradingStats = createQuery({
    queryKey: ["trading-stats", selectedAddress],
    queryFn: () => getTradingStats(selectedAddress),
    staleTime: Infinity,
    retry: false,
    enabled: Object.keys(userInfo).length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: console.log("queryTradingStats: ", $queryTradingStats);

  $: profit =
    $queryTradingStats?.data !== undefined
      ? ($queryTradingStats?.data?.lfStats?.unrealizedProfit /
          $queryTradingStats?.data?.lfStats?.totalRealizedProfit) *
        100
      : 0;

  $: {
    if ($queryTradingStats?.data !== undefined) {
      const formatData = $queryTradingStats?.data.metadata.map((item) => {
        return {
          ...item,
          profit: Number(item.realizedProfit) - Number(item.unrealizedProfit),
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
</script>

<div
  class="xl:col-span-4 col-span-2 border border_0000001a rounded-xl flex flex-col min-h-[465px]"
>
  <div
    class="flex justify-start text-3xl font-medium xl:text-xl px-6 pb-3 pt-6"
  >
    Trading Stats
  </div>

  {#if $queryTradingStats.isFetching}
    <div class="flex items-center justify-center px-6 pb-6 flex-1">
      <LoadingPremium />
    </div>
  {:else}
    <div class="h-full relative">
      {#if $queryTradingStats.isError}
        <div
          class="h-full flex justify-center items-center xl:text-base text-lg"
        >
          Empty
        </div>
      {:else}
        <div class="h-full">
          {#if $queryTradingStats.data && $queryTradingStats.data !== undefined && $queryTradingStats?.data?.metadata.length === 0}
            <div
              class="h-full flex justify-center items-center xl:text-base text-lg"
            >
              There are no trading stats
            </div>
          {:else}
            <div class="flex flex-col gap-3 mt-2 px-6 pb-6">
              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-lg">
                    Trade make in last 30 days
                  </div>
                </div>
                <div
                  class="flex items-center justify-end xl:text-lg text-2xl col-span-1"
                >
                  {$queryTradingStats?.data?.lfStats?.totalTrade || 0}
                </div>
              </div>

              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-lg">
                    Win rate
                  </div>
                </div>
                <div
                  class="flex items-center justify-end xl:text-lg text-2xl col-span-1"
                >
                  {$queryTradingStats?.data?.lfStats?.winTrade || 0}
                </div>
              </div>

              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-lg">
                    Profit in last 30 days
                  </div>
                </div>
                <div
                  class={`flex items-center justify-end gap-1 xl:text-lg text-2xl col-span-1`}
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
                    <TooltipNumber number={Math.abs(profit)} type="percent" />%
                  </div>
                  {#if profit !== 0}
                    <img
                      src={profit >= 0 ? TrendUp : TrendDown}
                      alt="trend"
                      class="mb-1"
                    />
                  {/if}
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

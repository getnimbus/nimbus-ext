<script lang="ts">
  import {
    user,
    wallet,
    chain,
    typeWallet,
    isDarkMode,
    selectedPackage,
  } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";

  import Button from "~/components/Button.svelte";
  import DateRangePicker from "~/components/DateRangePicker.svelte";
  import SectorGrowth from "../AnalyticChart/SectorGrowth.svelte";
  import TotalValueHistory from "../AnalyticChart/TotalValueHistory.svelte";
  import DailyPnL from "../AnalyticChart/DailyPnL.svelte";
  import ProfitGrows from "../AnalyticChart/ProfitGrows.svelte";
  import TotalGasFee from "../AnalyticChart/TotalGasFee.svelte";
  import HistoricalActivities from "../AnalyticChart/HistoricalActivities.svelte";

  export let address;
  export let isShowSoon;
  export let packageSelected;
  export let isSync = false;
  export let enabledFetchAllData = false;

  $: isFetch = isSync ? enabledFetchAllData : true;

  // const handleGetDateRange = (data) => {
  //   console.log(data);
  // };

  const getTotalValueHistoryAndDailyGain = async (address, chain) => {
    const response = await nimbus.get(
      `/v2/analysis/${address}/holding-history?chain=${chain}&fromDate=${""}&toDate=${""}`
    );
    return response.data;
  };

  $: enabledQuery = Boolean(
    ($typeWallet === "EVM" ||
      $typeWallet === "CEX" ||
      $typeWallet === "BUNDLE") &&
      $wallet &&
      $wallet?.length !== 0 &&
      $selectedPackage !== "FREE"
  );

  $: query = createQuery({
    queryKey: ["holding-history", $wallet, $chain],
    enabled: enabledQuery && isFetch,
    queryFn: () => getTotalValueHistoryAndDailyGain($wallet, $chain),
    staleTime: Infinity,
  });
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-center">
    <div class="xl:text-2xl text-4xl font-medium">Historical Activities</div>
    <!-- <DateRangePicker onChange={handleGetDateRange} /> -->
  </div>
  <div class="flex flex-col gap-6 relative">
    <!-- <ProfitGrows isLoading={$query.isFetching} isEmpty={$query.isError} dataTotalValueHistory={$query.data.holdingHistory} />
    <TotalValueHistory isLoading={$query.isFetching} isEmpty={$query.isError} dataTotalValueHistory={$query.data.holdingHistory} />
    <DailyPnL isLoading={$query.isFetching} isEmpty={$query.isError} dataDailyPnL={$query.data.returnsChange} />
    <SectorGrowth /> -->

    {#if $typeWallet === "DEX"}
      <TotalGasFee {packageSelected} darkMode={$isDarkMode} {isFetch} />
    {:else}
      <HistoricalActivities
        {packageSelected}
        darkMode={$isDarkMode}
        {isFetch}
      />
    {/if}

    {#if isShowSoon && $user && Object.keys($user).length === 0}
      <div
        class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col justify-center items-center gap-3 z-9 backdrop-blur-md ${
          $isDarkMode ? "bg-black/90" : "bg-white/95"
        }`}
      >
        {#if $selectedPackage === "FREE"}
          <div class="flex flex-col items-center gap-1">
            <div class="text-lg font-medium">
              Use Nimbus at its full potential
            </div>
            <div class="text-base text-gray-500">
              Upgrade to Premium to access Analytics feature
            </div>
          </div>
        {/if}
        {#if $selectedPackage !== "FREE" && $typeWallet === "BTC"}
          <div class="text-lg">Coming soon 🚀</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

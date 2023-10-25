<script lang="ts">
  import { wallet, chain, typeWallet, isDarkMode } from "~/store";
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

  export let packageSelected;

  // const handleGetDateRange = (data) => {
  //   console.log(data);
  // };

  const getTotalValueHistoryAndDailyGain = async (address, chain) => {
    const response = await nimbus.get(
      `/v2/analysis/${address}/holding-history?chain=${chain}&fromDate=${""}&toDate=${""}`
    );
    return response.data;
  };

  $: enabledQuery =
    $wallet === "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0"
      ? true
      : Boolean(
          ($typeWallet === "EVM" ||
            $typeWallet === "CEX" ||
            $typeWallet === "BUNDLE") &&
            $wallet.length !== 0 &&
            packageSelected !== "FREE"
        );

  $: query = createQuery({
    queryKey: ["holding-history", $wallet, $chain],
    enabled: enabledQuery,
    queryFn: () => getTotalValueHistoryAndDailyGain($wallet, $chain),
    staleTime: Infinity,
  });
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-center">
    <div class="xl:text-2xl text-4xl font-medium">Historical Activities</div>
    <!-- <DateRangePicker onChange={handleGetDateRange} /> -->
  </div>
  <div class="flex flex-col gap-6">
    <!-- <ProfitGrows isLoading={$query.isFetching} isEmpty={$query.isError} dataTotalValueHistory={$query.data.holdingHistory} />
    <TotalValueHistory isLoading={$query.isFetching} isEmpty={$query.isError} dataTotalValueHistory={$query.data.holdingHistory} />
    <DailyPnL isLoading={$query.isFetching} isEmpty={$query.isError} dataDailyPnL={$query.data.returnsChange} />
    <SectorGrowth /> -->
    {#if $typeWallet === "DEX"}
      <TotalGasFee {packageSelected} darkMode={$isDarkMode} />
    {:else}
      <HistoricalActivities {packageSelected} darkMode={$isDarkMode} />
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

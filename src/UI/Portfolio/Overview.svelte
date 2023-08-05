<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import CountUpNumber from "~/components/CountUpNumber.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let data;
  export let totalPositions;
  export let totalClaimable;
  export let totalAssets;

  const MultipleLang = {
    networth: i18n("newtabPage.networth", "Net Worth"),
    claimable: i18n("newtabPage.claimable", "Claimable"),
    total_assets: i18n("newtabPage.total-assets", "Total Assets"),
    total_positions: i18n("newtabPage.total-positions", "Total Positions"),
    net_inflow: i18n("newtabPage.net-inflow", "Net Flow"),
    total_inflow: i18n("newtabPage.total-inflow", "Total Inflow"),
    total_outflow: i18n("newtabPage.total-outflow", "Total Outflow"),
  };

  $: netFlow =
    Number(data?.overview?.cumulativeOutflow || 0) -
    Number(data?.overview?.cumulativeInflow || 0);
</script>

<div class="flex xl:flex-row flex-col justify-between gap-6">
  <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
    <OverviewCard title={MultipleLang.networth}>
      <div class="xl:text-3xl text-5xl text-black flex">
        $<CountUpNumber
          id="networth"
          number={totalAssets + totalPositions}
          type="balance"
        />
      </div>
      <div class="flex items-center gap-3">
        <div
          class={`flex xl:text-lg text-3xl font-medium ${
            data?.overview.networthChange < 0
              ? "text-red-500"
              : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.networthChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="networth_grouth"
            number={Math.abs(data?.overview.networthChange)}
            type="percent"
          />%
        </div>
        <div class="text-[#00000066] xl:text-base text-2xl font-medium">
          24h
        </div>
      </div>
    </OverviewCard>

    <OverviewCard title={MultipleLang.net_inflow}>
      <div class="flex xl:text-3xl text-5xl text-black">
        {#if netFlow.toString().toLowerCase().includes("e-")}
          $<TooltipNumber number={netFlow} type="balance" />
        {:else}
          $<CountUpNumber id="claimable" number={netFlow} type="balance" />
        {/if}
      </div>
      <div class="flex items-center gap-3 opacity-50">
        <div
          class={`flex xl:text-lg text-3xl font-medium ${
            data?.overview.claimableChange < 0
              ? "text-red-500"
              : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.claimableChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="claimable_grouth"
            number={Math.abs(data?.overview.claimableChange)}
            type="percent"
          />%
        </div>
        <div class="text-[#00000066] xl:text-base text-2xl font-medium">
          24h
        </div>
      </div>
    </OverviewCard>
  </div>

  <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
    <OverviewCard title={MultipleLang.total_inflow}>
      <div class="xl:text-3xl text-5xl text-black flex">
        $<CountUpNumber
          id="total_assets"
          number={data?.overview?.cumulativeInflow}
          type="balance"
        />
      </div>
      <div class="flex items-center gap-3">
        <div
          class={`flex xl:text-lg text-3xl font-medium ${
            data?.overview?.cumulativeInflow < 0
              ? "text-red-500"
              : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.cumulativeInflowChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="total_assets_grouth"
            number={Math.abs(data?.overview.cumulativeInflowChange)}
            type="percent"
          />%
        </div>
        <div class="text-[#00000066] xl:text-base text-2xl font-medium">
          24h
        </div>
      </div>
    </OverviewCard>

    <OverviewCard title={MultipleLang.total_outflow}>
      <div class="flex xl:text-3xl text-5xl text-black">
        {#if data?.overview?.cumulativeOutflow
          ?.toString()
          .toLowerCase()
          .includes("e-")}
          $<TooltipNumber
            number={data?.overview?.cumulativeOutflow}
            type="balance"
          />
        {:else}
          $<CountUpNumber
            id="total_positions"
            number={data?.overview?.cumulativeOutflow}
            type="balance"
          />
        {/if}
      </div>
      <div class="flex items-center gap-3">
        <div
          class={`flex xl:text-lg text-3xl font-medium ${
            data?.overview.postionNetworthChange < 0
              ? "text-red-500"
              : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.cumulativeOutflowChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="total_positions_grouth"
            number={Math.abs(data?.overview.cumulativeOutflowChange)}
            type="percent"
          />%
        </div>
        <div class="text-[#00000066] xl:text-base text-2xl font-medium">
          24h
        </div>
      </div>
    </OverviewCard>
  </div>
</div>

<style>
</style>

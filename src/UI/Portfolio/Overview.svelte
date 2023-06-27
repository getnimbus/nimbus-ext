<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import CountUpNumber from "~/components/CountUpNumber.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";

  export let data;
  export let totalPositions;
  export let totalClaimable;
  export let totalAssets;

  const MultipleLang = {
    networth: i18n("newtabPage.networth", "Net Worth"),
    claimable: i18n("newtabPage.claimable", "Claimable"),
    total_assets: i18n("newtabPage.total-assets", "Total Assets"),
    total_positions: i18n("newtabPage.total-positions", "Total Positions"),
  };
</script>

<div class="flex xl:flex-row flex-col justify-between gap-6">
  <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
    <OverviewCard title={MultipleLang.networth}>
      <div class="text-3xl text-black flex">
        $<CountUpNumber
          id="networth"
          number={totalAssets + totalPositions}
          type="balance"
        />
      </div>
      <div class="flex items-center gap-3 opacity-50">
        <div
          class={`flex text-lg font-medium ${
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
        <div class="text-[#00000066] text-base font-medium">24h</div>
      </div>
    </OverviewCard>
    <OverviewCard title={MultipleLang.claimable}>
      <div class="text-3xl text-black flex">
        $<CountUpNumber id="claimable" number={totalClaimable} type="balance" />
      </div>
      <div class="flex items-center gap-3 opacity-50">
        <div
          class={`flex text-lg font-medium ${
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
        <div class="text-[#00000066] text-base font-medium">24h</div>
      </div>
    </OverviewCard>
  </div>

  <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
    <OverviewCard title={MultipleLang.total_assets}>
      <div class="text-3xl text-black flex">
        $<CountUpNumber id="total_assets" number={totalAssets} type="balance" />
      </div>
      <div class="flex items-center gap-3 opacity-50">
        <div
          class={`flex text-lg font-medium ${
            data?.overview.assetsChange < 0 ? "text-red-500" : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.assetsChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="total_assets_grouth"
            number={Math.abs(data?.overview.assetsChange)}
            type="percent"
          />%
        </div>
        <div class="text-[#00000066] text-base font-medium">24h</div>
      </div>
    </OverviewCard>
    <OverviewCard title={MultipleLang.total_positions}>
      <div class="text-3xl text-black flex">
        $<CountUpNumber
          id="total_positions"
          number={totalPositions}
          type="balance"
        />
      </div>
      <div class="flex items-center gap-3 opacity-50">
        <div
          class={`flex text-lg font-medium ${
            data?.overview.postionNetworthChange < 0
              ? "text-red-500"
              : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.postionNetworthChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="total_positions_grouth"
            number={Math.abs(data?.overview.postionNetworthChange)}
            type="percent"
          />%
        </div>
        <div class="text-[#00000066] text-base font-medium">24h</div>
      </div>
    </OverviewCard>
  </div>
</div>

<style>
</style>

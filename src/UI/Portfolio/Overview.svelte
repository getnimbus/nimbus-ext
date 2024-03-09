<script lang="ts">
  import { i18n } from "~/lib/i18n";
  import {
    typeWallet,
    isHidePortfolio,
    totalAssets,
    totalPositions,
    unrealizedProfit,
    realizedProfit,
    pastProfit,
  } from "~/store";

  import CountUpNumber from "~/components/CountUpNumber.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  export let data;

  const MultipleLang = {
    networth: i18n("newtabPage.networth", "Net Worth"),
    claimable: i18n("newtabPage.claimable", "Claimable"),
    total_assets: i18n("newtabPage.total-assets", "Total Assets"),
    total_positions: i18n("newtabPage.total-positions", "Total Positions"),
    net_flow: i18n("newtabPage.net_flow", "Net Flow"),
    realizedProfit: i18n("newtabPage.realizedProfit", "Realized PnL"),
    unrealizedProfit: i18n("newtabPage.unrealizedProfit", "Unrealized PnL"),
  };
</script>

<ErrorBoundary>
  <div class="flex flex-col justify-between gap-6 xl:flex-row">
    <div class="flex flex-col justify-between flex-1 gap-6 md:flex-row">
      <OverviewCard title={MultipleLang.networth}>
        <div class="flex text-4xl xl:text-3xl">
          <CountUpNumber
            number={$totalAssets + $totalPositions}
            type="value"
            personalValue
          />
        </div>
        <div
          class={`flex items-center gap-3 ${
            $typeWallet === "BTC" ? "opacity-50" : ""
          }`}
        >
          <div
            class={`flex xl:text-lg text-2xl font-medium ${
              data?.overview?.networthChange < 0
                ? "text-red-500"
                : "text-[#00A878]"
            }`}
          >
            {#if data?.overview?.networthChange < 0}
              ↓
            {:else}
              ↑
            {/if}
            <CountUpNumber
              number={Math.abs(data?.overview?.networthChange)}
              type="percent"
            />%
          </div>
          <div class="text-xl font-medium text_00000066 xl:text-base">24h</div>
        </div>
      </OverviewCard>

      <OverviewCard title={"Past Profit"}>
        <div class="flex xl:text-3xl text-4xl">
          {#if $pastProfit.toString().toLowerCase().includes("e-")}
            $<TooltipNumber number={$pastProfit} type="balance" personalValue />
          {:else}
            <span>
              {#if $pastProfit < 0 && !$isHidePortfolio}
                -
              {/if}
            </span>
            <CountUpNumber
              number={Math.abs($pastProfit)}
              type="value"
              personalValue
            />
          {/if}
        </div>
      </OverviewCard>
    </div>

    <div class="flex flex-col justify-between flex-1 gap-6 md:flex-row">
      <OverviewCard title={MultipleLang.realizedProfit}>
        <div class="xl:text-3xl text-4xl flex">
          <span>
            {#if $realizedProfit < 0 && !$isHidePortfolio}
              -
            {/if}
          </span>
          <CountUpNumber
            number={Math.abs($realizedProfit)}
            type="value"
            personalValue
          />
        </div>
        <!-- <div
          class={`flex items-center gap-3 ${
            $typeWallet === "CEX" ||
            $typeWallet === "BTC" ||
            $typeWallet === "SOL" ||
            $typeWallet === "NEAR" ||
            $typeWallet === "TON" || 
            $typeWallet === "AURA" ||
            $typeWallet === "ALGO"
              ? "opacity-50"
              : ""
          }`}
        >
          <div
            class={`flex xl:text-lg text-2xl font-medium ${
              data?.overview?.cumulativeInflow < 0
                ? "text-red-500"
                : "text-[#00A878]"
            }`}
          >
            {#if data?.overview?.cumulativeInflowChange < 0}
              ↓
            {:else}
              ↑
            {/if}
            <CountUpNumber
              number={Math.abs(data?.overview?.cumulativeInflowChange)}
              type="percent"
            />%
          </div>
          <div class="text-xl font-medium text_00000066 xl:text-base">24h</div>
        </div> -->
      </OverviewCard>

      <OverviewCard title={MultipleLang.unrealizedProfit}>
        <div class="xl:text-3xl text-4xl flex">
          <span>
            {#if $unrealizedProfit < 0 && !$isHidePortfolio}
              -
            {/if}
          </span>
          <CountUpNumber
            number={Math.abs($unrealizedProfit)}
            type="value"
            personalValue
          />
        </div>
        <!-- <div
          class={`flex items-center gap-3 ${
            $typeWallet === "CEX" ||
            $typeWallet === "BTC" ||
            $typeWallet === "SOL" ||
            $typeWallet === "NEAR" ||
            $typeWallet === "TON" || 
            $typeWallet === "AURA" ||
            $typeWallet === "ALGO"
              ? "opacity-50"
              : ""
          }`}
        >
          <div
            class={`flex xl:text-lg text-2xl font-medium ${
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
              number={Math.abs(data?.overview.cumulativeOutflowChange)}
              type="percent"
            />%
          </div>
          <div class="text-xl font-medium text_00000066 xl:text-base">24h</div>
        </div> -->
      </OverviewCard>
    </div>
  </div>
</ErrorBoundary>

<style>
</style>

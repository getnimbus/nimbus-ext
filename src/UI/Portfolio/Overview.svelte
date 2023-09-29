<script lang="ts">
  import { getChangeFromPercent, getChangePercent } from "~/chart-utils";
  import { i18n } from "~/lib/i18n";
  import { wallet, typeWallet, isHidePortfolio } from "~/store";

  import CountUpNumber from "~/components/CountUpNumber.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  export let data;
  export let dataTokenHolding;
  export let totalPositions;
  export let totalAssets;

  $: realizedProfit = (dataTokenHolding || [])
    .map((item) => {
      return {
        realized_profit: item?.profit?.realizedProfit || 0,
      };
    })
    .reduce((prev, item) => prev + Number(item.realized_profit), 0);

  $: unrealizedProfit = (dataTokenHolding || [])
    ?.filter((item) => Number(item?.amount) > 0 && Number(item?.avgCost) !== 0)
    ?.map((item) => {
      return {
        unrealized_profit:
          Number(item?.amount) *
          (Number(item?.price?.price) - Number(item?.profit?.averageCost)), // TODO: Use price from realtime
      };
    })
    .reduce((prev, item) => prev + Number(item.unrealized_profit), 0);

  const MultipleLang = {
    networth: i18n("newtabPage.networth", "Net Worth"),
    claimable: i18n("newtabPage.claimable", "Claimable"),
    total_assets: i18n("newtabPage.total-assets", "Total Assets"),
    total_positions: i18n("newtabPage.total-positions", "Total Positions"),
    net_flow: i18n("newtabPage.net_flow", "Net Flow"),
    realizedProfit: i18n("newtabPage.realizedProfit", "Realized PnL"),
    unrealizedProfit: i18n("newtabPage.unrealizedProfit", "Unrealized PnL"),
  };

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  $: networth = totalAssets + totalPositions;

  $: totalProfit =
    networth +
    Number(data?.overview?.cumulativeOutflow || 0) -
    Number(data?.overview?.cumulativeInflow || 0);

  $: changeLast24hNetWorth = getChangeFromPercent(
    networth,
    data?.overview?.networthChange
  );

  $: changeLast24hTotalInflow = getChangeFromPercent(
    data?.overview?.cumulativeInflow,
    data?.overview?.cumulativeInflowChange
  );

  $: changeLast24hTotalOutflow = getChangeFromPercent(
    data?.overview?.cumulativeOutflow,
    data?.overview?.cumulativeOutflowChange
  );

  $: changeLast24hTotalProfit =
    changeLast24hTotalOutflow -
    changeLast24hTotalInflow +
    changeLast24hNetWorth;

  $: last24hTotalProfitPercent =
    typeWalletAddress === "CEX"
      ? 0
      : getChangePercent(totalProfit, changeLast24hTotalProfit);
</script>

<ErrorBoundary>
  <div class="flex flex-col justify-between gap-6 xl:flex-row">
    <div class="flex flex-col justify-between flex-1 gap-6 md:flex-row">
      <OverviewCard title={MultipleLang.networth}>
        <div class="flex text-5xl xl:text-3xl">
          $<CountUpNumber
            id="networth"
            number={networth}
            type="balance"
            personalValue
          />
        </div>
        <div
          class={`flex items-center gap-3 ${
            typeWalletAddress === "BTC" ? "opacity-50" : ""
          }`}
        >
          <div
            class={`flex xl:text-lg text-3xl font-medium ${
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
              id="networth_grouth"
              number={Math.abs(data?.overview?.networthChange)}
              type="percent"
            />%
          </div>
          <div class="text-2xl font-medium text_00000066 xl:text-base">24h</div>
        </div>
      </OverviewCard>

      <OverviewCard
        title={MultipleLang.net_flow}
        isTooltip
        tooltipText="Net Flow = Total Outflow - Total Inflow + Net Worth"
      >
        <div class="flex xl:text-3xl text-5xl">
          {#if totalProfit.toString().toLowerCase().includes("e-")}
            $<TooltipNumber number={totalProfit} type="balance" personalValue />
          {:else}
            <span>
              {#if totalProfit < 0}
                -
              {/if}
            </span>
            $<CountUpNumber
              personalValue
              id="claimable"
              number={Math.abs(totalProfit)}
              type="balance"
            />
          {/if}
        </div>
        <div
          class={`flex items-center gap-3 ${
            typeWalletAddress === "BTC" || typeWalletAddress === "CEX"
              ? "opacity-50"
              : ""
          }`}
        >
          <div
            class={`flex xl:text-lg text-3xl font-medium ${
              last24hTotalProfitPercent < 0 ? "text-red-500" : "text-[#00A878]"
            }`}
          >
            {#if last24hTotalProfitPercent < 0}
              ↓
            {:else}
              ↑
            {/if}
            <CountUpNumber
              id="claimable_grouth"
              number={Math.abs(last24hTotalProfitPercent)}
              type="percent"
            />%
          </div>
          <div class="text-2xl font-medium text_00000066 xl:text-base">24h</div>
        </div>
      </OverviewCard>
    </div>

    <div class="flex flex-col justify-between flex-1 gap-6 md:flex-row">
      <OverviewCard title={MultipleLang.realizedProfit}>
        <div class="xl:text-3xl text-5xl flex">
          <span>
            {#if realizedProfit < 0}
              -
            {/if}
          </span>
          $<CountUpNumber
            personalValue
            id="total_assets"
            number={Math.abs(realizedProfit)}
            type="balance"
          />
        </div>
        <!-- <div
          class={`flex items-center gap-3 ${
            typeWalletAddress === "CEX" ||
            typeWalletAddress === "BTC" ||
            typeWalletAddress === "SOL"
              ? "opacity-50"
              : ""
          }`}
        >
          <div
            class={`flex xl:text-lg text-3xl font-medium ${
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
              id="total_assets_grouth"
              number={Math.abs(data?.overview?.cumulativeInflowChange)}
              type="percent"
            />%
          </div>
          <div class="text-2xl font-medium text_00000066 xl:text-base">24h</div>
        </div> -->
      </OverviewCard>

      <OverviewCard title={MultipleLang.unrealizedProfit}>
        <div class="xl:text-3xl text-5xl flex">
          <span>
            {#if unrealizedProfit < 0}
              -
            {/if}
          </span>
          $<CountUpNumber
            personalValue
            id="total_positions"
            number={Math.abs(unrealizedProfit)}
            type="balance"
          />
        </div>
        <!-- <div
          class={`flex items-center gap-3 ${
            typeWalletAddress === "CEX" ||
            typeWalletAddress === "BTC" ||
            typeWalletAddress === "SOL"
              ? "opacity-50"
              : ""
          }`}
        >
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
          <div class="text-2xl font-medium text_00000066 xl:text-base">24h</div>
        </div> -->
      </OverviewCard>
    </div>
  </div>
</ErrorBoundary>

<style>
</style>

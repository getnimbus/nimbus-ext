<script lang="ts">
  import Button from "~/components/Button.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import { i18n } from "~/lib/i18n";

  let openUserPerformanceSummary = false;

  const MultipleLang = {
    table_header_title: i18n("newTable.title", "Title"),
    table_header_all: i18n("newTable.all", "All"),
    // table_header_long: i18n("newTable.long", "Long"),
    // table_header_short: i18n("newTable.short", "Short"),
    content: {
      netProfit: i18n("newTable.content.netProfit", "Net Profit"),
      grossProfit: i18n("newTable.content.grossProfit", "Gross Profit"),
      grossLost: i18n("newTable.content.grossLost", "Gross Lost"),
      maxRunUp: i18n("newTable.content.maxRunUp", "Max Run-up"),
      maxDrawdown: i18n("newTable.content.maxDrawdown", "Max Drawdown"),
      buyAndHoldReturn: i18n(
        "newTable.content.buyAndHoldReturn",
        "Buy & Hold Return"
      ),
      sharpeRatio: i18n("newTable.content.sharpeRatio", "Sharpe Ratio"),
      sortinoRatio: i18n("newTable.content.sortinoRatio", "Sortino Ratio"),
      profitFactor: i18n("newTable.content.profitFactor", "Profit Factor"),
      maxContractsHeld: i18n(
        "newTable.content.maxContractsHeld",
        "Max Contracts Held"
      ),
      openPL: i18n("newTable.content.openPL", "Open PL"),
      commissionPaid: i18n(
        "newTable.content.commissionPaid",
        "Commission Paid"
      ),
      totalClosedTrades: i18n(
        "newTable.content.totalClosedTrades",
        "Total Closed Trades"
      ),
      totalOpenTrades: i18n(
        "newTable.content.totalOpenTrades",
        "Total Open Trades"
      ),
      numberWiningTrades: i18n(
        "newTable.content.numberWinningTrades",
        "Number Winning Trades"
      ),
      numberLosingTrades: i18n(
        "newTable.content.numberLosingTrades",
        "Number Losing Trades"
      ),
      percentProfitable: i18n(
        "newTable.content.percentProfitable",
        "Percent Profitable"
      ),
      avgTrade: i18n("newTable.content.avgTrade", "Avg Trade"),
      avgWinningTrade: i18n(
        "newTable.content.avgWinningTrade",
        "Avg Winning Trade"
      ),
      avgLosingTrade: i18n(
        "newTable.content.avgLosingTrade",
        "Avg Losing Trade"
      ),
      ratioAvgWinAvgLoss: i18n(
        "newTable.content.ratioAvgWinAvgLoss",
        "Ratio Avg Win / Avg Loss"
      ),
      largestWinningTrade: i18n(
        "newTable.content.largestWinningTrade",
        "Largest Winning Trade"
      ),
      largestLosingTrade: i18n(
        "newTable.content.largestLosingTrade",
        "Largest Losing Trade"
      ),
      avgHashtagBarsInTrade: i18n(
        "newTable.content.avgHashtagBarsInTrade",
        "Avg # Bars In Trade"
      ),
      avgHashtagBarsInWinningTrade: i18n(
        "newTable.content.avgHashtagBarsInWinningTrade",
        "Avg # Bars In Winning Trade"
      ),
      avgHashtagBarsInLosingTrade: i18n(
        "newTable.content.avgHashtagBarsInLosingTrade",
        "Avg # Bars In Losing Trade"
      ),
      marginCalls: i18n("newTable.content.marginCalls", "Margin Calls"),
    },
  };

  // data expample
  const dataTable = [
    {
      title: MultipleLang.content.netProfit,
      all: 313.0,
      long: 0.0,
      short: -12.0,
    },
    {
      title: MultipleLang.content.grossProfit,
      all: -313.0,
      long: -10.0,
      short: 12.0,
    },
    {
      title: MultipleLang.content.grossLost,
      all: 53.0,
      long: 0.0,
      short: -12.0,
    },
    {
      title: MultipleLang.content.maxRunUp,
      all: -33.0,
      long: 0.0,
      short: 12.0,
    },
    {
      title: MultipleLang.content.maxDrawdown,
      all: 13.0,
      long: 0.0,
      short: 12.0,
    },
    {
      title: MultipleLang.content.buyAndHoldReturn,
      all: 82.0,
      long: 0.0,
      short: -12.0,
    },
    {
      title: MultipleLang.content.sharpeRatio,
      all: -3.0,
      long: 0.0,
      short: 12.0,
    },
    {
      title: MultipleLang.content.sortinoRatio,
      all: -313.0,
      long: 0.0,
      short: -12.0,
    },
    {
      title: MultipleLang.content.profitFactor,
      all: -100.0,
      long: 0.0,
      short: 12.0,
    },
    {
      title: MultipleLang.content.openPL,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.commissionPaid,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.totalClosedTrades,
      all: 30.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.totalOpenTrades,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.numberWiningTrades,
      all: 20.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.numberLosingTrades,
      all: 100.0,
      long: 0,
      short: -10,
    },
    {
      title: MultipleLang.content.percentProfitable,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.avgTrade,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.avgWinningTrade,
      all: 0.0,
      long: 1,
      short: 0,
    },
    {
      title: MultipleLang.content.avgLosingTrade,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.ratioAvgWinAvgLoss,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.largestWinningTrade,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.largestLosingTrade,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.avgHashtagBarsInTrade,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.avgHashtagBarsInWinningTrade,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.avgHashtagBarsInLosingTrade,
      all: 0.0,
      long: 0,
      short: 0,
    },
    {
      title: MultipleLang.content.marginCalls,
      all: 0.0,
      long: 0,
      short: 0,
    },
  ];
</script>

<Button on:click={() => (openUserPerformanceSummary = true)}>
  <div class="w-full xl:w-[230px]">Performance Summary</div>
</Button>

<AppOverlay
  clickOutSideToClose
  isOpen={openUserPerformanceSummary}
  on:close={() => (openUserPerformanceSummary = false)}
>
  <div class="w-full max-h-[90vh] overflow-auto">
    <div class="xl:title-3 font-semibold mb-5">Summary Performance</div>
    <table class="w-full xl:text-base text-2xl">
      <thead>
        <tr>
          <th class="text-left py-1">
            {MultipleLang.table_header_title}
          </th>
          <th class="text-right py-1 px-4">
            {MultipleLang.table_header_all}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each dataTable as item}
          <tr class="border-y border-light-800">
            <td class="py-1">{item.title}</td>
            <td class="text-right py-1 px-4">
              <div class="flex flex-col">
                <span
                  class={`${
                    item.all > 0
                      ? "text-[#00A878]"
                      : item.all < 0
                      ? "text-red-500"
                      : ""
                  }`}
                  >{item.all} USD
                </span>
                <span class="xl:text-xs text-lg text-gray-400">20%</span>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</AppOverlay>

<style windi:preflights:global windi:safelist:global></style>

<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import mixpanel from "mixpanel-browser";

  import "~/components/Loading.custom.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import PublicPortfolioItem from "~/components/PublicPortfolioItem.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import Button from "~/components/Button.svelte";

  const MultipleLang = {
    whale: i18n("newtabPage.whale", "Whale 🐳"),
    whales_page_title: i18n(
      "newtabPage.whale-page-title",
      "Start earning by copying from Experienced"
    ),
    market_search_symbol: i18n(
      "newtabPage.market-search-symbol",
      "Find by symbol, name or token contract"
    ),
    market_search_amount: i18n(
      "newtabPage.market-search-amount",
      "Enter a USD amount higher than 10000"
    ),
  };

  let whalesData = [];
  let isLoading = false;
  let tableHeader;
  let isSticky = false;
  let pageValue = 0;

  const getPublicPortfolio = async () => {
    try {
      isLoading = true;
      const res = await nimbus
        .get(`/market/portfolio/?page=${pageValue}`)
        .then((response) => response.data);
      whalesData = res;
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    getPublicPortfolio();
    mixpanel.track("market_page");

    const handleScroll = () => {
      const clientRectTokenHeader = tableHeader?.getBoundingClientRect();
      isSticky = clientRectTokenHeader?.top <= 0;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] py-8 flex flex-col xl:gap-10 gap-6"
  >
    <div class="flex flex-col gap-1">
      <div class="xl:text-5xl text-7xl text-black font-semibold">
        {MultipleLang.whale}
      </div>
      <div
        class="flex justify-between xl:items-center xl:gap-11 xl:flex-row flex-col gap-6"
      >
        <div class="xl:text-xl text-3xl text-black font-medium w-max">
          {MultipleLang.whales_page_title}
        </div>
      </div>
    </div>
    <div
      class={`border border-[#0000000d] rounded-[10px] xl:overflow-visible overflow-x-auto ${
        isLoading ? "h-[1200px]" : ""
      }`}
    >
      {#if isLoading}
        <table class="table-auto xl:w-full w-[1800px]">
          <thead>
            <tr class="bg-[#f4f5f8]">
              <th
                class="pl-3 py-3 rounded-tl-[10px] 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8]"
              >
                <div
                  class="text-left xl:text-xs text-base uppercase font-semibold text-black"
                >
                  Address
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-left xl:text-xs text-base uppercase font-semibold text-black"
                >
                  Tokens
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  Net Worth
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  1D
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  7D
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  30D
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  1Y
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  <TooltipTitle
                    tooltipText={"Volatility measures the extent of price fluctuations for an asset over time."}
                    isBigIcon
                  >
                    Volatility
                  </TooltipTitle>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  <TooltipTitle
                    tooltipText={"Max drawdown is the biggest loss experienced by an investment or portfolio."}
                    isBigIcon
                  >
                    Max drawdown
                  </TooltipTitle>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  <TooltipTitle
                    tooltipText={"The Sharpe ratio measures how well an investment performs relative to its risk."}
                    isBigIcon
                  >
                    Sharpe ratio
                  </TooltipTitle>
                </div>
              </th>
              <th class="pr-3 py-3 rounded-tr-[10px]">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  Last 30D
                </div>
              </th>
            </tr>
          </thead>
        </table>
        <div
          class="flex justify-center items-center py-4 px-3 text-lg text-gray-400 h-full"
        >
          <loading-icon />
        </div>
      {:else}
        <table class="table-auto xl:w-full w-[1800px]">
          <thead
            class={isSticky ? "sticky top-0 z-10" : ""}
            bind:this={tableHeader}
          >
            <tr class="bg-[#f4f5f8]">
              <th
                class="pl-3 py-3 rounded-tl-[10px] 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8]"
              >
                <div
                  class="text-left xl:text-xs text-base uppercase font-semibold text-black"
                >
                  Address
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-left xl:text-xs text-base uppercase font-semibold text-black"
                >
                  Tokens
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  Net Worth
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  1D
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  7D
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  30D
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  1Y
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  <TooltipTitle
                    tooltipText={"Volatility measures the extent of price fluctuations for an asset over time."}
                    isBigIcon
                  >
                    Volatility
                  </TooltipTitle>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  <TooltipTitle
                    tooltipText={"Max drawdown is the biggest loss experienced by an investment or portfolio."}
                    isBigIcon
                  >
                    Max drawdown
                  </TooltipTitle>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  <TooltipTitle
                    tooltipText={"The Sharpe ratio measures how well an investment performs relative to its risk."}
                    isBigIcon
                  >
                    Sharpe ratio
                  </TooltipTitle>
                </div>
              </th>
              <th class="pr-3 py-3 rounded-tr-[10px]">
                <div
                  class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                >
                  Last 30D
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {#if whalesData.length === 0}
              <tr>
                <td colspan="11">
                  <div
                    class="flex justify-center items-center py-4 px-3 text-lg text-gray-400"
                  >
                    Empty
                  </div>
                </td>
              </tr>
            {:else}
              {#each whalesData as data}
                <PublicPortfolioItem {data} />
              {/each}
            {/if}
          </tbody>
        </table>
      {/if}
    </div>
    <div class="flex justify-center gap-3">
      <div class="w-[50px]">
        {#if pageValue === 0}
          <Button variant="disabled" disabled>
            <div class="text-2xl -mt-1">&lsaquo;</div>
          </Button>
        {:else}
          <Button
            variant="secondary"
            on:click={() => {
              if (pageValue > 1) {
                pageValue = pageValue - 1;
              } else {
                pageValue = 0;
              }
              getPublicPortfolio();
            }}
          >
            <div class="text-2xl -mt-1">&lsaquo;</div>
          </Button>
        {/if}
      </div>
      <div class="w-[50px]">
        {#if whalesData && whalesData.length === 0}
          <Button variant="disabled" disabled>
            <div class="text-2xl -mt-1">&rsaquo;</div>
          </Button>
        {:else}
          <Button
            variant="secondary"
            on:click={() => {
              pageValue = pageValue + 1;
              getPublicPortfolio();
            }}
          >
            <div class="text-2xl -mt-1">&rsaquo;</div>
          </Button>
        {/if}
      </div>
    </div>
  </div>
</ErrorBoundary>

<style></style>

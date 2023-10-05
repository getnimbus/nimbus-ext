<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import mixpanel from "mixpanel-browser";
  import { isDarkMode } from "~/store";

  import Loading from "~/components/Loading.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import PublicPortfolioItem from "~/components/PublicPortfolioItem.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import Button from "~/components/Button.svelte";
  import FilterModal from "~/UI/WhalesList/FilterModal.svelte";
  import AppOverlay from "~/components/Overlay.svelte";

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

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let whalesData = [];
  let isLoading = false;
  let tableHeader;
  let isSticky = false;
  let pageValue = 0;
  let isOpenFilterModal = false;
  let filterParams = "";
  let search = "";

  const getPublicPortfolio = async () => {
    try {
      isLoading = true;
      const res = await nimbus
        .get(
          `/market/portfolio/search?q=${filterParams}&token=${search}&page=${pageValue}`
        )
        .then((response) => response.data);
      whalesData = res;
    } catch (e) {
      console.error("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    mixpanel.track("market_page");
    getPublicPortfolio();
    const handleScroll = () => {
      const clientRectTokenHeader = tableHeader?.getBoundingClientRect();
      isSticky = clientRectTokenHeader?.top <= 0;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  const closeModal = () => {
    isOpenFilterModal = false;
  };

  const resetFilter = () => {
    filterParams = "";
    search = "";
    getPublicPortfolio();
  };

  const handleSubmitFilter = (formValue) => {
    const filterValue = {
      selectedNetWorth: formValue.selectedNetWorth,
      selectedSharpeRatio: formValue.selectedSharpeRatio,
      selectedVolatility: formValue.selectedVolatility,
      listSelectedReturn: formValue.listSelectedReturn,
    };

    search = formValue.searchValue;

    filterParams = encodeURIComponent(
      [
        filterValue.selectedNetWorth,
        filterValue.selectedSharpeRatio,
        filterValue.selectedVolatility,
        ...filterValue.listSelectedReturn,
      ]
        .filter((_) => _)
        .join(" AND ")
    );
    getPublicPortfolio();
  };
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col xl:gap-10 gap-6"
  >
    <div class="flex justify-between items-end">
      <div class="flex flex-col gap-2">
        <div class="xl:text-5xl text-7xl font-semibold">
          {MultipleLang.whale}
        </div>
        <div class="xl:text-xl text-3xl w-max">
          {MultipleLang.whales_page_title}
        </div>
      </div>
      <div class="w-[140px]">
        <Button variant="tertiary" on:click={() => (isOpenFilterModal = true)}>
          <div class="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="none"
                stroke="#fff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="m16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            <div class="xl:text-base text-2xl font-medium text-white">
              Filter
            </div>
          </div>
        </Button>
      </div>
    </div>
    <div class={`${isLoading ? "h-[1200px]" : ""}`}>
      <div
        class={`border border_0000000d rounded-[10px] xl:overflow-hidden overflow-x-auto h-full ${
          darkMode ? "bg-[#131313]" : "bg-[#fff]"
        }`}
      >
        {#if isLoading}
          <table class="table-auto xl:w-full w-[2800px]">
            <thead>
              <tr class="bg_f4f5f8">
                <th
                  class="pl-3 py-3 rounded-tl-[10px] 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8"
                >
                  <div
                    class="text-left xl:text-xs text-xl uppercase font-medium"
                  >
                    Address
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-left xl:text-xs text-xl uppercase font-medium"
                  >
                    Tokens
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    Net Worth
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    1D
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    7D
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    30D
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    1Y
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
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
                    class="text-right xl:text-xs text-xl uppercase font-medium"
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
                    class="text-right xl:text-xs text-xl uppercase font-medium"
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
                    class="text-right xl:text-xs text-xl uppercase font-medium"
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
            <Loading />
          </div>
        {:else}
          <table class="table-auto xl:w-full w-[2800px]">
            <thead
              class={isSticky ? "sticky top-0 z-10" : ""}
              bind:this={tableHeader}
            >
              <tr class="bg_f4f5f8">
                <th
                  class="pl-3 py-3 rounded-tl-[10px] 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8"
                >
                  <div
                    class="text-left xl:text-xs text-xl uppercase font-medium"
                  >
                    Address
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-left xl:text-xs text-xl uppercase font-medium"
                  >
                    Tokens
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    Net Worth
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    1D
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    7D
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    30D
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    1Y
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
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
                    class="text-right xl:text-xs text-xl uppercase font-medium"
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
                    class="text-right xl:text-xs text-xl uppercase font-medium"
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
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    Last 30D
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {#if whalesData && whalesData?.length === 0}
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

<AppOverlay
  clickOutSideToClose
  isOpen={isOpenFilterModal}
  on:close={() => {
    isOpenFilterModal = false;
  }}
>
  <FilterModal {closeModal} submit={handleSubmitFilter} {resetFilter} />
</AppOverlay>

<style></style>

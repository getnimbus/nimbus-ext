<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import mixpanel from "mixpanel-browser";

  import "~/components/Loading.custom.svelte";
  import MarketItem from "~/components/MarketItem.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import PublicPortfolioItem from "~/components/PublicPortfolioItem.svelte";

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

  const getPublicPortfolio = async () => {
    try {
      isLoading = true;
      const res = await nimbus
        .get(`/market/portfolio`)
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
      const clientRectTokenHeader = tableHeader.getBoundingClientRect();
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
      class="border border-[#0000000d] rounded-[10px] xl:overflow-visible overflow-x-auto"
    >
      <table class="table-auto xl:w-full w-[1300px]">
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
                1M
              </div>
            </th>
            <th class="pr-3 py-3 w-[190px]">
              <div
                class="text-right xl:text-xs text-base uppercase font-semibold text-black"
              >
                Volality
              </div>
            </th>
            <th class="pr-3 py-3 w-[190px]">
              <div
                class="text-right xl:text-xs text-base uppercase font-semibold text-black"
              >
                Max drawdown
              </div>
            </th>
            <th class="pr-3 py-3 w-[190px]">
              <div
                class="text-right xl:text-xs text-base uppercase font-semibold text-black"
              >
                Shapre ratio
              </div>
            </th>
            <th class="pr-3 py-3 w-[190px] rounded-tr-[10px]">
              <div
                class="text-right xl:text-xs text-base uppercase font-semibold text-black"
              >
                Last 30D
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            <div class="flex justify-center items-center py-4 px-3 w-full">
              <loading-icon />
            </div>
          {:else if whalesData.length === 0}
            <tr>
              <td colspan="6">
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
    </div>
  </div>
</ErrorBoundary>

<style></style>

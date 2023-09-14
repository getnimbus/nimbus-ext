<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import mixpanel from "mixpanel-browser";

  import "~/components/Loading.custom.svelte";
  import MarketItem from "~/components/MarketItem.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  const MultipleLang = {
    market: i18n("newtabPage.market", "Market"),
    market_page_title: i18n(
      "newtabPage.market-page-title",
      "Latest big swaps with useful information we've put together"
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

  let marketData = [];
  let searchValue = "";
  let amountValue = "";
  let timerSearchDebounce;
  let timerAmountDebounce;
  let isLoading = false;
  let tableHeader;
  let isSticky = false;

  const getMarketData = async () => {
    try {
      isLoading = true;
      const res = await nimbus
        .get(
          `/trades?minValue=${amountValue || "10000"}&token=${
            searchValue || ""
          }`
        )
        .then((response) => response.data);
      marketData = res;
    } catch (e) {
      console.error("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  const debounceSearch = (value) => {
    clearTimeout(timerSearchDebounce);
    timerSearchDebounce = setTimeout(() => {
      searchValue = value;
    }, 300);
  };

  const debounceAmount = (value) => {
    clearTimeout(timerAmountDebounce);
    timerAmountDebounce = setTimeout(() => {
      amountValue = value;
    }, 300);
  };

  onMount(() => {
    getMarketData();
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

  $: {
    setInterval(() => {
      getMarketData();
    }, 120000); // 2 mins
  }
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col xl:gap-10 gap-6"
  >
    <div class="flex flex-col gap-1">
      <div class="xl:text-5xl text-7xl font-medium">
        {MultipleLang.market}
      </div>
      <div
        class="flex justify-between xl:items-center xl:gap-11 xl:flex-row flex-col gap-6"
      >
        <div class="xl:text-xl text-3xl font-medium w-max">
          {MultipleLang.market_page_title}
        </div>
        <div class="flex flex-1 gap-3">
          <div
            class={`flex-1 border focus:outline-none w-full py-[6px] px-3 rounded-lg ${
              searchValue ? "bg-[#F0F2F7]" : "bg-white"
            }`}
          >
            <input
              on:keyup={({ target: { value } }) => debounceSearch(value)}
              on:keydown={(event) => {
                if ((event.which == 13 || event.keyCode == 13) && searchValue) {
                  getMarketData();
                }
              }}
              value={searchValue}
              placeholder={MultipleLang.market_search_symbol}
              type="text"
              class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
                searchValue ? "bg-[#F0F2F7]" : ""
              }`}
            />
          </div>
          <div
            class={`flex-[0.7] border focus:outline-none w-full py-[6px] px-3 rounded-lg ${
              amountValue ? "bg-[#F0F2F7]" : "bg-white"
            }`}
          >
            <input
              on:keyup={({ target: { value } }) => {
                const parsedValue = parseFloat(value);
                if (!isNaN(parsedValue) && parsedValue > 0) {
                  debounceAmount(value);
                } else {
                  amountValue = "";
                }
              }}
              on:keydown={(event) => {
                if ((event.which == 13 || event.keyCode == 13) && amountValue) {
                  getMarketData();
                }
              }}
              value={amountValue}
              placeholder={MultipleLang.market_search_amount}
              inputmode="decimal"
              pattern="[0-9]*(.[0-9]+)?"
              type="number"
              min="0.01"
              step="0.01"
              autocorrect="off"
              autocomplete="off"
              class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
                amountValue ? "bg-[#F0F2F7]" : ""
              }`}
            />
          </div>
        </div>
      </div>
    </div>
    <div
      class="border border_0000000d rounded-[10px] xl:overflow-visible overflow-x-auto"
    >
      <table class="table-auto xl:w-full w-[1300px]">
        <thead
          class={isSticky ? "sticky top-0 z-10" : ""}
          bind:this={tableHeader}
        >
          <tr class="bg_f4f5f8">
            <th
              class="pl-3 py-3 rounded-tl-[10px] 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8"
            >
              <div class="text-left xl:text-xs text-base uppercase font-medium">
                Pair
              </div>
            </th>
            <th class="py-3">
              <div class="text-left xl:text-xs text-base uppercase font-medium">
                Execution time
              </div>
            </th>
            <th class="py-3">
              <div class="text-left xl:text-xs text-base uppercase font-medium">
                Amount Out
              </div>
            </th>
            <th class="py-3">
              <div class="text-left xl:text-xs text-base uppercase font-medium">
                Amount In
              </div>
            </th>
            <th class="py-3">
              <div
                class="text-center xl:text-xs text-base uppercase font-medium"
              >
                Maker
              </div>
            </th>
            <th class="pr-3 py-3 w-[190px] rounded-tr-[10px]">
              <div
                class="text-right xl:text-xs text-base uppercase font-medium"
              >
                Action
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            <tr>
              <td colspan="6">
                <div class="flex justify-center items-center py-4 px-3">
                  <loading-icon />
                </div>
              </td>
            </tr>
          {:else if marketData.length === 0}
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
            {#each marketData as data}
              <MarketItem {data} />
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</ErrorBoundary>

<style></style>

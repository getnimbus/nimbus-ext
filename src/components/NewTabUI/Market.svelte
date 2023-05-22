<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "../../lib/network";
  import { i18n } from "~/lib/i18n";

  import "~/components/Loading.custom.svelte";
  import MarketItem from "~/components/MarketItem.svelte";

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
      console.log("error: ", e);
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
  });

  $: {
    setInterval(() => {
      getMarketData();
    }, 120000); // 2 mins
  }
</script>

<div class="max-w-[2000px] m-auto w-[90%] py-8 flex flex-col gap-10">
  <div class="flex flex-col">
    <div class="text-3xl text-black font-semibold">{MultipleLang.market}</div>
    <div class="flex justify-between items-center gap-11">
      <div class="text-lg text-black font-medium w-max">
        {MultipleLang.market_page_title}
      </div>
      <div class="flex flex-1 gap-3">
        <input
          on:keyup={({ target: { value } }) => debounceSearch(value)}
          on:keydown={(event) => {
            if (event.which == 13 || event.keyCode == 13) {
              getMarketData();
            }
          }}
          value={searchValue}
          placeholder={MultipleLang.market_search_symbol}
          type="text"
          class="flex-1 text-sm py-2 xl:px-3 px-2 rounded-[1000px] text-[#00000099] placeholder-[#00000099] border border-[#00000070] focus:outline-none focus:ring-0"
        />
        <input
          on:keyup={({ target: { value } }) => debounceAmount(value)}
          on:keydown={(event) => {
            if (event.which == 13 || event.keyCode == 13) {
              getMarketData();
            }
          }}
          value={amountValue}
          placeholder={MultipleLang.market_search_amount}
          type="text"
          class="flex-[0.6] text-sm py-2 xl:px-3 px-2 rounded-[1000px] text-[#00000099] placeholder-[#00000099] border border-[#00000070] focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px]">
    <table class="table-fixed w-full">
      <thead>
        <tr class="bg-[#f4f5f880]">
          <th class="pl-3 py-3 w-[250px]">
            <div class="text-left text-xs uppercase font-semibold text-black">
              Pair
            </div>
          </th>
          <th class="pl-3 py-3">
            <div class="text-left text-xs uppercase font-semibold text-black">
              Execution time
            </div>
          </th>
          <th class="py-3">
            <div class="text-left text-xs uppercase font-semibold text-black">
              Amount Out
            </div>
          </th>
          <th class="py-3">
            <div class="text-left text-xs uppercase font-semibold text-black">
              Amount In
            </div>
          </th>
          <th class="py-3 w-[170px]">
            <div class="text-center text-xs uppercase font-semibold text-black">
              Maker
            </div>
          </th>
          <th class="pr-3 py-3 w-[190px]">
            <div class="text-right text-xs uppercase font-semibold text-black">
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

<style></style>

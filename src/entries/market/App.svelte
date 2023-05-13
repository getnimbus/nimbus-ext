<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { nimbus } from "../../lib/network";
  import { i18n } from "~/lib/i18n";

  import "~/components/Loading.custom.svelte";

  import logo from "../../assets/logo-1.svg";
  import MarketItem from "~/components/MarketItem.svelte";

  const MultipleLang = {
    market: i18n("newtabPage.market", "Market"),
    market_page_title: i18n(
      "newtabPage.market-page-title",
      "Latest big swaps with useful information we've put together"
    ),
  };

  let marketData = [];
  let searchValue = "";
  let amountValue = "";
  let timerSearchDebounce;
  let timerAmountDebounce;

  const getMarketData = async () => {
    try {
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
    }
  };

  const debounceSearch = (value) => {
    clearTimeout(timerSearchDebounce);
    timerSearchDebounce = setTimeout(() => {
      searchValue = value;
    }, 500);
  };

  const debounceAmount = (value) => {
    clearTimeout(timerAmountDebounce);
    timerAmountDebounce = setTimeout(() => {
      amountValue = value;
    }, 500);
  };

  onMount(() => {
    getMarketData();
  });

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });

  $: {
    setInterval(() => {
      getMarketData();
    }, 120000);
  }
</script>

<div class="max-w-[2000px] m-auto w-[90%] py-8 flex flex-col gap-10">
  <img src={logo} alt="logo" width={200} class="-ml-6" />
  <div class="flex flex-col -mt-6">
    <div class="text-3xl text-black font-semibold">{MultipleLang.market}</div>
    <div class="flex justify-between items-center gap-11">
      <div class="text-lg text-black font-medium w-max">
        {MultipleLang.market_page_title}
      </div>
      <div class="flex flex-1 gap-3">
        <input
          on:keyup={({ target: { value } }) => debounceSearch(value)}
          on:blur={() => {
            getMarketData();
          }}
          on:keydown={(event) => {
            if (event.which == 13 || event.keyCode == 13) {
              getMarketData();
            }
          }}
          autofocus
          value={searchValue}
          placeholder="Find by symbol, name, token contract or pair address"
          type="text"
          class="flex-1 text-sm py-2 xl:px-3 px-2 rounded-[1000px] text-[#00000099] placeholder-[#00000099] border border-[#00000099] focus:outline-none focus:ring-0"
        />
        <input
          on:keyup={({ target: { value } }) => debounceAmount(value)}
          on:blur={() => {
            getMarketData();
          }}
          on:keydown={(event) => {
            if (event.which == 13 || event.keyCode == 13) {
              getMarketData();
            }
          }}
          autofocus
          value={amountValue}
          placeholder="Enter a USD amount higher than 10000"
          type="text"
          class="flex-[0.6] text-sm py-2 xl:px-3 px-2 rounded-[1000px] text-[#00000099] placeholder-[#00000099] border border-[#00000099] focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px] -mt-5">
    <table class="table-fixed w-full">
      <thead>
        <tr class="bg-[#f4f5f880]">
          <th class="pl-3 py-3 w-[250px]">
            <div class="text-left text-xs uppercase font-semibold text-black">
              Pair
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
        {#if marketData.length === 0}
          <tr>
            <td colspan="5">
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

<style windi:preflights:global windi:safelist:global>
</style>

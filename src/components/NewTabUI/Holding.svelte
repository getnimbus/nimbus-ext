<script lang="ts">
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";
  import { formatBalance } from "~/utils";

  export let data;
  export let isLoading;

  let filteredHolding = true;
  let filteredHoldingData = [];
  let marketPrice;
  let formatData = [];
  let sum = 0;

  import HoldingInfo from "../HoldingInfo.svelte";
  import "~/components/Loading.custom.svelte";

  const MultipleLang = {
    wallet: i18n("newtabPage.wallet", "Wallet"),
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    profit: i18n("newtabPage.profit", "Profit"),
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
  };

  $: {
    if (data) {
      // initial render api default data
      filteredHoldingData = data
        .map((item) => {
          return {
            ...item,
            market_price: item?.rate || 0,
          };
        })
        .filter((item) => item.value > 1);
      sum = data.reduce((prev, item) => prev + item.value, 0);
      // sub token with ws to get market price realtime data
      data.map((item) => {
        priceSubscribe([item?.cmc_id], (data) => {
          marketPrice = {
            id: data.id,
            market_price: data.p,
          };
        });
      });
    }
  }

  $: {
    if (marketPrice && data) {
      // format data with market price realtime data
      formatData = data.map((item) => {
        if (marketPrice.id === item.cmc_id) {
          return {
            ...item,
            market_price: marketPrice.market_price,
          };
        } else {
          return {
            ...item,
            market_price: item?.rate || 0,
          };
        }
      });
    }
  }

  $: {
    if (filteredHolding) {
      filteredHoldingData = formatData.filter(
        (item) => item?.amount * item.market_price > 1
      );
    } else {
      filteredHoldingData = formatData;
    }
    sum = (formatData || []).reduce(
      (prev, item) => prev + item?.amount * item.market_price,
      0
    );
  }
</script>

<div
  class="xl:w-[65%] w-full flex-col border border-[#0000001a] rounded-[20px] p-6"
>
  <div class="mb-6 flex justify-between items-center">
    <div class="text-2xl font-medium text-black">
      {MultipleLang.wallet}
    </div>
    <div class="text-3xl font-semibold text-right">
      ${isLoading ? 0 : formatBalance(sum)}
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-end gap-2">
      <label class="text-sm font-regular text-gray-400" for="filter-value"
        >{MultipleLang.hide}
      </label>
      <input
        type="checkbox"
        id="filter-value"
        bind:checked={filteredHolding}
        class="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
      />
    </div>
    <div class="border border-[#0000000d] rounded-[10px]">
      <table class="table-fixed w-full">
        <thead>
          <tr class="bg-[#f4f5f880]">
            <th class="pl-3 py-3 w-[220px]">
              <div class="text-left text-xs uppercase font-semibold text-black">
                {MultipleLang.assets}
              </div>
            </th>
            <th class="py-3">
              <div class="text-left text-xs uppercase font-semibold text-black">
                {MultipleLang.price} ($)
              </div>
            </th>
            <th class="py-3">
              <div class="text-left text-xs uppercase font-semibold text-black">
                {MultipleLang.amount}
              </div>
            </th>
            <th class="py-3">
              <div
                class="text-right text-xs uppercase font-semibold text-black"
              >
                {MultipleLang.value} ($)
              </div>
            </th>
            <th class="pr-3 py-3">
              <div
                class="text-right text-xs uppercase font-semibold text-black"
              >
                {MultipleLang.profit}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            <tr>
              <td colspan="5">
                <div class="flex justify-center items-center py-4 px-3">
                  <loading-icon />
                </div>
              </td>
            </tr>
          {:else if !isLoading && filteredHoldingData && filteredHoldingData.length === 0}
            <tr>
              <td colspan="5">
                <div class="flex justify-center items-center py-4 px-3">
                  No data
                </div>
              </td>
            </tr>
          {:else}
            {#each filteredHoldingData as holding}
              <HoldingInfo data={holding} />
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
</style>

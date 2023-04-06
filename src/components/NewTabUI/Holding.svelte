<script lang="ts">
  import { i18n } from "~/lib/i18n";

  export let data;
  export let isLoading;

  let filteredHolding = true;
  let filteredHoldingData;

  import HoldingInfo from "../HoldingInfo.svelte";
  import "~/components/Loading.custom.svelte";

  const MultipleLang = {
    wallet: i18n("newtabPage.wallet", "Wallet"),
    assets: i18n("newtabPage.assets", "Assets"),
    market_price: i18n("newtabPage.market-price", "Market price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    profit: i18n("newtabPage.profit", "Profit"),
  };

  $: {
    if (filteredHolding) {
      filteredHoldingData = data.filter((item) => item.value > 1);
    } else {
      filteredHoldingData = data;
    }
  }
</script>

<div
  class="xl:w-[65%] w-full flex-col border border-[#0000001a] rounded-[20px] p-6"
>
  <div class="mb-6 flex justify-between items-center">
    <div class="text-2xl font-medium text-black">
      {MultipleLang.wallet}
    </div>
    <div class="flex items-center gap-2">
      <label class="text-sm font-regular text-gray-400" for="filter-value"
        >Hide tokens less than $1
      </label>
      <input
        type="checkbox"
        id="filter-value"
        bind:checked={filteredHolding}
        class="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
      />
    </div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
    <table class="table-auto 2xl:w-full xl:w-auto w-full">
      <thead>
        <tr class="bg-[#f4f5f880]">
          <th class="pl-3 py-3">
            <div
              class="text-left text-sm uppercase font-semibold text-black min-w-[220px]"
            >
              {MultipleLang.assets}
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-right text-sm uppercase font-semibold text-black min-w-[120px]"
            >
              {MultipleLang.market_price}
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-right text-sm uppercase font-semibold text-black min-w-[120px]"
            >
              {MultipleLang.amount}
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-right text-sm uppercase font-semibold text-black min-w-[130px]"
            >
              {MultipleLang.value}
            </div>
          </th>
          <th class="pr-3 py-3">
            <div
              class="text-right text-sm uppercase font-semibold text-black min-w-[125px]"
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
        {:else if filteredHoldingData && filteredHoldingData.length !== 0}
          {#each filteredHoldingData as holding}
            <HoldingInfo data={holding} />
          {/each}
        {:else}
          <tr>
            <td colspan="5">
              <div class="flex justify-center items-center py-4 px-3">
                No data
              </div>
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>

<style>
</style>

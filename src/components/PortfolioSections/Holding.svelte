<script lang="ts">
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";
  import { formatBalance } from "~/utils";

  export let holdingTokenData;
  export let holdingNFTData;
  export let isLoadingToken;
  export let isLoadingNFT;
  export let totalAssets;
  export let selectedWallet;

  $: console.log({
    holdingNFTData,
  });

  let filteredHoldingToken = true;
  let filteredHoldingDataToken = [];
  let marketPrice;
  let formatData = [];
  let sum = 0;

  import HoldingToken from "../HoldingToken.svelte";
  import HoldingNFT from "../HoldingNFT.svelte";
  import "~/components/Loading.custom.svelte";
  import ErrorBoundary from "../ErrorBoundary.svelte";

  const MultipleLang = {
    holding: i18n("newtabPage.holding", "Holding"),
    token: i18n("newtabPage.token", "Tokens"),
    nft: i18n("newtabPage.nft", "NFTs"),
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    profit: i18n("newtabPage.profit", "Profit"),
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
  };

  $: {
    if (holdingTokenData) {
      holdingTokenData.map((item) => {
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
    if (holdingTokenData) {
      formatData = holdingTokenData.map((item) => {
        return {
          ...item,
          market_price: item?.rate || 0,
        };
      });
      filteredHoldingDataToken = formatData.filter((item) => item.value > 1);
      sum = holdingTokenData.reduce((prev, item) => prev + item.value, 0);
      totalAssets = holdingTokenData.reduce(
        (prev, item) => prev + item.value,
        0
      );
    }
  }

  $: {
    if (marketPrice) {
      const formatDataWithMarketPrice = formatData.map((item) => {
        if (marketPrice.id === item.cmc_id) {
          return {
            ...item,
            market_price: marketPrice.market_price,
          };
        }
        return { ...item };
      });
      formatData = formatDataWithMarketPrice;
    }
  }

  $: {
    if (filteredHoldingToken) {
      filteredHoldingDataToken = formatData.filter(
        (item) => item?.amount * item.market_price > 1
      );
    } else {
      filteredHoldingDataToken = formatData;
    }
    sum = (formatData || []).reduce(
      (prev, item) => prev + item?.amount * item.market_price,
      0
    );
    totalAssets = (formatData || []).reduce(
      (prev, item) => prev + item?.amount * item.market_price,
      0
    );
  }
</script>

<div
  class="xl:w-[70%] w-full flex flex-col gap-6 border border-[#0000001a] rounded-[20px] p-6"
>
  <ErrorBoundary>
    <div class="text-2xl font-medium text-black">
      {MultipleLang.holding}
    </div>

    <div>
      <div class="mb-2 flex justify-between items-center">
        <div class="text-xl font-medium text-black">
          {MultipleLang.token}
        </div>
        <div class="text-3xl font-semibold text-right">
          ${isLoadingToken ? 0 : formatBalance(sum)}
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
            bind:checked={filteredHoldingToken}
            class="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div class="border border-[#0000000d] rounded-[10px]">
          <table class="table-auto w-full">
            <thead>
              <tr class="bg-[#f4f5f880]">
                <th class="pl-3 py-3 w-[200px]">
                  <div
                    class="text-left text-xs uppercase font-semibold text-black"
                  >
                    {MultipleLang.assets}
                  </div>
                </th>
                <th class="py-3 min-w-[160px]">
                  <div
                    class="text-left text-xs uppercase font-semibold text-black"
                  >
                    {MultipleLang.price} ($)
                  </div>
                </th>
                <th class="py-3 w-[160px]">
                  <div
                    class="text-right text-xs uppercase font-semibold text-black"
                  >
                    {MultipleLang.amount}
                  </div>
                </th>
                <th class="py-3 w-[160px]">
                  <div
                    class="text-right text-xs uppercase font-semibold text-black"
                  >
                    {MultipleLang.value} ($)
                  </div>
                </th>
                <th
                  class={`py-3 w-[160px] ${
                    filteredHoldingDataToken.filter((item) => item.positionId)
                      .length === 0 && "pr-3"
                  }`}
                >
                  <div
                    class="text-right text-xs uppercase font-semibold text-black"
                  >
                    {MultipleLang.profit}
                  </div>
                </th>

                {#if filteredHoldingDataToken.filter((item) => item.positionId).length !== 0}
                  <th class="py-3 w-10" />
                {/if}
              </tr>
            </thead>
            {#if isLoadingToken}
              <tbody>
                <tr>
                  <td
                    colspan={filteredHoldingDataToken.filter(
                      (item) => item.positionId
                    ).length === 0
                      ? 5
                      : 6}
                  >
                    <div class="flex justify-center items-center py-4 px-3">
                      <loading-icon />
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else}
              <tbody>
                {#if filteredHoldingDataToken && filteredHoldingDataToken.length === 0}
                  <tr>
                    <td
                      colspan={filteredHoldingDataToken.filter(
                        (item) => item.positionId
                      ).length === 0
                        ? 5
                        : 6}
                    >
                      <div
                        class="flex justify-center items-center py-4 px-3 text-lg text-gray-400"
                      >
                        Empty
                      </div>
                    </td>
                  </tr>
                {:else}
                  {#each filteredHoldingDataToken as holding}
                    <HoldingToken data={holding} {selectedWallet} />
                  {/each}
                {/if}
              </tbody>
            {/if}
          </table>
        </div>
      </div>
      <div class="text-xs text-gray-400 text-right mt-2">
        Profit and loss is calculated by transactions that swap the tokens
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xl font-medium text-black">
        {MultipleLang.nft}
      </div>
      <div class="border border-[#0000000d] rounded-[10px]">
        <table class="table-auto w-full">
          <thead>
            <tr class="bg-[#f4f5f880]">
              <th class="pl-3 py-3">
                <div
                  class="text-left text-xs uppercase font-semibold text-black"
                >
                  Collection
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-left text-xs uppercase font-semibold text-black"
                >
                  Balance
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right text-xs uppercase font-semibold text-black"
                >
                  Floor price ($)
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right text-xs uppercase font-semibold text-black"
                >
                  Total spent
                </div>
              </th>
              <th class="py-3">
                <div
                  class="text-right text-xs uppercase font-semibold text-black"
                >
                  Current value ($)
                </div>
              </th>
              <th class="py-3 pr-3">
                <div
                  class="text-right text-xs uppercase font-semibold text-black"
                >
                  Profit & Loss
                </div>
              </th>
            </tr>
          </thead>
          {#if isLoadingNFT}
            <tbody>
              <tr>
                <td colspan={7}>
                  <div class="flex justify-center items-center py-4 px-3">
                    <loading-icon />
                  </div>
                </td>
              </tr>
            </tbody>
          {:else}
            <tbody>
              {#if holdingNFTData && holdingNFTData.length === 0}
                <tr>
                  <td colspan={7}>
                    <div
                      class="flex justify-center items-center py-4 px-3 text-lg text-gray-400"
                    >
                      Empty
                    </div>
                  </td>
                </tr>
              {:else}
                {#each holdingNFTData as holding}
                  <HoldingNFT data={holding} {selectedWallet} />
                {/each}
              {/if}
            </tbody>
          {/if}
        </table>
      </div>
    </div>
  </ErrorBoundary>
</div>

<style>
</style>

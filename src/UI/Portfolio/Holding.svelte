<script lang="ts">
  import { onMount } from "svelte";
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";
  import { getAddressContext } from "~/utils";
  import { chain, typeWallet, isDarkMode } from "~/store";

  export let selectedTokenHolding;
  export let selectedDataPieChart;
  export let holdingTokenData;
  export let holdingNFTData;
  export let isLoadingToken;
  export let isLoadingNFT;
  export let totalAssets;
  export let selectedWallet;

  import Select from "~/components/Select.svelte";
  import HoldingToken from "~/components/HoldingToken.svelte";
  import HoldingNFT from "~/components/HoldingNFT.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import "~/components/Loading.custom.svelte";

  let filteredHoldingToken = true;
  let filteredHoldingDataToken = [];
  let marketPriceToken;
  let marketPriceNFT;
  let formatData = [];
  let formatDataNFT = [];
  let sumTokens = 0;
  let sumAllTokens = 0;
  let sumNFT = 0;
  let tableTokenHeader;
  let isStickyTableToken = false;
  let tableNFTHeader;
  let isStickyTableNFT = false;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let selectedTypeTable = {
    label: "",
    value: "",
  };

  const MultipleLang = {
    holding: i18n("newtabPage.holding", "Holding"),
    token: i18n("newtabPage.token", "Tokens"),
    nft: i18n("newtabPage.nft", "NFTs"),
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    profit: i18n("newtabPage.profit", "Profit & Loss"),
    total_spent: i18n("newtabPage.total_spent", "Total Spent"),
    collection: i18n("newtabPage.collection", "Collection"),
    floor_price: i18n("newtabPage.floor_price", "Floor Price"),
    current_value: i18n("newtabPage.current_value", "Current Value"),
    Balance: i18n("newtabPage.Balance", "Balance"),
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  onMount(() => {
    const handleScroll = () => {
      const clientRectTokenHeader = tableTokenHeader?.getBoundingClientRect();
      isStickyTableToken = clientRectTokenHeader?.top <= 0;
      const clientRectNFTHeader = tableNFTHeader?.getBoundingClientRect();
      isStickyTableNFT = clientRectNFTHeader?.top <= 0;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: {
    if (selectedTokenHolding && holdingTokenData?.length !== 0) {
      holdingTokenData?.map((item) => {
        priceSubscribe([item?.cmc_id], (data) => {
          marketPriceToken = {
            id: data.id,
            market_price: data.p,
          };
        });
      });
      sumAllTokens = holdingTokenData?.reduce(
        (prev, item) => prev + item.value,
        0
      );
    }
    if (holdingNFTData) {
      holdingNFTData?.map((item) => {
        priceSubscribe([item?.cmc_id], (data) => {
          marketPriceNFT = {
            id: data.id,
            market_price: data.p,
          };
        });
      });
    }
  }

  $: {
    if (
      selectedTokenHolding &&
      Object.keys(selectedTokenHolding).length !== 0 &&
      selectedTokenHolding.data.length !== 0
    ) {
      let data = [];
      if (selectedTypeTable && Object.keys(selectedTypeTable).length !== 0) {
        if (Array.isArray(selectedTokenHolding.data)) {
          data = selectedTokenHolding?.data.find(
            (item) => item.name === selectedTypeTable.value
          )?.data;
        } else {
          data = selectedTokenHolding.data.data;
        }
      }

      if (data && data.length !== 0) {
        formatData = data.map((item) => {
          return {
            ...item,
            market_price: item?.rate || 0,
          };
        });
        filteredHoldingDataToken = formatData.filter((item) => item.value > 1);
        sumTokens = data.reduce((prev, item) => prev + item.value, 0);
      }
    }
    if (holdingNFTData) {
      formatDataNFT = holdingNFTData
        .map((item) => {
          return {
            ...item,
            market_price: item?.btcPrice || 0,
            current_value: item?.floorPriceBTC * item?.btcPrice * item?.balance,
          };
        })
        .sort((a, b) => {
          if (a.current_value < b.current_value) {
            return 1;
          }
          if (a.current_value > b.current_value) {
            return -1;
          }
          return 0;
        });
      sumNFT = formatDataNFT.reduce(
        (prev, item) => prev + item.current_value,
        0
      );
    }
  }

  $: {
    if (marketPriceToken) {
      const formatDataWithMarketPrice = formatData.map((item) => {
        if (marketPriceToken.id === item.cmc_id) {
          return {
            ...item,
            market_price: marketPriceToken.market_price,
          };
        }
        return { ...item };
      });
      formatData = formatDataWithMarketPrice;
      filteredHoldingDataToken = formatData.filter((item) => item.value > 1);
      sumTokens = formatDataWithMarketPrice.reduce(
        (prev, item) => prev + item.value,
        0
      );
      sumAllTokens = formatDataWithMarketPrice.reduce(
        (prev, item) => prev + item.value,
        0
      );
    }
    if (marketPriceNFT) {
      const formatDataWithMarketPrice = formatDataNFT.map((item) => {
        if (marketPriceNFT.id === item.cmc_id) {
          return {
            ...item,
            market_price: marketPriceNFT.market_price,
            current_value:
              item?.floorPriceBTC * marketPriceNFT.market_price * item?.balance,
          };
        }
        return { ...item };
      });
      formatDataNFT = formatDataWithMarketPrice;
    }
  }

  $: filteredHoldingDataToken = filteredHoldingToken
    ? formatData?.filter((item) => item?.amount * item.market_price > 1)
    : formatData;

  $: {
    if (formatData?.length === 0) {
      totalAssets = 0;
      sumTokens = 0;
      sumNFT = 0;
    } else {
      sumTokens = (formatData || []).reduce(
        (prev, item) => prev + item?.amount * item.market_price,
        0
      );
      sumNFT = (formatDataNFT || []).reduce(
        (prev, item) => prev + item?.current_value,
        0
      );
    }
  }

  $: {
    if (
      selectedTokenHolding &&
      Object.keys(selectedTokenHolding).length !== 0 &&
      selectedTokenHolding?.select.length === 0 &&
      (sumTokens || sumNFT)
    ) {
      totalAssets = sumNFT + sumTokens;
    }
  }

  $: colspan =
    typeWalletAddress === "DEX" &&
    getAddressContext(selectedWallet)?.type !== "EVM"
      ? 8
      : 7;

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        sumTokens = 0;
        sumAllTokens = 0;
        sumNFT = 0;
        formatData = [];
        formatDataNFT = [];
        filteredHoldingDataToken = [];
        marketPriceToken = undefined;
        marketPriceNFT = undefined;
      }
    }
  }

  $: {
    if (
      selectedTokenHolding &&
      Object.keys(selectedTokenHolding).length !== 0 &&
      selectedTokenHolding.data.length !== 0 &&
      selectedTokenHolding?.data?.data?.length === 0
    ) {
      filteredHoldingDataToken = [];
      sumTokens = 0;
    }
  }
</script>

<div
  class={`flex flex-col gap-6 rounded-[20px] p-6 ${
    darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
  }`}
>
  <ErrorBoundary>
    <div class="flex items-end gap-3">
      <div class="xl:text-2xl text-4xl font-medium">
        {MultipleLang.holding}
      </div>
      <!-- <a
        href="https://forms.gle/HfmvSTzd5frPPYDz8"
        target="_blank"
        class="xl:text-sm text-xl font-normal text-blue-500 mb-[2px] hover:text-blue-700 transition-all"
      >
        Get investment opportunities notification
      </a> -->
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="xl:text-xl text-3xl font-medium">
            {MultipleLang.token}
          </div>
          {#if selectedTokenHolding && Object.keys(selectedTokenHolding).length !== 0 && selectedTokenHolding?.select.length !== 0}
            <Select
              type="lang"
              positionSelectList="left-0"
              listSelect={selectedTokenHolding?.select || []}
              bind:selected={selectedTypeTable}
            />
          {/if}
        </div>
        <div class="xl:text-3xl text-4xl font-medium text-right">
          $<TooltipNumber number={sumTokens} type="balance" />
          {#if selectedTokenHolding && Object.keys(selectedTokenHolding).length !== 0 && selectedTokenHolding?.select.length !== 0}
            <span class="xl:text-xl text-2xl font-medium text-gray-400">
              <TooltipNumber
                number={selectedDataPieChart?.series[0]?.data.filter(
                  (item) => item.name === selectedTypeTable?.value
                )[0]?.value}
                type="percent"
              />%
            </span>
          {/if}
        </div>
      </div>

      <!-- token holding table -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-end gap-2">
          <label
            class="xl:text-sm text-lg font-regular text-gray-400"
            for="filter-value"
            >{MultipleLang.hide}
          </label>
          <input
            type="checkbox"
            id="filter-value"
            bind:checked={filteredHoldingToken}
            class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
          />
        </div>
        <div
          class={`rounded-[10px] xl:overflow-visible overflow-x-auto ${
            darkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          <table class="table-auto xl:w-full w-[1800px]">
            <thead
              class={isStickyTableToken ? "sticky top-0 z-10" : ""}
              bind:this={tableTokenHeader}
            >
              <tr class="bg_f4f5f8">
                <th
                  class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[420px]"
                >
                  <div
                    class="text-left xl:text-xs text-base uppercase font-medium"
                  >
                    {MultipleLang.assets}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    {MultipleLang.price}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    {MultipleLang.amount}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    {MultipleLang.value}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    <TooltipTitle
                      tooltipText="Ratio based on total token holding"
                    >
                      Ratio
                    </TooltipTitle>
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    Realized Profit
                  </div>
                </th>
                <th class="py-3 pr-3 rounded-tr-[10px]">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    Unrealized Profit
                  </div>
                </th>
                <!-- <th class="py-3 w-10 rounded-tr-[10px]" /> -->
              </tr>
            </thead>
            {#if isLoadingToken}
              <tbody>
                <tr>
                  <td {colspan}>
                    <div class="flex justify-center items-center py-3 px-3">
                      <loading-icon />
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else}
              <tbody>
                {#if filteredHoldingDataToken && filteredHoldingDataToken.length === 0}
                  <tr>
                    <td {colspan}>
                      <div
                        class="flex justify-center items-center py-3 px-3 xl:text-lg text-xl text-gray-400"
                      >
                        {MultipleLang.empty}
                      </div>
                    </td>
                  </tr>
                {:else}
                  {#each filteredHoldingDataToken as holding}
                    <HoldingToken
                      data={holding}
                      {selectedWallet}
                      sumAllTokens={totalAssets - sumNFT}
                    />
                  {/each}
                {/if}
              </tbody>
            {/if}
          </table>
        </div>
      </div>
    </div>

    <!-- nft holding table -->
    {#if typeWalletAddress === "DEX" && getAddressContext(selectedWallet)?.type === "BTC"}
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <div class="xl:text-xl text-3xl font-medium">
            {MultipleLang.nft}
          </div>
          <div class="xl:text-3xl text-4xl font-medium text-right">
            $<TooltipNumber number={sumNFT} type="balance" />
          </div>
        </div>
        <div
          class="border border_0000000d rounded-[10px] xl:overflow-visible overflow-x-auto"
        >
          <table class="table-auto xl:w-full w-[1400px]">
            <thead
              class={isStickyTableNFT ? "sticky top-0 z-10" : ""}
              bind:this={tableNFTHeader}
            >
              <tr class="bg_f4f5f8">
                <th
                  class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[220px]"
                >
                  <div
                    class="text-left xl:text-xs text-base uppercase font-medium"
                  >
                    {MultipleLang.collection}
                  </div>
                </th>
                <th
                  class="py-3 xl:static xl:bg-transparent sticky left-[220px] z-10 bg_f4f5f8 w-[160px]"
                >
                  <div
                    class="text-left xl:text-xs text-base uppercase font-medium"
                  >
                    {MultipleLang.Balance}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    <TooltipTitle
                      tooltipText={getAddressContext(selectedWallet)?.type ===
                      "EVM"
                        ? "The Floor price of last 24h, if there is no volume, the floor price is 0"
                        : "The Floor price from Magic Eden marketplace. "}
                      link={getAddressContext(selectedWallet)?.type === "EVM"
                        ? ""
                        : "https://magiceden.io/ordinals"}
                    >
                      {MultipleLang.floor_price}
                    </TooltipTitle>
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    {MultipleLang.total_spent}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    {MultipleLang.current_value}
                  </div>
                </th>
                <th
                  class={`py-3 pr-3 ${
                    getAddressContext(selectedWallet)?.type === "EVM"
                      ? "rounded-tr-[10px]"
                      : ""
                  }`}
                >
                  <div
                    class="text-right xl:text-xs text-base uppercase font-medium"
                  >
                    <TooltipTitle
                      tooltipText="Price NFTs now - Price NFTs at time you spent"
                    >
                      {MultipleLang.profit}
                    </TooltipTitle>
                  </div>
                </th>
                {#if typeWalletAddress === "DEX" && getAddressContext(selectedWallet)?.type !== "EVM"}
                  <th class="py-3 w-10 rounded-tr-[10px]" />
                {/if}
              </tr>
            </thead>
            {#if isLoadingNFT}
              <tbody>
                <tr>
                  <td {colspan}>
                    <div class="flex justify-center items-center py-3 px-3">
                      <loading-icon />
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else}
              <tbody>
                {#if formatDataNFT && formatDataNFT.length === 0}
                  <tr>
                    <td {colspan}>
                      <div
                        class="flex justify-center items-center py-3 px-3 text-lg text-gray-400"
                      >
                        {MultipleLang.empty}
                      </div>
                    </td>
                  </tr>
                {:else}
                  {#each formatDataNFT as holding}
                    <HoldingNFT data={holding} {selectedWallet} />
                  {/each}
                {/if}
              </tbody>
            {/if}
          </table>
        </div>
      </div>
    {/if}
  </ErrorBoundary>
</div>

<style>
</style>

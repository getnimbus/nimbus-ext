<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { chain, typeWallet, isDarkMode } from "~/store";
  import { filterTokenValueType } from "~/utils";
  import { groupBy } from "lodash";
  import { priceMobulaSubscribe } from "~/lib/price-mobulaWs";
  import { priceSubscribe } from "~/lib/price-ws";

  export let selectedWallet;
  export let isLoadingNFT;
  export let isLoadingToken;
  export let holdingTokenData;
  export let holdingNFTData;

  import ClosedHoldingTokenPosition from "~/components/ClosedHoldingTokenPosition.svelte";
  import HoldingNFT from "~/components/HoldingNFT.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Loading from "~/components/Loading.svelte";
  import Select from "~/components/Select.svelte";

  let filteredHoldingDataToken = [];

  let dataSubWS = [];
  let marketPriceToken;
  let formatData = [];
  let formatDataNFT = [];
  let sumAllTokens = 0;
  let sumNFT = 0;
  let tableClosedTokenHeader;
  let isStickyTableClosedToken = false;
  let tableClosedNFTHeader;
  let isStickyTableClosedNFT = false;

  let filterTokenType = {
    label: "$1",
    value: 1,
  };

  const MultipleLang = {
    token_position: i18n("newtabPage.token_position", "Closed Positions"),
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
    hide_roi_token: i18n(
      "newtabPage.hide-token-has-roi-less-than-1",
      "Hide tokens has ROI less than $1"
    ),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  onMount(() => {
    const handleScroll = () => {
      const clientRectTokenHeader =
        tableClosedTokenHeader?.getBoundingClientRect();
      isStickyTableClosedToken = clientRectTokenHeader?.top <= 0;
      const clientRectNFTHeader = tableClosedNFTHeader?.getBoundingClientRect();
      isStickyTableClosedNFT = clientRectNFTHeader?.top <= 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  // format initial data
  $: {
    if (holdingTokenData) {
      formatData = holdingTokenData
        ?.filter((item) => Number(item?.amount) === 0)
        ?.filter((item) => {
          if (item?.profit !== undefined) {
            return Number(item?.profit.realizedProfit) !== 0;
          }
        })
        ?.map((item) => {
          return {
            ...item,
            market_price: item?.rate || 0,
          };
        })
        .sort(
          (a, b) =>
            Number(b?.profit.realizedProfit) - Number(a?.profit.realizedProfit)
        );

      sumAllTokens = formatData.reduce(
        (prev, item) => prev + Number(item?.profit.realizedProfit),
        0
      );

      filteredHoldingDataToken = formatData.filter(
        (item) => Math.abs(Number(item?.profit.realizedProfit)) > 1
      );
    }
    if (holdingNFTData) {
      formatDataNFT = holdingNFTData
        .map((item) => {
          return {
            ...item,
            market_price: item?.btcPrice || 0,
            current_value:
              item?.floorPriceBTC * item?.btcPrice * item?.balance || 0,
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

  // subscribe to ws
  $: {
    if (!isLoadingToken) {
      if (holdingTokenData?.length !== 0) {
        const dataTokenHolding = holdingTokenData?.filter(
          (item) =>
            item?.price?.source === undefined ||
            item?.price?.source !== "Modifed"
        );
        const filteredHoldingTokenData = dataTokenHolding?.filter(
          (item) => item?.cmc_id
        );
        const filteredNullCmcHoldingTokenData = dataTokenHolding?.filter(
          (item) => item?.cmc_id === null
        );
        const groupFilteredNullCmcHoldingTokenData = groupBy(
          filteredNullCmcHoldingTokenData,
          "chain"
        );
        const filteredUndefinedCmcHoldingTokenData = dataTokenHolding?.filter(
          (item) => item?.cmc_id === undefined
        );
        if (
          $typeWallet === "CEX" &&
          filteredUndefinedCmcHoldingTokenData.length > 0
        ) {
          filteredUndefinedCmcHoldingTokenData
            .filter((item) => item?.symbol)
            .map((item) => {
              priceMobulaSubscribe([item?.symbol], "CEX", (data) => {
                marketPriceToken = {
                  id: data.id,
                  market_price: data.price,
                };
              });
            });
        }
        const chainList = Object.keys(groupFilteredNullCmcHoldingTokenData);
        chainList.map((chain) => {
          groupFilteredNullCmcHoldingTokenData[chain]
            .filter((item) => item?.contractAddress)
            .map((item) => {
              priceMobulaSubscribe(
                [item?.contractAddress],
                item?.chain,
                (data) => {
                  marketPriceToken = {
                    id: data.id,
                    market_price: data.price,
                  };
                }
              );
            });
        });
        dataSubWS = filteredHoldingTokenData.map((item) => {
          return {
            symbol: item.symbol,
            cmcId: item.cmc_id,
          };
        });
      }
    }
  }

  $: {
    if (!isLoadingToken && dataSubWS && dataSubWS.length !== 0) {
      let filteredData = [];
      const symbolSet = new Set();
      dataSubWS.forEach((item) => {
        if (!symbolSet.has(item.symbol)) {
          symbolSet.add(item.symbol);
          filteredData.push(item);
        }
      });
      filteredData?.map((item) => {
        priceSubscribe([Number(item?.cmcId)], item?.chain, (data) => {
          marketPriceToken = {
            id: data.id,
            market_price: data.price,
          };
        });
      });
    }
  }

  // check market price and update price real-time
  $: {
    if (marketPriceToken) {
      const formatDataWithMarketPrice = formatData.map((item) => {
        if (
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.cmc_id?.toString().toLowerCase() ||
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.contractAddress.toString().toLowerCase() ||
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.symbol?.toString().toLowerCase() ||
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.price?.symbol?.toString().toLowerCase()
        ) {
          return {
            ...item,
            market_price: Number(marketPriceToken.market_price),
            value: Number(item?.amount) * Number(marketPriceToken.market_price),
          };
        }
        return { ...item };
      });
      formatData = formatDataWithMarketPrice.sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });
      filteredHoldingDataToken = formatData.filter(
        (item) => Math.abs(Number(item?.profit.realizedProfit)) > 1
      );
      sumAllTokens = formatData.reduce(
        (prev, item) => prev + Number(item?.profit.realizedProfit),
        0
      );
    }
  }

  $: {
    if (filterTokenType) {
      if (filterTokenType.value === 0) {
        filteredHoldingDataToken = formatData;
      } else {
        filteredHoldingDataToken = formatData?.filter(
          (item) =>
            Math.abs(Number(item?.profit.realizedProfit)) >
            filterTokenType.value
        );
      }
    }
  }

  $: {
    if (formatData?.length === 0) {
      sumAllTokens = 0;
      sumNFT = 0;
    } else {
      sumAllTokens = formatData.reduce(
        (prev, item) => prev + Number(item?.profit.realizedProfit),
        0
      );
      sumNFT = (formatDataNFT || []).reduce(
        (prev, item) => prev + item?.current_value,
        0
      );
    }
  }

  $: colspan =
    $typeWallet === "SOL" ||
    $typeWallet === "NEAR" ||
    $typeWallet === "TON" ||
    $typeWallet === "AURA" ||
    $typeWallet === "ALGO" ||
    $typeWallet === "EVM" ||
    $typeWallet === "MOVE" ||
    $typeWallet === "BUNDLE" ||
    $typeWallet === "CEX"
      ? 5
      : 4;

  $: {
    if (selectedWallet || $chain) {
      if (selectedWallet?.length !== 0 && $chain?.length !== 0) {
        sumAllTokens = 0;
        sumNFT = 0;
        formatData = [];
        formatDataNFT = [];
        filteredHoldingDataToken = [];
        marketPriceToken = undefined;
      }
    }
  }
</script>

<div
  class={`flex flex-col gap-6 rounded-[20px] p-6 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
  }`}
>
  <ErrorBoundary>
    <div class="flex items-end gap-3">
      {#if $typeWallet !== "EVM" && $typeWallet !== "MOVE"}
        <div class="xl:text-2xl text-4xl font-medium">
          {MultipleLang.token_position}
        </div>
      {:else}
        <TooltipTitle
          tooltipText="Closed positions for BNB and AVAX might not accuracy, we're working to fix it"
          type="warning"
        >
          <div class="xl:text-2xl text-4xl font-medium">
            {MultipleLang.token_position}
          </div>
        </TooltipTitle>
      {/if}
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="xl:text-xl text-3xl font-medium">
            {MultipleLang.token}
          </div>
        </div>
        <div
          class={`xl:text-3xl text-4xl font-medium text-right ${
            sumAllTokens !== 0
              ? sumAllTokens >= 0
                ? "text-[#00A878]"
                : "text-red-500"
              : $isDarkMode
                ? "text-white"
                : "text-black"
          }`}
        >
          <TooltipNumber
            number={Math.abs(sumAllTokens)}
            type="value"
            personalValue
          />
        </div>
      </div>

      <!-- token holding table -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-end gap-2">
          <div class="xl:text-sm text-2xl font-regular text-gray-400">
            Hide tokens has ROI less than
          </div>
          <Select
            type="filter"
            positionSelectList="right-0"
            listSelect={filterTokenValueType}
            bind:selected={filterTokenType}
          />
        </div>

        <div
          class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          <table class="table-auto xl:w-full w-[1400px] h-full">
            <thead
              class={isStickyTableClosedToken ? "sticky top-0 z-10" : ""}
              bind:this={tableClosedTokenHeader}
            >
              <tr class="bg_f4f5f8">
                <th
                  class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[420px]"
                >
                  <div
                    class="text-left xl:text-xs text-xl uppercase font-medium"
                  >
                    {MultipleLang.assets}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    {MultipleLang.price}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    Avg Cost
                  </div>
                </th>
                <th
                  class={`py-3 ${
                    $typeWallet === "SOL" ||
                    $typeWallet === "NEAR" ||
                    $typeWallet === "TON" ||
                    $typeWallet === "AURA" ||
                    $typeWallet === "ALGO" ||
                    $typeWallet === "EVM" ||
                    $typeWallet === "MOVE" ||
                    $typeWallet === "BUNDLE" ||
                    $typeWallet === "CEX"
                      ? ""
                      : "pr-3 rounded-tr-[10px]"
                  }`}
                >
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    ROI
                  </div>
                </th>
                {#if $typeWallet === "SOL" || $typeWallet === "NEAR" || $typeWallet === "TON" || $typeWallet === "AURA" || $typeWallet === "ALGO" || $typeWallet === "EVM" || $typeWallet === "MOVE" || $typeWallet === "BUNDLE" || $typeWallet === "CEX"}
                  <th class="py-3 xl:w-14 w-32 rounded-tr-[10px]" />
                {/if}
              </tr>
            </thead>

            {#if $chain === "ALL"}
              <tbody>
                {#if filteredHoldingDataToken && filteredHoldingDataToken.length === 0 && !isLoadingToken}
                  <tr>
                    <td {colspan}>
                      <div
                        class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                      >
                        {#if holdingTokenData && holdingTokenData.length === 0}
                          {MultipleLang.empty}
                        {:else}
                          All tokens less than $1
                        {/if}
                      </div>
                    </td>
                  </tr>
                {/if}
                {#each filteredHoldingDataToken as holding, index}
                  <ClosedHoldingTokenPosition
                    lastIndex={filteredHoldingDataToken.length - 1 === index}
                    data={holding}
                    {selectedWallet}
                  />
                {/each}
              </tbody>
              {#if isLoadingToken}
                <tbody>
                  <tr>
                    <td {colspan}>
                      <div
                        class="flex justify-center items-center h-full py-3 px-3"
                      >
                        <Loading />
                      </div>
                    </td>
                  </tr>
                </tbody>
              {/if}
            {/if}

            {#if $chain !== "ALL"}
              {#if isLoadingToken}
                <tbody>
                  <tr>
                    <td {colspan}>
                      <div
                        class="flex justify-center items-center h-full py-3 px-3"
                      >
                        <Loading />
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
                          class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                        >
                          {#if holdingTokenData && holdingTokenData.length === 0}
                            {MultipleLang.empty}
                          {:else}
                            All tokens less than $1
                          {/if}
                        </div>
                      </td>
                    </tr>
                  {:else}
                    {#each filteredHoldingDataToken as holding, index}
                      <ClosedHoldingTokenPosition
                        lastIndex={filteredHoldingDataToken.length - 1 ===
                          index}
                        data={holding}
                        {selectedWallet}
                      />
                    {/each}
                  {/if}
                </tbody>
              {/if}
            {/if}
          </table>
        </div>
      </div>
    </div>

    <!-- nft holding table -->
    <!-- {#if $typeWallet === "BTC"}
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <div class="xl:text-xl text-3xl font-medium">
            {MultipleLang.nft}
          </div>
          <div class="xl:text-3xl text-4xl font-medium text-right">
            <TooltipNumber number={sumNFT} type="value" />
          </div>
        </div>
        <div
          class="border border_0000000d rounded-[10px] xl:overflow-visible overflow-x-auto"
        >
          <table class="table-auto xl:w-full w-[1400px]">
            <thead
              class={isStickyTableClosedNFT ? "sticky top-0 z-10" : ""}
              bind:this={tableClosedNFTHeader}
            >
              <tr class="bg_f4f5f8">
                <th
                  class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[220px]"
                >
                  <div
                    class="text-left xl:text-xs text-xl uppercase font-medium"
                  >
                    {MultipleLang.collection}
                  </div>
                </th>
                <th
                  class="py-3 xl:static xl:bg-transparent sticky left-[220px] z-10 bg_f4f5f8 w-[160px]"
                >
                  <div
                    class="text-left xl:text-xs text-xl uppercase font-medium"
                  >
                    {MultipleLang.Balance}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    <TooltipTitle
                      tooltipText={$typeWallet === "BTC"
                        ? "The Floor price from Magic Eden marketplace. "
                        : "The Floor price of last 24h, if there is no volume, the floor price is 0"}
                      link={$typeWallet === "BTC"
                        ? "https://magiceden.io/ordinals"
                        : ""}
                    >
                      {MultipleLang.floor_price}
                    </TooltipTitle>
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    {MultipleLang.total_spent}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    {MultipleLang.current_value}
                  </div>
                </th>
                <th
                  class={`py-3 pr-3 ${
                    $typeWallet === "BTC" ? "" : "rounded-tr-[10px]"
                  }`}
                >
                  <div
                    class="text-right xl:text-xs text-xl uppercase font-medium"
                  >
                    <TooltipTitle
                      tooltipText="Price NFTs now - Price NFTs at time you spent"
                    >
                      {MultipleLang.profit}
                    </TooltipTitle>
                  </div>
                </th>
                {#if $typeWallet === "BTC"}
                  <th class="py-3 w-10 rounded-tr-[10px]" />
                {/if}
              </tr>
            </thead>
            {#if isLoadingNFT}
              <tbody>
                <tr>
                  <td {colspan}>
                    <div class="flex justify-center items-center py-3 px-3">
                      <Loading />
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
    {/if} -->
  </ErrorBoundary>
</div>

<style>
</style>

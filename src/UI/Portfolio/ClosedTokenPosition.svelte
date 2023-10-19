<script lang="ts">
  import { onMount } from "svelte";
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";
  import { chain, typeWallet, isDarkMode } from "~/store";
  import { filterTokenValueType } from "~/utils";
  import { groupBy } from "lodash";

  export let holdingTokenData;
  export let holdingNFTData;
  export let isLoadingToken;
  export let isLoadingNFT;
  export let selectedWallet;

  import ClosedHoldingTokenPosition from "~/components/ClosedHoldingTokenPosition.svelte";
  import HoldingNFT from "~/components/HoldingNFT.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Loading from "~/components/Loading.svelte";
  import Select from "~/components/Select.svelte";

  let filteredHoldingToken = true;
  let filteredHoldingDataToken = [];
  let marketPriceToken;
  let marketPriceNFT;
  let formatData = [];
  let formatDataNFT = [];
  let sumAllTokens = 0;
  let sumNFT = 0;
  let tableTokenHeader;
  let isStickyTableToken = false;
  let tableNFTHeader;
  let isStickyTableNFT = false;

  let filterTokenType = {
    label: "$1",
    value: 1,
  };

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

  // subscribe to ws
  $: {
    if (holdingTokenData?.length !== 0) {
      const filteredHoldingTokenData = holdingTokenData?.filter(
        (item) => item?.cmc_id
      );

      const filteredNullCmcHoldingTokenData = holdingTokenData?.filter(
        (item) => item?.cmc_id === null
      );

      const groupFilteredNullCmcHoldingTokenData = groupBy(
        filteredNullCmcHoldingTokenData,
        "chain"
      );

      const chainList = Object.keys(groupFilteredNullCmcHoldingTokenData);

      chainList.map((chain) => {
        groupFilteredNullCmcHoldingTokenData[chain].map((item) => {
          priceSubscribe([item?.contractAddress], true, chain, (data) => {
            marketPriceToken = {
              id: data.id,
              market_price: data.price,
            };
          });
        });
      });

      filteredHoldingTokenData?.map((item) => {
        priceSubscribe([item?.cmc_id], false, "", (data) => {
          marketPriceToken = {
            id: data.id,
            market_price: data.price,
          };
        });
      });
    }
    if (holdingNFTData) {
      holdingNFTData
        ?.filter((item) => item?.nativeToken?.cmcId)
        ?.map((item) => {
          priceSubscribe(
            [Number(item?.nativeToken?.cmcId)],
            false,
            "",
            (data) => {
              marketPriceNFT = {
                id: data.id,
                market_price: data.price,
              };
            }
          );
        });
    }
  }

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

  // check market price and update price real-time
  $: {
    if (marketPriceToken) {
      const formatDataWithMarketPrice = formatData.map((item) => {
        if (
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.cmc_id?.toString().toLowerCase() ||
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.contractAddress.toString().toLowerCase()
        ) {
          return {
            ...item,
            market_price: marketPriceToken.market_price,
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
    if (marketPriceNFT) {
      const formatDataNFTWithMarketPrice = formatDataNFT.map((item) => {
        if (
          marketPriceNFT?.id.toString().toLowerCase() ===
          item?.nativeToken?.cmcId.toString().toLowerCase()
        ) {
          return {
            ...item,
            market_price: marketPriceNFT.market_price,
            current_value:
              item?.floorPriceBTC * marketPriceNFT.market_price * item?.balance,
          };
        }
        return { ...item };
      });
      formatDataNFT = formatDataNFTWithMarketPrice.sort((a, b) => {
        if (a.current_value < b.current_value) {
          return 1;
        }
        if (a.current_value > b.current_value) {
          return -1;
        }
        return 0;
      });
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

  $: colspan = typeWalletAddress !== "EVM" ? 5 : 4;

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
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
</script>

<div
  class={`flex flex-col gap-6 rounded-[20px] p-6 ${
    darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
  }`}
  id="view-closed-positions"
>
  <ErrorBoundary>
    <div class="flex items-end gap-3">
      {#if typeWalletAddress !== "EVM"}
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
              : darkMode
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

        <div class={`${isLoadingToken ? "h-[400px]" : ""}`}>
          <div
            class={`rounded-[10px] xl:overflow-hidden overflow-x-auto h-full ${
              darkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
            }`}
          >
            <table class="table-auto xl:w-full w-[1400px] h-full">
              <thead
                class={isStickyTableToken ? "sticky top-0 z-10" : ""}
                bind:this={tableTokenHeader}
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
                      Average Cost
                    </div>
                  </th>
                  <th
                    class="py-3 pr-3 rounded-tr-[10px] pr-3 rounded-tr-[10px]"
                  >
                    <div
                      class="text-right xl:text-xs text-xl uppercase font-medium"
                    >
                      ROI
                    </div>
                  </th>
                  <!-- <th class="py-3 w-10 rounded-tr-[10px]" /> -->
                </tr>
              </thead>
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
                    {#each filteredHoldingDataToken as holding}
                      <ClosedHoldingTokenPosition
                        data={holding}
                        {selectedWallet}
                      />
                    {/each}
                  {/if}
                </tbody>
              {/if}
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- nft holding table -->
    <!-- {#if typeWalletAddress === "BTC"}
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
              class={isStickyTableNFT ? "sticky top-0 z-10" : ""}
              bind:this={tableNFTHeader}
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
                      tooltipText={typeWalletAddress === "BTC"
                        ? "The Floor price from Magic Eden marketplace. "
                        : "The Floor price of last 24h, if there is no volume, the floor price is 0"}
                      link={typeWalletAddress === "BTC"
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
                    typeWalletAddress === "BTC" ? "" : "rounded-tr-[10px]"
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
                {#if typeWalletAddress === "BTC"}
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

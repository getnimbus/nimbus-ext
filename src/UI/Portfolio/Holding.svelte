<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import {
    wallet,
    chain,
    typeWallet,
    isDarkMode,
    realtimePrice,
    totalAssets,
    unrealizedProfit,
    realizedProfit,
  } from "~/store";
  import { filterTokenValueType, chunkArray, triggerFirework } from "~/utils";
  import { listSupported } from "~/lib/chains";
  import { groupBy } from "lodash";
  import { priceMobulaSubscribe } from "~/lib/price-mobulaWs";
  import { priceSubscribe } from "~/lib/price-ws";
  import { wait } from "~/entries/background/utils";

  import goldImg from "~/assets/Gold4.svg";

  export let isLoadingNFT;
  export let isLoadingToken;
  export let holdingTokenData;
  export let holdingNFTData;
  export let dataVaults;
  export let selectedTokenHolding;
  export let selectedDataPieChart;
  export let selectedType;

  import HoldingToken from "~/UI/Portfolio/HoldingToken.svelte";
  import HoldingNFT from "~/UI/Portfolio/HoldingNFT.svelte";
  import Select from "~/components/Select.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Loading from "~/components/Loading.svelte";

  let dataSubWS = [];
  let filteredUndefinedCmcHoldingTokenData = [];
  let filteredNullCmcHoldingTokenData = [];
  let filteredHoldingDataToken = [];
  let filteredHoldingDataNFT = [];
  let formatData = [];
  let formatDataNFT = [];
  let sumTokens = 0;
  let sumNFT = 0;
  let tableTokenHeader;
  let isStickyTableToken = false;
  let tableNFTHeader;
  let isStickyTableNFT = false;

  let selectedTypeTable = {
    label: "",
    value: "",
  };

  let filterTokenType = {
    label: "$1",
    value: 1,
  };

  let filterNFTType = {
    label: "$1",
    value: 1,
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

  // format initial data
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
            current_native_token:
              Number(item?.floorPrice) * item?.tokens?.length,
            current_value:
              Number(item?.floorPrice) *
              Number(item?.marketPrice) *
              item?.tokens?.length,
          };
        })
        .sort((a, b) => {
          if (a.current_native_token < b.current_native_token) {
            return 1;
          }
          if (a.current_native_token > b.current_native_token) {
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
          (item) =>
            item?.cmc_id !== undefined &&
            item?.cmc_id !== null &&
            item?.cmc_id > 0
        );

        dataSubWS = filteredHoldingTokenData.map((item) => {
          return {
            symbol: item.symbol,
            cmcId: item.cmc_id,
          };
        });

        filteredNullCmcHoldingTokenData = dataTokenHolding?.filter(
          (item) => item?.cmc_id === null || item?.cmc_id === 0
        );

        filteredUndefinedCmcHoldingTokenData = dataTokenHolding?.filter(
          (item) => item?.cmc_id === undefined
        );
      }
    }
    if (!isLoadingNFT) {
      if (holdingNFTData?.length !== 0) {
        const formatHoldingNFTData = holdingNFTData
          ?.filter((item) => item?.nativeToken?.cmcId)
          ?.map((item) => {
            return {
              symbol: item.nativeToken.symbol,
              cmcId: item.nativeToken.cmcId,
            };
          });
        dataSubWS = dataSubWS.concat(formatHoldingNFTData);
      }
    }
  }

  $: {
    if (
      !isLoadingNFT &&
      !isLoadingToken &&
      filteredUndefinedCmcHoldingTokenData &&
      filteredUndefinedCmcHoldingTokenData.length !== 0 &&
      $typeWallet === "CEX"
    ) {
      const chunkedArray = chunkArray(
        filteredUndefinedCmcHoldingTokenData,
        100
      );
      chunkedArray.forEach((chunk) => {
        const listTokenSubWs = chunk.filter((item) => item?.symbol);
        if (listTokenSubWs && listTokenSubWs.length !== 0) {
          priceMobulaSubscribe(
            listTokenSubWs.map((item) => item?.symbol),
            "CEX"
          );
        }
      });
    }
  }

  $: {
    if (
      !isLoadingNFT &&
      !isLoadingToken &&
      filteredNullCmcHoldingTokenData &&
      filteredNullCmcHoldingTokenData.length !== 0
    ) {
      const groupFilteredNullCmcHoldingTokenData = groupBy(
        filteredNullCmcHoldingTokenData,
        "chain"
      );

      const chainList = Object.keys(groupFilteredNullCmcHoldingTokenData);
      chainList.map((chain) => {
        const chunkedArray = chunkArray(
          groupFilteredNullCmcHoldingTokenData[chain],
          100
        );
        chunkedArray.forEach((chunk) => {
          const listTokenSubWs = chunk.filter((item) => item?.contractAddress);
          if (listTokenSubWs && listTokenSubWs.length !== 0) {
            priceMobulaSubscribe(
              listTokenSubWs.map((item) => item.contractAddress),
              listTokenSubWs[0]?.chain
            );
          }
        });
      });
    }
  }

  $: {
    if (
      !isLoadingNFT &&
      !isLoadingToken &&
      dataSubWS &&
      dataSubWS.length !== 0
    ) {
      let filteredData = [];
      const symbolSet = new Set();
      dataSubWS.forEach((item) => {
        if (!symbolSet.has(item.symbol)) {
          symbolSet.add(item.symbol);
          filteredData.push(item);
        }
      });
      filteredData?.map((item) => {
        priceSubscribe([Number(item?.cmcId)], item?.chain);
      });
    }
  }

  // check market price and update price real-time
  $: {
    if ($realtimePrice) {
      // update data token holding
      const formatDataWithMarketPrice = formatData.map((item) => {
        return {
          ...item,
          market_price: $realtimePrice[
            item?.cmc_id ||
              item?.contractAddress ||
              item?.symbol ||
              item?.price?.symbol
          ]
            ? Number(
                $realtimePrice[
                  item?.cmc_id ||
                    item?.contractAddress ||
                    item?.symbol ||
                    item?.price?.symbol
                ]?.price
              )
            : Number(item.market_price),
          value:
            Number(item?.amount) *
            ($realtimePrice[
              item?.cmc_id ||
                item?.contractAddress ||
                item?.symbol ||
                item?.price?.symbol
            ]
              ? Number(
                  $realtimePrice[
                    item?.cmc_id ||
                      item?.contractAddress ||
                      item?.symbol ||
                      item?.price?.symbol
                  ]?.price
                )
              : Number(item.market_price)),
        };
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
      filteredHoldingDataToken = formatData.filter((item) => item.value > 1);
      sumTokens = formatDataWithMarketPrice.reduce(
        (prev, item) => prev + item.value,
        0
      );

      // update data nft holding
      const formatDataNFTWithMarketPrice = formatDataNFT.map((item) => {
        return {
          ...item,
          marketPrice: $realtimePrice[item?.nativeToken?.cmcId]
            ? Number($realtimePrice[item?.nativeToken?.cmcId]?.price)
            : Number(item?.marketPrice),
          current_native_token: item?.floorPrice * item?.tokens?.length,
          current_value:
            item?.floorPrice *
            ($realtimePrice[item?.nativeToken?.cmcId]
              ? Number($realtimePrice[item?.nativeToken?.cmcId]?.price)
              : Number(item?.marketPrice)) *
            item?.tokens?.length,
        };
      });
      formatDataNFT = formatDataNFTWithMarketPrice.sort((a, b) => {
        if (a.current_native_token < b.current_native_token) {
          return 1;
        }
        if (a.current_native_token > b.current_native_token) {
          return -1;
        }
        return 0;
      });
      sumNFT = formatDataNFTWithMarketPrice.reduce(
        (prev, item) => prev + item.current_value,
        0
      );
    }
  }

  $: {
    if (filterTokenType) {
      const formatDataWithVault = formatData?.map((item) => {
        try {
          const regex = new RegExp(`(^${item?.symbol}|-${item?.symbol})`);
          const filteredVaults = dataVaults?.filter((data) =>
            data.name.match(regex)
          );

          return {
            ...item,
            vaults: filteredVaults,
          };
        } catch (error) {
          return {
            ...item,
            vaults: [],
          };
        }
      });
      if (filterTokenType.value === 0) {
        filteredHoldingDataToken = formatDataWithVault;
      } else {
        filteredHoldingDataToken = formatDataWithVault?.filter(
          (item) => item?.amount * item.market_price > filterTokenType.value
        );
      }
    }
  }

  $: {
    if (filterNFTType) {
      if (filterNFTType.value === 0) {
        filteredHoldingDataNFT = formatDataNFT;
      } else {
        filteredHoldingDataNFT = formatDataNFT?.filter(
          (item) => item?.current_value > filterNFTType.value
        );
      }
    }
  }

  $: {
    if (formatData?.length === 0) {
      sumTokens = 0;
      sumNFT = 0;
      totalAssets.update((n) => (n = 0));
      unrealizedProfit.update((n) => (n = 0));
      realizedProfit.update((n) => (n = 0));
    } else {
      sumTokens = (formatData || []).reduce(
        (prev, item) => prev + item?.amount * item.market_price,
        0
      );

      sumNFT = (formatDataNFT || []).reduce(
        (prev, item) => prev + item?.current_value,
        0
      );

      realizedProfit.update(
        (n) =>
          (n = (formatData || [])
            .map((item) => {
              return {
                realized_profit: item?.profit?.realizedProfit || 0,
              };
            })
            .reduce((prev, item) => prev + Number(item.realized_profit), 0))
      );

      unrealizedProfit.update(
        (n) =>
          (n = (formatData || [])
            ?.filter(
              (item) => Number(item?.amount) > 0 && Number(item?.avgCost) !== 0
            )
            ?.map((item) => {
              const price = Number(
                item?.market_price || item?.price?.price || 0
              );
              const pnl =
                Number(item?.balance || 0) * price +
                Number(item?.profit?.totalGain || 0) -
                Number(item?.profit?.cost || 0);
              const realizedProfit = item?.profit?.realizedProfit
                ? Number(item?.profit?.realizedProfit)
                : 0;

              return {
                unrealized_profit:
                  Number(item?.avgCost) === 0
                    ? 0
                    : Number(pnl) - realizedProfit,
              };
            })
            .reduce((prev, item) => prev + Number(item.unrealized_profit), 0))
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
      totalAssets.update((n) => (n = sumNFT + sumTokens));
    }
  }

  $: colspan = listSupported.includes($typeWallet) ? 8 : 7;

  $: {
    if ($wallet || $chain) {
      if ($wallet?.length !== 0 && $chain?.length !== 0) {
        sumTokens = 0;
        sumNFT = 0;
        formatData = [];
        formatDataNFT = [];
        filteredHoldingDataToken = [];
        filteredHoldingDataNFT = [];
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

  let openScreenBonusScore: boolean = false;
  let bonusScore: number = 10;

  const triggerFireworkBonus = (score: number) => {
    bonusScore = score;
    triggerBonusScore();
  };

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
  };
</script>

<div
  class={`flex flex-col gap-6 rounded-[20px] p-6 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
  }`}
>
  <ErrorBoundary>
    <div class="flex flex-col gap-2">
      <div class="flex justify-between">
        <div class="flex items-end gap-3">
          <div class="xl:text-2xl text-4xl font-medium">
            {MultipleLang.holding}
          </div>
          <!-- <a
            href="https://forms.gle/HfmvSTzd5frPPYDz8"
            target="_blank"
            class="xl:text-sm text-2xl font-normal text-blue-500 mb-[2px] hover:text-blue-700 transition-all"
          >
            Get investment opportunities notification
          </a> -->
        </div>
        <div class="xl:text-3xl text-4xl font-medium">
          {#if selectedType === "token"}
            <TooltipNumber number={sumTokens} type="value" personalValue />
          {/if}
          {#if selectedType === "nft"}
            <TooltipNumber number={sumNFT} type="value" />
          {/if}
        </div>
      </div>

      <!-- token holding table -->
      {#if selectedType === "token"}
        <div class="flex flex-col gap-2">
          {#if selectedTokenHolding && Object.keys(selectedTokenHolding).length !== 0 && selectedTokenHolding?.select.length !== 0}
            <div
              class="xl:text-xl text-2xl font-medium text-gray-400 text-right"
            >
              <TooltipNumber
                number={selectedDataPieChart?.series[0]?.data.filter(
                  (item) =>
                    item.name === selectedTypeTable?.value ||
                    item.name === selectedTypeTable?.label
                )[0]?.value}
                type="percent"
              />%
            </div>
          {/if}

          <div class="flex flex-col gap-4">
            <div
              class={`flex items-center ${
                selectedTokenHolding &&
                Object.keys(selectedTokenHolding).length !== 0 &&
                selectedTokenHolding?.select.length !== 0
                  ? "justify-between"
                  : "justify-end"
              }`}
            >
              {#if selectedTokenHolding && Object.keys(selectedTokenHolding).length !== 0 && selectedTokenHolding?.select.length !== 0}
                <Select
                  type="lang"
                  positionSelectList="left-0"
                  listSelect={selectedTokenHolding?.select || []}
                  bind:selected={selectedTypeTable}
                />
              {/if}
              <div class="flex items-center justify-end gap-2">
                <div class="xl:text-sm text-2xl font-regular text-gray-400">
                  Hide tokens less than
                </div>
                <Select
                  type="filter"
                  positionSelectList="right-0"
                  listSelect={filterTokenValueType}
                  bind:selected={filterTokenType}
                />
              </div>
            </div>

            <div
              class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
                $isDarkMode
                  ? "bg-[#131313]"
                  : "bg-[#fff] border border_0000000d"
              }`}
            >
              <table class="table-auto xl:w-full w-[2000px] h-full">
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
                        {MultipleLang.amount}
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        {MultipleLang.value}
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        Avg Cost
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        Realized PnL
                      </div>
                    </th>
                    <th
                      class={`py-3 xl:pr-3 pr-6 ${
                        listSupported.includes($typeWallet)
                          ? ""
                          : "rounded-tr-[10px]"
                      }`}
                    >
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        Unrealized PnL
                      </div>
                    </th>
                    {#if listSupported.includes($typeWallet)}
                      <th
                        class={`py-3 pr-3 rounded-tr-[10px] ${
                          ["BUNDLE", "SOL"].includes($typeWallet)
                            ? "xl:max-w-20 w-16"
                            : "xl:w-12 w-32"
                        }`}
                      />
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
                      <HoldingToken
                        data={holding}
                        lastIndex={filteredHoldingDataToken.length - 1 ===
                          index}
                        sumAllTokens={$totalAssets - sumNFT}
                        index={index + 1}
                        {triggerFireworkBonus}
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
                        {#each filteredHoldingDataToken as holding, index (holding.positionId)}
                          <HoldingToken
                            data={holding}
                            lastIndex={filteredHoldingDataToken.length - 1 ==
                              index}
                            sumAllTokens={$totalAssets - sumNFT}
                            index={index + 1}
                            {triggerFireworkBonus}
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
      {/if}

      <!-- nft holding table -->
      {#if selectedType === "nft"}
        {#if $typeWallet !== "CEX"}
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-end gap-2">
              <div class="xl:text-sm text-2xl font-regular text-gray-400">
                Hide NFT Collections less than
              </div>
              <Select
                type="filter"
                positionSelectList="right-0"
                listSelect={filterTokenValueType}
                bind:selected={filterNFTType}
              />
            </div>

            <div
              class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
                $isDarkMode
                  ? "bg-[#131313]"
                  : "bg-[#fff] border border_0000000d"
              }`}
            >
              <table class="table-auto xl:w-full w-[2000px] h-full">
                <thead
                  class={isStickyTableNFT ? "sticky top-0 z-10" : ""}
                  bind:this={tableNFTHeader}
                >
                  <tr class="bg_f4f5f8">
                    <th
                      class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 xl:w-[220px] w-[350px]"
                    >
                      <div
                        class="text-left xl:text-xs text-xl uppercase font-medium"
                      >
                        {MultipleLang.collection}
                      </div>
                    </th>
                    <th
                      class="py-3 xl:static xl:bg-transparent sticky left-[350px] z-10 bg_f4f5f8 w-[200px]"
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
                          tooltipText={false
                            ? "The Floor price from Magic Eden marketplace. "
                            : "The Floor price of last 24h, if there is no volume, the floor price is 0"}
                          link={false ? "https://magiceden.io/ordinals" : ""}
                        >
                          {MultipleLang.floor_price}
                        </TooltipTitle>
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        Cost
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        {MultipleLang.current_value}
                      </div>
                    </th>
                    <th class="py-3">
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
                    <th class="py-3 xl:w-12 w-32 rounded-tr-[10px]" />
                  </tr>
                </thead>

                {#if $chain === "ALL"}
                  <tbody>
                    {#if filteredHoldingDataNFT && filteredHoldingDataNFT.length === 0 && !isLoadingNFT}
                      <tr>
                        <td colspan={7}>
                          <div
                            class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400 view-nft-detail"
                          >
                            {#if formatDataNFT && formatDataNFT.length === 0}
                              {MultipleLang.empty}
                            {:else}
                              All NFT Collections less than $1
                            {/if}
                          </div>
                        </td>
                      </tr>
                    {/if}
                    {#each filteredHoldingDataNFT as holding, index}
                      <HoldingNFT
                        data={holding}
                        {index}
                        lastIndex={filteredHoldingDataNFT.length - 1 == index}
                      />
                    {/each}
                  </tbody>
                  {#if isLoadingNFT}
                    <tbody>
                      <tr>
                        <td colspan={7}>
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
                  {#if isLoadingNFT}
                    <tbody>
                      <tr>
                        <td colspan={7}>
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
                      {#if filteredHoldingDataNFT && filteredHoldingDataNFT.length === 0}
                        <tr>
                          <td colspan={7}>
                            <div
                              class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400 view-nft-detail"
                            >
                              {#if formatDataNFT && formatDataNFT.length === 0}
                                {MultipleLang.empty}
                              {:else}
                                All NFT Collections less than $1
                              {/if}
                            </div>
                          </td>
                        </tr>
                      {:else}
                        {#each filteredHoldingDataNFT as holding, index}
                          <HoldingNFT
                            lastIndex={filteredHoldingDataNFT.length - 1 ==
                              index}
                            data={holding}
                            {index}
                          />
                        {/each}
                      {/if}
                    </tbody>
                  {/if}
                {/if}
              </table>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </ErrorBoundary>
</div>

{#if openScreenBonusScore}
  <div
    class="fixed h-screen w-screen top-0 left-0 z-[29] flex items-center justify-center bg-[#000000cc]"
    on:click={() => {
      setTimeout(() => {
        openScreenBonusScore = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Congratulation!!!
      </div>
      <img src={goldImg} alt="" class="w-40 h-40" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have received {bonusScore} GM Points
      </div>
    </div>
  </div>
{/if}

<style>
</style>

<script lang="ts">
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
    pastProfit,
  } from "~/store";
  import { filterTokenValueType, chunkArray, triggerFirework } from "~/utils";
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
  export let formatHoldingTokenData;

  import HoldingNFT from "~/UI/Portfolio/HoldingNFT.svelte";
  import HoldingToken from "~/UI/Portfolio/HoldingToken.svelte";
  import Select from "~/components/Select.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  let dataSubWS = [];
  let filteredUndefinedCmcHoldingTokenData = [];
  let filteredNullCmcHoldingTokenData = [];
  let filteredHoldingDataToken = [];
  let filteredHoldingDataNFT = [];
  let formatData = [];
  let formatDataNFT = [];
  let sumTokens = 0;
  let sumNFT = 0;

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
  };

  $: {
    if (formatHoldingTokenData) {
      const closedHoldingToken = formatHoldingTokenData
        ?.filter(
          (item) =>
            item?.profit?.realizedProfit !== undefined &&
            Number(item.amount) === 0
        )
        .sort(
          (a, b) =>
            Number(b?.profit.realizedProfit) - Number(a?.profit.realizedProfit)
        );

      pastProfit.update(
        (n) =>
          (n = closedHoldingToken.reduce(
            (prev, item) => prev + Number(item?.profit.realizedProfit),
            0
          ))
      );
    }
  }

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
                (item) =>
                  Number(item?.amount) > 0 && Number(item?.avgCost) !== 0
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
    if (
      selectedTokenHolding &&
      Object.keys(selectedTokenHolding).length !== 0 &&
      selectedTokenHolding?.select.length === 0 &&
      (sumTokens || sumNFT)
    ) {
      totalAssets.update((n) => (n = sumNFT + sumTokens));
    }
  }

  $: {
    if ($wallet || $chain) {
      if ($wallet?.length !== 0 && $chain?.length !== 0) {
        sumTokens = 0;
        sumNFT = 0;
        formatData = [];
        formatDataNFT = [];
        filteredHoldingDataToken = [];
        filteredHoldingDataNFT = [];
        totalAssets.update((n) => (n = 0));
        unrealizedProfit.update((n) => (n = 0));
        realizedProfit.update((n) => (n = 0));
        pastProfit.update((n) => (n = 0));
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
            <HoldingToken
              {sumTokens}
              defaultData={holdingTokenData}
              data={filteredHoldingDataToken}
              isLoading={isLoadingToken}
              {triggerFireworkBonus}
            />
          </div>
        </div>
      {/if}

      <!-- nft holding table -->
      {#if selectedType === "nft"}
        {#if $typeWallet !== "CEX"}
          <div class="flex flex-col gap-4">
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
            <HoldingNFT
              defaultData={holdingNFTData}
              data={filteredHoldingDataNFT}
              isLoading={isLoadingNFT}
            />
          </div>
        {/if}
      {/if}
    </div>
  </ErrorBoundary>
</div>

{#if openScreenBonusScore}
  <div
    class="fixed h-screen w-screen top-0 left-0 flex items-center justify-center bg-[#000000cc]"
    style="z-index: 2147483648;"
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

<script lang="ts">
  import { Datafeed } from "~/lib/trading-view/utils";
  import { overrides } from "~/lib/trading-view/theme";
  import { widgetOptionsDefault } from "~/lib/trading-view/helper";
  import {
    DISABLED_FEATURES,
    ENABLED_FEATURES,
  } from "~/lib/trading-view/constant";
  import { isDarkMode, typeWallet } from "~/store";
  import { handleFormatBlockChainId } from "~/lib/price-mobulaWs";
  import { nimbus } from "~/lib/network";
  import { formatBalance } from "~/utils";
  import { groupBy } from "lodash";

  import Loading from "~/components/Loading.svelte";

  export let id: string;
  export let mobile: boolean = false;
  export let contractAddress;
  export let price;
  export let chain;
  export let sellHistoryTradeList;
  export let buyHistoryTradeList;
  export let selectedTypeChart;
  export let avgCost;

  let CONTAINER_ID = "";
  let chartContainer;
  let baseAsset;
  let isEmpty = false;
  let isLoading = false;

  const nativeTokenList = [
    "ETH",
    "BTC",
    "SUI",
    "BNB",
    "SOL",
    "ADA",
    "AVAX",
    "DOT",
    "MATIC",
    "LINK",
    "ALGO",
    "XTZ",
    "CRO",
    "MNT",
    "XZO",
    "KLAY",
    "AURA",
    "VIC",
    "TON",
    "NEAR",
    "ZETA",
    "FTM",
    "EVMOS",
    "ONE",
    "GLMR",
    "METIS",
    "RON",
    "MOVR",
    "CANTO",
    "ROSE",
  ];

  $: {
    if (selectedTypeChart === "candles") {
      if ($typeWallet === "CEX") {
        if (chain === "SOL") {
          baseAsset = {
            name: id,
            address: contractAddress,
            price,
            token0: id,
            token1: "USD",
          };
        } else {
          if (nativeTokenList.includes(id)) {
            handleGetPairData(id === "ETH" ? "ethereum" : id);
          } else {
            handleGetPairData(contractAddress);
          }
        }
      } else if ($typeWallet === "SOL") {
        baseAsset = {
          name: id,
          address: contractAddress,
          price,
          token0: id,
          token1: "USD",
        };
      } else {
        if (chain === "SOL") {
          baseAsset = {
            name: id,
            address: contractAddress,
            price,
            token0: id,
            token1: "USD",
          };
        } else {
          if (contractAddress.includes("CEX-")) {
            baseAsset = {};
          } else {
            if (
              contractAddress &&
              contractAddress !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
            ) {
              if (nativeTokenList.includes(id)) {
                handleGetPairData(id === "ETH" ? "ethereum" : id);
              } else {
                handleGetPairData(contractAddress);
              }
            } else {
              handleGetPairData(id);
            }
          }
        }
      }
    }
  }

  const handleGetPairData = async (address: string) => {
    isLoading = true;
    try {
      const blockchain = handleFormatBlockChainId(
        $typeWallet === "CEX" ? id : chain
      );
      if (blockchain) {
        const params = {
          address,
          blockchain,
        };
        const res = await nimbus.get("/token/market-pairs/mobula", {
          params,
        });
        if (
          res &&
          res?.data &&
          res?.data?.pairs &&
          res?.data?.pairs?.length !== 0
        ) {
          baseAsset = {
            name: id,
            address: res?.data?.pairs[0]?.address,
            price,
            token0: res?.data?.pairs[0]?.token0?.symbol,
            token1: res?.data?.pairs[0]?.token1?.symbol,
          };
        } else {
          isEmpty = true;
        }
      } else {
        isEmpty = true;
      }
    } catch (error) {
      isEmpty = true;
      console.error(error);
    } finally {
      isLoading = false;
    }
  };

  $: {
    if (id) {
      CONTAINER_ID = `svelte-tradingview-widget-${id};`;
    }
  }

  const chartInit = () => {
    if (!baseAsset) return () => {};

    if (!chartContainer) {
      return;
    }

    const options: any = {
      datafeed: Datafeed(baseAsset, $typeWallet),
      symbol:
        baseAsset?.token0 === id
          ? baseAsset?.token0 + "/" + "USD"
          : baseAsset?.token1 + "/" + "USD",
    };

    try {
      import("../../../public/static/charting_library")
        .then(({ widget: Widget }) => {
          const tvWidget = new Widget({
            ...options,
            ...widgetOptionsDefault,
            container: chartContainer,
            container_id: CONTAINER_ID,
            library_path: "/static/charting_library/",
            locale: "en",
            disabled_features: [
              ...DISABLED_FEATURES,
              ...(mobile ? ["left_toolbar"] : []),
            ],
            enabled_features: ENABLED_FEATURES,
            charts_storage_url: "https://saveload.tradingview.com",
            charts_storage_api_version: "1.1",
            client_id: "tradingview.com",
            user_id: "public_user_id",
            fullscreen: false,
            autosize: true,
            theme: $isDarkMode ? "Dark" : "Light",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as any,
            favorites: {
              intervals: ["60", "240", "1", "5", "1440"],
            },
            studies_overrides: {
              "volume.volume.color.0": "#ea3943",
              "volume.volume.color.1": "#0ECB81",
            },
            interval: "24h",
          });

          (window as any).tvWidget = tvWidget;

          tvWidget.onChartReady(() => {
            tvWidget.applyOverrides(overrides(!$isDarkMode) || {});

            if (Number(avgCost) > 0) {
              tvWidget.activeChart().createShape(
                {
                  time: 0,
                  price: Number(avgCost || 0),
                },
                {
                  shape: "horizontal_line",
                  lock: true,
                  text: "Avg Cost",
                  overrides: {
                    linewidth: 0.5,
                    linecolor: "#eab308",
                    showLabel: true,
                    textcolor: "#eab308",
                    horzLabelsAlign: "right",
                  },
                }
              );
            }

            const buyHistoryTradeCreatedList = groupBy(
              buyHistoryTradeList,
              "created_at"
            );
            const buyCreatedList = Object.getOwnPropertyNames(
              buyHistoryTradeCreatedList
            );

            const formatBuyTradeList = buyCreatedList.map((item) => {
              if (buyHistoryTradeCreatedList[item].length > 1) {
                return {
                  created_at: item,
                  quantity_out: buyHistoryTradeCreatedList[item].reduce(
                    (prev, item) => prev + Number(item?.quantity_out),
                    0
                  ),
                };
              }
              return {
                created_at: item,
                quantity_out: Number(
                  buyHistoryTradeCreatedList[item][0].quantity_out
                ),
              };
            });

            formatBuyTradeList
              .filter((item) => Number(item?.quantity_out) > 0)
              .forEach((item) => {
                tvWidget
                  .activeChart()
                  .createExecutionShape()
                  .setText(`B ${formatBalance(Number(item?.quantity_out))}`)
                  .setFont("14pt Arial")
                  .setArrowHeight(14)
                  .setTextColor("#00b580")
                  .setArrowColor("#00b580")
                  .setDirection("buy")
                  .setTime(Number(item.created_at));
              });

            const sellHistoryTradeCreatedList = groupBy(
              sellHistoryTradeList,
              "created_at"
            );

            const sellCreatedList = Object.getOwnPropertyNames(
              sellHistoryTradeCreatedList
            );

            const formatSellTradeList = sellCreatedList.map((item) => {
              if (sellHistoryTradeCreatedList[item].length > 1) {
                return {
                  created_at: item,
                  quantity_in: sellHistoryTradeCreatedList[item].reduce(
                    (prev, item) => prev + Number(item?.quantity_in),
                    0
                  ),
                };
              }
              return {
                created_at: item,
                quantity_in: Number(
                  sellHistoryTradeCreatedList[item][0].quantity_in
                ),
              };
            });

            formatSellTradeList
              .filter((item) => Number(item?.quantity_in) > 0)
              .forEach((item) => {
                tvWidget
                  .activeChart()
                  .createExecutionShape()
                  .setText(`S ${formatBalance(Number(item?.quantity_in))}`)
                  .setFont("14pt Arial")
                  .setArrowHeight(14)
                  .setTextColor("#ef4444")
                  .setArrowColor("#ef4444")
                  .setDirection("sell")
                  .setTime(Number(item?.created_at));
              });
          });
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  $: {
    if (baseAsset || mobile || $isDarkMode) {
      if (chartContainer) {
        if ((window as any).tvWidget !== null) {
          (window as any).tvWidget?.remove();
          (window as any).tvWidget = null;
        }

        chartInit();
      }
    }
  }
</script>

{#if isLoading}
  <div class="flex justify-center items-center h-[485px]">
    <Loading />
  </div>
{:else}
  <div>
    {#if isEmpty || contractAddress.includes("CEX-")}
      {#if contractAddress.includes("CEX-")}
        <div
          class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center gap-3 pt-62 z-7 backdrop-blur-md ${
            $isDarkMode ? "bg-black/90" : "bg-white/95"
          }`}
        >
          <div class="text-lg">Coming soon 🚀</div>
        </div>
      {:else}
        <div
          class="flex justify-center items-center h-[485px] text-base text-gray-400"
        >
          Empty
        </div>
      {/if}
    {:else}
      <div
        class="w-full h-[485px]"
        id={CONTAINER_ID}
        bind:this={chartContainer}
      />
    {/if}
  </div>
{/if}

<style>
</style>

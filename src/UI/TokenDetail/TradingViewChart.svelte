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
  let tvWidget;
  let checked = true;

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
          if (
            contractAddress.includes("CEX-") ||
            $typeWallet === "ALGO" ||
            $typeWallet === "NEAR" ||
            $typeWallet === "TON" ||
            $typeWallet === "INJ" ||
            $typeWallet === "MOVE" ||
            $typeWallet === "BTC"
          ) {
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

  const chartInit = (isRenderTradeData) => {
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
          tvWidget = new Widget({
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

            if (isRenderTradeData) {
              handleRenderTradeData();
            }
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

        chartInit(true);
      }
    }
  }

  const handleRenderTradeData = () => {
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
        quantity_out: Number(buyHistoryTradeCreatedList[item][0].quantity_out),
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
        quantity_in: Number(sellHistoryTradeCreatedList[item][0].quantity_in),
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
  };

  const toggleMarkTradeData = (e) => {
    checked = !checked;
    if (checked) {
      tvWidget &&
        tvWidget.onChartReady(() => {
          handleRenderTradeData();
        });
    } else {
      tvWidget &&
        tvWidget.onChartReady(() => {
          chartInit(false);
        });
    }
  };
</script>

{#if isLoading}
  <div class="flex justify-center items-center h-[485px]">
    <Loading />
  </div>
{:else}
  <div>
    {#if isEmpty || contractAddress.includes("CEX-") || $typeWallet === "ALGO" || $typeWallet === "NEAR" || $typeWallet === "TON" || $typeWallet === "INJ" || $typeWallet === "MOVE" || $typeWallet === "BTC"}
      {#if contractAddress.includes("CEX-") || $typeWallet === "ALGO" || $typeWallet === "NEAR" || $typeWallet === "TON" || $typeWallet === "INJ" || $typeWallet === "MOVE" || $typeWallet === "BTC"}
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
      <div class="flex flex-col gap-4 xl:justify-end xl:items-end xl:-mt-10">
        <div class="flex xl:justify-end justify-start items-center xl:mr-2">
          <div class="flex items-center justify-start gap-2">
            <input
              type="checkbox"
              {checked}
              on:change={toggleMarkTradeData}
              class="cursor-pointer relative w-5 h-5 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
            />
            <div class="text-base xl:text-sm">Display Trade History</div>
          </div>
        </div>
        <div
          class="w-full h-[485px]"
          id={CONTAINER_ID}
          bind:this={chartContainer}
        />
      </div>
    {/if}
  </div>
{/if}

<style>
</style>

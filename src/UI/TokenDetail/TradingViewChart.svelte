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

  export let id: string;
  export let mobile: boolean = false;
  export let contractAddress;
  export let price;
  export let chain;
  export let sellHistoryTradeList;
  export let buyHistoryTradeList;

  let CONTAINER_ID = "";
  let chartContainer;
  let baseAsset;
  let isEmpty = false;

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
    if ($typeWallet === "CEX") {
      if (nativeTokenList.includes(id)) {
        handleGetPairData(id === "ETH" ? "ethereum" : id);
      } else {
        handleGetPairData(contractAddress);
      }
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

  const handleGetPairData = async (address: string) => {
    try {
      const blockchain = handleFormatBlockChainId(
        $typeWallet === "CEX" ? id : chain
      );
      if (blockchain) {
        const params = {
          address,
          blockchain,
        };
        console.log(params);
        const res = await nimbus.get("/token/market-pairs/mobula", {
          params,
        });
        if (res && res?.data && res?.data?.pairs.length !== 0) {
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
      datafeed: Datafeed(baseAsset),
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
            ...widgetOptionsDefault,
          });

          (window as any).tvWidget = tvWidget;

          tvWidget.onChartReady(() => {
            tvWidget.applyOverrides(overrides(!$isDarkMode) || {});

            buyHistoryTradeList.forEach((item) => {
              tvWidget
                .activeChart()
                .createExecutionShape()
                .setText(`Buy ${formatBalance(Number(item?.quantity_out))}`)
                .setFont("16pt Arial")
                .setArrowHeight(14)
                .setTextColor("#00b580")
                .setArrowColor("#00b580")
                .setDirection("buy")
                .setTime(Number(item.created_at));
            });

            sellHistoryTradeList.forEach((item) => {
              tvWidget
                .activeChart()
                .createExecutionShape()
                .setText(`Sell ${formatBalance(Number(item?.quantity_in))}`)
                .setFont("16pt Arial")
                .setArrowHeight(14)
                .setTextColor("#ef4444")
                .setArrowColor("#ef4444")
                .setDirection("sell")
                .setTime(Number(item.created_at));
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

{#if isEmpty}
  <div
    class="flex justify-center items-center text-lg text-gray-400 h-[485px] relative"
  >
    Empty
  </div>
{:else}
  <div class="w-full h-[485px]" id={CONTAINER_ID} bind:this={chartContainer} />
{/if}

<style>
</style>

<script lang="ts">
  import { Datafeed } from "~/lib/trading-view/utils";
  import { overrides } from "~/lib/trading-view/theme";
  import { widgetOptionsDefault } from "~/lib/trading-view/helper";
  import {
    DISABLED_FEATURES,
    ENABLED_FEATURES,
  } from "~/lib/trading-view/constant";
  import { isDarkMode } from "~/store";
  import { handleFormatBlockChainId } from "~/lib/price-mobulaWs";
  import { UDFCompatibleDatafeed } from "~/lib/trading-view/datafeeds/udf/lib/udf-compatible-datafeed";
  import axios from "axios";

  export let id: string;
  export let mobile: boolean = false;
  export let contractAddress;
  export let price;
  export let chain;

  let CONTAINER_ID = "";
  let chartContainer;
  let baseAsset;

  $: {
    if (
      contractAddress &&
      contractAddress !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      handleGetPairData(contractAddress);
    } else {
      baseAsset = {
        name: id,
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        price,
        token0: "",
        token1: "",
      };
    }
  }

  const handleGetPairData = async (address: string) => {
    try {
      const res = await axios.get(
        `https://api.mobula.io/api/1/market/pairs?asset=${address}&&blockchain=${handleFormatBlockChainId(
          chain
        )}`
      );
      if (res && res?.data?.data) {
        baseAsset = {
          name: id,
          address: res?.data?.data?.pairs[0]?.address,
          price,
          token0: res?.data?.data?.pairs[0]?.token0?.symbol,
          token1: res?.data?.data?.pairs[0]?.token1?.symbol,
        };
      }
    } catch (e) {
      console.log(e);
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

    const options: any =
      baseAsset?.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ? {
            symbol: "AAPL",
            datafeed: new UDFCompatibleDatafeed(
              "https://demo_feed.tradingview.com",
              undefined,
              {
                maxResponseLength: 1000,
                expectedOrder: "latestFirst",
              }
            ),
          }
        : {
            datafeed: Datafeed(baseAsset),
            symbol:
              baseAsset?.token0 === id
                ? baseAsset?.token0 + "/" + "USD"
                : baseAsset?.token1 + "/" + "USD",
          };

    try {
      import("../../../public/static/charting_library").then(
        ({ widget: Widget }) => {
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
            studies_overrides: {
              "volume.volume.color.0": "#ea3943",
              "volume.volume.color.1": "#0ECB81",
            },
            ...widgetOptionsDefault,
          });

          (window as any).tvWidget = tvWidget;

          (window as any).tvWidget.onChartReady(() => {
            (window as any).tvWidget?.applyOverrides(
              overrides(!$isDarkMode) || {}
            );

            (window as any).tvWidget.activeChart().createShape(
              { time: 2114355600, channel: "close" },
              {
                shape: "arrow_down",
                text: "B",
                overrides: {
                  backgroundColor: "#00b580",
                  borderColor: "#00b580",
                },
              }
            );

            (window as any).tvWidget.activeChart().createShape(
              { time: 1705053600, channel: "open" },
              {
                shape: "comment",
                text: "S",
              }
            );
          });
        }
      );
    } catch (error) {
      console.log("error", error);
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

<div class="w-full h-[485px]" id={CONTAINER_ID} bind:this={chartContainer} />

<style>
</style>

<script lang="ts">
  import { Datafeed } from "~/lib/trading-view/utils";
  import { overrides } from "~/lib/trading-view/theme";
  import { widgetOptionsDefault } from "~/lib/trading-view/helper";
  import {
    DISABLED_FEATURES,
    ENABLED_FEATURES,
  } from "~/lib/trading-view/constant";
  import { isDarkMode } from "~/store";

  export let mobile = false;
  export let baseAsset;
  export let custom_css_url = "../themed.css";
  export let isPair = false;
  export let setPairTrades;

  let chartContainer;

  const chartInit = () => {
    if (!baseAsset) return () => {};
    import("~/lib/trading-view/charting_library").then(({ widget: Widget }) => {
      if (!chartContainer.current) return;

      const baseToken = baseAsset?.[baseAsset?.baseToken];
      const quoteToken = baseAsset?.[baseAsset?.quoteToken];
      const tvWidget = new Widget({
        datafeed: Datafeed(baseAsset, isPair, setPairTrades),
        symbol: isPair
          ? baseToken?.symbol + "/" + quoteToken?.symbol
          : baseAsset?.symbol + "/USD",
        container: chartContainer.current,
        container_id: chartContainer.current.id,
        locale: "en",
        fullscreen: false,
        enabled_features: ENABLED_FEATURES,
        disabled_features: [
          ...DISABLED_FEATURES,
          ...(mobile ? ["left_toolbar"] : []),
        ],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as any,
        autosize: true,
        theme: $isDarkMode ? "Dark" : "Light",
        studies_overrides: {
          "volume.volume.color.0": "#ea3943",
          "volume.volume.color.1": "#0ECB81",
        },
        ...widgetOptionsDefault,
      });

      (window as any).tvWidget = tvWidget;

      (window as any).tvWidget.onChartReady(() => {
        // setIsChartLoaded(true);
        (window as any).tvWidget?.applyOverrides(overrides($isDarkMode) || {});
      });
    });
  };

  $: {
    if (baseAsset?.id || custom_css_url || mobile || $isDarkMode) {
      (window as any).tvWidget = null;

      chartInit();

      if ((window as any).tvWidget !== null) {
        (window as any).tvWidget?.remove();
        (window as any).tvWidget = null;
      }
    }
  }
</script>

<div class="w-full h-full border border-red-500" bind:this={chartContainer} />

<style>
</style>

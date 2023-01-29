<svelte:options tag="coin-chart" />

<script lang="ts">
  import { createChart, LineStyle } from "lightweight-charts";
  import { onDestroy, onMount, tick } from "svelte";
  import dayjs from "dayjs";
  import { formatCurrency } from "../entries/contentScript/views/utils";
  import { sendMessage } from "webext-bridge";
  import { isEmpty } from "lodash";

  import "~/components/ResetStyle.custom.svelte";

  export let symbol;
  export let loaded;

  let chartElement;
  let chart;
  let areaChart;
  let hoverDate;
  let hoverPrice = 0;
  let isErrorDataChart = false;
  let hasData = false;
  let hasChart = false;

  const getChartData = async () => {
    const dataLocal = (await sendMessage("chartDataLocal", {
      symbol: symbol.toLowerCase(),
    })) as any;

    if (dataLocal) {
      hasData = true;
      renderChart(dataLocal.result);
    }
  };

  const callNewDataChart = async () => {
    if (hasData) return;
    const newestData = (await sendMessage("chartData", {
      symbol: symbol.toLowerCase(),
    })) as any;

    if (newestData) {
      hasData = true;
      renderChart(newestData);
    }
  };

  const renderChart = async (data: any) => {
    if (hasChart) return;
    hasChart = true;
    if (isEmpty(data)) {
      isErrorDataChart = true;
    } else {
      const priceData = data.prices.map(([time, price]) => ({
        time: dayjs(time).unix(),
        value: price,
      }));
      const lastPrice = data.prices[data.prices.length - 1] || [];

      if (lastPrice.length === 0) {
        isErrorDataChart = true;
        return;
      }

      isErrorDataChart = false;
      await tick();

      hoverPrice = lastPrice[1];
      hoverDate = dayjs.unix(dayjs(lastPrice[0]).unix()).toDate();

      try {
        console.log("Start chart");
        chart = createChart(chartElement, {
          width: 300,
          height: 200,
          handleScroll: {
            mouseWheel: false,
            pressedMouseMove: false,
            horzTouchDrag: false,
            vertTouchDrag: false,
          },
          crosshair: {
            mode: 0,
            vertLine: {
              style: LineStyle.Dashed,
            },
            horzLine: {
              visible: false,
            },
          },
          grid: {
            vertLines: {
              visible: false,
            },
            horzLines: {
              visible: false,
            },
          },
          timeScale: {
            visible: false,
            fixLeftEdge: true,
            fixRightEdge: true,
            borderColor: "#e5e7eb",
            drawTicks: false,
            rightBarStaysOnScroll: true,
          },
          handleScale: false,
          rightPriceScale: {
            visible: false,
            scaleMargins: {
              top: 0.05,
              bottom: 0,
            },
          },
        });
        // TODO: Change chart color based on up or down
        areaChart = chart.addAreaSeries({
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        areaChart.setData(priceData);
        chart.timeScale().fitContent();

        chart.subscribeCrosshairMove(function (param) {
          hoverDate = param.time ? dayjs.unix(param.time).toDate() : new Date();
          hoverPrice =
            param.seriesPrices.get(areaChart) ||
            priceData?.[priceData.length - 1].value ||
            0;
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  onDestroy(() => {
    if (chart) {
      chart.remove();
    }
  });

  onMount(() => {
    getChartData();
  });

  $: {
    if (loaded) {
      callNewDataChart();
    }
  }
</script>

<reset-style>
  {#if isErrorDataChart}
    <div
      class="w-full h-[180px] my-3 skeleton rounded flex items-center justify-center flex-col text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-10 w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        />
      </svg>
      <div class="mt-2 text-gray-900 mx-6 text-xs">No chart data</div>
    </div>
  {:else if !isErrorDataChart}
    {#if !hasData}
      <div
        class="w-full h-[180px] my-3 skeleton rounded flex items-center justify-center flex-col text-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
        <div class="mt-2 text-gray-900 mx-6 text-xs leading-4">
          Click outside to finish search and load chart data
        </div>
      </div>
    {:else}
      <div class="w-full h-[200px] relative">
        <div class="w-full h-[200px]" bind:this={chartElement} />
        <div class="absolute bottom-2 left-2 z-10">
          <div
            class="inline-block px-1 bg-[#22c55e] text-white rounded text-sm"
          >
            {dayjs(hoverDate).format("YYYY/MM/DD HH:mm")}
          </div>
          <br />
          <div
            class="inline-block px-1 bg-[#22c55e] text-white rounded text-sm"
          >
            ${hoverPrice && formatCurrency(hoverPrice)}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</reset-style>

<style>
  @keyframes skeleton-loading {
    0% {
      background-color: hsl(200, 20%, 80%);
    }
    100% {
      background-color: hsl(200, 20%, 95%);
    }
  }

  .skeleton {
    /* animation: skeleton-loading 1s linear infinite alternate; */
    background-color: hsl(200, 20%, 95%);
  }
</style>

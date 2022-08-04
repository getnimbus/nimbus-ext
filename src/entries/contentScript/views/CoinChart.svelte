<svelte:options tag="coin-chart" />

<script>
  import { createChart } from "lightweight-charts";
  import { onDestroy, onMount } from "svelte";
  import { coinGeko } from "./network";
  import dayjs from "dayjs";
  import { formatCurrency } from "./utils";
  let chartElement;
  export let symbol;
  let chart;
  let areaChart;
  let hoverDate;
  let hoverPrice = 0;

  const getChartData = async () => {
    const data = await coinGeko
      .get(`coins/${symbol.toLowerCase()}/market_chart/range`, {
        id: `${symbol.toLowerCase()}-chart`,
        params: {
          vs_currency: "usd",
          from: dayjs().subtract(7, "d").unix(),
          to: dayjs().unix(),
        },
      })
      .then((response) => response.data);

    const priceData = data.prices.map(([time, price]) => ({
      time: dayjs(time).unix(),
      value: price,
    }));

    hoverPrice = data.prices[data.prices.length - 1][1];
    hoverDate = dayjs
      .unix(dayjs(data.prices[data.prices.length - 1][0]).unix())
      .toDate();

    try {
      console.log("Start chart");
      chart = createChart(chartElement, {
        width: 350,
        height: 200,
        crosshair: {
          mode: 0,
          vertLine: {
            visible: false,
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
        },
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
  };

  onMount(() => {
    getChartData();
  });

  onDestroy(() => {
    if (chart) {
      chart.remove();
    }
  });
</script>

<div class="w-[350px] h-[200px] relative">
  <div class="w-[350px] h-[200px]" bind:this={chartElement} />
  <div class="absolute bottom-2 left-2 z-10">
    <div class="inline-block px-1 bg-[#22c55e] text-white rounded mb-1">
      {dayjs(hoverDate).format("YYYY/MM/DD HH:mm")}
    </div>
    <br />
    <div class="inline-block px-1 bg-[#22c55e] text-white rounded mb-1">
      ${formatCurrency(hoverPrice)}
    </div>
  </div>
</div>

<style>
</style>

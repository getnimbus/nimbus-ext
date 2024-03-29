<script lang="ts">
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { autoFontSize, formatCurrency } from "~/utils";
  import { sendMessage } from "webext-bridge";
  import { chain, wallet } from "~/store";
  import type { EChartsOption } from "echarts";
  import { uniqBy } from "lodash";

  import EChart from "~/components/EChart.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";

  import Logo from "~/assets/logo-1.svg";

  let isEmpty = false;
  let isLoading = false;
  let chartData = [];
  let portfolioData = [];
  let chartOption: EChartsOption = {};

  const getHoldingData = async () => {
    isLoading = true;
    try {
      const [holdingData, networthChart] = await Promise.all([
        sendMessage("getHoldingToken", {
          address: $wallet,
          chain: $chain,
        }),
        sendMessage("getNetworthAnalysis", {
          address: $wallet,
          chain: $chain,
        }),
      ]);

      const addresses = (holdingData?.result || []).map((item) =>
        item.cg_id
          ? `coingecko:${item.cg_id}`
          : `ethereum:${item.contractAddress}`
      );

      const chartDataResponse = await sendMessage("getDefillamaTokenChart", {
        addresses,
        start: dayjs().startOf("d").subtract(30, "d").unix(),
        span: 30,
      });

      chartData = chartDataResponse?.coins || {};
      portfolioData = networthChart?.result || [];
      isEmpty = false;
      isLoading = false;
    } catch (e) {
      console.error("e: ", e);
      isEmpty = true;
      isLoading = false;
    }
  };

  $: {
    if ($wallet && $chain) {
      if ($wallet?.length !== 0 && $chain?.length !== 0) {
        getHoldingData();
      }
    }
  }

  $: {
    if (chartData && portfolioData.length) {
      const seriesList = Object.keys(chartData).map((token) => {
        const basePoint = chartData[token]?.prices[0];
        const lineData = uniqBy(
          chartData[token]?.prices.map((item) => [
            dayjs(item.timestamp * 1000)
              .startOf("d")
              .valueOf(),
            ((item.price - basePoint.price) / basePoint.price) * 100,
          ]),
          (item) => item[0]
        );

        return {
          type: "line",
          showSymbol: false,
          name: chartData[token]?.symbol || token,
          labelLayout: {
            moveOverlap: "shiftY",
          },
          emphasis: {
            focus: "series",
          },
          lineStyle: {
            type: "dashed",
          },
          data: lineData,
        };
      });

      const basePortfolioPoint = portfolioData[0];
      const portfolioSeries = {
        type: "line",
        showSymbol: false,
        name: "Portfolio",
        labelLayout: {
          moveOverlap: "shiftY",
        },
        emphasis: {
          focus: "series",
        },
        data: portfolioData.map((item) => [
          dayjs(item.time * 1000)
            .startOf("d")
            .valueOf(),
          ((item.value - basePortfolioPoint.value) / basePortfolioPoint.value) *
            100,
        ]),
      };

      chartOption = {
        animationDuration: 5000,
        tooltip: {
          order: "valueDesc",
          trigger: "axis",
        },
        xAxis: {
          name: "Time",
          type: "time",
          axisLabel: {
            fontSize: autoFontSize(),
          },
        },
        yAxis: {
          name: "Value",
          axisLabel: {
            formatter: "{value}%",
            fontSize: autoFontSize(),
          },
        },
        series: [portfolioSeries, ...seriesList],
      };
    }
  }
</script>

<div class="border border_0000001a rounded-[20px] p-6">
  <div class="xl:text-xl text-3xl font-medium">Portfolio performance</div>
  <div class="mt-2">
    {#if isLoading}
      <div class="flex items-center justify-center h-[415px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full">
        {#if isEmpty}
          <div
            class="flex justify-center items-center h-[415px] text-base text-gray-400"
          >
            Empty
          </div>
        {:else}
          <div class="relative">
            <EChart
              id="networth-chart"
              theme="white"
              notMerge={true}
              option={chartOption}
              height={415}
            />
            <div
              class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 top-1/2 left-1/2"
            >
              <img src={Logo} alt="" width="140" height="140" />
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

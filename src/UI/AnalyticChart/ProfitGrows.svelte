<script lang="ts">
  import dayjs from "dayjs";
  import { autoFontSize, formatCurrency } from "~/utils";

  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LoadingPremium from "~/components/LoadingPremium.svelte";

  export let isEmpty;
  export let isLoading;
  export let dataTotalValueHistory;

  let optionLine = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 350px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: #000;">
                    <span>${item?.marker}</span>
                    ${item?.seriesName}
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                    <span style="font-weight: 500; font-size: 14px; line-height: 17px; text-align: right; color: ${
                      item?.seriesIndex === 2
                        ? item?.value >= 0
                          ? "#05a878"
                          : "#f25f5d"
                        : "#000"
                    };">
                    $${formatCurrency(Math.abs(item?.value))}
                    </span>
                  </div>
                </div>
                `;
                })
                .join("")}
            </div>`;
      },
    },
    legend: {
      lineStyle: {
        type: "solid",
      },
      data: [],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [],
      axisLabel: {
        fontSize: autoFontSize(),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "${value}",
        fontSize: autoFontSize(),
      },
    },
    series: [],
  };

  $: {
    if (dataTotalValueHistory && dataTotalValueHistory.length !== 0) {
      const formatXAxis = dataTotalValueHistory.map((item) => {
        return dayjs(new Date(item.timestamp * 1000)).format("YYYY-MM-DD");
      });

      const formatDataCost = dataTotalValueHistory.map((item) => {
        return {
          value: item.cost,
          itemStyle: {
            color: "rgba(0,169,236, 0.8)",
          },
        };
      });

      const formatDataNetworth = dataTotalValueHistory.map((item) => {
        return {
          value: item.networth,
          itemStyle: {
            color: "#f7931a",
          },
        };
      });

      const formatDataProfit = dataTotalValueHistory.map((item) => {
        return {
          value: item.networth - item.cost,
          itemStyle: {
            color: "#547fef",
          },
        };
      });

      optionLine = {
        ...optionLine,
        legend: {
          ...optionLine.legend,
          data: [
            {
              name: "Cost",
              itemStyle: {
                color: "rgba(0,169,236, 0.8)",
              },
            },
            {
              name: "Net Worth",
              itemStyle: {
                color: "#f7931a",
              },
            },
            {
              name: "Profit",
              itemStyle: {
                color: "#547fef",
              },
            },
          ],
        },
        xAxis: {
          ...optionLine.xAxis,
          data: formatXAxis,
        },
        series: [
          {
            name: "Cost",
            type: "line",
            lineStyle: {
              type: "solid",
              color: "rgba(0,169,236, 0.8)",
            },
            data: formatDataCost,
          },
          {
            name: "Net Worth",
            type: "line",
            lineStyle: {
              type: "solid",
              color: "#f7931a",
            },
            data: formatDataNetworth,
          },
          {
            name: "Profit",
            type: "line",
            lineStyle: {
              type: "solid",
              color: "#547fef",
            },
            data: formatDataProfit,
          },
        ],
      };
    }
  }
</script>

<div class="border border_0000001a rounded-[20px] p-6">
  <div class="xl:text-xl text-3xl font-medium">Profit Grows</div>
  <div class="mt-2">
    {#if isLoading}
      <div class="flex items-center justify-center h-[415px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full">
        {#if isEmpty}
          <div
            class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[415px]"
          >
            Empty
          </div>
        {:else}
          <div class="relative">
            <EChart
              id="profit-grows"
              theme="white"
              notMerge={true}
              option={optionLine}
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

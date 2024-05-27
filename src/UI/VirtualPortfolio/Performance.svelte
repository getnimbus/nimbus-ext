<script lang="ts">
  import { autoFontSize, formatPercent } from "~/utils";
  import { isDarkMode } from "~/store";
  import dayjs from "dayjs";

  import EChart from "~/components/EChart.svelte";
  import Loading from "~/components/Loading.svelte";

  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";

  export let isLoading;
  export let dataVirtualPortfolioPerformance;

  let optionLine = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    $isDarkMode ? "white" : "black"
                  }">
                    <span>${item?.marker}</span>
                    ${item?.seriesName}
                  </div>

                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      item.value >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      ${formatPercent(Math.abs(item.value))}%
                      <img
                        src=${item.value >= 0 ? TrendUp : TrendDown} 
                        alt=""
                        style="margin-bottom: 4px;"
                      />
                    </div>
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
        fontSize: autoFontSize(),
      },
    },
    series: [],
  };

  $: {
    if (
      dataVirtualPortfolioPerformance &&
      Object.keys(dataVirtualPortfolioPerformance).length === 0
    ) {
      optionLine = {
        title: {
          text: "",
        },
        tooltip: {
          trigger: "axis",
          extraCssText: "z-index: 9997",
          formatter: function (params) {
            return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    $isDarkMode ? "white" : "black"
                  }">
                    <span>${item?.marker}</span>
                    ${item?.seriesName}
                  </div>

                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      item.value >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      ${formatPercent(Math.abs(item.value))}%
                      <img
                        src=${item.value >= 0 ? TrendUp : TrendDown} 
                        alt=""
                        style="margin-bottom: 4px;"
                      />
                    </div>
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
            fontSize: autoFontSize(),
          },
        },
        series: [],
      };
    } else {
      const formatXAxisPerformance =
        dataVirtualPortfolioPerformance?.portfolio?.map((item) => {
          return dayjs(item.timestamp).format("YYYY-MM-DD");
        });

      const formatDataPortfolio =
        dataVirtualPortfolioPerformance?.portfolio?.map((item) => {
          return {
            value: item.performance,
            itemStyle: {
              color: "#00b580",
            },
          };
        });

      const formatDataETH = dataVirtualPortfolioPerformance?.eth?.map(
        (item) => {
          return {
            value: item.performance,
            itemStyle: {
              color: "#547fef",
            },
          };
        }
      );

      const formatDataBTC = dataVirtualPortfolioPerformance?.btc?.map(
        (item) => {
          return {
            value: item.performance,
            itemStyle: {
              color: "#f7931a",
            },
          };
        }
      );

      optionLine = {
        ...optionLine,
        tooltip: {
          trigger: "axis",
          extraCssText: "z-index: 9997",
          formatter: function (params) {
            return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 260px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500;color: ${
                    $isDarkMode ? "white" : "black"
                  }">
                    <span>${item?.marker}</span>
                    ${item?.seriesName}
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      item.value >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      ${formatPercent(Math.abs(item.value))}%
                      <img
                        src=${item.value >= 0 ? TrendUp : TrendDown}
                        alt=""
                        style="margin-bottom: 4px;"
                      />
                    </div>
                  </div>
                </div>
                `;
                })
                .join("")}
            </div>`;
          },
        },
        legend: {
          ...optionLine.legend,
          data: [
            {
              name: "Your Portfolio",
              itemStyle: {
                color: "#00b580",
              },
            },
            {
              name: "Bitcoin",
              itemStyle: {
                color: "#f7931a",
              },
            },
            {
              name: "Ethereum",
              itemStyle: {
                color: "#547fef",
              },
            },
          ],
        },
        xAxis: {
          ...optionLine.xAxis,
          data: formatXAxisPerformance,
        },
        yAxis: {
          ...optionLine.yAxis,
          axisLabel: {
            formatter: "{value}%",
            fontSize: autoFontSize(),
          },
        },
        series: [
          {
            name: "Your Portfolio",
            type: "line",
            lineStyle: {
              type: "solid",
              color: "#00b580",
            },
            showSymbol: false,
            data: formatDataPortfolio,
          },
          {
            name: "Bitcoin",
            type: "line",
            lineStyle: {
              type: "dashed",
              color: "#f7931a",
            },
            showSymbol: false,
            data: formatDataBTC,
          },
          {
            name: "Ethereum",
            type: "line",
            lineStyle: {
              type: "dashed",
              color: "#547fef",
            },
            showSymbol: false,
            data: formatDataETH,
          },
        ],
      };
    }
  }

  $: theme = $isDarkMode ? "dark" : "white";
</script>

<div
  class={`rounded-[20px] xl:p-6 py-4 px-3 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
  }`}
>
  <div class="text-3xl font-medium xl:text-2xl mb-6">Performance</div>

  {#if isLoading}
    <div class="flex items-center justify-center h-[465px]">
      <Loading />
    </div>
  {:else}
    <div class="h-full">
      {#if dataVirtualPortfolioPerformance && Object.keys(dataVirtualPortfolioPerformance).length === 0}
        <div
          class="flex justify-center items-center h-[465px] text-base text-gray-400"
        >
          Empty
        </div>
      {:else}
        <EChart
          id="line-chart"
          {theme}
          notMerge={true}
          option={optionLine}
          height={465}
        />
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>

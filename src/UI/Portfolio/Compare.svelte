<script lang="ts">
  import dayjs from "dayjs";
  import { formatCurrency } from "~/utils";

  export let data;
  export let isLoadingDataCompare;

  import EChart from "~/components/EChart.svelte";
  import "~/components/Loading.custom.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";

  let optionBar = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
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
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      item.value >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      ${formatCurrency(Math.abs(item.value))}
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
      data: [],
    },
    xAxis: [
      {
        type: "category",
        axisTick: { show: false },
        data: ["Sharpe Ratio", "Volatility", "Drawdown"],
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [],
  };

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
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      item.value >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      $${formatCurrency(Math.abs(item.value))}
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
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "${value}",
      },
    },
    series: [],
  };

  $: {
    if (data && Object.keys(data).length !== 0) {
      const listKey = Object.getOwnPropertyNames(data);

      // bar chart format
      const legendDataBarChart = listKey.map((item) => {
        let data = {
          name: "",
          itemStyle: {
            color: "",
          },
        };
        switch (item) {
          case "btc":
            data = {
              name: "Bitcoin",
              itemStyle: {
                color: "#f7931a",
              },
            };
            break;
          case "eth":
            data = {
              name: "Ethereum",
              itemStyle: {
                color: "#547fef",
              },
            };
            break;
          case "base":
            data = {
              name: "This wallet",
              itemStyle: {
                color: "#00b580",
              },
            };
            break;
          case "compare":
            data = {
              name: "Compare wallet",
              itemStyle: {
                color: "rgba(178,184,255,1)",
              },
            };
            break;
        }
        return data;
      });

      const dataBarChart = listKey.map((item) => {
        let custom = {
          name: "",
          color: "",
        };
        switch (item) {
          case "btc":
            custom = {
              name: "Bitcoin",
              color: "#f7931a",
            };
            break;
          case "eth":
            custom = {
              name: "Ethereum",
              color: "#547fef",
            };
            break;
          case "base":
            custom = {
              name: "This wallet",
              color: "#00b580",
            };
            break;
          case "compare":
            custom = {
              name: "Compare wallet",
              color: "rgba(178,184,255,1)",
            };
            break;
        }

        return {
          name: custom.name,
          type: "bar",
          barStyle: {
            type: "solid",
            color: custom.color,
          },
          emphasis: {
            focus: "series",
          },
          data: [
            {
              value: data[item].sharpeRatio,
              itemStyle: {
                color: custom.color,
              },
            },
            {
              value: data[item].volatility,
              itemStyle: {
                color: custom.color,
              },
            },
            {
              value: data[item].drawDown,
              itemStyle: {
                color: custom.color,
              },
            },
          ],
        };
      });

      optionBar = {
        ...optionBar,
        legend: {
          data: legendDataBarChart,
        },
        series: dataBarChart,
      };

      // line chart format
      const formatDataLineChart = listKey.map((item) => {
        let formatData = {
          name: "",
          color: "",
          type: "",
          dataChart: [],
        };

        switch (item) {
          case "btc":
            formatData = {
              name: "Bitcoin",
              color: "#f7931a",
              type: "dashed",
              dataChart: data[item]?.holdingHistory
                .map((holdingData) => {
                  return {
                    value: holdingData.price,
                    timestamp: dayjs(
                      new Date(holdingData.timestamp * 1000)
                    ).format("DD/MM/YY"),
                  };
                })
                .slice(1, -1),
            };
            break;
          case "eth":
            formatData = {
              name: "Ethereum",
              color: "#547fef",
              type: "dashed",
              dataChart: data[item]?.holdingHistory
                .map((holdingData) => {
                  return {
                    value: holdingData.price,
                    timestamp: dayjs(
                      new Date(holdingData.timestamp * 1000)
                    ).format("DD/MM/YY"),
                  };
                })
                .slice(1, -1),
            };
            break;
          case "base":
            formatData = {
              name: "This wallet",
              color: "#00b580",
              type: "solid",
              dataChart: data[item]?.holdingHistory
                .map((holdingData) => {
                  return {
                    value: holdingData.networth,
                    timestamp: dayjs(
                      new Date(holdingData.timestamp * 1000)
                    ).format("DD/MM/YY"),
                  };
                })
                .slice(0, -2),
            };
            break;
          case "compare":
            formatData = {
              name: "Compare wallet",
              color: "rgba(178,184,255,1)",
              type: "solid",
              dataChart: data[item]?.holdingHistory
                .map((holdingData) => {
                  return {
                    value: holdingData.networth,
                    timestamp: dayjs(
                      new Date(holdingData.timestamp * 1000)
                    ).format("DD/MM/YY"),
                  };
                })
                .slice(0, -2),
            };
            break;
        }
        return formatData;
      });

      const XAxisDataLineChart = formatDataLineChart[0].dataChart.map(
        (item) => {
          return item.timestamp;
        }
      );

      const legendDataLineChart = formatDataLineChart.map((item) => {
        return {
          name: item.name,
          itemStyle: {
            color: item.color,
          },
        };
      });

      const dataLineChart = formatDataLineChart.map((item) => {
        return {
          name: item.name,
          type: "line",
          lineStyle: {
            type: item.type,
            color: item.color,
          },
          data: item.dataChart.map((eachDataCustom) => {
            return {
              value: eachDataCustom.value,
              itemStyle: {
                color: item.color,
              },
            };
          }),
        };
      });

      optionLine = {
        ...optionLine,
        legend: {
          ...optionLine.legend,
          data: legendDataLineChart,
        },
        xAxis: {
          ...optionLine.xAxis,
          data: XAxisDataLineChart,
        },
        series: dataLineChart,
      };
    }
  }
</script>

<ErrorBoundary>
  <div class="flex xl:flex-row flex-col justify-between gap-6">
    <div class="xl:w-1/2 w-full border border_0000001a rounded-[20px] p-6">
      <div class="mb-1 w-full">
        <div class="xl:text-xl text-3xl font-medium flex justify-start">
          Risks
          <!-- <TooltipTitle tooltipText={"The lower the better"} isBigIcon>
            Risks
          </TooltipTitle> -->
        </div>
      </div>
      {#if isLoadingDataCompare}
        <div class="flex items-center justify-center h-[465px]">
          <loading-icon />
        </div>
      {:else}
        <div class="h-full">
          {#if data && Object.keys(data).length === 0}
            <div
              class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[433px]"
            >
              Empty
            </div>
          {:else}
            <EChart
              id="bar-chart-compare"
              theme="white"
              notMerge={true}
              option={optionBar}
              height={465}
            />
          {/if}
        </div>
      {/if}
    </div>
    <div
      class="xl:w-1/2 w-full relative border border_0000001a rounded-[20px] p-6"
    >
      <div class="pl-4 xl:text-xl text-3xl font-medium  mb-3">
        Performance
      </div>
      {#if isLoadingDataCompare}
        <div class="flex items-center justify-center h-[433px]">
          <loading-icon />
        </div>
      {:else}
        <div class="h-full h">
          {#if data && Object.keys(data).length === 0}
            <div
              class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[433px]"
            >
              Empty
            </div>
          {:else}
            <EChart
              id="line-chart-compare"
              theme="white"
              notMerge={true}
              option={optionLine}
              height={433}
            />
          {/if}
        </div>
      {/if}
    </div>
  </div>
</ErrorBoundary>

<style>
</style>

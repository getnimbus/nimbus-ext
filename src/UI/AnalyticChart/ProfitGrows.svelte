<script lang="ts">
  import dayjs from "dayjs";
  import numeral from "numeral";
  import { formatBigBalance, formatCurrencyV2 } from "~/utils";

  import EChart from "~/components/EChart.svelte";

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
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #00b580; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[0].seriesName}
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[0].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                    $${
                      formatNumber(Math.abs(params[0].value)).number_size !==
                      "K"
                        ? numeral(
                            formatNumber(Math.abs(params[0].value))
                              .number_format
                          ).format("0,0.00") +
                          formatNumber(Math.abs(params[0].value)).number_size
                        : formatCurrencyV2(Math.abs(params[0].value))
                    }
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #f7931a; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[1].seriesName}
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[1].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                   $${
                     formatNumber(Math.abs(params[1].value)).number_size !== "K"
                       ? numeral(
                           formatNumber(Math.abs(params[1].value)).number_format
                         ).format("0,0.00") +
                         formatNumber(Math.abs(params[1].value)).number_size
                       : formatCurrencyV2(Math.abs(params[1].value))
                   }
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #547fef; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[2].seriesName}
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[2].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                    $${
                      formatNumber(Math.abs(params[2].value)).number_size !==
                      "K"
                        ? numeral(
                            formatNumber(Math.abs(params[2].value))
                              .number_format
                          ).format("0,0.00") +
                          formatNumber(Math.abs(params[2].value)).number_size
                        : formatCurrencyV2(Math.abs(params[2].value))
                    }
                </div>
              </div>
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

  const formatNumber = (number) => {
    const { number_format, number_size } = formatBigBalance(number);
    return {
      number_format,
      number_size,
    };
  };

  $: {
    if (dataTotalValueHistory && dataTotalValueHistory.length !== 0) {
      const formatXAxis = dataTotalValueHistory.map((item) => {
        return dayjs(new Date(item.timestamp * 1000)).format("DD MMM YYYY");
      });

      const formatDataCost = dataTotalValueHistory.map((item) => {
        return {
          value: item.cost,
          itemStyle: {
            color: "#00b580",
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
                color: "#00b580",
              },
            },
            {
              name: "Networth",
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
              color: "#00b580",
            },
            data: formatDataCost,
          },
          {
            name: "Networth",
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

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div class="font-medium text-black text-xl">Profit Grows</div>
  <div class="mt-2">
    {#if isLoading}
      <div class="flex items-center justify-center h-[465px]">
        <loading-icon />
      </div>
    {:else}
      <div class="h-full">
        {#if isEmpty}
          <div
            class="flex justify-center items-center h-full text-lg text-gray-400 h-[465px]"
          >
            Empty
          </div>
        {:else}
          <EChart
            id="ProfitGrows"
            theme="white"
            notMerge={true}
            option={optionLine}
            height={465}
          />
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

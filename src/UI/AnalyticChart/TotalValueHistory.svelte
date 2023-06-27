<script lang="ts">
  import dayjs from "dayjs";
  import numeral from "numeral";
  import { formatBigBalance, formatCurrencyV2 } from "~/utils";

  import EChart from "~/components/EChart.svelte";

  export let isEmpty;
  export let isLoading;
  export let dataTotalValueHistory;

  let optionLine = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 350px;">
              <div style="display: flex; justify-content: space-between;">
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                  ${params[0].axisValue}
                </div>
                <div style="font-weight: 600; font-size: 20px; line-height: 19px; color: black;">
                  $${
                    formatNumber(params[0].value).number_size !== "K"
                      ? numeral(
                          formatNumber(params[0].value).number_format
                        ).format("0,0.00") +
                        formatNumber(params[0].value).number_size
                      : formatCurrencyV2(params[0].value)
                  }
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${params[0].data.changes
                  .map((item) => {
                    return `
                    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));">
                      <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: #000;">
                          ${
                            item?.logo
                              ? `<img src=${item?.logo} alt="" width=20 height=20 style="border-radius: 100%" />`
                              : ""
                          }
                        ${item?.name}
                      </div>
                      <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                        <span style="font-weight: 500; color: #000">
                          ${
                            formatNumber(item?.balance).number_size !== "K"
                              ? numeral(
                                  formatNumber(item?.balance).number_format
                                ).format("0,0.00") +
                                formatNumber(item?.balance).number_size
                              : formatCurrencyV2(item?.balance)
                          }
                        </span>
                        <span>${item?.symbol}</span>
                      </div>

                      <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; font-weight: 500; font-size: 14px; color: #000;">
                           $${
                             formatNumber(item?.value).number_size !== "K"
                               ? numeral(
                                   formatNumber(item?.value).number_format
                                 ).format("0,0.00") +
                                 formatNumber(item?.value).number_size
                               : formatCurrencyV2(item?.value)
                           }
                      </div>
                    </div>`;
                  })
                  .join("")}
                </div>
            </div>`;
      },
    },
    legend: {
      lineStyle: {
        type: "solid",
      },
      itemStyle: {
        color: "rgba(0,169,236, 0.8)",
      },
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

      const formatData = dataTotalValueHistory.map((item) => {
        return {
          value: item.changes.reduce(
            (prev, item) => prev + Number(item.value),
            0
          ),
          changes: item.changes.map((change) => {
            return {
              name: change.name,
              symbol: change.price.symbol,
              logo: change?.logo,
              balance: change.balance,
              value: change.value,
            };
          }),
        };
      });

      optionLine = {
        ...optionLine,
        legend: {
          ...optionLine.legend,
        },
        xAxis: {
          ...optionLine.xAxis,
          data: formatXAxis,
        },
        series: [
          {
            name: "Total value",
            type: "line",
            lineStyle: {
              type: "solid",
              color: "rgba(0,169,236, 0.8)",
            },
            areaStyle: {
              color: "rgba(0,169,236, 0.5)",
            },
            showSymbol: false,
            data: formatData.map((item) => {
              return {
                value: item.value,
                itemStyle: {
                  color: "rgba(0,169,236, 0.8)",
                },
                changes: item.changes,
              };
            }),
          },
        ],
      };
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div class="font-medium text-black text-xl">Total Value History</div>
  <div class="mt-2">
    {#if isLoading}
      <div class="flex items-center justify-center h-[415px]">
        <loading-icon />
      </div>
    {:else}
      <div class="h-full">
        {#if isEmpty}
          <div
            class="flex justify-center items-center h-full text-lg text-gray-400 h-[415px]"
          >
            Empty
          </div>
        {:else}
          <EChart
            id="total-value-history"
            theme="white"
            option={optionLine}
            height={415}
            notMerge={true}
          />
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

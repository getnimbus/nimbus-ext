<script lang="ts">
  import dayjs from "dayjs";
  import numeral from "numeral";
  import { formatBigBalance, formatCurrency } from "~/utils";

  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LoadingPremium from "~/components/LoadingPremium.svelte";

  export let isEmpty;
  export let isLoading;
  export let dataTotalValueHistory;

  let optionLine = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 380px;">
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
                      : formatCurrency(params[0].value)
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
                          ${formatCurrency(item?.balance)}
                        </span>
                        <span>${item?.symbol}</span>
                      </div>

                      <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; font-weight: 500; font-size: 14px; color: #000;">
                           $${formatCurrency(item?.value)}
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
        return dayjs(new Date(item.timestamp * 1000)).format("YYYY-MM-DD");
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
  <div class="xl:text-xl text-3xl font-medium text-black">
    Total Value History
  </div>
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
              id="total-value-history"
              theme="white"
              option={optionLine}
              height={415}
              notMerge={true}
              type="full-width"
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

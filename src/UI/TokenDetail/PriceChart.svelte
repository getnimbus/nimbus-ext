<script lang="ts">
  import dayjs from "dayjs";
  import { createQuery } from "@tanstack/svelte-query";
  import { mobula } from "~/lib/network";
  import { isDarkMode } from "~/store";
  import { autoFontSize, formatCurrency, formatValue } from "~/utils";
  import numeral from "numeral";

  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";
  import Loading from "~/components/Loading.svelte";

  export let contractAddress;
  export let sellHistoryTradeList;
  export let buyHistoryTradeList;
  export let id;
  export let avgCost;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  const handleGetTokenPrice = async () => {
    const response = await mobula.get(
      `/1/market/history?blockchain=Ethereum&asset=${contractAddress}&from=${dayjs()
        .subtract(30, "day")
        .unix()}&to'`
    );
    return response?.data?.price_history;
  };

  let dataPriceChart = [];
  let dataAvgCost = [];

  let optionLine = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        console.log("params", params);
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 320px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                darkMode ? "white" : "black"
              }">
                 ${dayjs(params[0].axisValue).format("YYYY-MM-DD")}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    darkMode ? "white" : "black"
                  }">
                    <span>${item?.marker}</span>
                    <span>${
                      item?.seriesName === "series\u00001"
                        ? "Avg Cost"
                        : item?.seriesName === "series\u00000"
                        ? "Price USD"
                        : item?.seriesName
                    }</span>
                  </div>

                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      darkMode ? "white" : "black"
                    }">
                      $${formatCurrency(Math.abs(item.value[1]))}
                    </div>
                  </div>
                </div>
                `;
                })
                .join("")}
            </div>`;
      },
    },
    toolbox: {
      right: "3%",
      top: "-1%",
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "time",
      axisLabel: {
        fontSize: autoFontSize(),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: function (value, index) {
          return (
            `${value < 0 ? "-" : ""} $` +
            numeral(Math.abs(value)).format("0.0000a")
          );
        },
        fontSize: autoFontSize(),
      },
    },
    series: [],
  };

  $: queryTokenPrice = createQuery({
    queryKey: ["token-price", contractAddress],
    queryFn: () => handleGetTokenPrice(),
    staleTime: Infinity,
    retry: false,
    enabled: contractAddress !== undefined && contractAddress.length !== 0,
  });

  $: {
    if (
      !$queryTokenPrice.isError &&
      $queryTokenPrice.data !== undefined &&
      $queryTokenPrice.data.length !== 0
    ) {
      dataPriceChart = $queryTokenPrice.data?.map((item) => {
        return {
          value: [item[0], item[1]],
          itemStyle: {
            color: "#00b580",
          },
        };
      });

      dataAvgCost = $queryTokenPrice.data?.map((item) => {
        return {
          value: [item[0], avgCost],
          itemStyle: {
            color: "#eab308",
          },
        };
      });
    }
  }

  const findClosestObject = (date, array) => {
    let closestObject = null;
    let closestDateDifference = Infinity;

    for (const obj of array) {
      const dateDifference = Math.abs(dayjs(date).diff(dayjs(obj.date)));
      if (dateDifference < closestDateDifference) {
        closestDateDifference = dateDifference;
        closestObject = obj;
      }
    }

    return closestObject;
  };

  // Function to filter duplicates based on the 'date' field and collect duplicates into a separate array
  function filterAndCollectDuplicates(arr) {
    const uniqueDates = new Set();
    const duplicates = [];

    arr.forEach((item) => {
      const date = dayjs(item.date);
      const dateStr = date.format("YYYY-MM-DD"); // Change the format as needed
      if (uniqueDates.has(dateStr)) {
        duplicates.push(item);
      }
      uniqueDates.add(dateStr);
    });
    return duplicates;
  }

  $: {
    if (
      dataPriceChart &&
      dataPriceChart.length !== 0 &&
      ((sellHistoryTradeList && sellHistoryTradeList.length !== 0) ||
        (buyHistoryTradeList && buyHistoryTradeList.length !== 0))
    ) {
      const formatDataBuyHistoryTrade = buyHistoryTradeList.map((item) => {
        const selected = findClosestObject(
          item.created_at * 1000,
          dataPriceChart.map((item) => {
            return {
              ...item,
              date: item.value[0],
            };
          })
        );
        return {
          itemStyle: { color: "#547fef" },
          value: [item.created_at * 1000, selected.value[1]],
          type: "buy",
        };
      });

      const formatDataSellHistoryTrade = sellHistoryTradeList.map((item) => {
        const selected = findClosestObject(
          item.created_at * 1000,
          dataPriceChart.map((item) => {
            return {
              ...item,
              date: item.value[0],
            };
          })
        );
        return {
          itemStyle: { color: "#ef4444" },
          value: [item.created_at * 1000, selected.value[1]],
          type: "sell",
        };
      });

      console.log({
        formatDataBuyHistoryTrade: formatDataBuyHistoryTrade.map((item) => {
          return {
            ...item,
            id: dayjs(item.value[0]).format("YYYY-MM-DD"),
          };
        }),
        formatDataSellHistoryTrade: formatDataSellHistoryTrade.map((item) => {
          return {
            ...item,
            id: dayjs(item.value[0]).format("YYYY-MM-DD"),
          };
        }),
      });

      const dataHistoryTrade = formatDataBuyHistoryTrade.concat(
        formatDataSellHistoryTrade
      );
      console.log(
        "dataHistoryTrade: ",
        dataHistoryTrade.map((item) => {
          return {
            ...item,
            date: item.value[0],
          };
        })
      );

      const duplicateHistoryDateTrade = filterAndCollectDuplicates(
        dataHistoryTrade.map((item) => {
          return {
            ...item,
            date: item.value[0],
          };
        })
      );
      console.log(
        "blabla: ",
        duplicateHistoryDateTrade.map((item) => {
          return {
            ...item,
            date: dayjs(item.date).format("YYYY-MM-DD hh:mm:ss"),
          };
        })
      );

      console.log("dataPriceChart: ", dataPriceChart);

      optionLine = {
        ...optionLine,
        series: [
          {
            type: "line",
            symbol: "circle",
            datasetIndex: 1,
            symbolSize: 0.1,
            lineStyle: {
              type: "solid",
              color: "#00b580",
            },
            showSymbol: false,
            data: dataPriceChart,
          },
          {
            type: "line",
            symbol: "circle",
            datasetIndex: 1,
            symbolSize: 0.1,
            lineStyle: {
              type: "dashed",
              color: "#eab308",
            },
            showSymbol: false,
            data: dataAvgCost,
          },
          {
            name: "Buy",
            type: "scatter",
            symbolSize: 10,
            itemStyle: { color: "#547fef" },
            data: formatDataBuyHistoryTrade,
          },
          {
            name: "Sell",
            type: "scatter",
            symbolSize: 10,
            itemStyle: { color: "#ef4444" },
            data: formatDataSellHistoryTrade,
          },
        ],
      };
    } else {
      optionLine = {
        ...optionLine,
        series: [
          {
            type: "line",
            symbol: "circle",
            datasetIndex: 1,
            symbolSize: 0.1,
            lineStyle: {
              type: "solid",
              color: "#00b580",
            },
            showSymbol: false,
            data: [],
          },
          {
            name: "Buy",
            type: "scatter",
            symbolSize: 10,
            itemStyle: { color: "#547fef" },
            data: [],
          },
          {
            name: "Sell",
            type: "scatter",
            symbolSize: 10,
            itemStyle: { color: "#ef4444" },
            data: [],
          },
        ],
      };
    }
  }

  $: theme = darkMode ? "dark" : "white";
</script>

{#if $queryTokenPrice.isFetching}
  <div class="flex items-center justify-center h-[475px]">
    <Loading />
  </div>
{:else}
  <div class="h-full">
    {#if $queryTokenPrice.isError || (dataPriceChart && dataPriceChart.length === 0)}
      <div
        class="flex justify-center items-center h-full text-lg text-gray-400 h-[475px]"
      >
        Empty
      </div>
    {:else}
      <div class="relative">
        <EChart {id} {theme} notMerge={true} option={optionLine} height={485} />
        <div
          class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none top-1/2 left-1/2"
        >
          <img
            src={darkMode ? LogoWhite : Logo}
            alt=""
            width="140"
            height="140"
          />
        </div>
      </div>
    {/if}
  </div>
{/if}

<style></style>

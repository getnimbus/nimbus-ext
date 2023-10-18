<script lang="ts">
  import dayjs from "dayjs";
  import { createQuery } from "@tanstack/svelte-query";
  import { mobula } from "~/lib/network";
  import { isDarkMode } from "~/store";
  import { autoFontSize, formatCurrency } from "~/utils";
  import numeral from "numeral";
  import { groupBy } from "lodash";

  import EChart from "~/components/EChart.svelte";
  import Loading from "~/components/Loading.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

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
                    ${
                      item?.seriesName === "Trade"
                        ? handleSumTradeBuyAndSell(item?.data?.data)
                        : `
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
                      `
                    }
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
      position: "right",
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
            color: "#1e96fc",
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

  const filterAndCollectDuplicates = (arr) => {
    let dateMap = new Map();
    let duplicates = [];

    arr.forEach((item) => {
      const date = dayjs(item.date);
      const dateStr = date.format("YYYY-MM-DD");

      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr).push(item);
      } else {
        dateMap.set(dateStr, [item]);
      }
    });

    dateMap.forEach((duplicateGroup) => {
      if (duplicateGroup.length > 1) {
        duplicates.push(...duplicateGroup);
      }
    });

    return duplicates;
  };

  const handleSumTradeBuyAndSell = (arr) => {
    const groupBuySellHistoryData = groupBy(arr, "type");
    const buySellHistoryData = Object.getOwnPropertyNames(
      groupBuySellHistoryData
    );

    const formatData = buySellHistoryData.map((item) => {
      return {
        type: item,
        value: groupBuySellHistoryData[item]?.reduce(
          (prev, item) => prev + Number(item.value[1]),
          0
        ),
      };
    });

    return `
       ${formatData
         .map((item) => {
           return `
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  darkMode ? "white" : "black"
                }">
                  <span style="margin-top: 5px; display:inline-block; margin-right:4px; border-radius:10px; width:10px; height:10px; background-color: ${
                    item?.type === "buy" ? "#00b580" : "#ef4444"
                  };"></span>
                  <span style="text-transform: capitalize;">${item?.type}</span>
                </div>

                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
                  <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    darkMode ? "white" : "black"
                  }">
                    $${formatCurrency(Math.abs(item.value))}
                  </div>
                </div>
              </div>
            `;
         })
         .join("")}
    `;
  };

  $: {
    if (
      dataPriceChart &&
      dataPriceChart.length !== 0 &&
      ((sellHistoryTradeList && sellHistoryTradeList.length !== 0) ||
        (buyHistoryTradeList && buyHistoryTradeList.length !== 0))
    ) {
      const formatDataBuyHistory = buyHistoryTradeList.map((item) => {
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
          itemStyle: { color: "#00b580" },
          value: [item.created_at * 1000, selected.value[1]],
          type: "buy",
        };
      });
      const formatDataSellHistory = sellHistoryTradeList.map((item) => {
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
      const dataHistory = formatDataBuyHistory.concat(formatDataSellHistory);

      const tradeHistoryData = filterAndCollectDuplicates(
        dataHistory.map((item) => {
          return {
            ...item,
            date: dayjs(item.value[0]).format("YYYY-MM-DD"),
          };
        })
      );
      const groupBuyTradeHistoryData = groupBy(tradeHistoryData, "date");
      const dateTradeHistoryData = Object.getOwnPropertyNames(
        groupBuyTradeHistoryData
      );
      const dataTrade = dateTradeHistoryData.map((item) => {
        const selected = findClosestObject(
          groupBuyTradeHistoryData[item][0].value[0],
          dataPriceChart.map((item) => {
            return {
              ...item,
              date: item.value[0],
            };
          })
        );
        return {
          dateFormat: item,
          date: groupBuyTradeHistoryData[item][0].value[0],
          data: groupBuyTradeHistoryData[item],

          itemStyle: { color: "#6b7280" },
          value: [
            groupBuyTradeHistoryData[item][0].value[0],
            selected.value[1],
          ],
          type: "trade",
        };
      });

      const filteredDuplicateHistoryData = dataHistory
        .map((item) => {
          return {
            ...item,
            date: item.value[0],
          };
        })
        .filter(
          (elem) =>
            !tradeHistoryData
              .map((item) => {
                return {
                  ...item,
                  date: item.value[0],
                };
              })
              .find(({ date }) => elem.date === date)
        );
      const groupBuyHistoryData = groupBy(filteredDuplicateHistoryData, "type");
      const dataBuy = groupBuyHistoryData["buy"];
      const dataSell = groupBuyHistoryData["sell"];

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
              color: "#1e96fc",
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
            name: "Trade",
            type: "scatter",
            symbolSize: 20,
            data: dataTrade || [],
          },
          {
            name: "Buy",
            type: "scatter",
            symbolSize: 20,
            data: dataBuy || [],
          },
          {
            name: "Sell",
            type: "scatter",
            symbolSize: 20,
            data: dataSell || [],
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
              color: "#1e96fc",
            },
            showSymbol: false,
            data: [],
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
            data: [],
          },
          {
            name: "Trade",
            type: "scatter",
            symbolSize: 20,
            data: [],
          },
          {
            name: "Buy",
            type: "scatter",
            symbolSize: 20,
            data: [],
          },
          {
            name: "Sell",
            type: "scatter",
            symbolSize: 20,
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
    {#if $queryTokenPrice.isError || (dataPriceChart && dataPriceChart.length === 0) || (dataAvgCost && dataAvgCost.length === 0)}
      <div
        class="flex justify-center items-center h-full text-lg text-gray-400 h-[475px]"
      >
        Empty
      </div>
    {:else}
      <div class="relative">
        <EChart
          id={id + "line-chart"}
          {theme}
          notMerge={true}
          option={optionLine}
          height={485}
        />
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

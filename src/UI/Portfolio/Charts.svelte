<script lang="ts">
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { i18n } from "~/lib/i18n";
  import { chain, wallet, typeWallet, isDarkMode } from "~/store";
  import {
    formatCurrency,
    performanceTypeChartPortfolio,
    typePieChart,
    formatPercent,
    formatValue,
  } from "~/utils";
  import dayjs from "dayjs";
  import numeral from "numeral";

  export let handleSelectedTableTokenHolding = (data, selectDataPieChart) => {};
  export let isLoading;
  export let isLoadingBreakdown;
  export let holdingTokenData;
  export let overviewDataPerformance;
  export let dataPieChart;
  export let isEmptyDataPie;

  import EChart from "~/components/EChart.svelte";
  import "~/components/Loading.custom.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TokenAllocation from "~/components/TokenAllocation.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";

  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";

  const MultipleLang = {
    token_allocation: i18n("newtabPage.token-allocation", "Token Allocation"),
    nft_allocation: i18n("newtabPage.nft-allocation", "NFT Allocation"),
    performance: i18n("newtabPage.performance", "Performance"),
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
  };

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let selectedType: "token" | "nft" = "token";
  let selectedTypePerformance: "percent" | "networth" = "percent";
  let optionPie = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="display: flex; align-items: centers; gap: 4px">
                <img src=${
                  params?.data?.logo ||
                  "https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
                } alt="" width=20 height=20 style="border-radius: 100%" />
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                  darkMode ? "white" : "black"
                }">
                  ${params?.name} ${
          params?.data?.symbol ? `(${params?.data?.symbol})` : ""
        }
                </div>
              </div>

              ${
                params?.data?.name_balance
                  ? `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                  darkMode ? "white" : "black"
                }">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${MultipleLang[params?.data?.name_balance]}
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${formatCurrency(params?.data?.value_balance)}
                  </div>
                </div>
              `
                  : ""
              }

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                darkMode ? "white" : "black"
              }">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${MultipleLang[params?.data?.name_value]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${formatValue(params?.data?.value_value)}
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                darkMode ? "white" : "black"
              }">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${MultipleLang[params?.data?.name_ratio]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${formatPercent(params?.value)}%
                </div>
              </div>
            </div>`;
      },
    },
    legend: {
      type: "scroll",
      top: "0%",
      left: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "60%"],
        left: 0,
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
    ],
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
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                darkMode ? "white" : "black"
              }">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    darkMode ? "white" : "black"
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
    },
    yAxis: {
      type: "value",
    },
    series: [],
  };

  let dataLineChartPercent = {
    formatXAxis: [],
    formatDataPortfolio: [],
    formatDataETH: [],
    formatDataBTC: [],
  };

  let dataLineChartNetWorth = {
    formatXAxis: [],
  };

  $: {
    if (
      overviewDataPerformance?.performance?.length !== 0 ||
      overviewDataPerformance?.portfolioChart?.length !== 0
    ) {
      const formatXAxisPerformance = overviewDataPerformance?.performance?.map(
        (item) => {
          return dayjs(item.date).format("YYYY-MM-DD");
        }
      );

      const formatDataPortfolio = overviewDataPerformance?.performance?.map(
        (item) => {
          return {
            value: item.portfolio,
            itemStyle: {
              color: "#00b580",
            },
          };
        }
      );

      const formatDataETH = overviewDataPerformance?.performance?.map(
        (item) => {
          return {
            value: item.eth,
            itemStyle: {
              color: "#547fef",
            },
          };
        }
      );

      const formatDataBTC = overviewDataPerformance?.performance?.map(
        (item) => {
          return {
            value: item.btc,
            itemStyle: {
              color: "#f7931a",
            },
          };
        }
      );

      const formatXAxisPortfolioChart =
        overviewDataPerformance?.portfolioChart?.map((item) => {
          return dayjs(item.timestamp * 1000).format("YYYY-MM-DD");
        });

      dataLineChartPercent = {
        formatXAxis: formatXAxisPerformance,
        formatDataPortfolio,
        formatDataETH,
        formatDataBTC,
      };

      dataLineChartNetWorth = {
        formatXAxis: formatXAxisPortfolioChart,
      };
    } else {
      dataLineChartNetWorth = {
        formatXAxis: [],
      };
      dataLineChartPercent = {
        formatXAxis: [],
        formatDataPortfolio: [],
        formatDataETH: [],
        formatDataBTC: [],
      };
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
                darkMode ? "white" : "black"
              }">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    darkMode ? "white" : "black"
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
        },
        yAxis: {
          type: "value",
        },
        series: [],
      };
    }
  }

  $: {
    if (selectedTypePerformance) {
      if (selectedTypePerformance === "percent") {
        optionLine = {
          ...optionLine,
          tooltip: {
            trigger: "axis",
            extraCssText: "z-index: 9997",
            formatter: function (params) {
              return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 260px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                darkMode ? "white" : "black"
              }">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500;color: ${
                    darkMode ? "white" : "black"
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
            data: dataLineChartPercent.formatXAxis,
          },
          yAxis: {
            ...optionLine.yAxis,
            axisLabel: {
              formatter: "{value}%",
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
              data: dataLineChartPercent.formatDataPortfolio,
            },
            {
              name: "Bitcoin",
              type: "line",
              lineStyle: {
                type: "dashed",
                color: "#f7931a",
              },
              showSymbol: false,
              data: dataLineChartPercent.formatDataBTC,
            },
            {
              name: "Ethereum",
              type: "line",
              lineStyle: {
                type: "dashed",
                color: "#547fef",
              },
              showSymbol: false,
              data: dataLineChartPercent.formatDataETH,
            },
          ],
        };
      }
      if (selectedTypePerformance === "networth") {
        optionLine = {
          ...optionLine,
          tooltip: {
            trigger: "axis",
            extraCssText: "z-index: 9997",
            formatter: function (params) {
              return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 320px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                darkMode ? "white" : "black"
              }">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    darkMode ? "white" : "black"
                  }">
                    <span>${item?.marker}</span>
                    ${item?.seriesName}
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      darkMode ? "white" : "black"
                    }">
                      ${formatValue(Math.abs(item.value))}
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
            ],
          },
          xAxis: {
            ...optionLine.xAxis,
            data: dataLineChartNetWorth.formatXAxis,
          },
          yAxis: {
            ...optionLine.yAxis,
            axisLabel: {
              formatter: function (value, index) {
                return (
                  `${value < 0 ? "-" : ""} $` +
                  numeral(Math.abs(value)).format("0.00a")
                );
              },
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
              data: overviewDataPerformance?.portfolioChart.map((item) => {
                return {
                  value: item.value,
                  itemStyle: {
                    color: "#00b580",
                  },
                };
              }),
            },
          ],
        };
      }
    }
  }

  $: {
    if (selectedType) {
      if (Object.keys(dataPieChart).length !== 0) {
        if (selectedType === "token") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data:
                  dataPieChart.token.sumOrderBreakdownToken > 0
                    ? dataPieChart.token.formatDataPieChartTopFiveToken.concat(
                        dataPieChart.token.dataPieChartOrderBreakdownToken
                      )
                    : dataPieChart.token.formatDataPieChartTopFiveToken,
              },
            ],
          };
        }
        if (selectedType === "nft") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data:
                  dataPieChart.nft.sumOrderBreakdownNft > 0
                    ? dataPieChart.nft.formatDataPieChartTopFiveNft.concat(
                        dataPieChart.nft.dataPieChartOrderBreakdownNft
                      )
                    : dataPieChart.nft.formatDataPieChartTopFiveNft,
              },
            ],
          };
        }
      } else {
        optionPie = {
          title: {
            text: "",
          },
          tooltip: {
            trigger: "item",
            extraCssText: "z-index: 9997",
            formatter: function (params) {
              return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="display: flex; align-items: centers; gap: 4px">
                <img src=${
                  params?.data?.logo ||
                  "https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
                } alt="" width=20 height=20 style="border-radius: 100%" />
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                  darkMode ? "white" : "black"
                }">
                  ${params?.name} ${
                params?.data?.symbol ? `(${params?.data?.symbol})` : ""
              }
                </div>
              </div>

              ${
                params?.data?.name_balance
                  ? `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                  darkMode ? "white" : "black"
                }">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${MultipleLang[params?.data?.name_balance]}
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${formatCurrency(params?.data?.value_balance)}
                  </div>
                </div>
              `
                  : ""
              }

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                darkMode ? "white" : "black"
              }">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${MultipleLang[params?.data?.name_value]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  $${formatCurrency(params?.data?.value_value)}
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                darkMode ? "white" : "black"
              }">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${MultipleLang[params?.data?.name_ratio]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatCurrency(params?.value)}%
                </div>
              </div>
            </div>`;
            },
          },
          legend: {
            type: "scroll",
            top: "0%",
            left: "center",
          },
          series: [
            {
              type: "pie",
              radius: ["40%", "60%"],
              left: 0,
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: "center",
              },
              emphasis: {
                label: {
                  show: false,
                  fontSize: 40,
                  fontWeight: "bold",
                },
              },
              labelLine: {
                show: false,
              },
              data: [],
            },
          ],
        };
      }
    }
  }

  $: theme = darkMode ? "dark" : "white";
</script>

<ErrorBoundary>
  <div class="flex flex-col justify-between gap-6 xl:flex-row">
    <div
      class={`xl:w-1/2 w-full rounded-[20px] p-6 xl:block hidden ${
        darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
      }`}
    >
      <div class="relative w-full mb-6">
        <div class="w-full text-4xl font-medium xl:text-2xl">
          {#if selectedType === "token"}
            {MultipleLang.token_allocation}
          {:else}
            {MultipleLang.nft_allocation}
          {/if}
        </div>
        <div class="absolute top-0 right-0 flex items-center gap-1">
          <!-- <AnimateSharedLayout>
            {#each typePieChart as type}
              <div
                class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                on:click={() => (selectedType = type.value)}
              >
                <div
                  class={`relative z-20 ${
                    selectedType === type.value && "text-white"
                  }`}
                >
                  {type.label}
                </div>
                {#if type.value === selectedType}
                  <Motion
                    let:motion
                    layoutId="active-pill"
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <div
                      class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                      use:motion
                    />
                  </Motion>
                {/if}
              </div>
            {/each}
          </AnimateSharedLayout> -->
        </div>
      </div>
      {#if isLoadingBreakdown}
        <div class="flex items-center justify-center h-[465px]">
          <loading-icon />
        </div>
      {:else}
        <div class="h-full">
          {#if isEmptyDataPie}
            <div
              class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
            >
              Empty
            </div>
          {:else}
            <div class={`${typeWalletAddress !== "BTC" ? "-mt-14" : ""}`}>
              <TokenAllocation
                {dataPieChart}
                {holdingTokenData}
                {handleSelectedTableTokenHolding}
                listOptionTypeCategory={[]}
                selectedOption={{}}
                id="pie-chart-token-allocation"
              />
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div
      class={`xl:w-1/2 w-full rounded-[20px] p-6 relative ${
        darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
      }`}
    >
      <div class="flex justify-between mb-6">
        {#if typeWalletAddress === "CEX"}
          <TooltipTitle
            tooltipText="Due to privacy, the performance data can only get after 7 days you connect to Nimbus"
            type="warning"
          >
            <div class="pl-4 text-4xl font-medium xl:text-2xl">
              {MultipleLang.performance}
            </div>
          </TooltipTitle>
        {:else}
          <div class="pl-4 text-4xl font-medium xl:text-2xl">
            {MultipleLang.performance}
          </div>
        {/if}
        {#if overviewDataPerformance?.performance?.length !== 0 || overviewDataPerformance?.portfolioChart?.length !== 0}
          <div class="flex items-center gap-2">
            <AnimateSharedLayout>
              {#each performanceTypeChartPortfolio as type}
                <div
                  class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                  on:click={() => (selectedTypePerformance = type.value)}
                >
                  <div
                    class={`relative z-20 ${
                      selectedTypePerformance === type.value && "text-white"
                    }`}
                  >
                    {type.label}
                  </div>
                  {#if type.value === selectedTypePerformance}
                    <Motion
                      let:motion
                      layoutId="active-pill"
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <div
                        class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                        use:motion
                      />
                    </Motion>
                  {/if}
                </div>
              {/each}
            </AnimateSharedLayout>
          </div>
        {/if}
      </div>
      {#if selectedChain === "XDAI" || typeWalletAddress === "BTC" || typeWalletAddress === "SOL"}
        <div
          class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex items-center justify-center ${
            darkMode ? "bg-[#222222e6]" : "bg-white/90"
          } z-30 backdrop-blur-md`}
        >
          <div class="text-xl xl:text-lg">Coming soon 🚀</div>
        </div>
      {/if}
      {#if isLoading}
        <div class="flex items-center justify-center h-[465px]">
          <loading-icon />
        </div>
      {:else}
        <div>
          {#if overviewDataPerformance?.performance?.length === 0 || overviewDataPerformance?.portfolioChart?.length === 0}
            <div
              class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
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
  </div>
</ErrorBoundary>

<style>
</style>

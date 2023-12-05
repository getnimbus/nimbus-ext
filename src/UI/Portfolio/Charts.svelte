<script lang="ts">
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { i18n } from "~/lib/i18n";
  import {
    chain,
    wallet,
    typeWallet,
    isDarkMode,
    selectedBundle,
  } from "~/store";
  import {
    performanceTypeChartPortfolio,
    typePieChart,
    formatPercent,
    formatValue,
    autoFontSize,
  } from "~/utils";
  import dayjs from "dayjs";
  import numeral from "numeral";

  export let handleSelectedTableTokenHolding = (data, selectDataPieChart) => {};
  export let isLoading;
  export let isLoadingBreakdownTokens;
  export let isLoadingBreakdownNfts;
  export let overviewDataPerformance;
  export let holdingTokenData;
  export let dataPieChartToken;
  export let dataPieChartNft;
  export let isEmptyDataPieTokens;
  export let isEmptyDataPieNfts;
  export let dataOverviewBundlePieChart;

  import EChart from "~/components/EChart.svelte";
  import Loading from "~/components/Loading.svelte";
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
                <img src="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                onerror="this.onerror=null;this.src='https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384';"
                alt="" width=20 height=20 style="border-radius: 100%" />
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                  $isDarkMode ? "white" : "black"
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
                  $isDarkMode ? "white" : "black"
                }">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${MultipleLang[params?.data?.name_balance]}
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${params?.data?.value_balance}
                  </div>
                </div>
              `
                  : ""
              }

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                $isDarkMode ? "white" : "black"
              }">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${MultipleLang[params?.data?.name_value]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${formatValue(params?.data?.value_value)}
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                $isDarkMode ? "white" : "black"
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
            data: dataLineChartPercent.formatXAxis,
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
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      $isDarkMode ? "white" : "black"
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
      if (Object.keys(dataPieChartNft).length !== 0) {
        if (selectedType === "nft") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data:
                  dataPieChartNft.sumOrderBreakdownNft > 0
                    ? dataPieChartNft.formatDataPieChartTopFiveNft.concat(
                        dataPieChartNft.dataPieChartOrderBreakdownNft
                      )
                    : dataPieChartNft.formatDataPieChartTopFiveNft,
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
                <img src="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                onerror="this.onerror=null;this.src='https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384';"
                alt="" width=20 height=20 style="border-radius: 100%" />
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                  $isDarkMode ? "white" : "black"
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
                  $isDarkMode ? "white" : "black"
                }">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${MultipleLang[params?.data?.name_balance]}
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${params?.data?.value_balance}
                  </div>
                </div>
              `
                  : ""
              }

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                $isDarkMode ? "white" : "black"
              }">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${MultipleLang[params?.data?.name_value]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${formatValue(params?.data?.value_value)}
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                $isDarkMode ? "white" : "black"
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
      }
    }
  }

  $: theme = $isDarkMode ? "dark" : "white";
</script>

<ErrorBoundary>
  <div class="flex flex-col justify-between gap-6 xl:flex-row view-the-pnl">
    <div
      class={`xl:w-1/2 w-full rounded-[20px] p-6 xl:block hidden ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
      }`}
    >
      <div class="w-full flex items-center gap-4 mb-6">
        <div class="text-4xl font-medium xl:text-2xl">Allocation</div>
        {#if $typeWallet !== "CEX"}
          <div class="flex items-center gap-1">
            <AnimateSharedLayout>
              {#each typePieChart as type}
                <div
                  class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                  on:click={() => (selectedType = type.value)}
                >
                  <div
                    class={`relative z-2 ${
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
                        class="absolute inset-0 rounded-full bg-[#1E96FC] z-1"
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

      {#if isLoadingBreakdownTokens && isLoadingBreakdownNfts}
        <div class="flex items-center justify-center h-[465px]">
          <Loading />
        </div>
      {:else}
        <div class="h-full">
          {#if selectedType === "token"}
            {#if isEmptyDataPieTokens}
              <div
                class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
              >
                Empty
              </div>
            {:else}
              <div class={`${$typeWallet !== "BTC" ? "-mt-15" : ""}`}>
                <TokenAllocation
                  {handleSelectedTableTokenHolding}
                  {holdingTokenData}
                  {dataPieChartToken}
                  listOptionTypeCategory={[]}
                  selectedOption={{}}
                  id="pie-chart-token-allocation"
                  isComparePage={false}
                  {dataOverviewBundlePieChart}
                />
              </div>
            {/if}
          {/if}

          {#if selectedType === "nft"}
            {#if isEmptyDataPieNfts}
              <div
                class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
              >
                Empty
              </div>
            {:else}
              <EChart
                id="pie-chart-nft-allocation"
                {theme}
                notMerge={true}
                option={optionPie}
                height={465}
              />
            {/if}
          {/if}
        </div>
      {/if}
    </div>

    <div
      class={`xl:w-1/2 w-full rounded-[20px] p-6 relative ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
      }`}
    >
      {#if $typeWallet === "BTC"}
        <div class="pl-4 text-4xl font-medium xl:text-2xl">
          {MultipleLang.performance}
        </div>
        <div
          class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex items-center justify-center z-10 backdrop-blur-md ${
            $isDarkMode ? "bg-[#222222e6]" : "bg-white/90"
          }`}
        >
          <div class="text-2xl xl:text-lg">Coming soon 🚀</div>
        </div>
      {:else}
        <div class="flex justify-between mb-6">
          {#if ($typeWallet === "EVM" && ($chain === "SCROLL" || $chain === "KLAY" || $chain === "XZO")) || $typeWallet === "CEX" || $typeWallet === "SOL" || $typeWallet === "ALGO" || $typeWallet === "AURA" || $typeWallet === "MOVE" || $selectedBundle?.accounts?.find((item) => item.type === "CEX") !== undefined}
            <TooltipTitle
              tooltipText="The performance data can only get after 7 days you connect to Nimbus"
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
        {#if isLoading}
          <div class="flex items-center justify-center h-[465px]">
            <Loading />
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
              <div class="flex flex-col gap-4">
                <!-- {#if selectedTypePerformance === "networth"}
                  <div class="ml-4">hello world</div>
                {/if} -->
                <EChart
                  id="line-chart"
                  {theme}
                  notMerge={true}
                  option={optionLine}
                  height={465}
                />
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    </div>
  </div>
</ErrorBoundary>

<style>
</style>

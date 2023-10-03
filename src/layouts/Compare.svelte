<script lang="ts">
  import { onMount } from "svelte";
  import { wallet, selectedPackage, typeWallet, isDarkMode } from "~/store";
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import dayjs from "dayjs";
  import {
    autoFontSize,
    formatCurrency,
    formatPercent,
    typeList,
  } from "~/utils";
  import { groupBy } from "lodash";
  import { getChangePercent } from "~/chart-utils";
  import { useNavigate } from "svelte-navigator";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";
  import * as Sentry from "@sentry/svelte";

  import type { TokenData } from "~/types/HoldingTokenData";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";
  import TokenAllocation from "~/components/TokenAllocation.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import Button from "~/components/Button.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import EChart from "~/components/EChart.svelte";
  import Select from "~/components/Select.svelte";
  import CompareResult from "~/UI/Compare/CompareResult.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import WhalesList from "~/UI/Compare/WhalesList.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import LeftArrowBlack from "~/assets/left-arrow-black.svg";
  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  const MultipleLang = {
    token_allocation: i18n("newtabPage.token-allocation", "Token Allocation"),
  };

  const navigate = useNavigate();

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let packageSelected = "";
  selectedPackage.subscribe((value) => {
    packageSelected = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  onMount(() => {
    mixpanel.track("user_compare");
    const urlParams = new URLSearchParams(window.location.search);
    let addressParams = urlParams.get("address");

    if (addressParams) {
      selectedWallet = addressParams;
    }
  });

  let typeListCategory = [
    {
      label: "All",
      value: "All",
    },
    {
      label: "Chain",
      value: "Chain",
    },
    ...typeList,
  ];
  let selectedType;

  let holdingTokenData: TokenData = [];
  let dataPieChart = {
    token: {
      sumOrderBreakdownToken: 0,
      formatDataPieChartTopFiveToken: [],
      dataPieChartOrderBreakdownToken: [],
    },
  };
  let isEmptyDataPie = false;
  let showCompareTable = false;
  let showCompareWhalesSuggest = false;

  let compareData = {};
  let searchCompare = "";

  let holdingTokenDataCompare: TokenData = [];
  let dataPieChartCompare = {
    token: {
      sumOrderBreakdownToken: 0,
      formatDataPieChartTopFiveToken: [],
      dataPieChartOrderBreakdownToken: [],
    },
  };

  let listSuggestion = [];

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
        axisLabel: {
          fontSize: autoFontSize(),
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          fontSize: autoFontSize(),
        },
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
                    ${item?.seriesName}
                  </div>

                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      item.data[1] >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      ${formatPercent(item.data[1])}%
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
      type: "time",
      axisLabel: {
        fontSize: autoFontSize(),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}%",
        fontSize: autoFontSize(),
      },
    },
    series: [],
  };

  let timerDebounce;
  let search = "";

  const getAnalyticCompare = async (address, searchValue) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/compare?compareAddress=${searchValue}&timeRange=1Y`
    );
    return response.data;
  };

  const getPersonalizeTag = async (address) => {
    const response = await nimbus.get(`/address/${address}/personalize/tag`);
    return response.data;
  };

  const getSimilarAddress = async (address: string) => {
    const response = await nimbus
      .get(`/v2/analysis/${address}/similar`)
      .then((res) => res.data);

    return response;
  };

  $: query = createQuery({
    queryKey: ["compare", selectedWallet, searchCompare],
    queryFn: () => getAnalyticCompare(selectedWallet, searchCompare),
    enabled: packageSelected !== "FREE" && !!selectedWallet,
    staleTime: Infinity,
  });

  $: queryPersonalTag = createQuery({
    queryKey: ["personal-tag", selectedWallet],
    queryFn: () => getPersonalizeTag(selectedWallet),
    enabled: packageSelected !== "FREE" && !!selectedWallet,
    staleTime: Infinity,
  });

  $: querySimilar = createQuery({
    queryKey: ["similar", selectedWallet],
    queryFn: () => getSimilarAddress(selectedWallet),
    enabled: showCompareWhalesSuggest && !!selectedWallet,
    placeholderData: [],
    staleTime: Infinity,
  });

  const formatDataAnalyticCompare = (data) => {
    const formatListSuggestion = Object.keys(data?.base?.suggestion).map(
      (item) => {
        let name = "";
        switch (item) {
          case "highRisk":
            name = "High Risk";
            break;
          case "lowRisk":
            name = "Low Risk";
            break;
          case "mediumRisk":
            name = "Medium Risk";
            break;
        }
        return {
          name,
          value: data?.base?.suggestion[item]?.address,
        };
      }
    );

    listSuggestion = formatListSuggestion;

    const formatData = data?.base?.currentHolding.map((item) => {
      return {
        ...item,
        amount: Number(item.balance),
      };
    });

    holdingTokenData = formatData.sort((a, b) => {
      if (a.value < b.value) {
        return 1;
      }
      if (a.value > b.value) {
        return -1;
      }
      return 0;
    });

    // pie chart format data Token holding
    const sumToken = (formatData || []).reduce(
      (prev, item) => prev + Number(item.value),
      0
    );

    const sortBreakdownToken = formatData.sort((a, b) => {
      if (a.value < b.value) {
        return 1;
      }
      if (a.value > b.value) {
        return -1;
      }
      return 0;
    });

    const topFiveBreakdownToken = sortBreakdownToken
      ?.slice(0, 5)
      .map((item) => {
        return {
          ...item,
          id: item.id || "N/A",
          symbol: item.symbol || "N/A",
          name: item.name || "N/A",
        };
      });

    const orderBreakdownToken = sortBreakdownToken.slice(
      5,
      sortBreakdownToken.length
    );

    const sumOrderBreakdownToken = (orderBreakdownToken || []).reduce(
      (prev, item) => prev + Number(item.value),
      0
    );

    const dataPieChartOrderBreakdownToken = [
      {
        logo: "https://raw.githubusercontent.com/getnimbus/assets/main/token.png",
        name: "Other tokens",
        symbol: "",
        name_ratio: "Ratio",
        value: (sumOrderBreakdownToken / sumToken) * 100,
        name_value: "Value",
        value_value: sumOrderBreakdownToken,
        name_balance: "",
        value_balance: 0,
      },
    ];

    const formatDataPieChartTopFiveToken = topFiveBreakdownToken.map((item) => {
      return {
        logo: item.logo,
        name: item.name || item.symbol,
        symbol: item.symbol,
        name_ratio: "Ratio",
        value: (Number(item.value) / sumToken) * 100,
        name_value: "Value",
        value_value: Number(item.value),
        name_balance: "Balance",
        value_balance: Number(item.balance),
      };
    });

    const formatDataPie = {
      token: {
        sumOrderBreakdownToken,
        formatDataPieChartTopFiveToken,
        dataPieChartOrderBreakdownToken,
      },
    };

    dataPieChart = formatDataPie;
  };

  const formatDataPersonalTag = (data) => {
    if (data) {
      const categoriesData = Object.getOwnPropertyNames(data);
      const categoriesDataList = categoriesData.map((item) => {
        return {
          category: item,
          dataTag: groupBy(data[item], "tag"),
        };
      });
      const formatDataCategory = categoriesDataList.map((item) => {
        return {
          category: item.category,
          dataTag: Object.getOwnPropertyNames(item.dataTag).map((tag) => {
            return {
              name: tag,
              tokens: item.dataTag[tag],
            };
          }),
        };
      });

      const listCategory = formatDataCategory.map((item) => {
        return {
          label: item.category,
          value: item.category,
        };
      });

      typeListCategory = [...typeListCategory, ...listCategory].reduce(
        (unique, o) => {
          if (
            !unique.some(
              (obj) => obj.label === o.label && obj.value === o.value
            )
          ) {
            unique.push(o);
          }
          return unique;
        },
        []
      );
    }
  };

  $: {
    if (!$query.isError && $query.data !== undefined) {
      formatDataAnalyticCompare($query.data);
      compareData = $query.data;
    }
  }

  $: {
    if (!$queryPersonalTag.isError && $queryPersonalTag.data !== undefined) {
      formatDataPersonalTag($queryPersonalTag.data);
    }
  }

  $: {
    if (
      $queryPersonalTag.isError &&
      $queryPersonalTag.data == undefined &&
      $query.isError &&
      $query.data == undefined
    ) {
      isEmptyDataPie = true;
    } else {
      isEmptyDataPie = false;
    }
  }

  $: {
    if (compareData && Object.keys(compareData).length !== 0) {
      const listKey = Object.getOwnPropertyNames(compareData);

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
              value: compareData[item].sharpeRatio,
              itemStyle: {
                color: custom.color,
              },
            },
            {
              value: compareData[item].volatility,
              itemStyle: {
                color: custom.color,
              },
            },
            {
              value: compareData[item].drawDown,
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

        const basePoint = compareData[item]?.holdingHistory?.[0];

        switch (item) {
          case "btc":
            formatData = {
              name: "Bitcoin",
              color: "#f7931a",
              type: "dashed",
              dataChart: compareData[item]?.holdingHistory.map(
                (holdingData) => {
                  return {
                    value: getChangePercent(holdingData.price, basePoint.price),
                    timestamp: holdingData.timestamp * 1000,
                  };
                }
              ),
              // .slice(1, -1),
            };
            break;
          case "eth":
            formatData = {
              name: "Ethereum",
              color: "#547fef",
              type: "dashed",
              dataChart: compareData[item]?.holdingHistory.map(
                (holdingData) => {
                  return {
                    value: getChangePercent(holdingData.price, basePoint.price),
                    timestamp: holdingData.timestamp * 1000,
                  };
                }
              ),
              // .slice(1, -1),
            };
            break;
          case "base":
            formatData = {
              name: "This wallet",
              color: "#00b580",
              type: "solid",
              dataChart: compareData[item]?.holdingHistory.map(
                (holdingData) => {
                  return {
                    value: holdingData.performance,
                    timestamp: holdingData.timestamp * 1000,
                  };
                }
              ),
              // .slice(0, -2),
            };
            break;
          case "compare":
            formatData = {
              name: "Compare wallet",
              color: "rgba(178,184,255,1)",
              type: "solid",
              dataChart: compareData[item]?.holdingHistory.map(
                (holdingData) => {
                  return {
                    value: getChangePercent(
                      holdingData.networth,
                      basePoint.networth
                    ),
                    timestamp: holdingData.timestamp * 1000,
                  };
                }
              ),
              // .slice(0, -2),
            };
            break;
        }
        return formatData;
      });

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
          showSymbol: false,
          itemStyle: {
            color: item.color,
          },
          data: item.dataChart.map((eachDataCustom) => {
            return [eachDataCustom.timestamp, eachDataCustom.value];
          }),
          // data: item.dataChart.map((eachDataCustom) => {
          //   return {
          //     value: eachDataCustom.value,
          //     itemStyle: {
          //       color: item.color,
          //     },
          //   };
          // }),
        };
      });

      optionLine = {
        ...optionLine,
        legend: {
          ...optionLine.legend,
          data: legendDataLineChart,
        },
        series: dataLineChart,
      };
    }
  }

  $: {
    if (
      compareData &&
      Object.keys(compareData).length !== 0 &&
      compareData?.compare
    ) {
      const formatData = compareData?.compare?.currentHolding.map((item) => {
        return {
          ...item,
          amount: Number(item.balance),
        };
      });

      holdingTokenDataCompare = formatData;

      // pie chart format data Token holding
      const sumToken = (formatData || []).reduce(
        (prev, item) => prev + Number(item.value),
        0
      );

      const sortBreakdownToken = formatData.sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

      const topFiveBreakdownToken = sortBreakdownToken
        ?.slice(0, 5)
        .map((item) => {
          return {
            ...item,
            id: item.id || "N/A",
            symbol: item.symbol || "N/A",
            name: item.name || "N/A",
          };
        });

      const orderBreakdownToken = sortBreakdownToken.slice(
        5,
        sortBreakdownToken.length
      );

      const sumOrderBreakdownToken = (orderBreakdownToken || []).reduce(
        (prev, item) => prev + Number(item.value),
        0
      );

      const dataPieChartOrderBreakdownToken = [
        {
          logo: "https://raw.githubusercontent.com/getnimbus/assets/main/token.png",
          name: "Other tokens",
          symbol: "",
          name_ratio: "Ratio",
          value: (sumOrderBreakdownToken / sumToken) * 100,
          name_value: "Value",
          value_value: sumOrderBreakdownToken,
          name_balance: "",
          value_balance: 0,
        },
      ];

      const formatDataPieChartTopFiveToken = topFiveBreakdownToken.map(
        (item) => {
          return {
            logo: item.logo,
            name: item.name || item.symbol,
            symbol: item.symbol,
            name_ratio: "Ratio",
            value: (Number(item.value) / sumToken) * 100,
            name_value: "Value",
            value_value: Number(item.value),
            name_balance: "Balance",
            value_balance: Number(item.balance),
          };
        }
      );

      const formatDataPie = {
        token: {
          sumOrderBreakdownToken,
          formatDataPieChartTopFiveToken,
          dataPieChartOrderBreakdownToken,
        },
      };

      dataPieChartCompare = formatDataPie;
    }
  }

  const handleCopyAddress = (address) => {
    searchCompare = address;
  };

  const handleCloseWhalesListModal = () => {
    showCompareWhalesSuggest = false;
  };

  $: theme = darkMode ? "dark" : "white";

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      search = value;
    }, 300);
  };

  $: console.log($querySimilar.data);
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10 relative"
  >
    <div class="flex flex-col justify-center gap-2">
      <div class="font-semibold xl:text-5xl text-7xl">
        Optimize your portfolio
      </div>
      <div class="text-2xl font-medium xl:font-normal xl:text-base">
        <Copy
          address={selectedWallet}
          iconColor={`${darkMode ? "#fff" : "#000"}`}
          color={`${darkMode ? "#fff" : "#000"}`}
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex justify-start">
        <Select
          type="lang"
          positionSelectList="left-0"
          listSelect={typeListCategory}
          bind:selected={selectedType}
        />
      </div>

      <div class="flex flex-col items-center justify-between gap-6 xl:flex-row">
        <div class="grid flex-1 w-full grid-cols-1 gap-6 xl:grid-cols-2">
          <div
            class={`rounded-[20px] p-6 min-h-[535px] relative ${
              darkMode ? "bg-[#222222]" : "bg-white border border_0000001a"
            }`}
          >
            <div class="w-full mb-6 text-4xl font-medium xl:text-2xl">
              {MultipleLang.token_allocation}
            </div>
            {#if $query.isFetching && $queryPersonalTag.isFetching}
              <div class="flex items-center justify-center h-[465px]">
                <LoadingPremium />
              </div>
            {:else}
              <div class="h-full">
                {#if isEmptyDataPie}
                  <div
                    class={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg rounded-[20px] ${
                      darkMode ? "bg-[#222222e6]" : "bg-white/90"
                    }`}
                  >
                    {#if typeWalletAddress === "CEX"}
                      Not enough data. CEX integration can only get data from
                      the day you connect
                    {:else}
                      Empty
                    {/if}
                  </div>
                {:else}
                  <div class="-mt-2">
                    <TokenAllocation
                      handleSelectedTableTokenHolding={(
                        data,
                        selectDatPieChart
                      ) => {
                        if (data.data && data.data.length !== 0) {
                          // console.log({
                          //   data,
                          //   selectDatPieChart,
                          // });
                        }
                      }}
                      {holdingTokenData}
                      {dataPieChart}
                      listOptionTypeCategory={typeListCategory}
                      selectedOption={selectedType}
                      id="pie-chart-token-allocation"
                      isComparePage={true}
                    />
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          <div
            class={`rounded-[20px] p-6 min-h-[535px] relative ${
              darkMode ? "bg-[#222222]" : "bg-white border border_0000001a"
            }`}
          >
            {#if compareData && Object.keys(compareData).length !== 0 && compareData?.compare}
              <div class="flex flex-col">
                <div class="flex items-center justify-between">
                  <div class="flex items-end gap-3">
                    <div class="text-4xl font-medium xl:text-2xl">
                      Comparing with
                    </div>
                    <div class="font-medium">
                      <Copy
                        isShorten
                        address={searchCompare}
                        iconColor={`${darkMode ? "#fff" : "#000"}`}
                        color={`${darkMode ? "#fff" : "#000"}`}
                      />
                    </div>
                  </div>
                  <div class="w-max">
                    <Button
                      variant="secondary"
                      on:click={() => {
                        searchCompare = "";
                        search = "";
                      }}>Remove</Button
                    >
                  </div>
                </div>
                <div class="flex flex-col h-full gap-5 mt-3">
                  {#if $query.isFetching}
                    <div class="flex items-center justify-center h-[433px]">
                      <LoadingPremium />
                    </div>
                  {:else}
                    <div class="h-full">
                      {#if compareData && Object.keys(compareData).length === 0}
                        <div
                          class={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
                            darkMode ? "bg-[#222222e6]" : "bg-white/90"
                          }`}
                        >
                          {#if typeWalletAddress === "CEX"}
                            Not enough data. CEX integration can only get data
                            from the day you connect
                          {:else}
                            Empty
                          {/if}
                        </div>
                      {:else}
                        <TokenAllocation
                          handleSelectedTableTokenHolding={(
                            data,
                            selectDatPieChart
                          ) => {
                            if (data.data && data.data.length !== 0) {
                              // console.log({
                              //   data,
                              //   selectDatPieChart,
                              // });
                            }
                          }}
                          holdingTokenData={holdingTokenDataCompare}
                          dataPieChart={dataPieChartCompare}
                          listOptionTypeCategory={typeListCategory}
                          selectedOption={selectedType}
                          id="pie-chart-token-allocation-compare"
                          isComparePage={true}
                        />
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            {:else}
              <div class="h-full">
                {#if $query.isFetching}
                  <div class="w-full text-4xl font-medium xl:text-2xl">
                    Compare with
                  </div>
                  <div class="flex items-center justify-center h-full">
                    <LoadingPremium />
                  </div>
                {:else}
                  <div class="h-full">
                    {#if compareData && Object.keys(compareData).length === 0}
                      <div class="w-full text-4xl font-medium xl:text-2xl">
                        Compare with
                      </div>
                      <div
                        class={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg rounded-[20px] ${
                          darkMode ? "bg-[#222222e6]" : "bg-white/90"
                        }`}
                      >
                        {#if typeWalletAddress === "CEX"}
                          Not enough data. CEX integration can only get data
                          from the day you connect
                        {:else}
                          Empty
                        {/if}
                      </div>
                    {:else}
                      <div class="grid h-full grid-rows-11">
                        <div class="w-full text-4xl font-medium xl:text-2xl">
                          Compare with
                        </div>
                        <div
                          class="flex flex-col justify-center gap-6 row-span-10"
                        >
                          <div class="flex items-center gap-4">
                            {#each listSuggestion as suggestion (suggestion.name)}
                              <div
                                class="flex-1"
                                id={suggestion.name}
                                use:tooltip={{
                                  content: `<tooltip-detail text="Coming soon!" />`,
                                  allowHTML: true,
                                  placement: "top",
                                  interactive: true,
                                }}
                              >
                                <Button
                                  on:click={() => {
                                    // searchCompare = suggestion.value;
                                    // queryClient.invalidateQueries(["compare"]);
                                  }}
                                  variant="disabled"
                                >
                                  <div
                                    class={`text-base ${
                                      darkMode ? "text-gray-400" : ""
                                    }`}
                                  >
                                    {suggestion.name}
                                  </div>
                                </Button>
                              </div>
                            {/each}
                          </div>
                          <div class="border-t-[1px] relative">
                            <div
                              class={`absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-gray-400 ${
                                darkMode ? "bg-[#222222]" : "bg-white"
                              } text-sm px-2`}
                            >
                              Or
                            </div>
                          </div>
                          <div class="flex flex-col gap-2">
                            <div
                              class={`border focus:outline-none w-full py-2 px-3 rounded-lg ${
                                searchCompare && !darkMode
                                  ? "bg-[#F0F2F7]"
                                  : "bg_fafafbff"
                              }`}
                            >
                              <input
                                on:keyup={({ target: { value } }) =>
                                  debounceSearch(value)}
                                on:keydown={(e) => {
                                  if (
                                    (e.which == 13 || e.keyCode == 13) &&
                                    search
                                  ) {
                                    searchCompare = search;
                                  }
                                }}
                                value={search}
                                placeholder={"Search address to compare"}
                                type="text"
                                class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-xl font-normal text-[#5E656B] placeholder-[#5E656B] h-7 ${
                                  searchCompare && !darkMode
                                    ? "bg-[#F0F2F7]"
                                    : "bg-transparent"
                                }`}
                              />
                            </div>
                            <div class="flex justify-end text-xl xl:text-sm">
                              <div
                                on:click={() =>
                                  (showCompareWhalesSuggest = true)}
                                class="text-blue-500 cursor-pointer w-max"
                              >
                                Get inspired from the whale list
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>

        <!-- Button Get re-balance action -->
        <div class="w-max">
          {#if ($query.isFetching && $queryPersonalTag.isFetching) || searchCompare.length === 0}
            <Button variant="disabled">
              <div class="flex items-center gap-1">
                <div
                  class={`xl:text-base text-2xl ${
                    darkMode ? "text-gray-400" : ""
                  }`}
                >
                  Get re-balance action
                </div>
                <img
                  src={darkMode ? LeftArrowBlack : LeftArrow}
                  alt=""
                  class="xl:w-4 xl:h-4 w-6 h-6 transform rotate-180 mt-[2px]"
                />
              </div>
            </Button>
          {:else}
            <Button on:click={() => (showCompareTable = true)}>
              <div class="flex items-center gap-1">
                <div class="text-2xl xl:text-base">Get re-balance action</div>
                <img
                  src={LeftArrow}
                  alt=""
                  class="xl:w-4 xl:h-4 w-6 h-6 transform rotate-180 mt-[2px]"
                />
              </div>
            </Button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Performance chart -->
    <div
      class={`rounded-[20px] p-6 relative ${
        darkMode ? "bg-[#222222]" : "bg-white border border_0000001a"
      }`}
    >
      <div class="mb-3 text-4xl font-medium xl:text-2xl">Performance</div>
      {#if $query.isFetching}
        <div class="flex items-center justify-center h-[433px]">
          <LoadingPremium />
        </div>
      {:else}
        <div class="h-full">
          {#if compareData && Object.keys(compareData).length === 0}
            <div class="h-[433px]">
              <div
                class={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg rounded-[20px] ${
                  darkMode ? "bg-[#222222e6]" : "bg-white/90"
                }`}
              >
                {#if typeWalletAddress === "CEX"}
                  Not enough data. CEX integration can only get data from the
                  day you connect
                {:else}
                  Empty
                {/if}
              </div>
            </div>
          {:else}
            <div class="relative">
              <EChart
                id="line-chart-compare"
                {theme}
                notMerge={true}
                option={optionLine}
                height={433}
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
    </div>

    <!-- Risks chart -->
    <div
      class={`rounded-[20px] p-6 relative ${
        darkMode ? "bg-[#222222]" : "bg-white border border_0000001a"
      }`}
    >
      <div class="w-full mb-1">
        <div class="flex justify-start text-4xl font-medium xl:text-2xl">
          <TooltipTitle tooltipText={"The lower the better"} isBigIcon>
            Risks
          </TooltipTitle>
        </div>
      </div>
      {#if $query.isFetching}
        <div class="flex items-center justify-center h-[465px]">
          <LoadingPremium />
        </div>
      {:else}
        <div class="h-full">
          {#if compareData && Object.keys(compareData).length === 0}
            <div class="h-[465px]">
              <div
                class={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg rounded-[20px] ${
                  darkMode ? "bg-[#222222e6]" : "bg-white/90"
                }`}
              >
                {#if typeWalletAddress === "CEX"}
                  Not enough data. CEX integration can only get data from the
                  day you connect
                {:else}
                  Empty
                {/if}
              </div>
            </div>
          {:else}
            <div class="relative">
              <EChart
                id="bar-chart-compare"
                {theme}
                notMerge={true}
                option={optionBar}
                height={465}
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
    </div>

    {#if packageSelected === "FREE"}
      <div
        class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center justify-center gap-3 ${
          darkMode ? "bg-[#222222e6]" : "bg-white/90"
        } z-30 backdrop-blur-md`}
      >
        <div class="flex flex-col items-center gap-1">
          <div class="text-lg font-medium">
            Use Nimbus at its full potential
          </div>
          <div class="text-base text-gray-500">
            Upgrade to Premium to access Compare feature
          </div>
        </div>
        <div class="mt-2 w-max">
          <Button variant="premium" on:click={() => navigate("/upgrade")}
            >Start 30-day Trial</Button
          >
        </div>
      </div>
    {/if}
  </div>

  <AppOverlay
    clickOutSideToClose
    isOpen={showCompareTable}
    isTableContent
    on:close={() => {
      showCompareTable = false;
    }}
  >
    <div class="mt-12 xl:mt-9">
      <CompareResult {darkMode} {holdingTokenData} {holdingTokenDataCompare} />
    </div>
  </AppOverlay>

  <AppOverlay
    clickOutSideToClose
    isOpen={showCompareWhalesSuggest}
    isTableContent
    on:close={() => {
      showCompareWhalesSuggest = false;
    }}
  >
    <div class="flex flex-col gap-2 mt-9">
      {#if $querySimilar.isFetching}
        <div class="mx-auto">
          <LoadingPremium />
        </div>
      {:else}
        <WhalesList
          {darkMode}
          data={$querySimilar.data}
          copyAddress={handleCopyAddress}
          closeModal={handleCloseWhalesListModal}
        />
      {/if}
      <div class="mt-3 text-2xl text-right xl:text-base">
        <a
          class="text-blue-500 cursor-pointer"
          href="/whales"
          target="_blank"
          on:click={() => (showCompareWhalesSuggest = false)}
          >Get full whales list</a
        >
      </div>
    </div>
  </AppOverlay>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>

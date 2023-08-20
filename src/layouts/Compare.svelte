<script lang="ts">
  import { onMount } from "svelte";
  import { wallet, selectedPackage, typeWallet } from "~/store";
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import dayjs from "dayjs";
  import { formatCurrency, typeList } from "~/utils";
  import { groupBy } from "lodash";
  import { getChangePercent } from "~/chart-utils";
  import { useNavigate } from "svelte-navigator";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import * as Sentry from "@sentry/svelte";

  import type { TokenData } from "~/types/HoldingTokenData";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";
  import TokenAllocation from "~/components/TokenAllocation.svelte";
  import "~/components/Loading.custom.svelte";
  import Button from "~/components/Button.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import EChart from "~/components/EChart.svelte";
  import Select from "~/components/Select.svelte";
  import CompareResult from "~/UI/Compare/CompareResult.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import WhalesList from "~/UI/Compare/WhalesList.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import Logo from "~/assets/logo-1.svg";

  const MultipleLang = {
    token_allocation: i18n("newtabPage.token-allocation", "Token Allocation"),
  };

  const navigate = useNavigate();

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
                ${dayjs(params[0].axisValue).format("DD/MM/YYYY")}
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
                      item.data[1] >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      ${item.data[1]}%
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
      type: "time",
      // boundaryGap: false,
      // data: [],
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}%",
      },
    },
    series: [],
  };

  const queryClient = useQueryClient();

  const getAnalyticCompare = async (address, searchValue) => {
    if (packageSelected === "FREE") {
      return undefined;
    }
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/compare?compareAddress=${searchValue}`
    );
    return response.data;
  };

  const getPersonalizeTag = async (address) => {
    if (packageSelected === "FREE") {
      return undefined;
    }
    const response = await nimbus.get(`/address/${address}/personalize/tag`);
    return response.data;
  };

  $: query = createQuery({
    queryKey: ["compare", selectedWallet],
    queryFn: () => getAnalyticCompare(selectedWallet, searchCompare),
    staleTime: Infinity,
  });

  $: queryPersonalTag = createQuery({
    queryKey: ["personal-tag", selectedWallet],
    queryFn: () => getPersonalizeTag(selectedWallet),
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
          !unique.some((obj) => obj.label === o.label && obj.value === o.value)
        ) {
          unique.push(o);
        }
        return unique;
      },
      []
    );
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
        xAxis: {
          ...optionLine.xAxis,
          data: XAxisDataLineChart,
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
    queryClient.invalidateQueries(["compare"]);
  };

  const handleCloseWhalesListModal = () => {
    showCompareWhalesSuggest = false;
  };
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] py-8 flex flex-col gap-10 relative"
  >
    <div class="flex flex-col gap-2 justify-center">
      <div class="xl:text-5xl text-7xl text-black font-medium">Compare</div>
      <div class="xl:font-normal xl:text-base text-2xl text-black font-medium">
        <Copy address={selectedWallet} iconColor="#000" color="#000" />
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

      <div class="flex justify-between items-center gap-6">
        <div class="grid xl:grid-cols-2 grid-cols-1 gap-6 flex-1 w-full">
          <div
            class="border border-[#0000001a] rounded-[20px] p-6 min-h-[535px] relative"
          >
            <div
              class="xl:text-2xl text-4xl font-medium text-black w-full mb-6"
            >
              {MultipleLang.token_allocation}
            </div>
            {#if $query.isFetching && $queryPersonalTag.isFetching}
              <div class="flex items-center justify-center h-[465px]">
                <loading-icon />
              </div>
            {:else}
              <div class="h-full">
                {#if isEmptyDataPie}
                  <div
                    class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 bg-white/95 z-30 backdrop-blur-md xl:text-xs text-lg rounded-[20px]"
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
                      {dataPieChart}
                      {holdingTokenData}
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
                      listOptionTypeCategory={typeListCategory}
                      selectedOption={selectedType}
                      id="pie-chart-token-allocation"
                    />
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          <div
            class="border border-[#0000001a] rounded-[20px] p-6 min-h-[535px] relative"
          >
            {#if compareData && Object.keys(compareData).length !== 0 && compareData?.compare}
              <div class="flex flex-col">
                <div class="flex justify-between items-center">
                  <div class="flex items-end gap-3">
                    <div class="xl:text-2xl text-4xl font-medium text-black">
                      Comparing with
                    </div>
                    <div class="text-black font-medium">
                      <Copy
                        isShorten
                        address={searchCompare}
                        iconColor="#000"
                        color="#000"
                      />
                    </div>
                  </div>
                  <div class="w-max">
                    <Button
                      variant="secondary"
                      on:click={() => {
                        searchCompare = "";
                        queryClient.invalidateQueries(["compare"]);
                      }}>Remove</Button
                    >
                  </div>
                </div>
                <div class="h-full flex flex-col gap-5 mt-3">
                  {#if $query.isFetching}
                    <div class="flex items-center justify-center h-[433px]">
                      <loading-icon />
                    </div>
                  {:else}
                    <div class="h-full">
                      {#if compareData && Object.keys(compareData).length === 0}
                        <div
                          class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 bg-white/95 z-30 backdrop-blur-md xl:text-xs text-lg"
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
                          dataPieChart={dataPieChartCompare}
                          holdingTokenData={holdingTokenDataCompare}
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
                          listOptionTypeCategory={typeListCategory}
                          selectedOption={selectedType}
                          id="pie-chart-token-allocation-compare"
                        />
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            {:else}
              <div class="h-full">
                {#if $query.isFetching}
                  <div
                    class="xl:text-2xl text-4xl font-medium text-black w-full"
                  >
                    Compare with
                  </div>
                  <div class="flex items-center justify-center h-full">
                    <loading-icon />
                  </div>
                {:else}
                  <div class="h-full">
                    {#if compareData && Object.keys(compareData).length === 0}
                      <div
                        class="xl:text-2xl text-4xl font-medium text-black w-full"
                      >
                        Compare with
                      </div>
                      <div
                        class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 bg-white/95 z-30 backdrop-blur-md xl:text-xs text-lg rounded-[20px]"
                      >
                        {#if typeWalletAddress === "CEX"}
                          Not enough data. CEX integration can only get data
                          from the day you connect
                        {:else}
                          Empty
                        {/if}
                      </div>
                    {:else}
                      <div class="grid grid-rows-11 h-full">
                        <div
                          class="xl:text-2xl text-4xl font-medium text-black w-full"
                        >
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
                                  <div class="">
                                    {suggestion.name}
                                  </div>
                                </Button>
                              </div>
                            {/each}
                          </div>
                          <div class="border-t-[1px] relative">
                            <div
                              class="absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-gray-400 bg-white text-sm px-2"
                            >
                              Or
                            </div>
                          </div>
                          <div class="flex flex-col gap-2">
                            <div
                              class={`border focus:outline-none w-full py-2 px-3 rounded-lg ${
                                searchCompare ? "bg-[#F0F2F7]" : "bg-white"
                              }`}
                            >
                              <input
                                on:keydown={(e) => {
                                  if (
                                    (e.which == 13 || e.keyCode == 13) &&
                                    searchCompare
                                  ) {
                                    queryClient.invalidateQueries(["compare"]);
                                  }
                                }}
                                bind:value={searchCompare}
                                placeholder={"Search address to compare"}
                                type="text"
                                class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] h-7 ${
                                  searchCompare ? "bg-[#F0F2F7]" : ""
                                }`}
                              />
                            </div>
                            <div class="xl:text-sm text-lg text-right">
                              <div
                                on:click={() =>
                                  (showCompareWhalesSuggest = true)}
                                class="text-blue-500 cursor-pointer"
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
                <div class="xl:text-base text-2xl">Get re-balance action</div>
                <img
                  src={LeftArrow}
                  alt=""
                  class="xl:w-4 xl:h-4 w-6 h-6 transform rotate-180 mt-[2px]"
                />
              </div>
            </Button>
          {:else}
            <Button on:click={() => (showCompareTable = true)}>
              <div class="flex items-center gap-1">
                <div class="xl:text-base text-2xl">Get re-balance action</div>
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
    <div class="border border-[#0000001a] rounded-[20px] p-6 relative">
      <div class="xl:text-2xl text-4xl font-medium text-black mb-3">
        Performance
      </div>
      {#if $query.isFetching}
        <div class="flex items-center justify-center h-[433px]">
          <loading-icon />
        </div>
      {:else}
        <div class="h-full">
          {#if compareData && Object.keys(compareData).length === 0}
            <div class="h-[433px]">
              <div
                class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 bg-white/95 z-30 backdrop-blur-md xl:text-xs text-lg rounded-[20px]"
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
                theme="white"
                notMerge={true}
                option={optionLine}
                height={433}
              />
              <div
                class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 top-1/2 left-1/2 pointer-events-none"
              >
                <img src={Logo} alt="" width="140" height="140" />
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Risks chart -->
    <div class="border border-[#0000001a] rounded-[20px] p-6 relative">
      <div class="mb-1 w-full">
        <div
          class="xl:text-2xl text-4xl font-medium text-black flex justify-start"
        >
          <TooltipTitle tooltipText={"The lower the better"} isBigIcon>
            Risks
          </TooltipTitle>
        </div>
      </div>
      {#if $query.isFetching}
        <div class="flex items-center justify-center h-[465px]">
          <loading-icon />
        </div>
      {:else}
        <div class="h-full">
          {#if compareData && Object.keys(compareData).length === 0}
            <div class="h-[465px]">
              <div
                class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 bg-white/95 z-30 backdrop-blur-md xl:text-xs text-lg rounded-[20px]"
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
                theme="white"
                notMerge={true}
                option={optionBar}
                height={465}
              />
              <div
                class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 top-1/2 left-1/2 pointer-events-none"
              >
                <img src={Logo} alt="" width="140" height="140" />
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    {#if packageSelected === "FREE"}
      <div
        class="absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center justify-center gap-3 bg-white/95 z-30 backdrop-blur-md"
      >
        <div class="flex flex-col items-center gap-1">
          <div class="text-lg font-medium">
            Use Nimbus at its full potential
          </div>
          <div class="text-gray-500 text-base">
            Upgrade to Premium to access Compare feature
          </div>
        </div>
        <div class="w-max mt-2">
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
    <div class="xl:mt-9 mt-12">
      <CompareResult {holdingTokenData} {holdingTokenDataCompare} />
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
      <WhalesList
        data={compareData?.base?.similarPortfolio}
        copyAddress={handleCopyAddress}
        closeModal={handleCloseWhalesListModal}
      />
      <div class="xl:text-base text-xl text-right mt-3">
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

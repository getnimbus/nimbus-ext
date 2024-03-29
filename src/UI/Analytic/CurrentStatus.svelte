<script lang="ts">
  import { user, wallet, chain, typeWallet, isDarkMode } from "~/store";
  import { groupBy, flatten } from "lodash";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import {
    formatCurrency,
    typeList,
    handleFormatDataPieChart,
    formatPercent,
    performanceTypeChartPortfolio,
    formatValue,
    autoFontSize,
  } from "~/utils";
  import { listSupported } from "~/lib/chains";
  import { i18n } from "~/lib/i18n";
  import { useNavigate } from "svelte-navigator";
  import { nimbus } from "~/lib/network";
  import dayjs from "dayjs";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import numeral from "numeral";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  import EChart from "~/components/EChart.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";

  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";
  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";
  import defaultToken from "~/assets/defaultToken.png";

  export let address;
  export let isShowSoon;
  export let packageSelected;
  export let selectedTimeFrame;
  export let isSync = false;
  export let enabledFetchAllData = false;

  $: isFetch = isSync ? enabledFetchAllData : true;

  const MultipleLang = {
    token_allocation: i18n("newtabPage.token-allocation", "Token Allocation"),
    performance: i18n("newtabPage.performance", "Performance"),
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
  };

  const navigate = useNavigate();

  let selectedType: "category" | "sector" | "rank" = "category";
  let isEmptyDataPie = false;
  let dataRank = [];
  let dataCategory = [];
  let dataSector = [];
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
                  params?.data?.logo || defaultToken
                } alt="" width=20 height=20 style="border-radius: 100%" />
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                  $isDarkMode ? "white" : "black"
                }">
                  ${params?.name} ${
                    params?.data?.symbol ? `(${params?.data?.symbol})` : ""
                  }
                </div>
              </div>

              ${
                params?.data?.name_balance.length !== 0
                  ? `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: ${
                  $isDarkMode ? "white" : "black"
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
  let selectedDataPie = [];

  let typeListCategory = [...typeList];
  let dataPersonalizeTag = [];
  let dataTokenHolding = [];
  let personalizeCategoryData = [];

  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;
  let container;

  let selectedTypeChart: "percent" | "networth" = "percent";
  let optionLinePercentChange = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 260px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${dayjs(params[0].axisValue).format("YYYY-MM-DD")}
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
                      item.value[1] >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      ${formatPercent(Math.abs(item.value[1]))}%
                      <img
                        src=${item.value[1] >= 0 ? TrendUp : TrendDown} 
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
  let optionLineNetWorth = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 320px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                 ${dayjs(params[0].axisValue).format("YYYY-MM-DD")}
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
                      ${formatValue(Math.abs(item.value[1]))}
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
        formatter: function (value, index) {
          return (
            `${value < 0 ? "-" : ""} $` +
            numeral(Math.abs(value)).format("0.00a")
          );
        },
        fontSize: autoFontSize(),
      },
    },
    series: [],
  };

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  const queryClient = useQueryClient();

  const handleValidateAddress = async (address: string) => {
    if (address) {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      return (
        response?.data || {
          address: "",
          type: "",
        }
      );
    }
  };

  $: queryValidate = createQuery({
    queryKey: ["validate", $wallet],
    queryFn: () => handleValidateAddress($wallet),
    staleTime: Infinity,
    retry: false,
    enabled: Boolean($wallet && $wallet?.length !== 0),
  });

  // query personalize tag
  const getPersonalizeTag = async (address) => {
    const response = await nimbus.get(`/address/${address}/personalize/tag`);
    return response?.data || [];
  };

  const formatDataPersonalTag = (data) => {
    if (data && data.length !== 0) {
      const categoriesData = data && Object.getOwnPropertyNames(data);
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
      dataPersonalizeTag = formatDataCategory;
    }
  };

  $: queryPersonalTag = createQuery({
    queryKey: ["personalize-tag", $wallet],
    enabled: enabledQuery && isFetch,
    queryFn: () => getPersonalizeTag($wallet),
    staleTime: Infinity,
  });

  $: {
    if (!$queryPersonalTag.isError && $queryPersonalTag.data !== undefined) {
      formatDataPersonalTag($queryPersonalTag.data);
    }
  }

  // query holding token
  const getHoldingToken = async (chain) => {
    let addressChain = chain;

    if (addressChain === "ALL") {
      const validateAccount = $queryValidate.data;
      addressChain = validateAccount?.type;
    }

    const response: HoldingTokenRes = await nimbus
      .get(
        `/v2/address/${$wallet}/holding?chain=${
          addressChain === "BUNDLE" ? "" : addressChain
        }`
      )
      .then((response) => response.data);
    return response;
  };

  const formatDataHoldingToken = (data) => {
    if (data && data.length !== 0) {
      dataTokenHolding = data;
      queryClient.invalidateQueries(["personalize-tag"]);

      dataRank = handleFormatDataPieChart(data, "rank");
      dataCategory = handleFormatDataPieChart(data, "category");
      dataSector = handleFormatDataPieChart(data, "sector");
    }
  };

  $: queryHoldingToken = createQuery({
    queryKey: ["token-holding", $wallet, $chain],
    queryFn: () => getHoldingToken($chain),
    staleTime: Infinity,
    enabled: enabledQuery && isFetch && !$queryValidate.isFetching,
  });

  $: {
    if (!$queryHoldingToken.isError && $queryHoldingToken.data !== null) {
      formatDataHoldingToken($queryHoldingToken.data);
    }
  }

  // query compare
  const getAnalyticCompare = async (address: string, timeFrame: string) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/compare?compareAddress=${""}&timeRange=${timeFrame}`
    );
    return response?.data || [];
  };

  $: queryCompare = createQuery({
    queryKey: ["compare", $wallet, $chain, selectedTimeFrame],
    enabled: enabledQuery && isFetch,
    queryFn: () => getAnalyticCompare($wallet, selectedTimeFrame),
    staleTime: Infinity,
  });

  $: {
    if ($queryCompare.data) {
      formatDataCompare($queryCompare?.data);
    }
  }

  const formatDataCompare = (data) => {
    if (data?.base?.holdingHistory?.length !== 0) {
      // percent change
      const formatDataPortfolio = data?.base?.holdingHistory?.map((item) => {
        return {
          value: [item?.timestamp * 1000, item.performance],
          itemStyle: {
            color: "#00b580",
          },
        };
      });

      const formatDataETH = data?.eth?.holdingHistory.map((item) => {
        return {
          value: [item?.timestamp * 1000, item.performance],
          itemStyle: {
            color: "#547fef",
          },
        };
      });

      const formatDataBTC = data?.btc?.holdingHistory.map((item) => {
        return {
          value: [item?.timestamp * 1000, item.performance],
          itemStyle: {
            color: "#f7931a",
          },
        };
      });

      optionLinePercentChange = {
        ...optionLinePercentChange,
        legend: {
          ...optionLinePercentChange.legend,
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
        series: [
          {
            name: "Your Portfolio",
            type: "line",
            lineStyle: {
              type: "solid",
              color: "#00b580",
            },
            showSymbol: false,
            data: formatDataPortfolio,
          },
          {
            name: "Bitcoin",
            type: "line",
            lineStyle: {
              type: "dashed",
              color: "#f7931a",
            },
            showSymbol: false,
            data: formatDataBTC,
          },
          {
            name: "Ethereum",
            type: "line",
            lineStyle: {
              type: "dashed",
              color: "#547fef",
            },
            showSymbol: false,
            data: formatDataETH,
          },
        ],
      };

      // net worth
      const formatDataPortfolioNetWorth = data?.base?.holdingHistory?.map(
        (item) => {
          return {
            value: [item.timestamp * 1000, item.networth],
            itemStyle: {
              color: "#00b580",
            },
          };
        }
      );

      optionLineNetWorth = {
        ...optionLineNetWorth,
        legend: {
          ...optionLineNetWorth.legend,
          data: [
            {
              name: "Your Portfolio",
              itemStyle: {
                color: "#00b580",
              },
            },
          ],
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
            data: formatDataPortfolioNetWorth,
          },
        ],
      };
    }
  };

  // handle logic select
  $: {
    if (
      dataPersonalizeTag &&
      dataPersonalizeTag.length !== 0 &&
      dataTokenHolding &&
      dataTokenHolding.length !== 0
    ) {
      const tokenDataEachCategory = dataPersonalizeTag.map((item) => {
        return {
          category: item.category,
          dataTokens: flatten(
            item.dataTag
              .filter((item) => item.name !== "Other")
              .map((item) => item.tokens)
          ),
        };
      });

      const formatTokenDataEachCategory = tokenDataEachCategory.map((item) => {
        const formatDataTokens = dataTokenHolding.map((tokenHolding) => {
          const isSelected = item.dataTokens.some(
            (selectedToken) =>
              selectedToken.contractAddress === tokenHolding.contractAddress
          );

          const selected = item.dataTokens.filter(
            (selectedToken) =>
              selectedToken.contractAddress === tokenHolding.contractAddress
          );

          return {
            ...tokenHolding,
            [item.category]: isSelected ? selected[0].tag : "Other",
          };
        });

        return {
          category: item.category,
          dataTokens: formatDataTokens,
        };
      });

      const listCategory = dataPersonalizeTag.map((item) => {
        return {
          label: item.category,
          value: item.category,
        };
      });

      typeListCategory = [...typeList];
      typeListCategory = [...typeListCategory, ...listCategory].filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) => t.label === value.label && t.value === value.value
          )
      );

      personalizeCategoryData = formatTokenDataEachCategory.map((item) => {
        return {
          category: item.category,
          dataPie: handleFormatDataPieChart(item.dataTokens, item.category),
        };
      });
    } else {
      typeListCategory = [...typeList];
      personalizeCategoryData = [];
      isEmptyDataPie = false;
      selectedDataPie = [];
    }
  }

  $: {
    if (selectedType) {
      if (dataRank && dataCategory && dataSector && personalizeCategoryData) {
        if (selectedType === "sector") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataSector.map((item) => {
                  return {
                    ...item,
                    name_balance: "",
                    value_balance: 0,
                  };
                }),
              },
            ],
          };
        } else if (selectedType === "rank") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataRank.map((item) => {
                  return {
                    ...item,
                    name_balance: "",
                    value_balance: 0,
                  };
                }),
              },
            ],
          };
        } else if (selectedType === "category") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataCategory.map((item) => {
                  return {
                    ...item,
                    name_balance: "",
                    value_balance: 0,
                  };
                }),
              },
            ],
          };
        } else {
          const indexOfType = personalizeCategoryData
            .map((item) => item.category)
            .indexOf(selectedType);
          const selectedPersonalizeCategoryData =
            personalizeCategoryData[indexOfType];

          if (selectedPersonalizeCategoryData !== undefined) {
            optionPie = {
              ...optionPie,
              series: [
                {
                  ...optionPie.series[0],
                  data: selectedPersonalizeCategoryData.dataPie?.map((item) => {
                    return {
                      ...item,
                      name_balance: "",
                      value_balance: 0,
                    };
                  }),
                },
              ],
            };
          } else {
            optionPie = {
              ...optionPie,
              series: [
                {
                  ...optionPie.series[0],
                  data: [],
                },
              ],
            };
          }
        }
      }
    }
  }

  $: enabledQuery = Boolean(
    listSupported.includes($typeWallet) && $wallet && $wallet?.length !== 0
  );

  $: theme = $isDarkMode ? "dark" : "white";
</script>

<div class="flex flex-col justify-between xl:gap-6 gap-0 xl:flex-row">
  <!-- Token allocation -->
  <div
    class={`xl:w-1/2 w-full flex flex-col justify-between items-start gap-2 rounded-[20px] xl:p-6 py-4 px-3 ${
      $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
    }`}
  >
    <div class="text-3xl font-medium xl:text-2xl">
      {MultipleLang.token_allocation}
    </div>

    <div class="flex md:flex-row flex-col justify-end w-full gap-5">
      <div
        class="relative flex items-center justify-between w-full gap-3 overflow-hidden"
        bind:this={container}
      >
        <div
          class={`text-white absolute left-0 py-2 rounded-tl-lg rounded-bl-lg ${
            isScrollStart ? "hidden" : "block"
          }`}
          style="background-image: linear-gradient(to right, rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100% );"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            height="24px"
            width="24px"
            viewBox="0 0 24 24"
            class="sc-aef7b723-0 fKbUaI"
            ><path
              d="M15 6L9 12L15 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-miterlimit="10"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg
          >
        </div>
        <div
          class="flex gap-3 overflow-x-auto w-max whitespace-nowrap"
          bind:this={scrollContainer}
          on:scroll={handleScroll}
        >
          <AnimateSharedLayout>
            {#each typeListCategory as type}
              <div
                class="relative cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all"
                on:click={() => (selectedType = type.value)}
              >
                <div
                  class={`relative z-1 ${
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
                      class="absolute inset-0 rounded-full bg-[#1E96FC] z-0"
                      use:motion
                    />
                  </Motion>
                {/if}
              </div>
            {/each}
          </AnimateSharedLayout>
        </div>
        {#if scrollContainer?.scrollWidth >= container?.offsetWidth}
          <div
            class={`text-white absolute right-0 py-2 rounded-tr-lg rounded-br-lg ${
              isScrollEnd ? "hidden" : "block"
            }`}
            style="background-image: linear-gradient(to left,rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100%);"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              height="24px"
              width="24px"
              viewBox="0 0 24 24"
              class="sc-aef7b723-0 fKbUaI"
              ><path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              /></svg
            >
          </div>
        {/if}
      </div>
      <div class="flex-1 w-max">
        {#if $user && Object.keys($user).length !== 0}
          <div
            on:click={() => {
              navigate(
                `/personal-token-breakdown?chain=${encodeURIComponent(
                  $chain
                )}&address=${encodeURIComponent($wallet)}`
              );
            }}
            class="mt-1 font-medium text-blue-500 cursor-pointer xl:text-base text-lg hover:underline w-max"
          >
            Custom category
          </div>
        {:else}
          <div
            class="mt-1 font-medium text-gray-500 cursor-pointer xl:text-base text-lg hover:underline w-max"
          >
            Custom category
          </div>
        {/if}
      </div>
    </div>

    <div class="w-full mt-5">
      {#if $queryHoldingToken.isFetching}
        <div class="flex items-center justify-center h-[475px]">
          <LoadingPremium />
        </div>
      {:else}
        <div class="h-full">
          {#if $queryHoldingToken.isError || ($queryHoldingToken.data && $queryHoldingToken.data?.length === 0)}
            <div
              class="flex justify-center items-center h-[475px] text-base text-gray-400"
            >
              Empty
            </div>
          {:else}
            <div class="relative">
              <EChart
                id="current-status-analytics"
                {theme}
                option={optionPie}
                height={475}
                notMerge={true}
              />
              <div
                class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none top-1/2 left-1/2"
              >
                <img
                  src={$isDarkMode ? LogoWhite : Logo}
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
  </div>

  <!-- Performance -->
  <div
    class={`xl:w-1/2 w-full relative rounded-[20px] xl:p-6 py-4 px-3 ${
      $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
    }`}
  >
    <div
      class="flex md:flex-row flex-col md:gap-0 gap-3 justify-between items-start mb-6"
    >
      <div class="flex justify-start">
        {#if listSupported.slice(2).includes($typeWallet)}
          <TooltipTitle
            tooltipText="The performance data can only get after 7 days you connect to Nimbus"
            type="warning"
          >
            <div class="md:pl-4 text-3xl font-medium xl:text-2xl">
              {MultipleLang.performance}
            </div>
          </TooltipTitle>
        {:else}
          <div class="md:pl-4 text-3xl font-medium xl:text-2xl">
            {MultipleLang.performance}
          </div>
        {/if}
      </div>
      {#if !$queryCompare.isError || ($queryCompare.data?.performance && $queryCompare.data?.performance.length !== 0)}
        <div class="flex items-center gap-2">
          <AnimateSharedLayout>
            {#each performanceTypeChartPortfolio as type}
              <div
                class="relative cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all"
                on:click={() => (selectedTypeChart = type.value)}
              >
                <div
                  class={`relative z-1 ${
                    selectedTypeChart === type.value && "text-white"
                  }`}
                >
                  {type.label}
                </div>
                {#if type.value === selectedTypeChart}
                  <Motion
                    let:motion
                    layoutId="active-pill"
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <div
                      class="absolute inset-0 rounded-full bg-[#1E96FC] z-0"
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

    {#if $queryCompare.isFetching}
      <div class="flex items-center justify-center h-[485px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full">
        {#if $queryCompare.isError || ($queryCompare.data?.performance && $queryCompare.data?.performance.length === 0)}
          <div
            class="flex justify-center items-center text-center h-[465px] text-base text-gray-400"
          >
            {#if $typeWallet === "CEX" && $queryCompare.isError}
              Not enough data. CEX integration can only get data from the day
              you connect
            {:else}
              Empty
            {/if}
          </div>
        {:else}
          <div class="relative">
            <EChart
              id="line-chart-anaylic-performace"
              {theme}
              notMerge={true}
              option={selectedTypeChart === "percent"
                ? optionLinePercentChange
                : optionLineNetWorth}
              height={485}
            />
            <div
              class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none top-1/2 left-1/2"
            >
              <img
                src={$isDarkMode ? LogoWhite : Logo}
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
</div>

<style>
</style>

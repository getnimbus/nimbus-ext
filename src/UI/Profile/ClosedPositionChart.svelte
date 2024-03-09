<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { isDarkMode, user } from "~/store";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import numeral from "numeral";
  import {
    autoFontSize,
    formatPercent,
    formatValue,
    shorterName,
    typeClosedHoldingTokenChart,
  } from "~/utils";
  import dayjs from "dayjs";

  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";
  import defaultToken from "~/assets/defaultToken.png";

  export let selectedAddress;
  export let isSync = false;
  export let enabledFetchAllData = false;

  let closedHoldingPosition = [];
  let selectedTypeChart: "value" | "percent" = "value";
  let optionBarValue = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        const selectedItem = closedHoldingPosition.find(
          (item) =>
            item?.contractAddress?.toLowerCase() ===
            params[0]?.name?.toLowerCase()
        );
        return `
          <div style="display: flex; flex-direction: column; gap: 12px; min-width: 400px;">
            <div style="display: flex; align-items: centers; gap: 4px">
              <img src=${
                selectedItem?.logo || defaultToken
              } alt="" width=20 height=20 style="border-radius: 100%" />
              <div style="margin-top: 2px; font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${
                  selectedItem?.name?.length > 20
                    ? shorterName(selectedItem?.name, 20)
                    : selectedItem?.name || "N/A"
                } ${selectedItem?.symbol ? `(${selectedItem?.symbol})` : ""}
              </div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ROI
              </div>
            
              <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px;">
                <div style="display:flex; justify-content: flex-end; align-items: center; color: ${
                  params[0].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                  <span>${params[0].value < 0 ? "-" : ""}</span>
                  ${formatValue(Math.abs(params[0].value))}
                </div>
                <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; color: ${
                  selectedItem?.percentRealizedProfit >= 0
                    ? "#05a878"
                    : "#f25f5d"
                };">
                  ${formatPercent(
                    Math.abs(selectedItem?.percentRealizedProfit)
                  )}%
                  <img src=${
                    selectedItem?.percentRealizedProfit >= 0
                      ? TrendUp
                      : TrendDown
                  } alt="" style="margin-bottom: 4px;" />
                </div>
              </div>
            </div>
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
    xAxis: {
      type: "category",
      axisTick: { show: false },
      show: false,
      data: [],
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
  let optionBarPercent = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        const selectedItem = closedHoldingPosition.find(
          (item) =>
            item?.contractAddress?.toLowerCase() ===
            params[0]?.name?.toLowerCase()
        );
        return `
          <div style="display: flex; flex-direction: column; gap: 12px; min-width: 400px;">
            <div style="display: flex; align-items: centers; gap: 4px">
              <img src=${
                selectedItem?.logo || defaultToken
              } alt="" width=20 height=20 style="border-radius: 100%" />
              <div style="margin-top: 2px; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${
                  selectedItem?.name?.length > 20
                    ? shorterName(selectedItem?.name, 20)
                    : selectedItem?.name || "N/A"
                } ${selectedItem?.symbol ? `(${selectedItem?.symbol})` : ""}
              </div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ROI
              </div>
              <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px;">
                <div style="display:flex; justify-content: flex-end; align-items: center; color: ${
                  selectedItem?.realizedProfit >= 0 ? "#05a878" : "#f25f5d"
                };">
                  <span>${selectedItem?.realizedProfit < 0 ? "-" : ""}</span>
                  ${formatValue(Math.abs(selectedItem?.realizedProfit))}
                </div>
                <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; color: ${
                  params[0].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                  ${formatPercent(Math.abs(params[0].value))}%
                  <img src=${
                    params[0].value >= 0 ? TrendUp : TrendDown
                  } alt="" style="margin-bottom: 4px;" />
                </div>
              </div>
            </div>
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
    xAxis: {
      type: "category",
      axisTick: { show: false },
      show: false,
      data: [],
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

  $: isFetch = isSync ? enabledFetchAllData : true;

  const getTradingStats = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/trading-stats`
    );
    return response?.data;
  };

  const formatDataHoldingToken = (dataTokenHolding) => {
    const formatData = dataTokenHolding.metadata
      .filter(
        (item) => dayjs().subtract(30, "day").valueOf() < item.lastTrade * 1000
      )
      .map((item) => {
        return {
          ...item.holding,
          value:
            Number(item?.holding?.amount || 0) *
            Number(item?.holding.price?.price || item?.holding.rate),
        };
      })
      .sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

    closedHoldingPosition = formatData
      .filter((item) => item?.profit?.realizedProfit)
      .map((item) => {
        return {
          ...item,
          realizedProfit: item?.profit?.realizedProfit,
          percentRealizedProfit:
            (item?.avgCost || 0) === 0
              ? 0
              : (Number(item?.profit?.realizedProfit) /
                  Number(Math.abs(item?.avgCost))) *
                100,
        };
      });

    if (closedHoldingPosition && closedHoldingPosition.length !== 0) {
      optionBarValue = {
        ...optionBarValue,
        xAxis: {
          ...optionBarValue.xAxis,
          data: closedHoldingPosition
            .sort((a, b) => a?.realizedProfit - b?.realizedProfit)
            .map((item) => {
              return item?.contractAddress?.toLowerCase();
            }),
        },
        series: [
          {
            type: "bar",
            data: closedHoldingPosition
              .sort((a, b) => a?.realizedProfit - b?.realizedProfit)
              .map((item) => {
                return {
                  value: item.realizedProfit,
                  itemStyle: {
                    color: item.realizedProfit >= 0 ? "#05a878" : "#f25f5d",
                  },
                };
              }),
          },
        ],
      };

      optionBarPercent = {
        ...optionBarPercent,
        xAxis: {
          ...optionBarPercent.xAxis,
          data: closedHoldingPosition
            .sort((a, b) => a?.percentRealizedProfit - b?.percentRealizedProfit)
            .map((item) => {
              return item?.contractAddress?.toLowerCase();
            }),
        },
        series: [
          {
            type: "bar",
            data: closedHoldingPosition
              .sort(
                (a, b) => a?.percentRealizedProfit - b?.percentRealizedProfit
              )
              .map((item) => {
                return {
                  value: item.percentRealizedProfit,
                  itemStyle: {
                    color:
                      item.percentRealizedProfit >= 0 ? "#05a878" : "#f25f5d",
                  },
                };
              }),
          },
        ],
      };
    }
  };

  $: queryTradingStats = createQuery({
    queryKey: ["trading-stats", selectedAddress],
    queryFn: () => getTradingStats(selectedAddress),
    staleTime: Infinity,
    retry: false,
    enabled: selectedAddress?.length !== 0 && isFetch,
  });

  $: {
    if (
      !$queryTradingStats.isError &&
      $queryTradingStats.data &&
      $queryTradingStats.data !== undefined
    ) {
      formatDataHoldingToken($queryTradingStats.data);
    }
  }

  $: theme = $isDarkMode ? "dark" : "white";
</script>

<div
  class="col-span-4 border border_0000001a rounded-xl flex flex-col min-h-[465px]"
>
  <div class="flex justify-start font-medium text-2xl px-6 pb-3 pt-6">
    Positions 30D
  </div>

  {#if $queryTradingStats.isFetching}
    <div class="flex items-center justify-center px-6 pb-6 flex-1">
      <LoadingPremium />
    </div>
  {:else}
    <div class="h-full relative">
      {#if $queryTradingStats.isError}
        <div class="h-full flex justify-center items-center text-base">
          Empty
        </div>
      {:else}
        <div class="h-full">
          {#if closedHoldingPosition && closedHoldingPosition.length !== 0}
            <div class="flex flex-row px-6">
              <AnimateSharedLayout>
                {#each typeClosedHoldingTokenChart as type}
                  <div
                    class="relative cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all"
                    on:click={() => (selectedTypeChart = type.value)}
                  >
                    <div
                      class={`relative z-2 ${
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
          {#if closedHoldingPosition && closedHoldingPosition.length === 0}
            <div
              class="h-full w-full flex items-center justify-center px-4 text-center"
            >
              There are no closed holding position in the last 30 day
            </div>
          {:else}
            <div class="relative pl-4">
              <EChart
                id="closed-holding-token"
                {theme}
                option={selectedTypeChart === "value"
                  ? optionBarValue
                  : optionBarPercent}
                notMerge={true}
                height={465}
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
  {/if}
</div>

<style windi:preflights:global windi:safelist:global>
</style>

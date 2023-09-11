<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { isDarkMode, typeWallet, wallet, chain } from "~/store";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import numeral from "numeral";
  import { formatPercent, formatValue, shorterName } from "~/utils";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";

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

  const typeChart = [
    {
      label: "Value",
      value: "value",
    },
    {
      label: "Percent",
      value: "percent",
    },
  ];

  let formatXAxisData = [];
  let selectedTypeChart: "value" | "percent" = "value";
  let optionBarValue = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        const selectedItem = formatXAxisData.find(
          (item) =>
            item?.contractAddress?.toLowerCase() ===
            params[0]?.name?.toLowerCase()
        );
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 400px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                params[0].value >= 0 ? "#05a878" : "#f25f5d"
              };">
                ${params[0].value > 0 ? "Win" : "Lose"}
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: centers; gap: 4px">
                  <img src=${
                    selectedItem?.logo ||
                    "https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
                  } alt="" width=20 height=20 style="border-radius: 100%" />
                  <div style="margin-top: 2px; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    darkMode ? "white" : "black"
                  }">
                    ${
                      selectedItem?.name?.length > 20
                        ? shorterName(selectedItem?.name, 20)
                        : selectedItem?.name || "N/A"
                    } ${selectedItem?.symbol ? `(${selectedItem?.symbol})` : ""}
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[0].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                    <div style="display:flex; justify-content: flex-end; align-items: center;">
                      <span>${params[0].value < 0 ? "-" : ""}</span>
                      ${formatValue(Math.abs(params[0].value))}
                    </div>  
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px;">
                      ${formatPercent(Math.abs(selectedItem?.percent))}%
                      <img src=${
                        selectedItem?.percent >= 0 ? TrendUp : TrendDown
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
        const selectedItem = formatXAxisData.find(
          (item) =>
            item?.contractAddress?.toLowerCase() ===
            params[0]?.name?.toLowerCase()
        );
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 400px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                params[0].value >= 0 ? "#05a878" : "#f25f5d"
              };">
                ${params[0].value > 0 ? "Win" : "Lose"}
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: centers; gap: 4px">
                  <img src=${
                    selectedItem?.logo ||
                    "https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
                  } alt="" width=20 height=20 style="border-radius: 100%" />
                  <div style="margin-top: 2px; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    darkMode ? "white" : "black"
                  }">
                    ${
                      selectedItem?.name?.length > 20
                        ? shorterName(selectedItem?.name, 20)
                        : selectedItem?.name || "N/A"
                    } ${selectedItem?.symbol ? `(${selectedItem?.symbol})` : ""}
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[0].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                    <div style="display:flex; justify-content: flex-end; align-items: center;">
                      <span>${selectedItem?.value < 0 ? "-" : ""}</span>
                      ${formatValue(Math.abs(selectedItem?.value))}  
                    </div>  
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px;">
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
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}%",
      },
    },
    series: [],
  };
  let biggestWin = {};
  let worseLose = {};
  let sumRealizedProfit = 0;

  const getHoldingToken = async (address, chain) => {
    const response: HoldingTokenRes = await nimbus
      .get(`/v2/address/${address}/holding?chain=${chain}`)
      .then((response) => response.data);
    return response;
  };

  const formatDataHoldingToken = (dataTokenHolding) => {
    const formatData = dataTokenHolding
      .map((item) => {
        return {
          ...item,
          value:
            Number(item?.amount) * Number(item?.price?.price || item?.rate),
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

    const closedHoldingPosition = formatData
      .filter((item) => item?.profit?.realizedProfit)
      .filter((item) => Number(item.amount) === 0)
      .map((item) => {
        return {
          ...item,
          realizedProfit: item?.profit?.realizedProfit,
          percentRealizedProfit:
            (item?.avgCost || 0) === 0
              ? 0
              : item?.profit?.realizedProfit / Math.abs(item?.avgCost),
        };
      })
      .sort((a, b) => a?.profit.realizedProfit - b?.profit.realizedProfit);

    sumRealizedProfit = (closedHoldingPosition || []).reduce(
      (prev, item) => prev + Number(item.realizedProfit),
      0
    );

    biggestWin = closedHoldingPosition.reduce((maxObject, currentObject) => {
      if (currentObject.realizedProfit > maxObject.realizedProfit) {
        return currentObject;
      } else {
        return maxObject;
      }
    });

    worseLose = closedHoldingPosition.reduce((maxObject, currentObject) => {
      if (currentObject.realizedProfit < maxObject.realizedProfit) {
        return currentObject;
      } else {
        return maxObject;
      }
    });

    const formatXAxis = closedHoldingPosition.map((item) => {
      return item.contractAddress;
    });

    formatXAxisData = closedHoldingPosition.map((item) => {
      return {
        contractAddress: item.contractAddress,
        name: item.name,
        symbol: item.symbol,
        logo: item.logo,
        chain: item.chain,
        value: item.realizedProfit,
        percent: item.percentRealizedProfit,
      };
    });

    optionBarValue = {
      ...optionBarValue,
      xAxis: {
        ...optionBarValue.xAxis,
        data: formatXAxis,
      },
      series: [
        {
          type: "bar",
          data: closedHoldingPosition.map((item) => {
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
        data: formatXAxis,
      },
      series: [
        {
          type: "bar",
          data: closedHoldingPosition.map((item) => {
            return {
              value: item.percentRealizedProfit,
              itemStyle: {
                color: item.percentRealizedProfit >= 0 ? "#05a878" : "#f25f5d",
              },
            };
          }),
        },
      ],
    };
  };

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedWallet, selectedChain],
    queryFn: () => getHoldingToken(selectedWallet, selectedChain),
    staleTime: Infinity,
    enabled: enabledQuery,
  });

  $: {
    if (!$queryTokenHolding.isError && $queryTokenHolding.data !== undefined) {
      formatDataHoldingToken($queryTokenHolding.data);
    }
  }

  $: enabledQuery = Boolean(
    (typeWalletAddress === "EVM" ||
      typeWalletAddress === "CEX" ||
      typeWalletAddress === "BUNDLE") &&
      selectedWallet.length !== 0
  );

  $: theme = darkMode ? "dark" : "white";
</script>

<AnalyticSection>
  <span slot="title">
    <div class="flex justify-start text-4xl font-medium xl:text-2xl">
      Closed Positions
    </div>
  </span>

  <span slot="overview">
    {#if !$queryTokenHolding.isFetching && !$queryTokenHolding.isError}
      <div class="mb-4 text-3xl font-medium xl:text-xl px-6 pt-6">Overview</div>
    {/if}
    {#if $queryTokenHolding.isFetching}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full relative min-h-[465px]">
        {#if $queryTokenHolding.isError}
          <div
            class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
              darkMode ? "bg-[#222222e6]" : "bg-white/90"
            }`}
          >
            {#if typeWalletAddress === "CEX"}
              Not enough data. CEX integration can only get data from the day
              you connect
            {:else}
              Empty
            {/if}
          </div>
        {:else}
          <div class="flex flex-col gap-4 px-6 pb-6">
            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div class="flex justify-start text-2xl xl:text-base">
                  Biggest win
                </div>
              </div>
              <div
                class="flex items-center justify-end gap-1 xl:text-base text-2xl text-[#05a878] col-span-1"
              >
                <div>
                  {formatValue(Math.abs(biggestWin?.realizedProfit))}
                </div>
                /
                <div class="flex items-center gap-1">
                  {formatPercent(Math.abs(biggestWin?.percentRealizedProfit))}%
                  <img src={TrendUp} alt="" style="margin-bottom: 4px;" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div class="flex justify-start text-2xl xl:text-base">
                  Worse lose
                </div>
              </div>
              <div
                class="flex items-center justify-end gap-1 xl:text-base text-2xl text-[#f25f5d] col-span-1"
              >
                <div>
                  {formatValue(Math.abs(worseLose?.realizedProfit))}
                </div>
                /
                <div class="flex items-center gap-1">
                  {formatPercent(Math.abs(worseLose?.percentRealizedProfit))}%
                  <img src={TrendDown} alt="" style="margin-bottom: 4px;" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div class="flex justify-start text-2xl xl:text-base">
                  Total realized profit
                </div>
              </div>
              <div
                class="flex items-center justify-end xl:text-base text-2xl col-span-1"
              >
                {formatValue(sumRealizedProfit)}
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </span>

  <span slot="chart">
    {#if $queryTokenHolding.isFetching}
      <div class="flex items-center justify-center h-[465px] p-6">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full relative">
        {#if $queryTokenHolding.isError}
          <div
            class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
              darkMode ? "bg-[#222222e6]" : "bg-white/90"
            }`}
          >
            {#if typeWalletAddress === "CEX"}
              Not enough data. CEX integration can only get data from the day
              you connect
            {:else}
              Empty
            {/if}
          </div>
        {:else}
          <div class="flex flex-row p-6">
            <AnimateSharedLayout>
              {#each typeChart as type}
                <div
                  class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                  on:click={() => (selectedTypeChart = type.value)}
                >
                  <div
                    class={`relative z-20 ${
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
                        class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                        use:motion
                      />
                    </Motion>
                  {/if}
                </div>
              {/each}
            </AnimateSharedLayout>
          </div>
          <div class="relative">
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
  </span>
</AnalyticSection>

<style windi:preflights:global windi:safelist:global>
</style>

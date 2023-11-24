<script lang="ts">
  import { nimbus } from "~/lib/network";
  import {
    wallet,
    chain,
    selectedPackage,
    typeWallet,
    isDarkMode,
  } from "~/store";
  import {
    autoFontSize,
    formatCurrency,
    formatPercent,
    formatValue,
    getTooltipContent,
    volatilityColorChart,
  } from "~/utils";
  import groupBy from "lodash/groupBy";
  import sumBy from "lodash/sumBy";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import dayjs from "dayjs";
  import {
    calculateVolatility,
    getChangePercent,
    getPostionInRange,
  } from "~/chart-utils";
  import { createQuery } from "@tanstack/svelte-query";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import EChart from "~/components/EChart.svelte";
  import CtaIcon from "~/components/CtaIcon.svelte";
  import ProgressBar from "~/components/ProgressBar.svelte";
  import CheckIcon from "~/components/CheckIcon.svelte";
  import DangerIcon from "~/components/DangerIcon.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";
  import VolatilityExplain from "~/assets/explain/volatility-explain.mp4";
  import SharpeRatioExplain from "~/assets/explain/sharpe-ratio-explain.mp4";
  import MaxDrawdownExplain from "~/assets/explain/max-drawdown-explain.mp4";
  import defaultToken from "~/assets/defaultToken.png";

  export let selectedTimeFrame;
  export let isSync = false;
  export let enabledFetchAllData = false;

  $: isFetch = isSync ? enabledFetchAllData : true;

  const riskTypeChart = [
    {
      label: "Overview",
      value: "overview",
    },
    {
      label: "Volatility breakdown",
      value: "riskBreakdown",
    },
  ];

  let data;
  let dataRiskBreakdown;
  let selectedTypeChart = "overview";
  let dataRiskGroup = {};
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
                      params[0]?.axisValue === "Sharpe Ratio"
                        ? item.value >= 0
                          ? "#05a878"
                          : "#f25f5d"
                        : $isDarkMode
                          ? "white"
                          : "black"
                    };">
                      ${
                        params[0]?.axisValue === "Volatility" ||
                        params[0]?.axisValue === "Max drawdown"
                          ? formatPercent(Math.abs(item.value))
                          : formatCurrency(Math.abs(item.value))
                      }${
                        params[0]?.axisValue === "Volatility" ||
                        params[0]?.axisValue === "Max drawdown"
                          ? "%"
                          : ""
                      }
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
        data: ["Sharpe Ratio", "Volatility", "Max drawdown"],
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
  let riskBreakdownChartOption = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 350px;">
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                  $isDarkMode ? "white" : "black"
                }">
                  <span>${params?.marker}</span> ${params?.data?.name}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; color: ${
                  $isDarkMode ? "white" : "black"
                }">
                  <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${formatValue(Number(params?.data?.value))}
                  </div>
                </div>
              </div>
              <div style="border-top: 0.8px solid #d1d5db; padding-top: 10px; display: flex; flex-direction: column; gap: 12px;">
                ${dataRiskGroup[params?.data?.name]
                  .sort((a, b) => {
                    if (
                      Number(a?.amount) * Number(a?.price?.price) <
                      Number(b?.amount) * Number(b?.price?.price)
                    ) {
                      return 1;
                    }
                    if (
                      Number(a?.amount) * Number(a?.price?.price) >
                      Number(b?.amount) * Number(b?.price?.price)
                    ) {
                      return -1;
                    }
                    return 0;
                  })
                  .map((item) => {
                    return `
                      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                        <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                          $isDarkMode ? "white" : "black"
                        }">
                            <img src=${
                              item?.logo || defaultToken
                            } alt="" width=20 height=20 style="border-radius: 100%" />
                            ${item?.name} ${
                              item?.symbol ? `(${item?.symbol})` : ""
                            }
                        </div>
                        <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                          <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                            $isDarkMode ? "white" : "black"
                          }">
                           ${formatValue(
                             Number(item?.amount) * Number(item?.price?.price)
                           )}
                          </div>
                        </div>
                      </div>
              `;
                  })
                  .join("")}
              </div>
            </div>`;
      },
    },
    legend: {
      top: "0%",
      left: "center",
    },
    color: [],
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

  const getAnalyticCompare = async (address: string, timeFrame: string) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/compare?compareAddress=${""}&timeRange=${timeFrame}`
    );
    return response?.data || [];
  };

  const getRiskBreakdown = async (address: string, timeFrame: string) => {
    const response = await nimbus.get(
      `/v2/analysis/${address}/risk-breakdown?timeRange=${timeFrame}`
    );
    return response?.data || [];
  };

  $: enabledQuery =
    $wallet === "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0"
      ? true
      : Boolean(
          ($typeWallet === "EVM" ||
            $typeWallet === "CEX" ||
            $typeWallet === "SOL" ||
            $typeWallet === "ALGO" ||
            $typeWallet === "XZO" ||
            $typeWallet === "BUNDLE") &&
            $wallet.length !== 0 &&
            $selectedPackage !== "FREE"
        );

  $: query = createQuery({
    queryKey: ["compare", $wallet, $chain, selectedTimeFrame],
    enabled: enabledQuery && isFetch,
    queryFn: () => getAnalyticCompare($wallet, selectedTimeFrame),
    staleTime: Infinity,
  });

  $: queryBreakdown = createQuery({
    queryKey: ["compare-breakdown", $wallet, $chain, selectedTimeFrame],
    enabled: enabledQuery && isFetch,
    queryFn: () => getRiskBreakdown($wallet, selectedTimeFrame),
    staleTime: Infinity,
  });

  $: {
    if ($query.data) {
      data = $query.data;
    }
  }

  $: {
    if ($queryBreakdown.data) {
      dataRiskBreakdown = $queryBreakdown.data;
    }
  }

  $: {
    if (
      !$query.isError &&
      data !== undefined &&
      dataRiskBreakdown &&
      dataRiskBreakdown.length !== 0
    ) {
      const riskGroup = groupBy(dataRiskBreakdown, (item) => {
        return item.volatilityLabel;
      });

      // TODO: Break by high, medium, low risk

      dataRiskGroup = riskGroup;

      riskBreakdownChartOption = {
        ...riskBreakdownChartOption,
        color: Object.keys(riskGroup)
          .map((riskType) => {
            return {
              name: riskType,
              value: riskGroup[riskType][0],
            };
          })
          .map((item) => {
            return volatilityColorChart(item.value.sharpeRatio);
          }),
        series: [
          {
            ...riskBreakdownChartOption.series[0],
            data: Object.keys(riskGroup).map((riskType) => {
              return {
                name: riskType,
                value: sumBy(
                  riskGroup[riskType],
                  (item) => Number(item.amount) * Number(item.rate)
                ),
              };
            }),
          },
        ],
      };

      const listKey =
        Object.keys(data).length !== 0 && Object.getOwnPropertyNames(data);

      const legendDataBarChart = (listKey || [])?.map((item) => {
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

      const dataBarChart = (listKey || [])?.map((item) => {
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
              value: data[item]?.sharpeRatio,
              itemStyle: {
                color: custom.color,
              },
            },
            {
              value: data[item]?.volatility,
              itemStyle: {
                color: custom.color,
              },
            },
            {
              value: data[item]?.drawDown,
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
    }
  }

  $: sharpeRatioCompare = getChangePercent(
    Number(data?.base?.sharpeRatio || 0),
    Number(data?.btc?.sharpeRatio || 0)
  );

  $: volatilityCompare = getChangePercent(
    Number(data?.base?.volatility || 0),
    Number(data?.btc?.volatility || 0)
  );

  $: volatilityCompareAvg = getPostionInRange(
    Number(data?.base?.volatility || 0),
    Number(data?.base?.avgMarket?.minVolality || 0),
    Number(data?.base?.avgMarket?.maxVolality || 0)
  );

  $: volatilityAvgMarket = (
    (Number(data?.base?.avgMarket?.minVolality || 0) +
      Number(data?.base?.avgMarket?.maxVolality || 0)) /
    2
  ).toFixed(2);

  $: drawDownCompare = getChangePercent(
    Number(data?.base?.drawDown || 0),
    Number(data?.btc?.drawDown || 0)
  );

  $: drawDownCompareAvg = getPostionInRange(
    Number(data?.base?.drawDown || 0),
    Number(data?.base?.avgMarket?.minDrawdown || 0),
    Number(data?.base?.avgMarket?.maxDrawdown || 0)
  );

  $: drawDownAvgMarket = (
    (Number(data?.base?.avgMarket?.minDrawdown || 0) +
      Number(data?.base?.avgMarket?.maxDrawdown || 0)) /
    2
  ).toFixed(2);

  $: theme = $isDarkMode ? "dark" : "white";
</script>

<AnalyticSection>
  <span slot="title">
    <div class="flex justify-start text-4xl font-medium xl:text-2xl">
      Volatility
    </div>
  </span>

  <span slot="overview">
    {#if !($query.isFetching || $queryBreakdown.isFetching) && !$query.isError}
      <div class="px-6 pt-6 mb-4 text-3xl font-medium xl:text-xl">Overview</div>
    {/if}
    {#if $query.isFetching || $queryBreakdown.isFetching}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full relative min-h-[465px]">
        {#if $query.isError}
          <div
            class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
              $isDarkMode ? "bg-[#222222e6]" : "bg-white/90"
            }`}
          >
            {#if $typeWallet === "CEX"}
              Not enough data. CEX integration can only get data from the day
              you connect
            {:else}
              Empty
            {/if}
          </div>
        {:else}
          <div class="flex flex-col gap-8 px-6 pb-8">
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-base">
                    <TooltipTitle
                      tooltipText={getTooltipContent(
                        "The Sharpe ratio measures how well an investment performs relative to its risk.",
                        SharpeRatioExplain,
                        true,
                        $isDarkMode,
                        "360px"
                      )}
                      isBigIcon
                      isExplainVideo
                    >
                      Sharpe ratio
                    </TooltipTitle>
                  </div>
                </div>
                <div class="flex items-center justify-end col-span-1">
                  <div class="text-2xl xl:text-base">
                    <TooltipNumber
                      number={data?.base?.sharpeRatio}
                      type="percent"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-base">
                    <TooltipTitle
                      tooltipText={getTooltipContent(
                        "Volatility measures the extent of price fluctuations for an asset over time.",
                        VolatilityExplain,
                        true,
                        $isDarkMode,
                        "360px"
                      )}
                      isExplainVideo
                      isBigIcon
                    >
                      Volatility
                    </TooltipTitle>
                  </div>
                </div>
                <div class="flex items-center justify-end col-span-1">
                  <div class="text-2xl xl:text-base">
                    <TooltipNumber
                      number={data?.base?.volatility}
                      type="percent"
                    />%
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-base">
                    <TooltipTitle
                      tooltipText={getTooltipContent(
                        "Max drawdown is the biggest loss experienced by an investment or portfolio.",
                        MaxDrawdownExplain,
                        true,
                        $isDarkMode,
                        "360px"
                      )}
                      isExplainVideo
                      isBigIcon
                    >
                      Max drawdown
                    </TooltipTitle>
                  </div>
                </div>
                <div class="flex items-center justify-end col-span-1">
                  <div class="text-2xl xl:text-base">
                    <TooltipNumber
                      number={data?.base?.drawDown}
                      type="percent"
                    />%
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-3">
              <div class="text-2xl xl:text-base">
                <CtaIcon isGood={sharpeRatioCompare > 0} />
                Sharpe ratio is {sharpeRatioCompare > 0 ? "higher" : "lower"} than
                Bitcoin by
                <span class="font-medium">{Math.abs(sharpeRatioCompare)}%</span>
              </div>
              <div class="text-2xl xl:text-base">
                <CtaIcon isGood={volatilityCompare < 0} />
                Volatility is {volatilityCompare > 0 ? "higher" : "lower"} than Bitcoin
                by
                <span class="font-medium">{Math.abs(volatilityCompare)}%</span>
              </div>

              <div class="text-2xl xl:text-base">
                <CtaIcon isGood={drawDownCompare < 0} />
                Max Drawdown is {drawDownCompare > 0 ? "higher" : "lower"} than Bitcoin
                by
                <span class="font-medium">{Math.abs(drawDownCompare)}%</span>
              </div>

              <!-- <div>
                <div>Meaning</div>
                <ul>
                  <li />
                </ul>
              </div> -->
            </div>
            <div class="flex flex-col gap-3">
              <div class="text-2xl font-medium xl:text-lg">
                <TooltipTitle
                  tooltipText={"Compare with top 100 by CoinMarketCap."}
                  isBigIcon
                >
                  Compare to Market
                </TooltipTitle>
              </div>
              <ProgressBar
                leftLabel="Low"
                rightLabel="High"
                averageText={`Avg Market (${volatilityAvgMarket}%)`}
                progress={volatilityCompareAvg}
                tooltipText="Volatility"
              />
              <ProgressBar
                leftLabel="Low"
                rightLabel="High"
                averageText={`Avg Market (${drawDownAvgMarket}%)`}
                progress={drawDownCompareAvg}
                tooltipText="Max Drawdown"
              />
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </span>

  <span slot="chart">
    {#if $query.isFetching || $queryBreakdown.isFetching}
      <div class="flex items-center justify-center h-[465px] p-6">
        <LoadingPremium />
      </div>
    {:else}
      <div class="relative h-full">
        {#if $query.isError}
          <div
            class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
              $isDarkMode ? "bg-[#222222e6]" : "bg-white/90"
            }`}
          >
            {#if $typeWallet === "CEX"}
              Not enough data. CEX integration can only get data from the day
              you connect
            {:else}
              Empty
            {/if}
          </div>
        {:else}
          <div class="flex flex-row p-6">
            <AnimateSharedLayout>
              {#each riskTypeChart as type}
                <div
                  class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
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
          <div class="relative mt-3">
            {#if selectedTypeChart === "overview"}
              <EChart
                id="bar-chart-compare-analytic"
                {theme}
                notMerge={true}
                option={optionBar}
                height={465}
              />
            {:else}
              <EChart
                id="bar-chart-compare-analytic"
                {theme}
                notMerge={true}
                option={riskBreakdownChartOption}
                height={465}
              />
            {/if}
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
  </span>
</AnalyticSection>

<style windi:preflights:global windi:safelist:global>
</style>

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
    sharpeRatioColorChart,
  } from "~/utils";
  import maxBy from "lodash/maxBy";
  import minBy from "lodash/minBy";
  import groupBy from "lodash/groupBy";
  import sumBy from "lodash/sumBy";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { createQuery } from "@tanstack/svelte-query";
  import { getChangePercent, getPostionInRange } from "~/chart-utils";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import EChart from "~/components/EChart.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import CtaIcon from "~/components/CtaIcon.svelte";
  import ProgressBar from "~/components/ProgressBar.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";
  import SharpeRatioExplain from "~/assets/explain/sharpe-ratio-explain.mp4";
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
      label: "Shapre Ratio",
      value: "shrapeRatioBreakdown",
    },
  ];

  let data;
  let dataRiskBreakdown;
  let selectedTypeChart = "overview";
  let riskBreakdownData = [];
  let dataShrapeRatioGroup = {};
  let optionScatter = {
    tooltip: {
      trigger: "item",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                <span>${params?.marker}</span> ${params.seriesName}
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  $isDarkMode ? "white" : "black"
                }">
                  Return 
                </div>

                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    params.value[1] >= 0 ? "#05a878" : "#f25f5d"
                  };">
                    ${formatPercent(params.value[1])}%
                  </div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  $isDarkMode ? "white" : "black"
                }">
                  Volatility 
                </div>

                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    $isDarkMode ? "white" : "black"
                  }">
                    ${Number(params.value[0]).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>`;
      },
    },
    legend: {
      data: [],
    },
    xAxis: [
      {
        type: "value",
        axisTick: { show: false },
        name: "Volatility",
        axisLabel: {
          formatter: "{value}%",
          fontSize: autoFontSize(),
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Return",
        axisTick: { show: false },
        axisLabel: {
          formatter: "{value}%",
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
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    $isDarkMode ? "white" : "black"
                  }">
                    ${formatValue(Number(params?.data?.value))}
                  </div>
                </div>
              </div>
              <div style="border-top: 0.8px solid #d1d5db; padding-top: 10px; display: flex; flex-direction: column; gap: 12px;">
                ${dataShrapeRatioGroup[params?.data?.name]
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
            $typeWallet === "KLAY" ||
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
      riskBreakdownData = dataRiskBreakdown;

      const listKey = Object.getOwnPropertyNames(data);
      const legendDataBarChart = (listKey || [])?.map((item) => {
        let data = {
          name: "",
          // itemStyle: {
          //   color: "",
          // },
        };
        switch (item) {
          case "btc":
            data = {
              name: "Bitcoin",
              // itemStyle: {
              //   color: "#f7931a",
              // },
            };
            break;
          case "eth":
            data = {
              name: "Ethereum",
              // itemStyle: {
              //   color: "#547fef",
              // },
            };
            break;
          case "base":
            data = {
              name: "This wallet",
              // itemStyle: {
              //   color: "#00b580",
              // },
            };
            break;
          case "compare":
            data = {
              name: "Compare wallet",
              // itemStyle: {
              //   color: "rgba(178,184,255,1)",
              // },
            };
            break;
        }
        return data;
      });

      const scatterData = (listKey || []).map((item) => {
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
          type: "scatter",
          symbolSize: 30,
          itemStyle: {
            color: custom.color,
          },
          data: [
            [
              Number(data[item].volatility),
              Number(
                getChangePercent(
                  data[item].sparkline?.length - 1
                    ? data[item]?.sparkline[data[item].sparkline?.length - 1]
                    : 0,
                  data[item]?.sparkline ? data[item]?.sparkline[0] : 0
                )
              ),
              // Number(data[item].netWorthChange?.networth30D),
            ],
          ],
        };
      });

      const tokenScatterData = dataRiskBreakdown.map((token) => {
        return {
          name: token.symbol,
          type: "scatter",
          symbolSize: 10,
          data: [[token.volatility, token.change30DPercent]],
        };
      });

      const shrapeRatioGroup = groupBy(
        dataRiskBreakdown,
        (item) => item.sharpeRatioLabel
      );

      dataShrapeRatioGroup = shrapeRatioGroup;

      riskBreakdownChartOption = {
        ...riskBreakdownChartOption,
        color: Object.keys(shrapeRatioGroup)
          .map((riskType) => {
            return {
              name: riskType,
              value: shrapeRatioGroup[riskType][0],
            };
          })
          .map((item) => {
            return sharpeRatioColorChart(item.value.sharpeRatio);
          }),
        series: [
          {
            ...riskBreakdownChartOption.series[0],
            data: Object.keys(shrapeRatioGroup).map((riskType) => {
              return {
                name: riskType,
                value: sumBy(
                  shrapeRatioGroup[riskType],
                  (item) => Number(item.amount) * Number(item.rate)
                ),
              };
            }),
          },
        ],
      };

      optionScatter = {
        ...optionScatter,
        legend: {
          data: legendDataBarChart,
        },
        series: [...scatterData, ...tokenScatterData],
      };
    }
  }

  $: goodPerf = maxBy(riskBreakdownData, (item) => item.change30DPercent);
  $: badPerf = minBy(riskBreakdownData, (item) => item.change30DPercent);
  $: sharpeRatioCompareAvg = getPostionInRange(
    Number(data?.base?.sharpeRatio || 0),
    Number(data?.base?.avgMarket?.minShapreRatio || 0),
    Number(data?.base?.avgMarket?.maxShapreRatio || 0)
  );

  $: sharpeRatioAvgMarket = (
    (Number(data?.base?.avgMarket?.minShapreRatio || 0) +
      Number(data?.base?.avgMarket?.maxShapreRatio || 0)) /
    2
  ).toFixed(2);

  $: theme = $isDarkMode ? "dark" : "white";
</script>

<AnalyticSection>
  <span slot="title">
    <div class="flex justify-start text-4xl font-medium xl:text-2xl">
      Volatility & Returns
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
            <div class="flex flex-col gap-3">
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
                {#if data?.base?.sharpeRatio < 1}
                  <div class="text-2xl xl:text-base">
                    <CtaIcon isGood={false} />
                    <span class="text-red-500"
                      >Your portfolio is not "balance" between risk and return:</span
                    >
                    It has expected yield only
                    <span class="font-medium"
                      >{data?.base?.sharpeRatio?.toFixed(2)}</span
                    >
                    units of profit per <span class="font-medium">1</span> unit of
                    risk.
                  </div>
                {/if}
              </div>
              <div class="flex items-center gap-3">
                {#if badPerf}
                  <div class="rounded-[20px] flex-1 bg_fafafbff px-4 pb-3 pt-5">
                    <div class="xl:text-base text-xl text-[#6E7787FF] relative">
                      <div
                        class="border border-red-500 absolute -top-1 left-0 w-[40px]"
                      />
                      Worse return
                    </div>
                    <div class="text-3xl xl:text-2xl">{badPerf?.symbol}</div>
                    <div class="flex items-center gap-1 text-2xl xl:text-lg">
                      <img
                        src={badPerf?.change30DPercent >= 0
                          ? TrendUp
                          : TrendDown}
                        alt="trend"
                        class="mb-1"
                      />
                      <div
                        class={`${
                          badPerf?.change30DPercent >= 0
                            ? "text-[#00A878]"
                            : "text-red-500"
                        }`}
                      >
                        <TooltipNumber
                          number={Math.abs(badPerf?.change30DPercent || 0)}
                          type="percent"
                        />
                        %
                      </div>
                    </div>
                  </div>
                {/if}

                {#if goodPerf}
                  <div class="rounded-[20px] flex-1 bg_fafafbff px-4 pb-3 pt-5">
                    <div class="xl:text-base text-xl text-[#6E7787FF] relative">
                      <div
                        class="border border-[#00A878] absolute -top-1 left-0 w-[40px]"
                      />
                      Best return
                    </div>
                    <div class="text-3xl xl:text-2xl">{goodPerf?.symbol}</div>
                    <div class="flex items-center gap-1 text-2xl xl:text-lg">
                      <img
                        src={goodPerf?.change30DPercent >= 0
                          ? TrendUp
                          : TrendDown}
                        alt="trend"
                        class="mb-1"
                      />
                      <div
                        class={`${
                          goodPerf?.change30DPercent >= 0
                            ? "text-[#00A878]"
                            : "text-red-500"
                        }`}
                      >
                        <TooltipNumber
                          number={Math.abs(goodPerf?.change30DPercent || 0)}
                          type="percent"
                        />
                        %
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
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
                averageText={`Avg Market (${sharpeRatioAvgMarket})`}
                progress={sharpeRatioCompareAvg}
                lowerIsBetter={false}
                tooltipText="Shapre Ratio"
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
          <div class="flex flex-row p-6 mb-2">
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
          <div class="relative">
            {#if selectedTypeChart === "overview"}
              <EChart
                id="risk-return-chart-analytic"
                {theme}
                notMerge={true}
                option={optionScatter}
                height={465}
              />
            {:else}
              <EChart
                id="risk-return-chart-analytic"
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

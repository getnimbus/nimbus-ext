<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { wallet, chain, typeWallet } from "~/store";
  import { formatCurrency, formatCurrencyV2, getAddressContext } from "~/utils";
  import groupBy from "lodash/groupBy";
  import sumBy from "lodash/sumBy";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { sendMessage } from "webext-bridge";
  import dayjs from "dayjs";
  import {
    calculateVolatility,
    getChangePercent,
    getPostionInRage,
  } from "~/chart-utils";

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

  const riskTypeChart = [
    {
      label: "Overview",
      value: "overview",
    },
    {
      label: "Risk breakdown",
      value: "riskBreakdown",
    },
  ];

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

  let compareData = {};
  let selectedTypeChart = "overview";
  let isLoadingDataCompare = false;
  let isEmptyDataCompare = false;
  let dataRiskGroup = {};
  let errorMsg = "";
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
                      ${formatCurrencyV2(Math.abs(item.value))}
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
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                  <span>${params?.marker}</span> ${params?.data?.name}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px;">
                    $${formatCurrency(Number(params?.data?.value))}
                  </div>
                </div>
              </div>
              <div style="border-top: 0.8px solid #d1d5db; padding-top: 10px; display: flex; flex-direction: column; gap: 12px;">
                ${dataRiskGroup[params?.data?.name]
                  .map((item) => {
                    return `
                      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                        <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: #000;">
                            <img src=${
                              item?.logo ||
                              "https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
                            } alt="" width=20 height=20 style="border-radius: 100%" />
                            ${item?.name} ${
                      item?.symbol ? `(${item?.symbol})` : ""
                    }
                        </div>
                        <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                          <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px;">
                           $${formatCurrency(
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

  const getAnalyticCompare = async () => {
    isLoadingDataCompare = true;
    isEmptyDataCompare = false;
    try {
      const response: any = await nimbus.get(
        `/v2/analysis/${selectedWallet}/compare?compareAddress=${""}`
      );
      if (response && response.data) {
        compareData = response.data;

        const chartDataResponse = await nimbus
          .get(`/v2/analysis/${selectedWallet}/risk-breakdown`)
          .then((res) => res.data);

        const riskGroup = groupBy(
          chartDataResponse,
          (item) => item.volatilityLabel
        );

        // TODO: Break by high, medium, low risk

        dataRiskGroup = riskGroup;

        riskBreakdownChartOption = {
          ...riskBreakdownChartOption,
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

        const listKey = Object.getOwnPropertyNames(response.data);
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
                value: response.data[item].sharpeRatio,
                itemStyle: {
                  color: custom.color,
                },
              },
              {
                value: response.data[item].volatility,
                itemStyle: {
                  color: custom.color,
                },
              },
              {
                value: response.data[item].drawDown,
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

        isLoadingDataCompare = false;
      } else {
        errorMsg = response.error;
        isEmptyDataCompare = true;
        isLoadingDataCompare = false;
      }
    } catch (e) {
      console.log("e: ", e);
      isEmptyDataCompare = true;
      isLoadingDataCompare = false;
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        if (
          getAddressContext(selectedWallet)?.type === "EVM" ||
          typeWalletAddress === "CEX"
        ) {
          getAnalyticCompare();
        }
      }
    }
  }

  $: sharpeRatioCompare = getChangePercent(
    Number(compareData?.base?.sharpeRatio || 0),
    Number(compareData?.btc?.sharpeRatio || 0)
  );

  $: volatilityCompare = getChangePercent(
    Number(compareData?.base?.volatility || 0),
    Number(compareData?.btc?.volatility || 0)
  );

  $: volatilityCompareAvg = getPostionInRage(
    Number(compareData?.base?.volatility || 0),
    Number(compareData?.base?.avgMarket?.minVolality || 0),
    Number(compareData?.base?.avgMarket?.maxVolality || 0)
  );

  $: volatilityAvgMarket = (
    (Number(compareData?.base?.avgMarket?.minVolality || 0) +
      Number(compareData?.base?.avgMarket?.maxVolality || 0)) /
    2
  ).toFixed(2);

  $: drawDownCompare = getChangePercent(
    Number(compareData?.base?.drawDown || 0),
    Number(compareData?.btc?.drawDown || 0)
  );

  $: drawDownCompareAvg = getPostionInRage(
    Number(compareData?.base?.drawDown || 0),
    Number(compareData?.base?.avgMarket?.minDrawDown || 0),
    Number(compareData?.base?.avgMarket?.maxDrawDown || 0)
  );

  $: drawDownAvgMarket = (
    (Number(compareData?.base?.avgMarket?.minDrawDown || 0) +
      Number(compareData?.base?.avgMarket?.maxDrawDown || 0)) /
    2
  ).toFixed(2);
</script>

<AnalyticSection>
  <span slot="title">
    <div class="xl:text-2xl text-4xl font-medium text-black flex justify-start">
      Risks
      <!-- <TooltipTitle tooltipText={"The lower the better"} isBigIcon>
      </TooltipTitle> -->
    </div>
  </span>

  <span slot="overview" class="relative">
    {#if !isLoadingDataCompare}
      <div class="xl:text-xl text-3xl font-medium text-black mb-4">
        Overview
      </div>
    {/if}
    {#if isLoadingDataCompare}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full">
        {#if isEmptyDataCompare}
          <div
            class="absolute top-0 left-0 w-full h-[465px] flex flex-col items-center justify-center text-center gap-3 bg-white/85 z-30 backdrop-blur-md xl:text-xs text-lg"
          >
            {errorMsg}
          </div>
        {:else}
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div
                  class="xl:text-base text-2xl text-black flex justify-start"
                >
                  <TooltipTitle
                    tooltipText={"The Sharpe ratio measures how well an investment performs relative to its risk."}
                    isBigIcon
                  >
                    Sharpe ratio
                  </TooltipTitle>
                </div>
              </div>
              <div class="col-span-1 flex items-center justify-end">
                <div class="xl:text-base text-2xl">
                  <TooltipNumber
                    number={compareData?.base?.sharpeRatio}
                    type="percent"
                  />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div
                  class="xl:text-base text-2xl text-black flex justify-start"
                >
                  <TooltipTitle
                    tooltipText={"Volatility measures the extent of price fluctuations for an asset over time."}
                    isBigIcon
                  >
                    Volatility
                  </TooltipTitle>
                </div>
              </div>
              <div class="col-span-1 flex items-center justify-end">
                <div class="xl:text-base text-2xl">
                  <TooltipNumber
                    number={compareData?.base?.volatility}
                    type="percent"
                  />%
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div
                  class="xl:text-base text-2xl text-black flex justify-start"
                >
                  <TooltipTitle
                    tooltipText={"Max drawdown is the biggest loss experienced by an investment or portfolio."}
                    isBigIcon
                  >
                    Max drawdown
                  </TooltipTitle>
                </div>
              </div>
              <div class="col-span-1 flex items-center justify-end">
                <div class="xl:text-base text-2xl">
                  <TooltipNumber
                    number={compareData?.base?.drawDown}
                    type="percent"
                  />%
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 space-y-3">
            <div class="xl:text-base text-2xl">
              <CtaIcon isGood={sharpeRatioCompare > 0} />
              Sharpe ratio is {sharpeRatioCompare > 0 ? "higher" : "lower"} than
              Bitcoin by
              <strong>{Math.abs(sharpeRatioCompare)}%</strong>
            </div>
            <div class="xl:text-base text-2xl">
              <CtaIcon isGood={volatilityCompare < 0} />
              Volatility is {volatilityCompare > 0 ? "higher" : "lower"} than Bitcoin
              by
              <strong>{Math.abs(volatilityCompare)}%</strong>
            </div>

            <div class="xl:text-base text-2xl">
              <CtaIcon isGood={drawDownCompare < 0} />
              Max Drawdown is {drawDownCompare > 0 ? "higher" : "lower"} than Bitcoin
              by
              <strong>{Math.abs(drawDownCompare)}%</strong>
            </div>

            <!-- <div>
              <div>Meaning</div>
              <ul>
                <li />
              </ul>
            </div> -->
          </div>
          <div class="flex flex-col gap-3 mt-8">
            <div class="xl:text-lg text-2xl font-medium text-black">
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
        {/if}
      </div>
    {/if}
  </span>

  <span slot="chart">
    {#if isLoadingDataCompare}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full">
        {#if isEmptyDataCompare}
          <div
            class="flex justify-center items-center h-full xl:text-xs text-lg h-[465px]"
          >
            {errorMsg}
          </div>
        {:else}
          <div class="flex flex-row">
            <AnimateSharedLayout>
              {#each riskTypeChart as type}
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
              id="bar-chart-compare-analytic"
              theme="white"
              notMerge={true}
              option={selectedTypeChart === "overview"
                ? optionBar
                : riskBreakdownChartOption}
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
  </span>
</AnalyticSection>

<style windi:preflights:global windi:safelist:global>
</style>

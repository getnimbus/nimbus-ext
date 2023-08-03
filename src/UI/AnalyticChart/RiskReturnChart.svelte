<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { chain, wallet } from "~/store";
  import { getAddressContext } from "~/utils";

  import groupBy from "lodash/groupBy";
  import sumBy from "lodash/sumBy";
  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import EChart from "~/components/EChart.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";

  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import Logo from "~/assets/logo-1.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let compareData = {};
  let selectedTypeChart = "overview";
  let riskBreakdownData = [];
  let isLoadingDataCompare = false;
  let optionBar = {
    tooltip: {
      trigger: "item",
      extraCssText: "z-index: 9997",
      // valueFormatter: (value) => `${value}%`,
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                <span>${params?.marker}</span> ${params.seriesName}
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: #000;">
                  Return 
                </div>

                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    params.value[1] >= 0 ? "#05a878" : "#f25f5d"
                  };">
                    ${params.value[1]}%
                  </div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: #000;">
                  Risk 
                </div>

                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${Number(params.value[0]).toFixed(2)}
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
        name: "Risk",
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Return",
        axisTick: { show: false },
        axisLabel: {
          formatter: "{value}%",
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
    try {
      const response: any = await nimbus.get(
        `/v2/analysis/${selectedWallet}/compare?compareAddress=${""}`
      );
      if (response && response.data) {
        compareData = response.data;

        const chartDataResponse = await nimbus
          .get(`/v2/analysis/${selectedWallet}/risk-breakdown`)
          .then((res) => res.data);

        riskBreakdownData = chartDataResponse;

        const listKey = Object.getOwnPropertyNames(response.data);
        const legendDataBarChart = listKey.map((item) => {
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

        const scatterData = listKey.map((item) => {
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
                Number(response.data[item].volatility),
                Number(response.data[item].netWorthChange?.networth30D),
              ],
            ],
          };
        });

        const tokenScatterData = chartDataResponse.map((token) => {
          return {
            name: token.symbol,
            type: "scatter",
            symbolSize: 10,
            data: [[token.volatility, token.change30DPercent]],
          };
        });

        const shrapeRatioGroup = groupBy(
          chartDataResponse,
          (item) => item.sharpeRatioLabel
        );

        riskBreakdownChartOption = {
          ...riskBreakdownChartOption,
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

        optionBar = {
          ...optionBar,
          legend: {
            data: legendDataBarChart,
          },
          series: [...scatterData, ...tokenScatterData],
        };
        isLoadingDataCompare = false;
      }
    } catch (e) {
      console.log("e: ", e);
      isLoadingDataCompare = false;
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        if (getAddressContext(selectedWallet)?.type === "EVM") {
          getAnalyticCompare();
        }
      }
    }
  }

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
</script>

<AnalyticSection>
  <span slot="title">
    <div class="xl:text-2xl text-4xl font-medium text-black flex justify-start">
      Risks & Returns
      <!-- <TooltipTitle tooltipText={"The lower the better"} isBigIcon>
        Risks & Returns
      </TooltipTitle> -->
    </div>
  </span>

  <span slot="overview">
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
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2">
          <div class="col-span-1">
            <div class="xl:text-base text-2xl text-black flex justify-start">
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
            <div class="xl:text-base text-2xl text-black flex justify-start">
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
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div class="col-span-1">
            <div class="xl:text-base text-2xl text-black flex justify-start">
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
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 mt-8">
        <div class="rounded-[20px] flex-1 bg-[#FAFAFBFF] px-4 pb-3 pt-5">
          <div class="xl:text-base text-lg text-[#6E7787FF] relative">
            <div
              class="border border-[#00A878] absolute -top-1 left-0 w-[40px]"
            />
            Best perf
          </div>
          <div class="xl:text-2xl text-3xl">PEPE</div>
          <div class="xl:text-lg text-2xl flex items-center gap-1">
            <img src={TrendUp} alt="trend" class="mb-1" />
            <div class="text-[#00A878]">16%</div>
          </div>
        </div>

        <div class="rounded-[20px] flex-1 bg-[#FAFAFBFF] px-4 pb-3 pt-5">
          <div class="xl:text-base text-lg text-[#6E7787FF] relative">
            <div
              class="border border-red-500 absolute -top-1 left-0 w-[40px]"
            />
            Worse perf
          </div>
          <div class="xl:text-2xl text-3xl">BTC</div>
          <div class="xl:text-lg text-2xl flex items-center gap-1">
            <img src={TrendDown} alt="trend" class="mb-1" />
            <div class="text-red-500">8%</div>
          </div>
        </div>
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
        <div class="flex flex-row mb-2">
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
        {#if compareData && Object.keys(compareData).length === 0}
          <div
            class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
          >
            Empty
          </div>
        {:else}
          <div class="relative">
            <EChart
              id="risk-return-chart-analytic"
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

<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { wallet, chain } from "~/store";
  import { formatCurrencyV2, getAddressContext } from "~/utils";
  import groupBy from "lodash/groupBy";
  import sumBy from "lodash/sumBy";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { sendMessage } from "webext-bridge";
  import dayjs from "dayjs";
  import { calculateVolatility } from "~/chart-utils";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";

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
  let isLoadingDataCompare = false;
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

        const riskGroup = groupBy(
          chartDataResponse,
          (item) => item.volatilityLabel
        );

        // TODO: Break by high, medium, low risk

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

        console.log(riskBreakdownChartOption);

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
      label: "Risk breakdown",
      value: "riskBreakdown",
    },
  ];
</script>

<AnalyticSection>
  <span slot="title">
    <div class="xl:text-2xl text-4xl font-medium text-black flex justify-start">
      Risks
      <!-- <TooltipTitle tooltipText={"The lower the better"} isBigIcon>
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
            <div class=" text-black flex justify-start">
              <TooltipTitle
                tooltipText={"Volatility measures the extent of price fluctuations for an asset over time."}
                isBigIcon
              >
                Volatility
              </TooltipTitle>
            </div>
          </div>
          <div class="col-span-1 flex items-center justify-end">
            <div
              class={`xl:text-base text-2xl ${
                compareData?.base?.volatility < 0
                  ? "text-red-500"
                  : "text-[#00A878]"
              }`}
            >
              <TooltipNumber
                number={Math.abs(compareData?.base?.volatility)}
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
                Max draw down
              </TooltipTitle>
            </div>
          </div>
          <div class="col-span-1 flex items-center justify-end">
            <div
              class={`xl:text-base text-2xl ${
                compareData?.base?.drawDown < 0
                  ? "text-red-500"
                  : "text-[#00A878]"
              }`}
            >
              <TooltipNumber
                number={Math.abs(compareData?.base?.drawDown)}
                type="percent"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8 space-y-3">
        <div class="xl:text-base text-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5 text-[#00A878] inline-block align-text-top"
          >
            <path
              fill-rule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clip-rule="evenodd"
            />
          </svg>
          Volality is lower than Bitcoin by <strong>15%</strong>
        </div>

        <div class="xl:text-base text-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5 text-red-500 inline-block align-text-top"
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
              clip-rule="evenodd"
            />
          </svg>
          Max draw down is higher than Bitcoin by <strong>10%</strong>
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
        {#if compareData && Object.keys(compareData).length === 0}
          <div
            class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
          >
            Empty
          </div>
        {:else}
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

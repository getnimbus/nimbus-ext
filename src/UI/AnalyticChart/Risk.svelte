<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { wallet, chain } from "~/store";
  import { formatCurrency, getAddressContext } from "~/utils";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import EChart from "~/components/EChart.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let compareData = {};
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

  const getAnalyticCompare = async () => {
    isLoadingDataCompare = true;
    try {
      const response: any = await nimbus.get(
        `/v2/analysis/${selectedWallet}/compare?compareAddress=${""}`
      );
      if (response && response.data) {
        compareData = response.data;

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
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        if (getAddressContext(selectedWallet)?.type === "EVM") {
          getAnalyticCompare();
        }
      }
    }
  }
</script>

<AnalyticSection>
  <span slot="title">
    <div class="xl:text-2xl text-4xl font-medium text-black flex justify-start">
      <TooltipTitle tooltipText={"The lower the better"} isBigIcon>
        Risks
      </TooltipTitle>
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
      <div class="flex flex-col gap-5">
        <div class="grid grid-cols-2">
          <div class="col-span-1">
            <div class="xl:text-lg text-xl text-black flex justify-start">
              <TooltipTitle tooltipText={"Hello World"} isBigIcon>
                Sharpe ratio
              </TooltipTitle>
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-1">
            <div
              class={`xl:text-lg text-xl ${
                compareData?.base?.sharpeRatio < 0
                  ? "text-red-500"
                  : "text-[#00A878]"
              }`}
            >
              <TooltipNumber
                number={Math.abs(compareData?.base?.sharpeRatio)}
                type="balance"
              />
            </div>
            {#if compareData?.base?.sharpeRatio < 0}
              <div class="xl:text-lg text-xl text-red-500">⚠️</div>
            {:else}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="none"
                  stroke="#00A878"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                />
              </svg>
            {/if}
          </div>
        </div>
        <div class="grid grid-cols-2">
          <div class="col-span-1">
            <div class="xl:text-lg text-xl text-black flex justify-start">
              <TooltipTitle tooltipText={"Hello World"} isBigIcon>
                Volatility
              </TooltipTitle>
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-1">
            <div
              class={`xl:text-lg text-xl ${
                compareData?.base?.volatility < 0
                  ? "text-red-500"
                  : "text-[#00A878]"
              }`}
            >
              <TooltipNumber
                number={Math.abs(compareData?.base?.volatility)}
                type="balance"
              />
            </div>
            {#if compareData?.base?.volatility < 0}
              <div class="xl:text-lg text-xl text-red-500">⚠️</div>
            {:else}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="none"
                  stroke="#00A878"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                />
              </svg>
            {/if}
          </div>
        </div>
        <div class="grid grid-cols-2">
          <div class="col-span-1">
            <div class="xl:text-lg text-xl text-black flex justify-start">
              <TooltipTitle tooltipText={"Hello World"} isBigIcon>
                Max draw down
              </TooltipTitle>
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-1">
            <div
              class={`xl:text-lg text-xl ${
                compareData?.base?.drawDown < 0
                  ? "text-red-500"
                  : "text-[#00A878]"
              }`}
            >
              <TooltipNumber
                number={Math.abs(compareData?.base?.drawDown)}
                type="balance"
              />
            </div>
            {#if compareData?.base?.drawDown < 0}
              <div class="xl:text-lg text-xl text-red-500">⚠️</div>
            {:else}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="none"
                  stroke="#00A878"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                />
              </svg>
            {/if}
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
        {#if compareData && Object.keys(compareData).length === 0}
          <div
            class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
          >
            Empty
          </div>
        {:else}
          <EChart
            id="bar-chart-compare-analytic"
            theme="white"
            notMerge={true}
            option={optionBar}
            height={465}
          />
        {/if}
      </div>
    {/if}
  </span>
</AnalyticSection>

<style windi:preflights:global windi:safelist:global>
</style>

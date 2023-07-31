<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { wallet, chain } from "~/store";
  import { formatCurrencyV2, getAddressContext } from "~/utils";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import EChart from "~/components/EChart.svelte";
  import { sendMessage } from "webext-bridge";
  import dayjs from "dayjs";
  import { calculateVolatility, getChangePercent } from "~/chart-utils";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

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
      extraCssText: "z-index: 9997",
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      valueFormatter: (value) => `${value}%`,
      // formatter: function (params) {
      //   return `
      //       <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
      //         <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
      //           <span>${params?.marker}</span> ${params.seriesName}
      //         </div>
      //         <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
      //           <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: #000;">
      //             Return
      //           </div>

      //           <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
      //             <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
      //               params.value[1] >= 0 ? "#05a878" : "#f25f5d"
      //             };">
      //               ${params.value[1]}%
      //             </div>
      //           </div>
      //         </div>
      //         <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
      //           <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: #000;">
      //             Risk
      //           </div>

      //           <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
      //             <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px;">
      //               ${Number(params.value[0]).toFixed(2)}
      //             </div>
      //           </div>
      //         </div>
      //       </div>`;
      // },
    },
    // legend: {
    //   data: [],
    // },
    xAxis: [
      {
        type: "time",
        axisTick: { show: false },
        // name: "Risk",
      },
    ],
    yAxis: [
      {
        type: "value",
        // name: "Return",
        axisLabel: {
          formatter: "{value}%",
        },
      },
    ],
    series: [],
  };

  const getAnalyticCompare = async () => {
    isLoadingDataCompare = true;
    try {
      const response: any = await nimbus.get(
        `/v2/analysis/${selectedWallet}/compare?compareAddress=${""}`,
      );
      if (response && response.data) {
        const nameConfig = {
          base: {
            name: "This wallet",
            color: "#f7931a",
          },
          btc: {
            name: "Bitcoin",
            color: "#f7931a",
          },
          eth: {
            name: "Ethereum",
            color: "#547fef",
          },
        };
        const series = Object.keys(response.data).map((key) => {
          const itemData = response.data[key];
          const baseData = itemData.sparkline[0];
          return {
            name: nameConfig[key].name,
            type: "bar",
            barStyle: {
              type: "solid",
              color: nameConfig[key].color,
            },
            emphasis: {
              focus: "series",
            },
            data: itemData.sparkline.map((item, index) => [
              dayjs()
                .startOf("day")
                .subtract(30 - index)
                .valueOf(),
              getChangePercent(item, baseData),
            ]),
          };
        });
        console.log({ series });
        optionBar = {
          ...optionBar,
          // legend: {
          //   data: legendDataBarChart,
          // },
          series: series,
        };

        console.log({ optionBar });
      }
    } catch (e) {
      console.log("e: ", e);
    } finally {
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
</script>

<AnalyticSection>
  <span slot="title">
    <div class="xl:text-2xl text-4xl font-medium text-black flex justify-start">
      Return
      <!-- <TooltipTitle tooltipText={"The lower the better"} isBigIcon>
        Risk & Return
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
          <div class="col-span-1 flex items-center gap-1 justify-end">
            <div
              class={`xl:text-base text-2xl ${
                compareData?.base?.sharpeRatio < 0
                  ? "text-red-500"
                  : "text-[#00A878]"
              }`}
            >
              <TooltipNumber
                number={Math.abs(compareData?.base?.sharpeRatio)}
                type="percent"
              />
            </div>
            {#if compareData?.base?.sharpeRatio < 0}
              <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
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
            <div class="xl:text-base text-2xl text-black flex justify-start">
              <TooltipTitle
                tooltipText={"Volatility measures the extent of price fluctuations for an asset over time."}
                isBigIcon
              >
                Volatility
              </TooltipTitle>
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-1 justify-end">
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
            {#if compareData?.base?.volatility < 0}
              <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
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
            <div class="xl:text-base text-2xl text-black flex justify-start">
              <TooltipTitle
                tooltipText={"Max drawdown is the biggest loss experienced by an investment or portfolio."}
                isBigIcon
              >
                Max draw down
              </TooltipTitle>
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-1 justify-end">
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
            {#if compareData?.base?.drawDown < 0}
              <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
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
        {#if !optionBar.series.length}
          <div
            class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
          >
            Empty
          </div>
        {:else}
          <EChart
            id="return-chart-analytic"
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

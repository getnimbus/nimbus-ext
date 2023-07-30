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
        `/v2/analysis/${selectedWallet}/compare?compareAddress=${""}`
      );
      if (response && response.data) {
        compareData = response.data;

        const tokenHolding = (response.data?.base?.currentHolding || []).map(
          (item) =>
            item.cg_id
              ? `coingecko:${item.cg_id}`
              : `ethereum:${item.contractAddress}`
        );

        // console.log({ tokenHolding });

        const chartDataResponse = await sendMessage("getDefillamaTokenChart", {
          addresses: tokenHolding,
          start: dayjs().startOf("d").subtract(30, "d").unix(),
          span: 30,
        }).then((res) => res?.coins || {});

        // console.log({ chartDataResponse });

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

        const tokenScatterData = Object.keys(chartDataResponse).map((token) => {
          const tokenData = chartDataResponse[token];
          const prices = (tokenData?.prices || []).map((item) => item.price);
          const return30D = getChangePercent(
            prices[prices.length - 1],
            prices[0]
          );

          return {
            name: tokenData.symbol,
            type: "scatter",
            symbolSize: 10,
            // label: {
            //   show: true,
            // },
            data: [[calculateVolatility(prices), return30D]],
          };
        });

        console.log({ tokenScatterData });

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
            <div class="text-black flex justify-start">
              <TooltipTitle
                tooltipText={"The Sharpe ratio measures how well an investment performs relative to its risk."}
                isBigIcon
              >
                Sharpe ratio
              </TooltipTitle>
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-1 justify-end">
            <div>
              <TooltipNumber
                number={Math.abs(compareData?.base?.sharpeRatio)}
                type="percent"
              />
            </div>
          </div>
        </div>
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
          <div class="col-span-1 flex items-center gap-1 justify-end">
            <div>
              <TooltipNumber
                number={Math.abs(compareData?.base?.volatility)}
                type="percent"
              />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2">
          <div class="col-span-1">
            <div class=" text-black flex justify-start">
              <TooltipTitle
                tooltipText={"Max drawdown is the biggest loss experienced by an investment or portfolio."}
                isBigIcon
              >
                Max draw down
              </TooltipTitle>
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-1 justify-end">
            <div>
              <TooltipNumber
                number={Math.abs(compareData?.base?.drawDown)}
                type="percent"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8 space-y-3">
        <div>
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

        <div>
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
        {#if compareData && Object.keys(compareData).length === 0}
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

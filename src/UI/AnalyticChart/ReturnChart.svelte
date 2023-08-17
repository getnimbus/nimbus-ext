<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { wallet, chain, typeWallet } from "~/store";
  import { formatCurrency, formatCurrencyV2, getAddressContext } from "~/utils";
  import { sendMessage } from "webext-bridge";
  import dayjs from "dayjs";
  import { calculateVolatility, getChangePercent } from "~/chart-utils";
  import dayjs from "dayjs";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import EChart from "~/components/EChart.svelte";
  import CheckIcon from "~/components/CheckIcon.svelte";
  import DangerIcon from "~/components/DangerIcon.svelte";
  import CtaIcon from "~/components/CtaIcon.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import Logo from "~/assets/logo-1.svg";

  export let isLoadingDataCompare;
  export let isEmptyDataCompare;
  export let data;

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

  let optionBar = {
    tooltip: {
      extraCssText: "z-index: 9997",
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${dayjs(params[0].axisValueLabel).format("YYYY-MM-DD")}
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
                      ${formatCurrency(Math.abs(item.value))}%
                      <img
                        src=${item.value >= 0 ? TrendUp : TrendDown} 
                        alt=""
                        style="margin-bottom: 4px;"
                      />
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
    xAxis: {
      type: "category",
      axisTick: { show: false },
      splitLine: { show: false },
      axisLine: { show: false },
      axisLabel: { show: false },
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

  $: {
    if (!isEmptyDataCompare && data !== undefined) {
      const nameConfig = {
        base: {
          name: "This wallet",
          color: "#00b580",
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

      const listKey = Object.keys(data);

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
        }
        return data;
      });

      const series = listKey?.map((key) => {
        const itemData = data[key];
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
          data: itemData.sparkline
            .map((item, index) => [
              dayjs()
                .startOf("day")
                .subtract(30 - index)
                .valueOf(),
              getChangePercent(item, baseData),
            ])
            .map((eachData) => eachData[1]),
        };
      });

      const formatXAxis = series[0].data?.map((item) => {
        return dayjs(item[0]).format("YYYY-MM-DD");
      });

      optionBar = {
        ...optionBar,
        legend: {
          data: legendDataBarChart,
        },
        xAxis: {
          ...optionBar.xAxis,
          data: formatXAxis,
        },
        series: series,
      };
    }
  }

  $: sharpeRatioCompare = getChangePercent(
    Number(data?.base?.sharpeRatio || 0),
    Number(data?.btc?.sharpeRatio || 0)
  );

  $: isReturn30Higher =
    data?.base?.netWorthChange?.networth30D >
    data?.btc?.netWorthChange?.networth30D;
</script>

<AnalyticSection>
  <span slot="title">
    <div class="xl:text-2xl text-4xl font-medium text-black flex justify-start">
      Returns
      <!-- <TooltipTitle tooltipText={"The lower the better"} isBigIcon>
        Risks & Returns
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
            {#if typeWalletAddress === "CEX"}
              Not enough data. CEX integration can only get data from the day
              you connect
            {:else}
              Empty
            {/if}
          </div>
        {:else}
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div
                  class="xl:text-base text-2xl text-black flex justify-start"
                >
                  Return 1D
                </div>
              </div>
              <div class="col-span-1 flex items-center justify-end">
                <div class={`xl:text-base text-2xl`}>
                  <span
                    class={`${
                      data?.base?.netWorthChange?.networth1D < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.netWorthChange.networth1D)}
                      type="percent"
                    />%</span
                  > <span class="text-gray-400">/</span>
                  <span
                    class={`${
                      data?.btc?.netWorthChange?.networth1D < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.btc?.netWorthChange.networth1D)}
                      type="percent"
                    />%</span
                  >
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div
                  class="xl:text-base text-2xl text-black flex justify-start"
                >
                  Return 7D
                </div>
              </div>
              <div class="col-span-1 flex items-center justify-end">
                <div class={`xl:text-base text-2xl`}>
                  <span
                    class={`${
                      data?.base?.netWorthChange?.networth7D < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.netWorthChange.networth7D)}
                      type="percent"
                    />%</span
                  > <span class="text-gray-400">/</span>
                  <span
                    class={`${
                      data?.btc?.netWorthChange?.networth7D < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.btc?.netWorthChange.networth7D)}
                      type="percent"
                    />%</span
                  >
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div
                  class="xl:text-base text-2xl text-black flex justify-start"
                >
                  Return 30D
                </div>
              </div>
              <div class="col-span-1 flex items-center justify-end">
                <div class={`xl:text-base text-2xl`}>
                  <span
                    class={`${
                      data?.base?.netWorthChange?.networth30D < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.netWorthChange.networth30D)}
                      type="percent"
                    />%</span
                  > <span class="text-gray-400">/</span>
                  <span
                    class={`${
                      data?.btc?.netWorthChange?.networth30D < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.btc?.netWorthChange.networth30D)}
                      type="percent"
                    />%</span
                  >
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div
                  class="xl:text-base text-2xl text-black flex justify-start"
                >
                  Return 1Y
                </div>
              </div>
              <div class="col-span-1 flex items-center justify-end">
                <div class={`xl:text-base text-2xl`}>
                  <span
                    class={`${
                      data?.base?.netWorthChange?.networth1Y < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.netWorthChange.networth1Y)}
                      type="percent"
                    />%</span
                  > <span class="text-gray-400">/</span>
                  <span
                    class={`${
                      data?.btc?.netWorthChange?.networth1Y < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.btc?.netWorthChange.networth1Y)}
                      type="percent"
                    />%</span
                  >
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div
                  class="xl:text-base text-2xl text-black flex justify-start"
                >
                  Return Lifetime
                </div>
              </div>
              <div class="col-span-1 flex items-center justify-end">
                <div class={`xl:text-base text-2xl`}>
                  <span
                    class={`${
                      data?.base?.changeLF?.portfolioChange < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.changeLF.portfolioChange)}
                      type="percent"
                    />%</span
                  > <span class="text-gray-400">/</span>
                  <span
                    class={`${
                      data?.base?.changeLF?.btcChange < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.changeLF.btcChange)}
                      type="percent"
                    />%</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 space-y-3">
            <div class="xl:text-base text-2xl">
              <CtaIcon isGood={isReturn30Higher} />
              30D return is {isReturn30Higher ? "higher" : "lower"} than Bitcoin
              by
              <span class="font-medium"
                >{Math.abs(
                  data?.base?.netWorthChange?.networth30D -
                    data?.btc?.netWorthChange?.networth30D
                ).toFixed(2)}%</span
              >
            </div>
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
            {#if typeWalletAddress === "CEX"}
              Not enough data. CEX integration can only get data from the day
              you connect
            {:else}
              Empty
            {/if}
          </div>
        {:else}
          <div class="relative">
            <EChart
              id="return-chart-analytic"
              theme="white"
              notMerge={true}
              option={optionBar}
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

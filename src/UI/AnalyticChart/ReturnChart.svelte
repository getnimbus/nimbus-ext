<script lang="ts">
  import { nimbus } from "~/lib/network";
  import {
    wallet,
    chain,
    typeWallet,
    selectedPackage,
    isDarkMode,
  } from "~/store";
  import { autoFontSize, formatPercent } from "~/utils";
  import dayjs from "dayjs";
  import { calculateVolatility, getChangePercent } from "~/chart-utils";
  import { createQuery } from "@tanstack/svelte-query";

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
  import LogoWhite from "~/assets/logo-white.svg";

  export let address;
  export let isShowSoon;
  export let selectedTimeFrame;
  export let isSync = false;
  export let enabledFetchAllData = false;

  $: isFetch = isSync ? enabledFetchAllData : true;

  let data;
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
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${dayjs(params[0].axisValueLabel).format("YYYY-MM-DD")}
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
                      item.value[1] >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      ${formatPercent(Math.abs(item.value[1]))}%
                      <img
                        src=${item.value[1] >= 0 ? TrendUp : TrendDown} 
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
    toolbox: {
      right: "4%",
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
      },
    },
    legend: {
      data: [],
    },
    xAxis: {
      type: "time",
      axisLabel: {
        fontSize: autoFontSize(),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}%",
        fontSize: autoFontSize(),
      },
    },
    series: [],
  };

  const getAnalyticCompare = async (address: string, timeFrame: string) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/compare?compareAddress=${""}&timeRange=${timeFrame}`
    );
    return response?.data || [];
  };

  $: enabledQuery =
    $wallet === "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0"
      ? true
      : Boolean(
          ($typeWallet === "EVM" ||
            $typeWallet === "MOVE" ||
            $typeWallet === "CEX" ||
            $typeWallet === "SOL" ||
            $typeWallet === "TON" ||
            $typeWallet === "AURA" ||
            $typeWallet === "ALGO" ||
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

  $: {
    if ($query.data) {
      data = $query.data;
    }
  }

  $: {
    if (!$query.isError && data !== undefined) {
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
        }
        return data;
      });

      const series = (listKey || [])?.map((key) => {
        const itemData = data[key];
        const valueField = key === "base" ? "networth" : "price";
        const baseData = itemData.holdingHistory[0];
        return {
          name: nameConfig[key].name,
          type: "bar",
          itemStyle: {
            type: "solid",
            color: nameConfig[key].color,
          },
          emphasis: {
            focus: "series",
          },
          data: itemData.holdingHistory.map((item, index) => [
            item.timestamp * 1000,
            getChangePercent(
              (itemData.holdingHistory?.[index - 1] || baseData)[valueField],
              baseData[valueField]
            ),
          ]),
        };
      });

      optionBar = {
        ...optionBar,
        legend: {
          data: legendDataBarChart,
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

  $: theme = $isDarkMode ? "dark" : "white";
</script>

<AnalyticSection {address} {isShowSoon}>
  <span slot="title">
    <div class="flex justify-start text-4xl font-medium xl:text-2xl">
      <TooltipTitle
        tooltipText={"Approximate daily profit & loss based on current token holdings"}
        isBigIcon
      >
        Daily PnL
      </TooltipTitle>
    </div>
  </span>

  <span slot="overview" class="relative">
    {#if !$query.isFetching && !$query.isError}
      <div class="mb-4 text-3xl font-medium xl:text-xl px-6 pt-6">Overview</div>
    {/if}
    {#if $query.isFetching}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full relative min-h-[465px]">
        {#if $query.isError}
          <div
            class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
              $isDarkMode ? "bg-black/90" : "bg-white/95"
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
          <div class="flex flex-col gap-8 px-6 pb-6">
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-base">
                    Return 1D
                  </div>
                </div>
                <div class="flex items-center justify-end col-span-1">
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
                  <div class="flex justify-start text-2xl xl:text-base">
                    Return 7D
                  </div>
                </div>
                <div class="flex items-center justify-end col-span-1">
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
                  <div class="flex justify-start text-2xl xl:text-base">
                    Return 30D
                  </div>
                </div>
                <div class="flex items-center justify-end col-span-1">
                  <div class={`xl:text-base text-2xl`}>
                    <span
                      class={`${
                        data?.base?.netWorthChange?.networth30D < 0
                          ? "text-red-500"
                          : "text-[#00A878]"
                      }`}
                    >
                      <TooltipNumber
                        number={Math.abs(
                          data?.base?.netWorthChange.networth30D
                        )}
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
                  <div class="flex justify-start text-2xl xl:text-base">
                    Return 1Y
                  </div>
                </div>
                <div class="flex items-center justify-end col-span-1">
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

              <!-- <div class="grid grid-cols-2">
                <div class="col-span-1">
                  <div class="flex justify-start text-2xl xl:text-base">
                    Return Lifetime
                  </div>
                </div>
                <div class="flex items-center justify-end col-span-1">
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
              </div> -->
            </div>
            <div class="space-y-3">
              <div class="text-2xl xl:text-base">
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
          </div>
        {/if}
      </div>
    {/if}
  </span>

  <span slot="chart">
    {#if $query.isFetching}
      <div class="flex items-center justify-center h-[465px] p-6">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full relative">
        {#if $query.isError}
          <div
            class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
              $isDarkMode ? "bg-black/90" : "bg-white/95"
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
          <div class="relative p-6">
            <EChart
              id="return-chart-analytic"
              {theme}
              notMerge={true}
              option={optionBar}
              height={465}
            />
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

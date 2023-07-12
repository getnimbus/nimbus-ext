<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";
  import dayjs from "dayjs";
  import { groupBy, intersection, flatten } from "lodash";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { formatCurrency, getAddressContext, typeList } from "~/utils";

  import type { AnalyticSectorGrowthRes } from "~/types/AnalyticSectorGrowthData";

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

  let selectedType: "category" | "sector" | "rank" = "category";
  let isLoadingSectorGrowth = false;
  let isEmptySectorGrowth = false;
  let dataSector;
  let dataCategory;
  let dataRank;

  let optionLine = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 350px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="font-weight: 500; font-size: 14px; line-height: 12px; color: black; display: flex; align-items: centers; gap: 6px;">
                      ${item.marker}
                      ${item.seriesName}
                    </div>
                    <div style="display:flex; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: #000;">
                      $${formatCurrency(item.value)}
                    </div>
                  </div>`;
                })
                .join("")}
            </div>`;
      },
    },
    legend: {
      lineStyle: {
        type: "solid",
      },
      data: [],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [],
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "${value}",
      },
    },
    series: [],
  };

  const handleFormatDataLineChart = (data, type) => {
    const formatXAxis = data?.map((item) => {
      return dayjs(item.date * 1000).format("DD MMM YYYY");
    });

    const groupData = data?.map((item) => {
      return {
        date: item.date,
        data: groupBy(item.holding, type),
        keys: Object.getOwnPropertyNames(groupBy(item.holding, type)),
      };
    });

    const eachDataKeys = intersection(
      flatten(groupData?.map((item) => item.keys))
    );

    const formatData = eachDataKeys.map((key) => {
      return {
        name: key,
        type: "line",
        data: groupData.map((item) => {
          const sumValue = item.data[key].reduce(
            (prev, item) => prev + Number(item.value),
            0
          );
          return {
            value: sumValue,
          };
        }),
      };
    });

    return {
      series: formatData,
      formatXAxis,
      legend: eachDataKeys.map((item) => {
        return {
          name: item,
        };
      }),
    };
  };

  const getSectorGrowth = async () => {
    if (getAddressContext(selectedWallet).type === "EVM") {
      isLoadingSectorGrowth = true;
      try {
        const response: AnalyticSectorGrowthRes = await sendMessage(
          "getSectorGrowth",
          {
            address: selectedWallet,
            chain: selectedChain,
            // fromDate: "YYYY-MM-DD",
            // toDate: "YYYY-MM-DD",
          }
        );

        if (response === undefined) {
          isEmptySectorGrowth = true;
          isLoadingSectorGrowth = false;
          return;
        } else if (selectedWallet === response?.address) {
          if (response?.result?.length === 0) {
            isEmptySectorGrowth = true;
            isLoadingSectorGrowth = false;
            return;
          }

          dataSector = handleFormatDataLineChart(response.result, "sector");
          dataCategory = handleFormatDataLineChart(response.result, "category");
          dataRank = handleFormatDataLineChart(response.result, "rank");

          isLoadingSectorGrowth = false;
        } else {
          isEmptySectorGrowth = true;
          isLoadingSectorGrowth = false;
        }
      } catch (e) {
        console.log("error: ", e);
        isLoadingSectorGrowth = false;
        isEmptySectorGrowth = true;
      }
    }
  };

  $: {
    if (selectedType) {
      if (dataRank && dataCategory && dataSector) {
        if (selectedType === "sector") {
          optionLine = {
            ...optionLine,
            legend: {
              ...optionLine.legend,
              data: dataSector.legend,
            },
            xAxis: {
              ...optionLine.xAxis,
              data: dataSector.formatXAxis,
            },
            series: dataSector.series,
          };
        }
        if (selectedType === "rank") {
          optionLine = {
            ...optionLine,
            legend: {
              ...optionLine.legend,
              data: dataRank.legend,
            },
            xAxis: {
              ...optionLine.xAxis,
              data: dataRank.formatXAxis,
            },
            series: dataRank.series,
          };
        }
        if (selectedType === "category") {
          optionLine = {
            ...optionLine,
            legend: {
              ...optionLine.legend,
              data: dataCategory.legend,
            },
            xAxis: {
              ...optionLine.xAxis,
              data: dataCategory.formatXAxis,
            },
            series: dataCategory.series,
          };
        }
      }
    }
  }

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        getSectorGrowth();
      }
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div class="flex justify-between">
    <div class="text-xl font-medium text-black">Sector Growth</div>
    <div class="flex items-center gap-1">
      <AnimateSharedLayout>
        {#each typeList as type}
          <div
            class="relative cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all"
            on:click={() => (selectedType = type.value)}
          >
            <div
              class={`relative z-20 ${
                selectedType === type.value && "text-white"
              }`}
            >
              {type.label}
            </div>
            {#if type.value === selectedType}
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
  </div>
  <div class="mt-2">
    {#if isLoadingSectorGrowth}
      <div class="flex items-center justify-center h-[465px]">
        <loading-icon />
      </div>
    {:else}
      <div class="h-full">
        {#if isEmptySectorGrowth}
          <div
            class="flex justify-center items-center h-full text-lg text-gray-400 h-[465px]"
          >
            Empty
          </div>
        {:else}
          <div class="relative">
            <EChart
              id="sector-growth"
              theme="white"
              option={optionLine}
              height={465}
              notMerge={true}
            />
            <div
              class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 top-1/2 left-1/2"
            >
              <img src={Logo} alt="" width="140" height="140" />
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

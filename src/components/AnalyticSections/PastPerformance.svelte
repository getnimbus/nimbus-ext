<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";
  import dayjs from "dayjs";
  import { groupBy, intersection, flatten } from "lodash";
  import { formatCurrencyV2 } from "~/utils";

  import EChart from "~/components/EChart.svelte";
  import DateRangePicker from "~/components/DateRangePicker.svelte";

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
        console.log("params: ", params);
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              ${params.map((item) => {
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="font-weight: 500; font-size: 14px; line-height: 12px; color: black; display: flex; align-items: centers; gap: 6px;">
                      ${item.marker}
                      ${item.seriesName}
                    </div>
                    <div style="display:flex; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: #000;">
                      ${formatCurrencyV2(Math.abs(item.value))}
                    </div>
                  </div>`;
              })}
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
        formatter: "{value}",
      },
    },
    series: [],
  };

  const handleFormatDataLineChart = (data, type) => {
    const formatXAxis = data.map((item) => {
      return dayjs(item.date * 1000).format("DD MMM YYYY");
    });

    const groupData = data.map((item) => {
      return {
        date: item.date,
        data: groupBy(item.holding, type),
        keys: Object.getOwnPropertyNames(groupBy(item.holding, type)),
      };
    });

    const eachDataKeys = intersection(
      flatten(groupData.map((item) => item.keys))
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
    isLoadingSectorGrowth = true;
    try {
      const response = await sendMessage("getSectorGrowth", {
        address: selectedWallet,
        chain: selectedChain,
      });

      if (selectedWallet === response.address) {
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
  };

  const handleGetDateRange = (data) => {
    console.log(data);
  };

  $: {
    if (selectedType) {
      if (dataRank && dataCategory && dataSector) {
        switch (selectedType) {
          case "sector":
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
            break;
          case "rank":
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
            break;
          default:
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
        console.log("optionLine: ", optionLine);
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
  <div class="flex justify-between items-center border-b-[1px] mb-6 pb-4">
    <div class="text-2xl font-medium text-black">Past Performance</div>
    <DateRangePicker onChange={handleGetDateRange} />
  </div>
  <div>
    <div class="border border-[#0000001a] rounded-[20px] p-6">
      <div class="flex justify-between">
        <div class="font-medium text-black text-xl">Sector Growth</div>
        <div class="flex items-center gap-1">
          <div
            class={`cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all ${
              selectedType === "category" && "bg-[#1E96FC] text-white"
            }`}
            on:click={() => (selectedType = "category")}
          >
            Category
          </div>
          <div
            class={`cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all ${
              selectedType === "sector" && "bg-[#1E96FC] text-white"
            }`}
            on:click={() => (selectedType = "sector")}
          >
            Sector
          </div>
          <div
            class={`cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all ${
              selectedType === "rank" && "bg-[#1E96FC] text-white"
            }`}
            on:click={() => (selectedType = "rank")}
          >
            Token Rank
          </div>
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
              <EChart
                id="line-chart"
                theme="white"
                option={optionLine}
                height={465}
              />
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

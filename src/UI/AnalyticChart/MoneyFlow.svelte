<script lang="ts">
  import { groupBy, intersection, flatten, sumBy } from "lodash";
  import { wallet, chain, typeWallet, isDarkMode } from "~/store";
  import { autoFontSize, formatCurrency, formatValue } from "~/utils";
  import dayjs from "dayjs";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import numeral from "numeral";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  export let address;
  export let isShowSoon;
  export let packageSelected;
  export let selectedTimeFrame;
  export let isSync = false;
  export let enabledFetchAllData = false;

  $: isFetch = isSync ? enabledFetchAllData : true;

  const listDirection = ["inflow", "outflow"];

  let sumData = {
    inflow: 0,
    outflow: 0,
  };

  let option = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 350px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${dayjs(params[0].axisValue).format("YYYY-MM-DD")}
              </div>
              ${params
                .map((item) => {
                  return `
                  <div style="display: flex; align-items: center; justify-content: space-between; ${
                    item.seriesName.toLowerCase() === "netflow" &&
                    "border-top: 0.8px solid #d1d5db; padding-top: 10px;"
                  }">
                    <div style="font-weight: 500; font-size: 14px; line-height: 12px; display: flex; align-items: centers; gap: 6px; color: ${
                      $isDarkMode ? "white" : "black"
                    }">
                          ${item.marker}
                          ${item.seriesName}
                        </div>
                        <div style="display:flex; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                          item.value[1] >= 0 ? "#05a878" : "#f25f5d"
                        };">
                          ${formatValue(Math.abs(item.value[1]))}
                        </div>
                  </div>`;
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
      top: "5%",
      left: "center",
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
        formatter: function (value, index) {
          return (
            `${value < 0 ? "-" : ""} $` +
            numeral(Math.abs(value)).format("0.00a")
          );
        },
        fontSize: autoFontSize(),
      },
    },
    grid: [{ right: "5%" }],
    series: [],
  };

  // const formatDataTypeBaseOnInOutFlow = (data, direction, listType) => {
  //   const sortDataByInOutFlow = listDirection.map((item) => {
  //     return {
  //       type: item,
  //       data: data?.map((data) => {
  //         return data.changes[item] !== undefined
  //           ? {
  //               dataChanges: Object.getOwnPropertyNames(
  //                 groupBy(data.changes[item], "type")
  //               ).map((key) => {
  //                 return {
  //                   key,
  //                   data: groupBy(data.changes[item], "type")[key],
  //                 };
  //               }),
  //             }
  //           : 0;
  //       }),
  //     };
  //   });

  //   const formatData = listType.map((type) => {
  //     return {
  //       name: type,
  //       stack: direction,
  //       data: sortDataByInOutFlow
  //         .filter((item) => item.type === direction)[0]
  //         .data.map((item) => {
  //           if (item === 0) {
  //             return 0;
  //           } else {
  //             return item.dataChanges.filter((data) => data.key === type);
  //           }
  //         }),
  //     };
  //   });

  //   return formatData.map((item) => {
  //     return {
  //       ...item,
  //       type: "bar",
  //       emphasis: {
  //         itemStyle: {
  //           shadowBlur: 10,
  //           shadowColor: "rgba(0,0,0,0.3)",
  //         },
  //       },
  //       data: item.data.map((eachData) => {
  //         if (eachData.length === 0 || eachData === 0) {
  //           return 0;
  //         } else {
  //           return eachData[0].data.reduce(
  //             (prev, item) =>
  //               prev + Number(item?.amount) * Number(item?.price?.price),
  //             0
  //           );
  //         }
  //       }),
  //     };
  //   });
  // };

  const getInflowOutflow = async (
    address: string,
    chain: string,
    timeFrame: string
  ) => {
    const response = await nimbus.get(
      `/v2/analysis/${address}/inflow-outflow?chain=${chain}&timeRange=${timeFrame}`
    );
    return response.data;
  };

  const formatDataInflowOutFlow = (data) => {
    if (data.length !== 0) {
      const groupByDirectionData = data?.map((item) => {
        return {
          ...item,
          changes: groupBy(item.changes, "direction"),
          keys: Object.getOwnPropertyNames(groupBy(item.changes, "direction")),
        };
      });

      const listType = ["Inflow", "Outflow"];

      const inflowData = [
        {
          stack: "inflow",
          type: "bar",
          name: "Inflow",
          data: groupByDirectionData.map((item) => [
            item.timestamp * 1000,
            sumBy(
              item.changes.inflow,
              (row) => Number(row.amount) * Number(row.price?.price || 0)
            ),
          ]),
        },
      ];

      const outflowData = [
        {
          stack: "outflow",
          type: "bar",
          name: "Outflow",
          data: groupByDirectionData.map((item) => [
            item.timestamp * 1000,
            sumBy(
              item.changes.outflow,
              (row) => Number(row.amount) * Number(row.price?.price || 0)
            ) * -1,
          ]),
        },
      ];

      const formatDataInflow =
        inflowData[0]?.data.map((item, index) => {
          return {
            time: item[0],
            value: item[1],
          };
        }) || [];

      const formatDataOutflow =
        outflowData[0]?.data.map((item, index) => {
          return item[1];
        }) || [];

      sumData = {
        inflow: formatDataInflow.reduce((prev, item) => prev + item.value, 0),
        outflow: formatDataOutflow.reduce((prev, item) => prev + item, 0),
      };

      const dataNetflow = [];
      for (let i = 0; i < formatDataInflow.length; i++) {
        const sum = formatDataInflow[i].value + formatDataOutflow[i];
        dataNetflow.push({
          time: formatDataInflow[i].time,
          value: sum,
        });
      }

      const formatDataNetflow = dataNetflow.map((item) => {
        return {
          value: [item.time, item.value],
          itemStyle: {
            color: "rgba(0,169,236, 0.8)",
          },
        };
      });

      option = {
        ...option,
        legend: {
          ...option.legend,
          data: listType,
        },
        series: [
          ...inflowData,
          ...outflowData,
          {
            name: "Netflow",
            type: "line",
            showSymbol: false,
            data: formatDataNetflow,
            lineStyle: {
              color: "rgba(0,169,236, 0.8)",
            },
          },
        ],
      };
    } else {
      sumData = {
        inflow: 0,
        outflow: 0,
      };
      option = {
        tooltip: {
          trigger: "axis",
          extraCssText: "z-index: 9997",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params) {
            return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 350px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${dayjs(params[0].axisValue).format("YYYY-MM-DD")}
              </div>
              ${params
                .map((item) => {
                  return `
                  <div style="display: flex; align-items: center; justify-content: space-between; ${
                    item.seriesName.toLowerCase() === "netflow" &&
                    "border-top: 0.8px solid #d1d5db; padding-top: 10px;"
                  }">
                    <div style="font-weight: 500; font-size: 14px; line-height: 12px; display: flex; align-items: centers; gap: 6px; color: ${
                      $isDarkMode ? "white" : "black"
                    }">
                          ${item.marker}
                          ${item.seriesName}
                        </div>
                        <div style="display:flex; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                          item.value[1] >= 0 ? "#05a878" : "#f25f5d"
                        };">
                          ${formatValue(Math.abs(item.value[1]))}
                        </div>
                  </div>`;
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
          top: "5%",
          left: "center",
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
            formatter: function (value, index) {
              return (
                `${value < 0 ? "-" : ""} $` +
                numeral(Math.abs(value)).format("0.00a")
              );
            },
            fontSize: autoFontSize(),
          },
        },
        grid: [{ right: "5%" }],
        series: [],
      };
    }
  };

  $: query = createQuery({
    queryKey: ["inflow-outflow", $wallet, $chain, selectedTimeFrame],
    enabled: enabledQuery && isFetch,
    queryFn: () => getInflowOutflow($wallet, $chain, selectedTimeFrame),
    staleTime: Infinity,
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      formatDataInflowOutFlow($query.data);
    }
  }

  $: enabledQuery =
    $wallet === "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0"
      ? true
      : Boolean(
          ($typeWallet === "EVM" ||
            $typeWallet === "MOVE" ||
            $typeWallet === "CEX" ||
            $typeWallet === "SOL" ||
            $typeWallet === "AURA" ||
            $typeWallet === "ALGO" ||
            $typeWallet === "BUNDLE") &&
            $wallet.length !== 0 &&
            packageSelected !== "FREE"
        );

  $: theme = $isDarkMode ? "dark" : "white";
</script>

<AnalyticSection {address} {isShowSoon}>
  <span slot="title">
    <div class="flex justify-start text-4xl font-medium xl:text-2xl">
      Money flow
    </div>
  </span>

  <span slot="overview">
    <div class="relative h-full">
      {#if !$query.isFetching}
        <div class="mb-4 text-3xl font-medium xl:text-xl px-6 pt-6">
          Overview
        </div>
      {/if}
      {#if $query.isFetching}
        <div class="flex items-center justify-center h-[465px]">
          <LoadingPremium />
        </div>
      {:else}
        <div class="flex flex-col gap-4 px-6 pb-6">
          <div class="grid grid-cols-2">
            <div class="col-span-1">
              <div class="flex justify-start text-2xl xl:text-base">
                {selectedTimeFrame} Money Inflow
              </div>
            </div>
            <div
              class="flex items-center justify-end col-span-1 gap-1 xl:text-base text-2xl"
            >
              <TooltipNumber number={Math.abs(sumData.inflow)} type="value" />
            </div>
          </div>
          <div class="grid grid-cols-2">
            <div class="col-span-1">
              <div class="flex justify-start text-2xl xl:text-base">
                {selectedTimeFrame} Money Outflow
              </div>
            </div>
            <div
              class="flex items-center justify-end col-span-1 gap-1 xl:text-base text-2xl"
            >
              <TooltipNumber number={Math.abs(sumData.outflow)} type="value" />
            </div>
          </div>
          <div class="grid grid-cols-2">
            <div class="col-span-1">
              <div class="flex justify-start text-2xl xl:text-base">
                {selectedTimeFrame} Money Netflow
              </div>
            </div>
            <div
              class={`flex items-center justify-end col-span-1 xl:text-base text-2xl ${
                sumData.inflow + sumData.outflow >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
              }`}
            >
              {#if sumData.inflow + sumData.outflow < 0}-{/if}
              <TooltipNumber
                number={Math.abs(sumData.inflow + sumData.outflow)}
                type="value"
              />
            </div>
          </div>
        </div>
      {/if}
      {#if $typeWallet === "SOL" || $typeWallet === "AURA" || $typeWallet === "ALGO"}
        <div
          class={`absolute top-0 left-0 rounded-[20px] z-30 w-full h-full flex items-center justify-center z-10 backdrop-blur-md ${
            $isDarkMode ? "bg-black/90" : "bg-white/95"
          }`}
        >
          <div class="text-2xl xl:text-lg">Coming soon 🚀</div>
        </div>
      {/if}
    </div>
  </span>

  <span slot="chart">
    <div class="relative">
      {#if $query.isFetching}
        <div class="flex items-center justify-center h-[465px] p-6">
          <LoadingPremium />
        </div>
      {:else}
        <div class="h-full relative min-h-[465px]">
          {#if $query.isError || ($query.data && $query.data.length === 0)}
            <div
              class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
                $isDarkMode ? "bg-black/90" : "bg-white/95"
              }`}
            >
              Empty
            </div>
          {:else}
            <div class="relative p-6">
              <EChart
                id="inflow-outflow"
                {theme}
                {option}
                height={465}
                notMerge={true}
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
      {#if $typeWallet === "SOL" || $typeWallet === "AURA" || $typeWallet === "ALGO"}
        <div
          class={`absolute top-0 left-0 rounded-[20px] z-30 w-full h-full flex items-center justify-center z-10 backdrop-blur-md ${
            $isDarkMode ? "bg-black/90" : "bg-white/95"
          }`}
        >
          <div class="text-2xl xl:text-lg">Coming soon 🚀</div>
        </div>
      {/if}
    </div>
  </span>
</AnalyticSection>

<style windi:preflights:global windi:safelist:global>
</style>

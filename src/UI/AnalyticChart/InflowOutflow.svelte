<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";
  import { groupBy, intersection, flatten } from "lodash";
  import dayjs from "dayjs";

  import EChart from "~/components/EChart.svelte";
  import { formatCurrencyV2 } from "~/utils";

  const listDirection = ["inflow", "outflow"];

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let isLoadingInflowOutflow = false;
  let isEmptyInflowOutflow = false;

  let option = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 250px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  if (item.value) {
                    return `
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="font-weight: 500; font-size: 14px; line-height: 12px; color: black; display: flex; align-items: centers; gap: 6px;">
                      ${item.marker}
                      ${item.seriesName}
                    </div>
                    <div style="display:flex; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      item.value >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      $${formatCurrencyV2(Math.abs(item.value))}
                    </div>
                  </div>`;
                  }
                })
                .join("")}
            </div>`;
      },
    },
    legend: {
      data: [],
      top: "5%",
      left: "center",
    },
    xAxis: {
      data: [],
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "${value}",
      },
    },
    grid: [{ right: "5%" }],
    series: [],
  };

  const formatDataTypeBaseOnInOutFlow = (data, direction, listType) => {
    const sortDataByInOutFlow = listDirection.map((item) => {
      return {
        type: item,
        data: data.map((data) => {
          return data.changes[item] !== undefined
            ? {
                dataChanges: Object.getOwnPropertyNames(
                  groupBy(data.changes[item], "type")
                ).map((key) => {
                  return {
                    key,
                    data: groupBy(data.changes[item], "type")[key],
                  };
                }),
              }
            : 0;
        }),
      };
    });

    const formatData = listType.map((type) => {
      return {
        name: type,
        stack: direction,
        data: sortDataByInOutFlow
          .filter((item) => item.type === direction)[0]
          .data.map((item) => {
            if (item === 0) {
              return 0;
            } else {
              return item.dataChanges.filter((data) => data.key === type);
            }
          }),
      };
    });

    return formatData.map((item) => {
      return {
        ...item,
        type: "bar",
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
        data: item.data.map((eachData) => {
          if (eachData.length === 0 || eachData === 0) {
            return 0;
          } else {
            return eachData[0].data.reduce(
              (prev, item) =>
                prev + Number(item?.amount) * Number(item?.price?.price),
              0
            );
          }
        }),
      };
    });
  };

  const getInflowOutflow = async () => {
    isLoadingInflowOutflow = true;
    try {
      const response: any = await sendMessage("getInflowOutflow", {
        address: selectedWallet,
        chain: selectedChain,
        // fromDate: "YYYY-MM-DD",
        // toDate: "YYYY-MM-DD",
      });

      if (selectedWallet === response.address) {
        if (response?.result?.length === 0) {
          isEmptyInflowOutflow = true;
          isLoadingInflowOutflow = false;
          return;
        }

        const formatXAxis = response?.result.map((item) => {
          return dayjs(item.timestamp * 1000).format("DD MMM YYYY");
        });

        const groupByDirectionData = response.result.map((item) => {
          return {
            ...item,
            changes: groupBy(item.changes, "direction"),
            keys: Object.getOwnPropertyNames(
              groupBy(item.changes, "direction")
            ),
          };
        });

        const groupByTypeData = response.result.map((item) => {
          return {
            keys: Object.getOwnPropertyNames(groupBy(item.changes, "type")),
          };
        });

        const listType = intersection(
          flatten(groupByTypeData.map((item) => item.keys))
        );

        const inflowData = formatDataTypeBaseOnInOutFlow(
          groupByDirectionData,
          listDirection[0],
          listType
        );

        const outflowData = formatDataTypeBaseOnInOutFlow(
          groupByDirectionData,
          listDirection[1],
          listType
        );

        const formatOutflowData = outflowData.map((item) => {
          return {
            ...item,
            data: item.data.map((data) => {
              if (data !== 0) {
                return data * -1;
              }
              return 0;
            }),
          };
        });

        const sumDataInflow = inflowData[0]?.data.map((data, index) => {
          return inflowData.reduce((prev, item) => prev + item.data[index], 0);
        });

        const sumDataOutflow = formatOutflowData[0]?.data.map((data, index) => {
          return formatOutflowData.reduce(
            (prev, item) => prev + item.data[index],
            0
          );
        });

        const dataNetflow = [];
        for (let i = 0; i < sumDataInflow.length; i++) {
          const sum = sumDataInflow[i] + sumDataOutflow[i];
          dataNetflow.push(sum);
        }

        const formatDataNetflow = dataNetflow.map((item) => {
          return {
            value: item,
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
          xAxis: {
            ...option.xAxis,
            data: formatXAxis,
          },
          series: [
            ...inflowData,
            ...formatOutflowData,
            {
              name: "Netflow",
              type: "line",
              data: formatDataNetflow,
              lineStyle: {
                color: "rgba(0,169,236, 0.8)",
              },
            },
          ],
        };

        isLoadingInflowOutflow = false;
      } else {
        isEmptyInflowOutflow = true;
        isLoadingInflowOutflow = false;
      }
    } catch (e) {
      console.log("error: ", e);
      isLoadingInflowOutflow = false;
      isEmptyInflowOutflow = true;
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        getInflowOutflow();
      }
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] pt-6">
  <div class="font-medium text-black text-xl px-6">Token Inflow - Outflow</div>
  {#if isLoadingInflowOutflow}
    <div class="flex items-center justify-center h-[465px]">
      <loading-icon />
    </div>
  {:else}
    <div class="h-full w-full">
      {#if isEmptyInflowOutflow}
        <div
          class="flex justify-center items-center h-full text-lg text-gray-400 h-[465px]"
        >
          Empty
        </div>
      {:else}
        <EChart
          id="brush-chart"
          theme="white"
          {option}
          height={565}
          notMerge={true}
        />
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>

<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { groupBy, intersection, flatten } from "lodash";
  import { wallet, chain } from "~/store";
  import { formatCurrency, getAddressContext } from "~/utils";
  import dayjs from "dayjs";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";

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
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  if (item.value) {
                    return `
                  <div style="display: flex; align-items: center; justify-content: space-between; ${
                    item.seriesName.toLowerCase() === "netflow" &&
                    "border-top: 0.8px solid #d1d5db; padding-top: 10px;"
                  }">
                    ${
                      item.seriesName.toLowerCase() !== "netflow"
                        ? `
                    <div style="font-weight: 500; font-size: 14px; line-height: 12px; color: #000; display: flex; align-items: centers; gap: 6px;">
                      ${item.marker}  
                      <span style="color: ${
                        item.value >= 0 ? "#05a878" : "#f25f5d"
                      };">
                        ${item.value >= 0 ? "Inflow -" : "Outflow -"}
                      </span>
                      ${item.seriesName}
                    </div>
                    `
                        : `
                    <div style="font-weight: 500; font-size: 14px; line-height: 12px; color: #000; display: flex; align-items: centers; gap: 6px;">
                      ${item.marker}  
                      ${item.seriesName} 
                    </div>
                    `
                    }
                    <div style="display:flex; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      item.value >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      $${formatCurrency(Math.abs(item.value))}
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
        data: data?.map((data) => {
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
    if (getAddressContext(selectedWallet).type === "EVM") {
      isLoadingInflowOutflow = true;
      try {
        const response: any = await sendMessage("getInflowOutflow", {
          address: selectedWallet,
          chain: selectedChain,
          // fromDate: "YYYY-MM-DD",
          // toDate: "YYYY-MM-DD",
        });

        if (response === undefined) {
          isEmptyInflowOutflow = true;
          isLoadingInflowOutflow = false;
          return;
        } else if (selectedWallet === response?.address) {
          if (response?.result?.length === 0) {
            isEmptyInflowOutflow = true;
            isLoadingInflowOutflow = false;
            return;
          }

          const formatXAxis = response?.result?.map((item) => {
            return dayjs(item.timestamp * 1000).format("DD MMM YYYY");
          });

          const groupByDirectionData = response?.result?.map((item) => {
            return {
              ...item,
              changes: groupBy(item.changes, "direction"),
              keys: Object.getOwnPropertyNames(
                groupBy(item.changes, "direction")
              ),
            };
          });

          const groupByTypeData = response?.result?.map((item) => {
            return {
              keys: Object.getOwnPropertyNames(groupBy(item.changes, "type")),
            };
          });

          const listType = intersection(
            flatten(groupByTypeData?.map((item) => item.keys))
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

          const sumDataInflow =
            inflowData[0]?.data.map((data, index) => {
              return inflowData.reduce(
                (prev, item) => prev + item.data[index],
                0
              );
            }) || [];

          const sumDataOutflow = formatOutflowData[0]?.data.map(
            (data, index) => {
              return formatOutflowData.reduce(
                (prev, item) => prev + item.data[index],
                0
              );
            }
          );

          sumData.inflow = (sumDataInflow || []).reduce(
            (prev, item) => prev + Number(item),
            0
          );
          sumData.outflow = (sumDataOutflow || []).reduce(
            (prev, item) => prev + Number(item),
            0
          );

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
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        if (getAddressContext(selectedWallet)?.type === "EVM") {
          getInflowOutflow();
        }
      }
    }
  }
</script>

<AnalyticSection>
  <span slot="title">
    <div class="xl:text-2xl text-4xl font-medium text-black flex justify-start">
      Money flow
    </div>
  </span>

  <span slot="overview">
    {#if !isLoadingInflowOutflow}
      <div class="xl:text-xl text-3xl font-medium text-black mb-4">
        Overview
      </div>
    {/if}
    {#if isLoadingInflowOutflow}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="flex flex-col gap-5">
        <div class="grid grid-cols-2">
          <div class="col-span-1">
            <div class="xl:text-lg text-xl text-black flex justify-start">
              Total money in
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-1">
            <div
              class={`xl:text-lg text-xl ${
                sumData.inflow < 0 ? "text-red-500" : "text-[#00A878]"
              }`}
            >
              <TooltipNumber number={Math.abs(sumData.inflow)} type="balance" />
            </div>
            {#if sumData.inflow < 0}
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
              Total money out
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-1">
            <div
              class={`xl:text-lg text-xl ${
                sumData.outflow < 0 ? "text-red-500" : "text-[#00A878]"
              }`}
            >
              <TooltipNumber
                number={Math.abs(sumData.outflow)}
                type="balance"
              />
            </div>
            {#if sumData.outflow < 0}
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
    {#if isLoadingInflowOutflow}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="w-full h-full">
        {#if isEmptyInflowOutflow}
          <div
            class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
          >
            Empty
          </div>
        {:else}
          <div class="relative">
            <EChart
              id="inflow-outflow"
              theme="white"
              {option}
              height={465}
              notMerge={true}
              type="full-width"
            />
            <div
              class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 top-1/2 left-1/2"
            >
              <img src={Logo} alt="" width="140" height="140" />
            </div>
          </div>
        {/if}
      </div>
    {/if}</span
  >
</AnalyticSection>

<style windi:preflights:global windi:safelist:global>
</style>

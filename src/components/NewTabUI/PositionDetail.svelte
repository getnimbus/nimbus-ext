<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { Link } from "svelte-navigator";
  import dayjs from "dayjs";

  import "~/components/Loading.custom.svelte";
  import EChart from "~/components/EChart.svelte";

  import TwitterLogo from "~/assets/twitter.svg";
  import TooltipNumber from "../TooltipNumber.svelte";
  import Button from "../Button.svelte";
  // import type { EChartsOption } from "echarts";

  let positionDetail;
  let positionDetailPrice;
  let isLoadingPositionDetail = false;
  let isLoadingPositionDetailPrice = false;
  let isEmptyChart = false;
  let isDownPrice = 0;
  let tweet = "";
  let option = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
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
      type: "time",
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: [
      {
        type: "value",
        name: "Price",
        position: "right",
        alignTicks: true,
        axisLabel: {
          formatter: "${value}",
        },
      },
      {
        type: "value",
        name: "Balance",
        position: "left",
        alignTicks: true,
        axisLabel: {
          formatter: "{value}",
        },
      },
    ],
    series: [],
  };

  const getPositionDetailPrice = async (positionId, address) => {
    try {
      isLoadingPositionDetailPrice = true;
      const response = await nimbus
        .get(`/address/${address}/token/${positionId}`)
        .then((res) => res.data);
      if (response) {
        positionDetailPrice = response;

        if (response.length === 0) {
          isEmptyChart = true;
        }

        const formatXAxis = response?.balances.map((item) => {
          return dayjs(new Date(item.time)).format("DD/MM/YY hh:mm");
        });

        const lastPrice =
          (response?.prices &&
            response?.prices[response?.prices?.length - 1]) ||
          [];
        const firstPrice = (response?.prices && response?.prices[0]) || [];

        isDownPrice = firstPrice[1] - lastPrice[1];

        option = {
          ...option,
          legend: {
            ...option.legend,
            data: [
              {
                name: "Price",
                itemStyle: {
                  color: `${isDownPrice > 0 ? "#EF4444" : "#22c55e"}`,
                },
              },
              {
                name: "Balance",
                itemStyle: {
                  color: "rgba(178,184,255,1)",
                },
              },
            ],
          },
          xAxis: {
            ...option.xAxis,
            // data: formatXAxis,
          },
          series: [
            {
              name: "Price",
              type: "line",
              lineStyle: {
                type: "solid",
                color: `${isDownPrice > 0 ? "#EF4444" : "#22c55e"}`,
              },
              showSymbol: false,
              data: response?.prices.map((item) => {
                return {
                  value: [item.timestamp * 1000, item?.price],
                  itemStyle: {
                    color: `${isDownPrice > 0 ? "#EF4444" : "#22c55e"}`,
                  },
                };
              }),
            },
            {
              name: "Balance",
              type: "bar",
              barStyle: {
                type: "solid",
                color: "rgba(178,184,255,1)",
              },
              barCategoryGap: "50%",
              yAxisIndex: 1,
              showSymbol: false,
              data: response?.balances.map((item) => {
                return {
                  value: [item.timestamp * 1000, item?.balance],
                  itemStyle: {
                    color: "rgba(178,184,255,1)",
                  },
                };
              }),
            },
          ],
        };
      }
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoadingPositionDetailPrice = false;
    }
  };

  $: {
    console.log(option);
  }

  const getPositionDetail = async (positionId, positionType, address) => {
    try {
      isLoadingPositionDetail = true;
      const response = await nimbus
        .get(`/address/${address}/positions/${positionType}/${positionId}`)
        .then((res) => res.data);
      if (response) {
        positionDetail = response;
      }
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoadingPositionDetail = false;
    }
  };

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const positionIDParams = urlParams.get("positionId");
    const positionTypeParams = urlParams.get("positionType");
    const addressParams = urlParams.get("address");

    if (positionIDParams && positionTypeParams && addressParams) {
      getPositionDetailPrice(positionIDParams, addressParams);
      getPositionDetail(positionIDParams, positionTypeParams, addressParams);
      tweet = `Check it out on Nimbus 🚀 @get_nimbus https://app.getnimbus.io/position-detail?positionId=${positionIDParams}&positionType=${positionTypeParams}&address=${addressParams}`;
    }
  });
</script>

<div class="max-w-[2000px] m-auto w-[90%] py-8 flex flex-col gap-10">
  <div
    class="flex-1 flex flex-col gap-4 border border-[#0000001a] rounded-[20px] p-6"
  >
    {#if isLoadingPositionDetail && isLoadingPositionDetailPrice}
      <div class="flex justify-center items-center">
        <loading-icon />
      </div>
    {:else}
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <Link
            to={`${
              APP_TYPE.TYPE === "EXT" ? "src/entries/newTab/index.html" : "/"
            }`}
          >
            <Button variant="secondary" width={120}>Back</Button>
          </Link>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              tweet
            )}`}
            target="_blank"
          >
            <img src={TwitterLogo} alt="" class="w-8 h-8 rounded-full" />
          </a>
        </div>
        <div class="flex items-center gap-2 mt-4">
          <img src={positionDetail?.logo} alt="" class="rounded-full w-8 h-8" />
          <div class="text-3xl text-black font-semibold">
            {positionDetail?.price?.symbol}
          </div>
        </div>
        <div class="text-4xl text-black font-medium">
          $<TooltipNumber number={positionDetail?.price?.price} type="amount" />
        </div>
      </div>
      {#if isLoadingPositionDetailPrice}
        <div class="flex justify-center items-center">
          <loading-icon />
        </div>
      {:else}
        <div>
          {#if isEmptyChart}
            <div class="flex justify-center items-center text-lg text-gray-400">
              Empty
            </div>
          {:else}
            <EChart
              id="double-line-chart"
              theme="white"
              {option}
              height={565}
            />
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <div class="border border-[#0000001a] rounded-[20px] p-6">
    <div class="flex flex-col gap-6">
      <div class="text-2xl font-medium text-black">History</div>
      <div class="border border-[#0000000d] rounded-[10px]">
        <table class="table-fixed w-full">
          <thead>
            <tr class="bg-[#f4f5f880]">
              <th class="pl-3 py-3">
                <div
                  class="text-left text-xs uppercase font-semibold text-black"
                >
                  Transaction
                </div>
              </th>
              <th class="pr-3 py-3">
                <div
                  class="text-right text-xs uppercase font-semibold text-black"
                >
                  Change
                </div>
              </th>
            </tr>
          </thead>
          {#if isLoadingPositionDetail}
            <tbody>
              <tr>
                <td colspan="2">
                  <div class="flex justify-center items-center py-4 px-3">
                    <loading-icon />
                  </div>
                </td>
              </tr>
            </tbody>
          {:else}
            <tbody>
              {#if positionDetail?.changes && positionDetail?.changes.length === 0}
                <tr>
                  <td colspan="2">
                    <div
                      class="flex justify-center items-center py-4 px-3 text-lg text-gray-400"
                    >
                      Empty
                    </div>
                  </td>
                </tr>
              {:else}
                {#each positionDetail?.changes || [] as change}
                  <tr class="hover:bg-gray-100 transition-all">
                    <td class="pl-3 py-4">
                      <a
                        href={`https://www.oklink.com/btc/tx/${change?.transactionHash}`}
                        target="_blank"
                      >
                        <div class="text-left flex items-start gap-2">
                          <div class="flex flex-col">
                            <div class="text-sm">{change?.transactionHash}</div>
                            <div class="text-gray-400 text-xs">
                              {dayjs(new Date(change.timestamp)).format(
                                "DD MMM YYYY, hh:mm A"
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    </td>
                    <td class="pr-3 py-4">
                      <a
                        href={`https://www.oklink.com/btc/tx/${change?.transactionHash}`}
                        target="_blank"
                      >
                        <div
                          class="flex flex-col gap-1 justify-end items-end text-sm"
                        >
                          {#if change?.metadata?.btcChange}
                            <div class="flex items-center gap-1">
                              <div
                                class={`flex items-center gap-1 ${
                                  change?.metadata?.btcChange?.final_result >= 0
                                    ? "text-[#00A878]"
                                    : "text-red-500"
                                }`}
                              >
                                <TooltipNumber
                                  number={Math.abs(
                                    change?.metadata?.btcChange?.final_result
                                  )}
                                  type="amount"
                                />
                                <div>{change?.metadata?.btcPrice?.symbol}</div>
                              </div>
                              <div class="text-gray-500">
                                $<TooltipNumber
                                  number={Math.abs(
                                    change?.metadata?.btcChange?.final_result *
                                      Number(change?.metadata?.btcPrice?.price)
                                  )}
                                  type="amount"
                                />
                              </div>
                            </div>
                          {/if}

                          <div class="flex items-center gap-1">
                            <div
                              class={`flex items-center gap-1 ${
                                change.metadata.info.total >= 0
                                  ? "text-[#00A878]"
                                  : "text-red-500"
                              }`}
                            >
                              <TooltipNumber
                                number={Math.abs(change?.metadata?.info?.total)}
                                type="amount"
                              />
                              <div>{change?.metadata?.info?.tokenName}</div>
                            </div>
                            <div class="text-gray-500">
                              $<TooltipNumber
                                number={Math.abs(
                                  change?.metadata?.info?.total *
                                    Number(change?.metadata?.price?.price)
                                )}
                                type="amount"
                              />
                            </div>
                          </div>
                        </div>
                      </a>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          {/if}
        </table>
      </div>
    </div>
  </div>
</div>

<style></style>

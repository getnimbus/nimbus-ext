<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { Link } from "svelte-navigator";
  import dayjs from "dayjs";

  import "~/components/Loading.custom.svelte";
  import EChart from "~/components/EChart.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipNumber from "../TooltipNumber.svelte";
  import CopyToClipboard from "~/components/CopyToClipboard.svelte";

  import TwitterLogo from "~/assets/twitter.svg";
  import LeftArrow from "~/assets/left-arrow.svg";
  import Bitcoin from "~/assets/bitcoin.png";

  let positionDetail;
  let positionDetailPrice;
  let isLoadingPositionDetail = false;
  let isLoadingPositionDetailPrice = false;
  let isEmptyChart = false;
  let isDownPrice = 0;
  let tweet = "";
  let address = "";
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
      type: "category",
      boundaryGap: false,
      data: [],
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
  let option2 = option;

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
          return dayjs(new Date(item.timestamp * 1000)).format(
            "DD/MM/YY hh:mm"
          );
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
            data: formatXAxis,
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
                  value: item?.price,
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
                  value: item?.balance,
                  itemStyle: {
                    color: "rgba(178,184,255,1)",
                  },
                };
              }),
            },
          ],
        };

        option2 = {
          ...option2,
          legend: {
            ...option2.legend,
            data: [
              {
                name: "Value",
                itemStyle: {
                  color: "rgba(0,169,236, 0.8)",
                },
              },
            ],
          },
          yAxis: [
            {
              type: "value",
              name: "Value",
              position: "left",
              alignTicks: true,
              axisLabel: {
                formatter: "{value}",
              },
            },
          ],
          xAxis: {
            ...option.xAxis,
            data: formatXAxis,
          },
          series: [
            {
              name: "Value",
              type: "line",
              lineStyle: {
                type: "solid",
                color: "rgba(0,169,236, 0.8)",
              },
              areaStyle: {
                color: "rgba(0,169,236, 0.5)",
              },
              showSymbol: false,
              data: response?.balances.map((item) => {
                return {
                  value: item?.value,
                  itemStyle: {
                    color: "rgba(0,169,236, 0.8)",
                  },
                };
              }),
            },
          ],
        };

        setTimeout(() => {
          syncChartCursor();
        }, 500);
      }
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoadingPositionDetailPrice = false;
    }
  };

  const syncChartCursor = () => {
    let currentHightLight = null;
    const onChartHighlight = (e, chartName) => {
      const dataIndex = e?.batch?.[0]?.dataIndex;
      if (currentHightLight === dataIndex) {
        return;
      }
      currentHightLight = dataIndex;
      if (chartName === "chartBalance") {
        window.echarts.chartValue.dispatchAction({
          type: "showTip",
          dataIndex,
          seriesIndex: 0,
        });
      } else if (chartName === "chartValue") {
        window.echarts.chartBalance.dispatchAction({
          type: "showTip",
          dataIndex,
          seriesIndex: 1,
        });
      }
    };

    const onMouseOut = () => {
      setTimeout(() => {
        window.echarts?.chartValue?.dispatchAction({
          type: "hideTip",
        });
        window.echarts?.chartBalance?.dispatchAction({
          type: "hideTip",
        });
      }, 200);
    };

    if (window.echarts?.chartBalance) {
      // window.echarts.chartBalance.on("highlight", console.log);
      window.echarts.chartBalance.on("highlight", (e) =>
        onChartHighlight(e, "chartBalance")
      );
      window.echarts.chartBalance.on("mouseout", onMouseOut);
    }
    if (window.echarts?.chartValue) {
      window.echarts.chartValue.on("highlight", (e) =>
        onChartHighlight(e, "chartValue")
      );
      window.echarts.chartValue.on("mouseout", onMouseOut);
    }
  };

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
      address = addressParams;
      tweet = `Check it out on Nimbus 🚀 @get_nimbus https://app.getnimbus.io/position-detail?positionId=${positionIDParams}&positionType=${positionTypeParams}&address=${addressParams}`;
    }
  });
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto w-[82%]">
      <div class="flex flex-col gap-14 mb-5">
        <div class="flex justify-between items-center">
          <Link
            to={`${
              APP_TYPE.TYPE === "EXT" ? "src/entries/newTab/index.html" : "/"
            }`}
            class="cusor-pointer"
          >
            <div class="text-white flex items-center gap-1">
              <img src={LeftArrow} alt="" />
              <div>Back to Portfolio</div>
            </div>
          </Link>
        </div>
        <div class="flex justify-between">
          <div>
            <div class="flex items-center gap-2 text-white mb-3">
              <img
                src={positionDetail?.logo}
                alt=""
                class="rounded-full w-8 h-8"
              />
              <div class="text-3xl font-semibold">
                {positionDetail?.price?.symbol}
              </div>
            </div>
            <CopyToClipboard
              {address}
              iconColor="#fff"
              color="#fff"
              size={16}
            />
          </div>
          <div class="self-end">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                tweet
              )}`}
              target="_blank"
              class="flex justify-end"
            >
              <img src={TwitterLogo} alt="" class="w-8 h-8 rounded-full" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="max-w-[2000px] m-auto w-[90%] -mt-36">
    <div
      class="flex flex-col gap-7 bg-white rounded-[20px] p-8 mt-6"
      style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
    >
      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div
          class="xl:w-1/2 w-full border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="pl-4 text-2xl font-medium text-black mb-3">
            Price & Total Balance
          </div>
          {#if isLoadingPositionDetailPrice}
            <div class="flex justify-center items-center min-h-[420px]">
              <loading-icon />
            </div>
          {:else}
            <div>
              {#if isEmptyChart}
                <div
                  class="flex justify-center items-center text-lg text-gray-400"
                >
                  Empty
                </div>
              {:else}
                <EChart id="chartBalance" theme="white" {option} height={420} />
              {/if}
            </div>
          {/if}
        </div>
        <div
          class="xl:w-1/2 w-full border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="pl-4 text-2xl font-medium text-black mb-3">
            Position Value
          </div>
          {#if isLoadingPositionDetailPrice}
            <div class="flex justify-center items-center min-h-[420px]">
              <loading-icon />
            </div>
          {:else}
            <div>
              {#if isEmptyChart}
                <div
                  class="flex justify-center items-center text-lg text-gray-400"
                >
                  Empty
                </div>
              {:else}
                <EChart
                  id="chartValue"
                  theme="white"
                  option={option2}
                  height={420}
                />
              {/if}
            </div>
          {/if}
        </div>
      </div>
      <!-- <div
        class="border border-[#0000001a] rounded-[20px] p-6 flex justify-between gap-6"
      >
        <div class="flex-[0.7] flex flex-col gap-2">
          <div class="flex items-center gap-2 font-medium">
            <div class="text-lg">Equity</div>
            <div class="text-lg">6.9%</div>
          </div>
          <div class="flex flex-col">
            <div class="text-2xl font-medium text-black">$71,297.31</div>
            <div class="text-base font-medium">37.365 WETH</div>
          </div>
          <div class="flex items-center gap-1">
            <img src={Bitcoin} alt="" class="rounded-full w-5 h-5" />
            <div class="text-base font-light">
              37.365 ETH <span class="text-gray-500">($71,271.53)</span>
            </div>
          </div>
        </div>
        <div class="flex-1 grid grid-cols-2 grid-rows-2 gap-y-4">
          <div class="flex flex-col gap-1">
            <div class="text-lg font-medium">Profit/Loss</div>
            <div class="text-base">−$16,556.79</div>
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-lg font-medium">Average Cost</div>
            <div class="text-base">$2,229.91</div>
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-lg font-medium">24-hour Return</div>
            <div class="text-base">+0.63% ($443.82)</div>
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-lg font-medium">Paid Fees</div>
            <div class="text-base">$18.71</div>
          </div>
        </div>
      </div> -->
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
                      Token Change
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
                                <div class="text-sm">
                                  {change?.transactionHash}
                                </div>
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
                                      change?.metadata?.btcChange
                                        ?.final_result >= 0
                                        ? "text-[#00A878]"
                                        : "text-red-500"
                                    }`}
                                  >
                                    <TooltipNumber
                                      number={Math.abs(
                                        change?.metadata?.btcChange
                                          ?.final_result
                                      )}
                                      type="amount"
                                    />
                                    <div>
                                      {change?.metadata?.btcPrice?.symbol}
                                    </div>
                                  </div>
                                  <div class="text-gray-500">
                                    $<TooltipNumber
                                      number={Math.abs(
                                        change?.metadata?.btcChange
                                          ?.final_result *
                                          Number(
                                            change?.metadata?.btcPrice?.price
                                          )
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
                                    number={Math.abs(
                                      change?.metadata?.info?.total
                                    )}
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
  </div>
</ErrorBoundary>

<style>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }
</style>

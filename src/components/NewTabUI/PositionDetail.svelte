<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { Link } from "svelte-navigator";
  import dayjs from "dayjs";
  import { shorterAddress, formatCurrencyV2 } from "~/utils";

  import tooltip from "~/entries/contentScript/views/tooltip";
  import "~/components/Loading.custom.svelte";
  import EChart from "~/components/EChart.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipNumber from "../TooltipNumber.svelte";
  import CopyToClipboard from "~/components/CopyToClipboard.svelte";
  import CountUpNumber from "../CountUpNumber.svelte";
  import OverviewCard from "../OverviewCard.svelte";

  import TwitterLogo from "~/assets/twitter.svg";
  import LeftArrow from "~/assets/left-arrow.svg";

  let type = "";
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
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: ${
                    params[0].color
                  }; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[0].seriesName}
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  $${formatCurrencyV2(Math.abs(params[0].value))}
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: ${
                    params[1].color
                  }; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[1].seriesName}
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${formatCurrencyV2(Math.abs(params[1].value))}
                </div>
              </div>
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
    yAxis: [
      {
        type: "value",
        name: "Price",
        position: "right",
        offset: 10,
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
  let option2 = {
    ...option,
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: ${
                    params[0].color
                  }; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[0].seriesName}
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${formatCurrencyV2(Math.abs(params[0].value))}
                </div>
              </div>
            </div>`;
      },
    },
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
              tooltip: {
                valueFormatter: function (value) {
                  return value ? "$" + value : "--";
                },
              },
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

    let positionIDParams = urlParams.get("id");
    let positionTypeParams = urlParams.get("type");
    let addressParams = urlParams.get("address");

    if (APP_TYPE.TYPE === "EXT") {
      const params = decodeURIComponent(window.location.hash)
        .split("?")[1]
        .split("&")
        .reduce(function (result, param) {
          var [key, value] = param.split("=");
          result[key] = value;
          return result;
        }, {});

      positionIDParams = params.id;
      positionTypeParams = params.type;
      addressParams = params.address;
    }

    if (positionIDParams && positionTypeParams && addressParams) {
      getPositionDetailPrice(positionIDParams, addressParams);
      getPositionDetail(positionIDParams, positionTypeParams, addressParams);
      address = addressParams;
      type = positionTypeParams;
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
              <div class="text-sm font-semibold">Back to Portfolio</div>
            </div>
          </Link>
        </div>
        <div class="flex justify-between items-center">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-white">
              <img
                src={positionDetail?.logo}
                alt=""
                class="rounded-full w-8 h-8"
              />
              <div class="text-3xl font-semibold">
                {positionDetail?.price?.symbol || "--"}
              </div>
            </div>
            {#if address}
              <div class="text-base">
                <CopyToClipboard {address} iconColor="#fff" color="#fff" />
              </div>
            {/if}
          </div>
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
      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <OverviewCard title={"Position Value"}>
            <div class="text-3xl text-black flex items-end gap-1">
              {#if (positionDetail?.overview?.holding)
                .toString()
                .toLowerCase()
                .includes("e-")}
                <TooltipNumber
                  number={positionDetail?.overview?.holding}
                  type="balance"
                />
                <span class="text-xl text-gray-500"
                  >{positionDetail?.price?.symbol || ""}</span
                >
              {:else}
                <CountUpNumber
                  id="PositionValueHolding"
                  number={positionDetail?.overview?.holding}
                  type="balance"
                />
                <span class="text-xl text-gray-500"
                  >{positionDetail?.price?.symbol || ""}</span
                >
              {/if}
            </div>
            <div class="text-lg flex">
              $<CountUpNumber
                id="PositionValue"
                number={positionDetail?.overview?.currentValue}
                type="balance"
              />
            </div>
          </OverviewCard>
          <OverviewCard title={"Profit & Loss"}>
            <div
              class={`text-3xl flex ${
                positionDetail?.overview?.profitAndLoss?.percent >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
              }`}
            >
              $<CountUpNumber
                id="Profit&Loss"
                number={Math.abs(
                  positionDetail?.overview?.profitAndLoss?.value
                )}
                type="balance"
              />
            </div>
            <div
              class={`text-lg flex ${
                positionDetail?.overview?.profitAndLoss?.percent >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
              }`}
            >
              {#if positionDetail?.overview?.profitAndLoss?.percent < 0}
                ↓
              {:else}
                ↑
              {/if}
              <CountUpNumber
                id="Profit&LossPercent"
                number={Math.abs(
                  positionDetail?.overview?.profitAndLoss?.percent
                ) * 100}
                type="percent"
              />%
            </div>
          </OverviewCard>
        </div>
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <OverviewCard title={"Average Cost"}>
            <div class="text-3xl text-black flex">
              {#if (positionDetail?.overview?.averageCost)
                .toString()
                .toLowerCase()
                .includes("e-")}
                $<TooltipNumber
                  number={positionDetail?.overview?.averageCost}
                  type="balance"
                />
              {:else}
                $<CountUpNumber
                  id="AverageCost"
                  number={positionDetail?.overview?.averageCost}
                  format={8}
                  type="balance"
                />
              {/if}
            </div>
          </OverviewCard>
          <OverviewCard title={"24-hour Return"}>
            <div
              class={`text-3xl flex ${
                positionDetail?.overview?.return24h?.percent >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
              }`}
            >
              $<CountUpNumber
                id="24-hourReturn"
                number={Math.abs(positionDetail?.overview?.return24h?.value)}
                type="balance"
              />
            </div>
            <div
              class={`text-lg flex ${
                positionDetail?.overview?.return24h?.percent >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
              }`}
            >
              {#if positionDetail?.overview?.return24h?.percent < 0}
                ↓
              {:else}
                ↑
              {/if}
              <CountUpNumber
                id="24-hourReturnPercent"
                number={Math.abs(positionDetail?.overview?.return24h?.percent) *
                  100}
                type="percent"
              />%
            </div>
          </OverviewCard>
        </div>
      </div>
    </div>
  </div>
  <div class="max-w-[2000px] m-auto w-[90%] -mt-26">
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
      {#if type !== "ERC_20"}
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
                    <th class="py-3">
                      <div
                        class="text-left text-xs uppercase font-semibold text-black"
                      >
                        Type
                      </div>
                    </th>
                    <th class="pr-3 py-3">
                      <div
                        class="text-left text-xs uppercase font-semibold text-black"
                      >
                        Token Change
                      </div>
                    </th>
                  </tr>
                </thead>
                {#if isLoadingPositionDetail}
                  <tbody>
                    <tr>
                      <td colspan="3">
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
                        <td colspan="3">
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
                            <div class="w-max">
                              <a
                                href={`https://www.oklink.com/btc/tx/${change?.transactionHash}`}
                                class="hover:text-blue-500 cursor-pointer"
                                target="_blank"
                              >
                                <div class="text-left flex items-start gap-2">
                                  <div class="flex flex-col">
                                    <div
                                      class="text-sm"
                                      use:tooltip={{
                                        content: `<tooltip-detail text="${change?.transactionHash}" />`,
                                        allowHTML: true,
                                        placement: "top-start",
                                      }}
                                    >
                                      {shorterAddress(change?.transactionHash)}
                                    </div>
                                    <div class="text-gray-400 text-xs">
                                      {dayjs(new Date(change.timestamp)).format(
                                        "DD MMM YYYY, hh:mm A"
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </a>
                            </div>
                          </td>
                          <td class="py-4">
                            {#if change?.metadata?.action}
                              <div
                                class="w-max px-2 py-1 text-[#27326F] text-[12px] font-normal bg-[#6AC7F533] rounded-[5px] capitalize"
                              >
                                {change?.metadata?.action}
                              </div>
                            {/if}
                          </td>
                          <td class="pr-3 py-4">
                            <div class="w-max">
                              <a
                                href={`https://www.oklink.com/btc/tx/${change?.transactionHash}`}
                                target="_blank"
                                class="cursor-pointer"
                              >
                                <div
                                  class="flex flex-col gap-1 justify-start items-start text-sm"
                                >
                                  {#if change?.metadata?.hasOwnProperty("btcChange")}
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
                                        | $<TooltipNumber
                                          number={Math.abs(
                                            change?.metadata?.btcChange
                                              ?.final_result *
                                              Number(
                                                change?.metadata?.btcPrice
                                                  ?.price
                                              )
                                          )}
                                          type="balance"
                                        />
                                      </div>
                                    </div>
                                  {/if}

                                  <div class="flex items-center gap-1">
                                    <div
                                      class={`flex items-center gap-1 ${
                                        change.event === "deposit"
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
                                      <div>
                                        {change?.metadata?.info?.tokenName}
                                      </div>
                                    </div>
                                    <div class="text-gray-500">
                                      | $<TooltipNumber
                                        number={Math.abs(
                                          change?.metadata?.info?.total *
                                            Number(
                                              change?.metadata?.price?.price
                                            )
                                        )}
                                        type="balance"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </a>
                            </div>
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
      {/if}
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

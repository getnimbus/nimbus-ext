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

  let positionDetail;
  let positionDetailPrice;
  let isLoadingPositionDetail = false;
  let isLoadingPositionDetailPrice = false;
  let isEmptyChart = false;
  let isDownPrice = 0;

  const colors = ["#808080", `${isDownPrice > 0 ? "#EF4444" : "#22c55e"}`];
  let option = {
    color: colors,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    grid: {
      right: "20%",
    },
    legend: {
      data: ["Price", "Balance"],
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
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[0],
          },
        },
        axisLabel: {
          formatter: "${value}",
        },
      },
      {
        type: "value",
        name: "Balance",
        position: "left",
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[1],
          },
        },
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
          return dayjs(new Date(item.time)).format("DD MMM YYYY");
        });

        const lastPrice =
          (response?.prices &&
            response?.prices[response?.prices?.length - 1]) ||
          [];
        const firstPrice = (response?.prices && response?.prices[0]) || [];

        isDownPrice = firstPrice[1] - lastPrice[1];

        option = {
          ...option,
          xAxis: {
            ...option.xAxis,
            data: formatXAxis,
          },
          series: [
            {
              name: "Price",
              type: "line",
              data: response?.prices.map((item) => {
                return item?.price;
              }),
            },
            {
              name: "Balance",
              type: "line",
              yAxisIndex: 1,
              data: response?.balances.map((item) => {
                return item?.balance;
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
            href={`https://twitter.com/intent/tweet?text=${encodeURI("hello")}`}
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
      {#if option.xAxis.data.length === 0 && option.series.length === 0 && !isEmptyChart}
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
            <div class="ml-26">
              <EChart
                id="double-line-chart"
                theme="white"
                {option}
                height={565}
              />
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <div class="border border-[#0000001a] rounded-[20px] p-6">
    {#if isLoadingPositionDetail}
      <div class="flex justify-center items-center">
        <loading-icon />
      </div>
    {:else}
      <div class="flex flex-col gap-6">
        <div class="text-2xl font-medium text-black">History</div>
        {#each positionDetail?.changes || [] as change}
          <a
            href={`https://www.oklink.com/btc/tx/${change?.transactionHash}`}
            target="_blank"
            class="flex justify-between items-center"
          >
            <div class="flex flex-col">
              <div>{change?.transactionHash}</div>
              <div class="text-gray-400">
                {dayjs(new Date(change.timestamp)).format(
                  "DD MMM YYYY, hh:mm A"
                )}
              </div>
            </div>
            <div class="flex flex-col gap-1">
              {#if change?.metadata?.btcChange}
                <div class="flex items-center gap-2">
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
                  <div class="text-gray-500 border-l pl-2">
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

              <div class="flex items-center gap-2">
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
                <div class="text-gray-500 border-l pl-2">
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
        {/each}
      </div>
    {/if}
  </div>
</div>

<style></style>

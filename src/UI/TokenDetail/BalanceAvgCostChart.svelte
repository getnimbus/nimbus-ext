<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    wallet,
    user,
    isDarkMode,
    typeWallet,
    selectedPackage,
  } from "~/store";
  import { autoFontSize } from "~/utils";
  import numeral from "numeral";

  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import EChart from "~/components/EChart.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  export let data;
  export let id;
  export let avgCost;
  export let filterType;

  let optionBar = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 260px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                $${formatPrice(params[0].axisValue)}
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  $isDarkMode ? "white" : "black"
                }">
                  <span>${params[0]?.marker}</span>
                  Amount
                </div>

                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="margin-top: 4px; display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    $isDarkMode ? "white" : "black"
                  };">
                    ${formatPrice(params[0]?.value[1])}
                  </div>
                </div>
              </div>
              
              ${
                avgCost
                  ? `
                  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                    <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                      $isDarkMode ? "white" : "black"
                    }">
                      <div style="margin-top: 5px; display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#eab308;"></div>
                      Avg Cost
                    </div>
                    <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                      <div style="margin-top: 4px; display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                        $isDarkMode ? "white" : "black"
                      };">
                        $${formatPrice(avgCost)}
                      </div>
                    </div>
                  </div>
                `
                  : ``
              }
              
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  $isDarkMode ? "white" : "black"
                }">
                  <div style="margin-top: 5px; display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#1e96fc;"></div>
                  Current Price
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="margin-top: 4px; display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    $isDarkMode ? "white" : "black"
                  };">
                    $${formatPrice(data?.market_price)}
                  </div>
                </div>
              </div>
            </div>`;
      },
    },
    grid: {
      left: 70,
      right: 70,
    },
    toolbox: {
      right: "4%",
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
      },
    },
    xAxis: {
      type: "value",
      axisTick: { show: false },
      nameGap: 30,
      min: function (value) {
        return value.min * 0.95;
      },
      max: function (value) {
        return value.max * 1.05;
      },
      axisLabel: {
        formatter: function (value, index) {
          return "$" + formatPrice(value);
        },
        fontSize: autoFontSize(),
      },
    },
    yAxis: {
      type: "value",
      axisTick: { show: false },
      axisLabel: {
        formatter: function (value, index) {
          return (
            `${value < 0 ? "-" : ""}` + numeral(Math.abs(value)).format("0.00a")
          );
        },
        fontSize: autoFontSize(),
      },
    },
    series: [],
  };

  const handleGetTradeHistoryAnalysis = async (address, filter) => {
    const response: any = await nimbus.get(
      `/v2/address/${address}/token/${data?.contractAddress}/trade-analysis?chain=${data?.chain}&type=${filter?.value}`
    );
    return response?.data;
  };

  $: queryHistoryTokenDetailAnalysis = createQuery({
    queryKey: ["trade-history-analysis", data, $wallet, filterType],
    queryFn: () => handleGetTradeHistoryAnalysis($wallet, filterType),
    staleTime: Infinity,
    retry: false,
    enabled:
      $selectedPackage !== "FREE" &&
      data !== undefined &&
      Object.keys(data).length !== 0 &&
      $wallet &&
      $wallet?.length !== 0 &&
      ($typeWallet === "EVM" || $typeWallet === "BUNDLE"),
  });

  const formatPrice = (value: number) => {
    if (value.toString().includes("e-")) {
      const numStr = value.toString();
      const eIndex = numStr.indexOf("e");
      if (eIndex !== -1) {
        const significand = parseFloat(
          numStr
            .slice(0, 4)
            .split("")
            .filter((e) => e != ".")
            .join("")
        );

        return `0.0...0${significand}`;
      }
    } else {
      return numeral(Math.abs(value)).format("0.000000a");
    }
  };

  let sumCount = 0;
  let sumCountWinHistoryTokenDetail = 0;
  let sumCountLossHistoryTokenDetail = 0;
  let sumTotalToken = 0;
  let sumWinProfitHistoryTokenDetail = 0;
  let sumLossProfitHistoryTokenDetail = 0;

  $: {
    if (
      !$queryHistoryTokenDetailAnalysis.isError &&
      $queryHistoryTokenDetailAnalysis.data !== undefined &&
      $queryHistoryTokenDetailAnalysis.data.length !== 0
    ) {
      const dataChart = $queryHistoryTokenDetailAnalysis.data.map((item) => {
        return [item?.price, item?.totalToken];
      });

      if (avgCost) {
        optionBar = {
          ...optionBar,
          series: [
            {
              tooltip: {
                show: true,
              },
              type: "bar",
              itemStyle: {
                color: "#27326F",
                borderColor: "#27326F",
              },
              data: dataChart,
              markLine: {
                precision: 10,
                symbol: ["none", "none"],
                data: [
                  {
                    name: "Current Price",
                    label: "Current Price",
                    xAxis: data?.market_price,
                    lineStyle: {
                      color: "#1e96fc",
                      type: "solid",
                      width: 2,
                    },
                  },
                  {
                    name: "Avg Cost",
                    label: "Avg Cost",
                    xAxis: avgCost,
                    lineStyle: {
                      color: "#eab308",
                      type: "dashed",
                      width: 2,
                    },
                  },
                ],
                label: {
                  show: false,
                },
              },
            },
          ],
        };
      } else {
        optionBar = {
          ...optionBar,
          series: [
            {
              tooltip: {
                show: true,
              },
              type: "bar",
              itemStyle: {
                color: "#27326F",
                borderColor: "#27326F",
              },
              data: dataChart,
              markLine: {
                precision: 10,
                symbol: ["none"],
                data: [
                  {
                    name: "Current Price",
                    label: "Current Price",
                    xAxis: data?.market_price,
                    lineStyle: {
                      color: "#1e96fc",
                      type: "solid",
                      width: 2,
                    },
                  },
                ],
                label: {
                  show: false,
                },
              },
            },
          ],
        };
      }

      sumCount = $queryHistoryTokenDetailAnalysis.data.reduce(
        (prev, item) => prev + Number(item.count),
        0
      );

      sumTotalToken = $queryHistoryTokenDetailAnalysis.data.reduce(
        (prev, item) => prev + Number(item.totalToken),
        0
      );

      // logic win
      const winHistoryTokenDetail =
        $queryHistoryTokenDetailAnalysis.data.filter(
          (item) => Number(item.price) <= Number(data?.market_price)
        );

      const formatWinHistoryTokenDetail = winHistoryTokenDetail.map((item) => {
        return {
          ...item,
          valueProfit:
            Number(data?.market_price) * Number(item.totalToken) -
            Number(item.price) * Number(item.totalToken),
        };
      });

      sumWinProfitHistoryTokenDetail = formatWinHistoryTokenDetail.reduce(
        (prev, item) => prev + Number(item.valueProfit),
        0
      );

      sumCountWinHistoryTokenDetail = winHistoryTokenDetail.reduce(
        (prev, item) => prev + Number(item.count),
        0
      );

      // logic lose
      const lossHistoryTokenDetail =
        $queryHistoryTokenDetailAnalysis.data.filter(
          (item) => Number(item.price) > Number(data?.market_price)
        );

      const formatLossHistoryTokenDetail = lossHistoryTokenDetail.map(
        (item) => {
          return {
            ...item,
            valueProfit:
              Number(data?.market_price) * Number(item.totalToken) -
              Number(item.price) * Number(item.totalToken),
          };
        }
      );

      sumLossProfitHistoryTokenDetail = formatLossHistoryTokenDetail.reduce(
        (prev, item) => prev + Number(item.valueProfit),
        0
      );

      sumCountLossHistoryTokenDetail = lossHistoryTokenDetail.reduce(
        (prev, item) => prev + Number(item.count),
        0
      );
    } else {
      optionBar = {
        ...optionBar,
        series: [
          {
            tooltip: {
              show: true,
            },
            type: "bar",
            itemStyle: {
              color: "#27326F",
              borderColor: "#27326F",
            },
            data: [],
            markLine: {
              precision: 10,
              symbol: ["none", "none"],
              data: [
                {
                  name: "Current Price",
                  label: "Current Price",
                  xAxis: 0,
                  lineStyle: {
                    color: "#1e96fc",
                    type: "solid",
                    width: 2,
                  },
                },
                {
                  name: "Avg Cost",
                  label: "Avg Cost",
                  xAxis: 0,
                  lineStyle: {
                    color: "#eab308",
                    type: "dashed",
                    width: 2,
                  },
                },
              ],
              label: {
                show: false,
              },
            },
          },
        ],
      };
    }
  }

  $: theme = $isDarkMode ? "dark" : "white";
</script>

<div class="flex flex-col pb-10">
  {#if $queryHistoryTokenDetailAnalysis.isFetching}
    <div class="flex items-center justify-center h-[475px]">
      <LoadingPremium />
    </div>
  {:else}
    <div class="h-full">
      {#if $queryHistoryTokenDetailAnalysis.isError || ($queryHistoryTokenDetailAnalysis.data !== undefined && $queryHistoryTokenDetailAnalysis.data.length === 0)}
        <div
          class="flex justify-center items-center text-lg text-gray-400 h-[475px]"
        >
          Empty
        </div>
      {:else}
        <div class="relative">
          <EChart
            id={id + "bar-chart"}
            {theme}
            notMerge={true}
            option={optionBar}
            height={485}
          />
          <div
            class="opacity-40 absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2"
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

  <div class="flex flex-col gap-14">
    <div class="flex flex-col gap-2">
      <div class="xl:text-lg text-xl">Win / Lose addresses</div>
      <div
        class="h-2 rounded-lg relative"
        style={`background: ${
          sumCountWinHistoryTokenDetail === 0
            ? "#00000066"
            : `linear-gradient(to right, #25b770 ${(
                (sumCountWinHistoryTokenDetail / sumCount) *
                100
              ).toFixed(2)}%, #e14040 ${(
                (sumCountWinHistoryTokenDetail / sumCount) *
                100
              ).toFixed(2)}%)`
        }`}
      >
        <div class="absolute top-5 left-0 xl:text-sm text-xl">
          <TooltipNumber
            number={(sumCountWinHistoryTokenDetail / sumCount) * 100}
            type="percent"
          />% Win
        </div>
        <div class="absolute top-5 right-0 xl:text-sm text-xl">
          <TooltipNumber
            number={(sumCountLossHistoryTokenDetail / sumCount) * 100}
            type="percent"
          />% Lose
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="xl:text-lg text-xl">Profit / Loss</div>
      <div
        class="h-2 rounded-lg relative"
        style={`background: ${
          sumWinProfitHistoryTokenDetail === 0
            ? "#00000066"
            : `linear-gradient(to right, #25b770 ${Math.abs(
                (sumWinProfitHistoryTokenDetail /
                  (Math.abs(sumLossProfitHistoryTokenDetail) +
                    Math.abs(sumWinProfitHistoryTokenDetail))) *
                  100
              ).toFixed(2)}%, #e14040 ${Math.abs(
                (sumWinProfitHistoryTokenDetail /
                  (Math.abs(sumLossProfitHistoryTokenDetail) +
                    Math.abs(sumWinProfitHistoryTokenDetail))) *
                  100
              ).toFixed(2)}%)`
        }`}
      >
        <div class="flex gap-1 absolute top-5 left-0 xl:text-sm text-xl w-max">
          Profit
          <TooltipNumber
            number={Math.abs(sumWinProfitHistoryTokenDetail)}
            type="value"
          />
        </div>
        <div class="flex gap-1 absolute top-5 right-0 xl:text-sm text-xl">
          Loss
          <TooltipNumber
            number={Math.abs(sumLossProfitHistoryTokenDetail)}
            type="value"
          />
        </div>
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>

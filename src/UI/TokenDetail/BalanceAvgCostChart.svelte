<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { wallet, user, isDarkMode, typeWallet } from "~/store";
  import { autoFontSize } from "~/utils";
  import numeral from "numeral";

  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import EChart from "~/components/EChart.svelte";
  import ProgressBar from "~/components/ProgressBar.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  export let data;
  export let id;
  export let avgCost;

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
                  Balance
                </div>

                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="margin-top: 4px; display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    $isDarkMode ? "white" : "black"
                  };">
                    ${formatPrice(params[0]?.value[1])}
                  </div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  $isDarkMode ? "white" : "black"
                }">
                  <div style="margin-top: 5px; display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#eab308;"></div>
                  Avg Price
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="margin-top: 4px; display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    $isDarkMode ? "white" : "black"
                  };">
                    $${formatPrice(avgCost)}
                  </div>
                </div>
              </div>

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

  const handleGetTradeHistoryAnalysis = async (address) => {
    const response: any = await nimbus.get(
      `/v2/address/${address}/token/${data?.contractAddress}/trade-analysis?chain=${data?.chain}`
    );
    return response?.data;
  };

  $: queryHistoryTokenDetailAnalysis = createQuery({
    queryKey: ["trade-history-analysis", data, $wallet],
    queryFn: () => handleGetTradeHistoryAnalysis($wallet),
    staleTime: Infinity,
    retry: false,
    enabled:
      data !== undefined &&
      Object.keys(data).length !== 0 &&
      $wallet.length !== 0 &&
      $typeWallet === "EVM",
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
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

      if (avgCost !== undefined) {
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
            (item) => item.price < data?.market_price
          );

        const formatWinHistoryTokenDetail = winHistoryTokenDetail.map(
          (item) => {
            return {
              ...item,
              valueProfit:
                Number(data?.market_price) * Number(item.totalToken) -
                Number(item.price) * Number(item.totalToken),
            };
          }
        );

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
            (item) => item.price > data?.market_price
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
      }
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

<div class="flex flex-col">
  {#if $queryHistoryTokenDetailAnalysis.isFetching}
    <div class="flex items-center justify-center h-[475px]">
      <LoadingPremium />
    </div>
  {:else}
    <div class="h-full">
      {#if $queryHistoryTokenDetailAnalysis.isError || ($queryHistoryTokenDetailAnalysis.data !== undefined && $queryHistoryTokenDetailAnalysis.data.length === 0)}
        <div
          class="flex justify-center items-center h-full text-lg text-gray-400 h-[475px]"
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

  <div class="flex flex-col gap-10">
    <div class="flex flex-col">
      <div class="xl:text-lg text-xl">Win / Lose addresses</div>
      <div class="px-10">
        <ProgressBar
          lowerIsBetter={false}
          isProfitLoss={true}
          leftLabel="0"
          rightLabel={`${sumCount}`}
          averageText={`${Math.round(sumCount / 2)}`}
          progress={(sumCountWinHistoryTokenDetail / sumCount) * 100}
          tooltipText={`${sumCountWinHistoryTokenDetail} addresses win`}
          isDoubleMark
          progressTwo={(sumCountLossHistoryTokenDetail / sumCount) * 100}
          tooltipTextTwo={`${sumCountLossHistoryTokenDetail} addresses lose`}
        />
      </div>
    </div>

    <div class="flex flex-col">
      <div class="xl:text-lg text-xl">Profit / Loss</div>
      <div class="px-10">
        <ProgressBar
          lowerIsBetter={false}
          isProfitLoss={true}
          leftLabel="$0"
          rightLabel={`$${formatPrice(
            Number(data?.market_price) * Number(sumTotalToken)
          )}`}
          averageText={`$${formatPrice(
            (Number(data?.market_price) * Number(sumTotalToken)) / 2
          )}`}
          progress={(sumWinProfitHistoryTokenDetail /
            (Number(data?.market_price) * Number(sumTotalToken))) *
            100}
          tooltipText={`Profit $${formatPrice(sumWinProfitHistoryTokenDetail)}`}
          isDoubleMark
          progressTwo={(sumLossProfitHistoryTokenDetail /
            (Number(data?.market_price) * Number(sumTotalToken))) *
            100}
          tooltipTextTwo={`Loss $${formatPrice(
            sumLossProfitHistoryTokenDetail
          )}`}
        />
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>

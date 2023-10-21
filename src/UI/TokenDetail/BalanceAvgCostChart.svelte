<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { wallet, user, isDarkMode, typeWallet } from "~/store";
  import { autoFontSize } from "~/utils";
  import numeral from "numeral";

  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  export let data;
  export let id;
  export let avgCost;

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let optionBar = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        let price = "";
        if (params[0].axisValue.toString().includes("e-")) {
          const numStr = params[0].axisValue.toString();
          const eIndex = numStr.indexOf("e");
          if (eIndex !== -1) {
            const significand = parseFloat(
              numStr
                .slice(0, 4)
                .split("")
                .filter((e) => e != ".")
                .join("")
            );

            price = `$0.0...0${significand}`;
          }
        } else {
          price =
            "$" + numeral(Math.abs(params[0].axisValue)).format("0.000000a");
        }

        console.log("params: ", params);
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                darkMode ? "white" : "black"
              }">
                ${price}
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  darkMode ? "white" : "black"
                }">
                  <span>${params[0]?.marker}</span>
                  Balance
                </div>

                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="margin-top: 4px; display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    darkMode ? "white" : "black"
                  };">
                    ${numeral(params[0]?.value[1]).format("0.0000a")}
                  </div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  darkMode ? "white" : "black"
                }">
                  <div style="margin-top: 5px; display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#eab308;"></div>
                  Avg Price
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="margin-top: 4px; display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    darkMode ? "white" : "black"
                  };">
                    $${numeral(avgCost).format("0.0000a")}
                  </div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  darkMode ? "white" : "black"
                }">
                  <div style="margin-top: 5px; display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#1e96fc;"></div>
                  Current Price
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                  <div style="margin-top: 4px; display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                    darkMode ? "white" : "black"
                  };">
                    $${numeral(data?.market_price).format("0.0000a")}
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

              return `$0.0...0${significand}`;
            }
          } else {
            return "$" + numeral(Math.abs(value)).format("0.000000a");
          }
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

  const handleGetTradeHistoryAnalysis = async () => {
    const response: any = await nimbus.get(
      `/v2/address/${selectedWallet}/token/${data?.contractAddress}/trade-analysis?chain=${data?.chain}`
    );
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  $: queryHistoryTokenDetailAnalysis = createQuery({
    queryKey: ["trade-history-analysis", data, selectedWallet],
    queryFn: () => handleGetTradeHistoryAnalysis(),
    staleTime: Infinity,
    retry: false,
    enabled:
      data !== undefined &&
      Object.keys(data).length !== 0 &&
      selectedWallet.length !== 0 &&
      typeWalletAddress === "EVM",
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (
      !$queryHistoryTokenDetailAnalysis.isError &&
      $queryHistoryTokenDetailAnalysis.data !== undefined &&
      $queryHistoryTokenDetailAnalysis.data.length !== 0
    ) {
      const dataChart = $queryHistoryTokenDetailAnalysis.data.map((item) => {
        return [item?.price, item?.totalToken];
      });

      console.log({
        avgCost,
        price: data?.market_price,
      });

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
    }
  }

  $: theme = darkMode ? "dark" : "white";
</script>

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
            src={darkMode ? LogoWhite : Logo}
            alt=""
            width="140"
            height="140"
          />
        </div>
      </div>
    {/if}
  </div>
{/if}

<style></style>

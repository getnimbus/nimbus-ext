<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { wallet, user, isDarkMode } from "~/store";
  import { autoFontSize } from "~/utils";
  import numeral from "numeral";

  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  export let data;
  export let id;

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let optionBar = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                darkMode ? "white" : "black"
              }">
                ${numeral(params[0].axisValue).format("$0.000000a")}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    darkMode ? "white" : "black"
                  }">
                    <span>${item?.marker}</span>
                    ${
                      item?.seriesName === "Current Price"
                        ? "Current Balance"
                        : "Balance"
                    }
                  </div>

                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                    <div style="margin-top: 4px; display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      darkMode ? "white" : "black"
                    };">
                        ${numeral(item.value).format("0.00a")}
                    </div>
                  </div>
                </div>
                `;
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
    xAxis: {
      type: "category",
      axisTick: { show: false },
      data: [],
      axisLabel: {
        formatter: function (value, index) {
          return "$" + numeral(Math.abs(value)).format("0.000000a");
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
      `/v2/address/${selectedWallet}/token/${data?.contractAddress}/trade-analysis?chain=ETH`
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
      selectedWallet.length !== 0,
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
      const formatXAxis = $queryHistoryTokenDetailAnalysis.data.map((item) => {
        return item?.price;
      });

      const dataChart = $queryHistoryTokenDetailAnalysis.data.map((item) => {
        return item?.totalToken;
      });

      optionBar = {
        ...optionBar,
        xAxis: {
          ...optionBar.xAxis,
          data: formatXAxis,
        },
        series: [
          {
            emphasis: {
              focus: "series",
            },
            type: "bar",
            data: dataChart,
          },
          {
            name: "Current Price",
            type: "bar",
            data: [Math.max(...dataChart), data?.market_price],
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
          id={id + "barchart"}
          {theme}
          notMerge={true}
          option={optionBar}
          height={485}
        />
        <div
          class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none top-1/2 left-1/2"
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

<script lang="ts">
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { i18n } from "~/lib/i18n";
  import { chain } from "~/store";
  import { formatCurrencyV2, typePieChart } from "~/utils";

  export let optionLine;
  export let dataPieChart;
  export let isLoading;
  export let isEmptyDataPie;

  import EChart from "~/components/EChart.svelte";
  import "~/components/Loading.custom.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  const MultipleLang = {
    token_allocation: i18n("newtabPage.token-allocation", "Token Allocation"),
    nft_allocation: i18n("newtabPage.nft-allocation", "NFT Allocation"),
    performance: i18n("newtabPage.performance", "Performance"),
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
  };

  $: selectedChain = $chain;

  let selectedType: "token" | "nft" = "token";
  let optionPie = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="display: flex; align-items: centers; gap: 4px">
                ${
                  params?.data?.logo
                    ? `<img src=${params?.data?.logo} alt="" width=20 height=20 style="border-radius: 100%" />`
                    : ""
                }
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                  ${params?.name} ${
          params?.data?.symbol ? `(${params?.data?.symbol})` : ""
        }
                </div>
              </div>

              ${
                params?.data?.name_balance
                  ? `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                    ${MultipleLang[params?.data?.name_balance]}
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                    ${formatCurrencyV2(params?.data?.value_balance)}
                  </div>
                </div>
              `
                  : ""
              }

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params?.data?.name_value]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  $${formatCurrencyV2(params?.data?.value_value)}
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params?.data?.name_ratio]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatCurrencyV2(params?.value)}%
                </div>
              </div>
            </div>`;
      },
    },
    legend: {
      orient: "vertical",
      right: "right",
      bottom: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "60%"],
        left: -220,
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
    ],
  };

  $: {
    if (selectedType) {
      if (Object.keys(dataPieChart).length !== 0) {
        if (selectedType === "token") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data:
                  dataPieChart.token.sumOrderBreakdownToken > 0
                    ? dataPieChart.token.formatDataPieChartTopFourToken.concat(
                        dataPieChart.token.dataPieChartOrderBreakdownToken
                      )
                    : dataPieChart.token.formatDataPieChartTopFourToken,
              },
            ],
          };
        }
        if (selectedType === "nft") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data:
                  dataPieChart.nft.sumOrderBreakdownNft > 0
                    ? dataPieChart.nft.formatDataPieChartTopFourNft.concat(
                        dataPieChart.nft.dataPieChartOrderBreakdownNft
                      )
                    : dataPieChart.nft.formatDataPieChartTopFourNft,
              },
            ],
          };
        }
      }
    }
  }
</script>

<ErrorBoundary>
  <div class="flex xl:flex-row flex-col justify-between gap-6">
    <div class="xl:w-1/2 w-full border border-[#0000001a] rounded-[20px] p-6">
      <div class="flex justify-between mb-1">
        <div class="pl-4 text-2xl font-medium text-black">
          {#if selectedType === "token"}
            {MultipleLang.token_allocation}
          {:else}
            {MultipleLang.nft_allocation}
          {/if}
        </div>
        <div class="flex items-center gap-1">
          <AnimateSharedLayout>
            {#each typePieChart as type}
              <div
                class="relative cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all"
                on:click={() => (selectedType = type.value)}
              >
                <div
                  class={`relative z-20 ${
                    selectedType === type.value && "text-white"
                  }`}
                >
                  {type.label}
                </div>
                {#if type.value === selectedType}
                  <Motion
                    let:motion
                    layoutId="active-pill"
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <div
                      class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                      use:motion
                    />
                  </Motion>
                {/if}
              </div>
            {/each}
          </AnimateSharedLayout>
        </div>
      </div>
      {#if isLoading}
        <div class="flex items-center justify-center h-[465px]">
          <loading-icon />
        </div>
      {:else}
        <div class="h-full">
          {#if isEmptyDataPie}
            <div
              class="flex justify-center items-center h-full text-lg text-gray-400"
            >
              Empty
            </div>
          {:else}
            <EChart
              id="pie-chart"
              theme="white"
              notMerge={true}
              option={optionPie}
              height={465}
            />
          {/if}
        </div>
      {/if}
    </div>
    <div
      class="xl:w-1/2 w-full relative border border-[#0000001a] rounded-[20px] p-6"
    >
      <div class="pl-4 text-2xl font-medium text-black mb-3">
        {MultipleLang.performance}
      </div>
      {#if selectedChain === "GNOSIS"}
        <div
          class="absolute top-0 left-0 rounded-[20px] w-full h-full flex items-center justify-center bg-white/85 z-10 backdrop-blur-md"
        >
          <div class="text-lg">Comming soon 🚀</div>
        </div>
      {/if}
      {#if isLoading}
        <div class="flex items-center justify-center h-[433px]">
          <loading-icon />
        </div>
      {:else}
        <EChart
          id="line-chart"
          theme="white"
          notMerge={true}
          option={optionLine}
          height={433}
        />
      {/if}
    </div>
  </div>
</ErrorBoundary>

<style>
</style>

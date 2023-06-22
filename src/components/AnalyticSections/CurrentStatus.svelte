<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";
  import { groupBy } from "lodash";
  import { formatBalance, formatCurrency } from "~/utils";
  import { i18n } from "~/lib/i18n";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  import EChart from "~/components/EChart.svelte";
  import "~/components/Loading.custom.svelte";

  const MultipleLang = {
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
  };

  let selectedType: "category" | "sector" | "rank" = "category";
  let isEmptyDataPie = false;
  let isLoadingDataPie = false;
  let dataRank = [];
  let dataCategory = [];
  let dataSector = [];
  let optionPie = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 190px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params.name}
              </div>
              ${
                params.data.name_balance
                  ? `<div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_balance]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatCurrency(params.data.value_balance)}</div>
              </div>`
                  : ""
              }
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_value]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  $${formatBalance(params.data.value_value)}</div>
              </div>

              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_ratio]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatBalance(params.value)}%
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
        left: -170,
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

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  const getHoldingToken = async (isReload: boolean = false) => {
    isLoadingDataPie = true;
    try {
      const response: HoldingTokenRes = await sendMessage("getHoldingToken", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });

      if (selectedWallet === response.address) {
        if (response?.result?.length === 0) {
          isEmptyDataPie = true;
          isLoadingDataPie = false;
          return;
        }

        const formatData = response.result.map((item) => {
          return {
            ...item,
            value: Number(item?.amount) * Number(item?.price?.price),
          };
        });

        const groupBySector = groupBy(formatData, "sector");
        const groupByCategory = groupBy(formatData, "category");
        const groupByRank = groupBy(formatData, "rank");

        const typesSector = Object.getOwnPropertyNames(groupBySector);
        const typesCategory = Object.getOwnPropertyNames(groupByCategory);
        const typesRank = Object.getOwnPropertyNames(groupByRank);

        const formatDataSector = typesSector.map((item) => {
          return {
            name: item,
            data: groupBySector[item],
            name_value: "Value",
            value_value: groupBySector[item].reduce(
              (prev, item) => prev + Number(item.value),
              0
            ),
            name_ratio: "Ratio",
            value: 0,
          };
        });

        const formatDataCategory = typesCategory.map((item) => {
          return {
            name: item,
            data: groupByCategory[item],
            name_value: "Value",
            value_value: groupByCategory[item].reduce(
              (prev, item) => prev + Number(item.value),
              0
            ),
            name_ratio: "Ratio",
            value: 0,
          };
        });

        const formatDataRank = typesRank.map((item) => {
          return {
            name: item,
            data: groupByRank[item],
            name_value: "Value",
            value_value: groupByRank[item].reduce(
              (prev, item) => prev + Number(item.value),
              0
            ),
            name_ratio: "Ratio",
            value: 0,
          };
        });

        const sumDataRank = formatDataRank.reduce(
          (prev, item) => prev + Number(item.value_value),
          0
        );

        const sumDataCategory = formatDataCategory.reduce(
          (prev, item) => prev + Number(item.value_value),
          0
        );

        const sumDataSector = formatDataSector.reduce(
          (prev, item) => prev + Number(item.value_value),
          0
        );

        dataRank = formatDataRank.map((item) => {
          return {
            name: item.name,
            name_value: item.name_value,
            value_value: item.value_value,
            name_ratio: item.name_ratio,
            value: (Number(item.value_value) / sumDataRank) * 100,
          };
        });

        dataCategory = formatDataCategory.map((item) => {
          return {
            name: item.name,
            name_value: item.name_value,
            value_value: item.value_value,
            name_ratio: item.name_ratio,
            value: (Number(item.value_value) / sumDataCategory) * 100,
          };
        });

        dataSector = formatDataSector.map((item) => {
          return {
            name: item.name,
            name_value: item.name_value,
            value_value: item.value_value,
            name_ratio: item.name_ratio,
            value: (Number(item.value_value) / sumDataSector) * 100,
          };
        });

        isLoadingDataPie = false;
      } else {
        isEmptyDataPie = true;
        isLoadingDataPie = false;
      }
    } catch (e) {
      console.log("error: ", e);
      isLoadingDataPie = false;
      isEmptyDataPie = true;
    }
  };

  $: {
    if (selectedType) {
      switch (selectedType) {
        case "sector":
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataSector,
              },
            ],
          };
          break;
        case "rank":
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataRank,
              },
            ],
          };
          break;
        default:
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataCategory,
              },
            ],
          };
      }
    }
  }

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        getHoldingToken();
      }
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div class="flex justify-between items-center border-b-[1px] mb-6 pb-4">
    <div class="text-2xl font-medium text-black">Current Status</div>
    <div class="flex items-center gap-1">
      <div
        class={`cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all ${
          selectedType === "category" && "bg-[#1E96FC] text-white"
        }`}
        on:click={() => (selectedType = "category")}
      >
        Category
      </div>
      <div
        class={`cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all ${
          selectedType === "sector" && "bg-[#1E96FC] text-white"
        }`}
        on:click={() => (selectedType = "sector")}
      >
        Sector
      </div>
      <div
        class={`cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all ${
          selectedType === "rank" && "bg-[#1E96FC] text-white"
        }`}
        on:click={() => (selectedType = "rank")}
      >
        Token Rank
      </div>
    </div>
  </div>
  <div class="flex gap-6">
    <div class="flex-[0.75] border border-[#0000001a] rounded-[20px] p-6">
      {#if isLoadingDataPie}
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
              option={optionPie}
              height={465}
            />
          {/if}
        </div>
      {/if}
    </div>
    <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">table</div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

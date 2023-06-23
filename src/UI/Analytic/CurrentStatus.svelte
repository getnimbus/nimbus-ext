<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";
  import { groupBy } from "lodash";
  import { formatBalance, formatCurrency } from "~/utils";
  import { i18n } from "~/lib/i18n";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  import EChart from "~/components/EChart.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import HoldingToken from "~/components/HoldingToken.svelte";
  import "~/components/Loading.custom.svelte";

  const MultipleLang = {
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
    token: i18n("newtabPage.token", "Tokens"),
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    profit: i18n("newtabPage.profit", "Profit & Loss"),
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

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
        left: -200,
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

  let filteredHoldingToken = false;
  let isLoadingToken = false;
  let filteredHoldingDataToken = [];

  const handleFormatDataPieChart = (data, type) => {
    const formatData = data.map((item) => {
      return {
        ...item,
        value: Number(item?.amount) * Number(item?.price?.price),
      };
    });

    const groupData = groupBy(formatData, type);
    const typesData = Object.getOwnPropertyNames(groupData);

    const formatGroupData = typesData.map((item) => {
      return {
        name: item,
        data: groupData[item],
        name_value: "Value",
        value_value: groupData[item].reduce(
          (prev, item) => prev + Number(item.value),
          0
        ),
        name_ratio: "Ratio",
        value: 0,
      };
    });

    const sumData = formatGroupData.reduce(
      (prev, item) => prev + Number(item.value_value),
      0
    );

    return formatGroupData.map((item) => {
      return {
        name: item.name,
        name_value: item.name_value,
        value_value: item.value_value,
        name_ratio: item.name_ratio,
        value: (Number(item.value_value) / sumData) * 100,
      };
    });
  };

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

        dataRank = handleFormatDataPieChart(response.result, "rank");
        dataCategory = handleFormatDataPieChart(response.result, "category");
        dataSector = handleFormatDataPieChart(response.result, "sector");

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
      if (dataRank && dataCategory && dataSector) {
        if (selectedType === "sector") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataSector,
              },
            ],
          };
        }
        if (selectedType === "rank") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataRank,
              },
            ],
          };
        }
        if (selectedType === "category") {
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
  <div class="text-2xl font-medium text-black border-b-[1px] mb-6 pb-4">
    Current Status
  </div>
  <div class="flex justify-between items-center border-b-[1px] mb-6 pb-4">
    <div class="font-medium text-black text-xl">Token breakdown</div>
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
  <div class="flex xl:flex-row flex-col justify-between gap-6">
    <div class="w-full xl:w-[45%] border border-[#0000001a] rounded-[20px] p-6">
      {#if isLoadingDataPie}
        <div class="flex items-center justify-center h-[465px]">
          <loading-icon />
        </div>
      {:else}
        <div class="h-full">
          {#if isEmptyDataPie}
            <div
              class="flex justify-center items-center h-full text-lg text-gray-400 h-[465px]"
            >
              Empty
            </div>
          {:else}
            <EChart
              id="pie-chart"
              theme="white"
              option={optionPie}
              height={465}
              notMerge={true}
            />
          {/if}
        </div>
      {/if}
    </div>
    <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">
      <div class="mb-2 flex justify-between items-center">
        <div>select</div>
        <div class="text-3xl font-semibold text-right">$0</div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-end gap-2">
          <label class="text-sm font-regular text-gray-400" for="filter-value"
            >{MultipleLang.hide}
          </label>
          <input
            type="checkbox"
            id="filter-value"
            bind:checked={filteredHoldingToken}
            class="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div class="border border-[#0000000d] rounded-[10px]">
          <table class="table-auto w-full">
            <thead>
              <tr class="bg-[#f4f5f880]">
                <th class="pl-3 py-3">
                  <div
                    class="text-left text-xs uppercase font-semibold text-black"
                  >
                    {MultipleLang.assets}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right text-xs uppercase font-semibold text-black"
                  >
                    {MultipleLang.price}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right text-xs uppercase font-semibold text-black"
                  >
                    {MultipleLang.amount}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right text-xs uppercase font-semibold text-black"
                  >
                    {MultipleLang.value}
                  </div>
                </th>
                <th class="py-3">
                  <div class="text-xs uppercase font-semibold text-black">
                    <TooltipTitle
                      tooltipText="Profit and loss is calculated by transactions that swap the tokens"
                    >
                      {MultipleLang.profit}
                    </TooltipTitle>
                  </div>
                </th>
                <th class="py-3 w-10" />
              </tr>
            </thead>
            {#if isLoadingToken}
              <tbody>
                <tr>
                  <td colspan={6}>
                    <div class="flex justify-center items-center py-3 px-3">
                      <loading-icon />
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else}
              <tbody>
                {#if filteredHoldingDataToken && filteredHoldingDataToken.length === 0}
                  <tr>
                    <td colspan={6}>
                      <div
                        class="flex justify-center items-center py-3 px-3 text-lg text-gray-400"
                      >
                        {MultipleLang.empty}
                      </div>
                    </td>
                  </tr>
                {:else}
                  {#each filteredHoldingDataToken as holding}
                    <HoldingToken data={holding} {selectedWallet} />
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

<style windi:preflights:global windi:safelist:global></style>

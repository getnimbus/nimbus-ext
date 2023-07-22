<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";
  import { groupBy, flatten } from "lodash";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import {
    formatBalance,
    formatCurrency,
    getAddressContext,
    typeList,
  } from "~/utils";
  import { i18n } from "~/lib/i18n";
  import { priceSubscribe } from "~/lib/price-ws";
  import { useNavigate } from "svelte-navigator";
  import { nimbus } from "~/lib/network";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  import Select from "~/components/Select.svelte";
  import EChart from "~/components/EChart.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import HoldingToken from "~/components/HoldingToken.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import "~/components/Loading.custom.svelte";
  import Button from "~/components/Button.svelte";

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

  const navigate = useNavigate();

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
  let selectedDataPie = [];

  let dataTableRank;
  let dataTableCategory;
  let dataTableSector;
  let dataTable;
  let selectedDataTable;
  let marketPrice;
  let isLoadingToken = false;
  let filteredHoldingToken = true;
  let filteredHoldingDataToken = [];
  let selectedTypeTable;
  let sum = 0;

  let sumTokenHolding = 0;
  let formatData = [];

  let typeListCategory = [...typeList];
  let dataPersonalizeTag = [];
  let dataTokenHolding = [];
  let personalizeCategoryData = [];

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

  const handleFormatDataTable = (data, type) => {
    let formatData = data.map((item) => {
      return {
        ...item,
        value: Number(item?.amount) * Number(item?.price?.price),
        market_price: Number(item?.price?.price) || 0,
      };
    });

    let groupData = groupBy(formatData, type);
    let typesData = Object.getOwnPropertyNames(groupData);

    let formatGroupData = typesData.map((item) => {
      return {
        name: item,
        data: groupData[item],
      };
    });

    return {
      select: typesData.map((item) => {
        return {
          value: item,
          label: item,
        };
      }),
      data: formatGroupData,
    };
  };

  const getHoldingToken = async (isReload: boolean = false) => {
    if (getAddressContext(selectedWallet).type === "EVM") {
      isLoadingDataPie = true;
      isLoadingToken = true;
      try {
        const response: HoldingTokenRes = await sendMessage("getHoldingToken", {
          address: selectedWallet,
          reload: isReload,
          chain: selectedChain,
        });

        if (response === null) {
          isEmptyDataPie = true;
          isLoadingToken = false;
          isLoadingDataPie = false;
        } else if (selectedWallet === response?.address) {
          if (response?.result?.length === 0) {
            isEmptyDataPie = true;
            isLoadingToken = false;
            isLoadingDataPie = false;
            return;
          }

          dataTokenHolding = response.result;

          const listCMCID = response.result
            .map((item) => item.cmc_id)
            .filter((n) => n);

          priceSubscribe(listCMCID, (data) => {
            marketPrice = {
              id: data.id,
              market_price: data.p,
            };
          });

          dataTableRank = handleFormatDataTable(response.result, "rank");
          dataTableCategory = handleFormatDataTable(
            response.result,
            "category"
          );
          dataTableSector = handleFormatDataTable(response.result, "sector");

          dataRank = handleFormatDataPieChart(response.result, "rank");
          dataCategory = handleFormatDataPieChart(response.result, "category");
          dataSector = handleFormatDataPieChart(response.result, "sector");

          formatData = response.result.map((item) => {
            return {
              cmc_id: item.cmc_id,
              amount: Number(item?.amount),
              market_price: Number(item?.price?.price),
            };
          });
          sumTokenHolding = formatData.reduce(
            (prev, item) => prev + item.amount * item.market_price,
            0
          );

          isLoadingDataPie = false;
          isLoadingToken = false;
        } else {
          isEmptyDataPie = true;
          isLoadingDataPie = false;
          isLoadingToken = false;
        }
      } catch (e) {
        console.log("error: ", e);
        isLoadingDataPie = false;
        isEmptyDataPie = true;
      }
    }
  };

  const getPersonalizeTag = async () => {
    try {
      const response = await nimbus.get(
        `/address/${selectedWallet}/personalize/tag`
      );
      if (response && response.data) {
        const categoriesData = Object.getOwnPropertyNames(response.data);
        const categoriesDataList = categoriesData.map((item) => {
          return {
            category: item,
            dataTag: groupBy(response.data[item], "tag"),
          };
        });
        const formatDataCategory = categoriesDataList.map((item) => {
          return {
            category: item.category,
            dataTag: Object.getOwnPropertyNames(item.dataTag).map((tag) => {
              return {
                name: tag,
                tokens: item.dataTag[tag],
              };
            }),
          };
        });

        dataPersonalizeTag = formatDataCategory;

        const listCategory = formatDataCategory.map((item) => {
          return {
            label: item.category,
            value: item.category,
          };
        });

        typeListCategory = [...typeListCategory, ...listCategory];
      }
    } catch (e) {
      console.log("e: ", e);
    }
  };

  $: {
    if (dataPersonalizeTag && dataTokenHolding) {
      const tokenDataEachCategory = dataPersonalizeTag.map((item) => {
        return {
          category: item.category,
          dataTokens: flatten(
            item.dataTag
              .filter((item) => item.name !== "Other")
              .map((item) => item.tokens)
          ),
        };
      });

      const formatTokenDataEachCategory = tokenDataEachCategory.map((item) => {
        const formatDataTokens = dataTokenHolding.map((tokenHolding) => {
          const isSelected = item.dataTokens.some(
            (selectedToken) =>
              selectedToken.contractAddress === tokenHolding.contractAddress
          );

          const selected = item.dataTokens.filter(
            (selectedToken) =>
              selectedToken.contractAddress === tokenHolding.contractAddress
          );

          return {
            ...tokenHolding,
            [item.category]: isSelected ? selected[0].tag : "Other",
          };
        });

        return {
          category: item.category,
          dataTokens: formatDataTokens,
        };
      });

      personalizeCategoryData = formatTokenDataEachCategory.map((item) => {
        return {
          category: item.category,
          dataPie: handleFormatDataPieChart(item.dataTokens, item.category),
          dataTable: handleFormatDataTable(item.dataTokens, item.category),
        };
      });
    }
  }

  $: {
    if (selectedType) {
      if (dataRank && dataCategory && dataSector && personalizeCategoryData) {
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
          dataTable = dataTableSector;
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
          dataTable = dataTableRank;
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
          dataTable = dataTableCategory;
        }

        const indexOfType = personalizeCategoryData
          .map((item) => item.category)
          .indexOf(selectedType);
        const selectedPersonalizeCategoryData =
          personalizeCategoryData[indexOfType];

        if (
          selectedType !== "sector" &&
          selectedType !== "rank" &&
          selectedType !== "category" &&
          selectedPersonalizeCategoryData !== undefined
        ) {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: selectedPersonalizeCategoryData.dataPie,
              },
            ],
          };
          dataTable = selectedPersonalizeCategoryData.dataTable;
        }
      }
    }
  }

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        getHoldingToken();
        getPersonalizeTag();
      }
    }
  }

  $: {
    if (selectedTypeTable) {
      selectedDataTable = dataTable.data.filter(
        (item) => item.name === selectedTypeTable.value
      )[0]?.data;
    }
  }

  $: {
    if (selectedDataTable) {
      let data = selectedDataTable;
      sum = selectedDataTable.reduce(
        (prev, item) => prev + Number(item.value),
        0
      );

      if (marketPrice !== undefined) {
        const formatDataWithMarketPrice = selectedDataTable.map((item) => {
          if (marketPrice.id === Number(item?.cmc_id)) {
            return {
              ...item,
              value: Number(item?.amount) * marketPrice.market_price,
              market_price: marketPrice.market_price,
            };
          }
          return { ...item };
        });
        data = formatDataWithMarketPrice;
        sum = formatDataWithMarketPrice.reduce(
          (prev, item) => prev + item.value,
          0
        );

        formatData = formatData.map((item) => {
          if (marketPrice.id === Number(item?.cmc_id)) {
            return {
              ...item,
              market_price: marketPrice.market_price,
            };
          }
          return { ...item };
        });
        sumTokenHolding = formatData.reduce(
          (prev, item) => prev + item.amount * item.market_price,
          0
        );
      }

      let sortData = data
        .map((item) => {
          return {
            ...item,
            price: item?.amount * item.market_price,
          };
        })
        .sort((a, b) => {
          if (a.price < b.price) {
            return 1;
          }
          if (a.price > b.price) {
            return -1;
          }
          return 0;
        });

      if (filteredHoldingToken) {
        filteredHoldingDataToken = sortData.filter((item) => item.price > 1);
      } else {
        filteredHoldingDataToken = sortData;
      }
    }
  }

  $: {
    if (selectedTypeTable) {
      selectedDataPie = optionPie.series[0].data.filter(
        (item) => item.name === selectedTypeTable?.value
      );
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div
    class="xl:text-2xl text-4xl font-medium text-black border-b-[1px] mb-6 pb-4"
  >
    Current Status
  </div>
  <div class="flex justify-between items-center border-b-[1px] mb-6 pb-4">
    <div class="font-medium text-black xl:text-xl text-3xl">
      Token breakdown
    </div>
    <div class="flex items-center gap-1">
      <AnimateSharedLayout>
        {#each typeListCategory as type}
          <div
            class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
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
      <div class="ml-4">
        <Button
          variant="tertiary"
          on:click={() => {
            navigate(
              `/personal-token-breakdown?chain=${encodeURIComponent(
                selectedChain
              )}&address=${encodeURIComponent(selectedWallet)}`
            );
          }}
        >
          <div class="xl:text-base text-2xl font-medium text-white">Custom</div>
        </Button>
      </div>
    </div>
  </div>
  <div class="flex 2xl:flex-row flex-col justify-between gap-6">
    <div
      class="w-full 2xl:w-[40%] border border-[#0000001a] rounded-[20px] p-6"
    >
      <div class="h-full pt-10">
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
                id="current-status-analytics"
                theme="white"
                option={optionPie}
                height={465}
                notMerge={true}
                type="full-width"
              />
            {/if}
          </div>
        {/if}
      </div>
    </div>
    <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">
      <div class="mb-2 flex justify-between items-center">
        <div class="xl:text-3xl text-4xl font-semibold text-right">
          $<TooltipNumber number={sum} type="balance" />
          <span class="xl:text-xl text-2xl font-medium text-gray-400">
            <TooltipNumber number={selectedDataPie[0]?.value} type="percent" />%
          </span>
        </div>
        {#if dataTable}
          <Select
            type="lang"
            listSelect={dataTable?.select || []}
            bind:selected={selectedTypeTable}
          />
        {:else}
          <div />
        {/if}
      </div>
      <div class="flex flex-col gap-2 h-[540px]">
        <div class="flex items-center justify-end gap-2">
          <label
            class="xl:text-sm text-lg font-regular text-gray-400"
            for="filter-value"
            >{MultipleLang.hide}
          </label>
          <input
            type="checkbox"
            id="filter-value"
            bind:checked={filteredHoldingToken}
            class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
          />
        </div>
        <div
          class="border border-[#0000000d] rounded-[10px] overflow-y-auto overflow-x-auto"
        >
          <table class="table-auto xl:w-full w-[1200px] overflow-y-scroll">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#f4f5f8]">
                <th
                  class="pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8] w-[220px]"
                >
                  <div
                    class="text-left xl:text-xs text-base uppercase font-semibold text-black"
                  >
                    {MultipleLang.assets}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                  >
                    {MultipleLang.price}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                  >
                    {MultipleLang.amount}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                  >
                    {MultipleLang.value}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                  >
                    <TooltipTitle tooltipText="Ratio based on token holding">
                      Ratio
                    </TooltipTitle>
                  </div>
                </th>
                <th class="py-3 pr-3">
                  <div
                    class="xl:text-xs text-base uppercase font-semibold text-black"
                  >
                    <TooltipTitle
                      tooltipText="Profit and loss is calculated by transactions that swap the tokens. "
                      link="https://docs.getnimbus.io/metrics/holding_profit_loss/"
                    >
                      {MultipleLang.profit}
                    </TooltipTitle>
                  </div>
                </th>
                <!-- <th class="py-3 w-10" /> -->
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
                        class="flex justify-center items-center py-3 px-3 xl:text-lg text-xl text-gray-400"
                      >
                        {MultipleLang.empty}
                      </div>
                    </td>
                  </tr>
                {:else}
                  {#each filteredHoldingDataToken as holding}
                    <HoldingToken
                      data={holding}
                      {selectedWallet}
                      {sumTokenHolding}
                    />
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

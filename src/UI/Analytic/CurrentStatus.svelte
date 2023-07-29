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
    handleFormatDataPieChart,
  } from "~/utils";
  import { i18n } from "~/lib/i18n";
  import { useNavigate } from "svelte-navigator";
  import { nimbus } from "~/lib/network";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  import EChart from "~/components/EChart.svelte";
  import "~/components/Loading.custom.svelte";
  import Button from "~/components/Button.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";

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
                    ${formatCurrency(params?.data?.value_balance)}
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
                  $${formatCurrency(params?.data?.value_value)}
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params?.data?.name_ratio]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatCurrency(params?.value)}%
                </div>
              </div>
            </div>`;
      },
    },
    legend: {
      top: "0%",
      left: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "60%"],
        left: 0,
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

  let typeListCategory = [...typeList];
  let dataPersonalizeTag = [];
  let dataTokenHolding = [];
  let personalizeCategoryData = [];

  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;
  let container;

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  const getHoldingToken = async (isReload: boolean = false) => {
    if (getAddressContext(selectedWallet).type === "EVM") {
      isLoadingDataPie = true;

      try {
        const response: HoldingTokenRes = await sendMessage("getHoldingToken", {
          address: selectedWallet,
          reload: isReload,
          chain: selectedChain,
        });

        if (response === null) {
          isEmptyDataPie = true;

          isLoadingDataPie = false;
        } else if (selectedWallet === response?.address) {
          if (response?.result?.length === 0) {
            isEmptyDataPie = true;

            isLoadingDataPie = false;
            return;
          }

          dataTokenHolding = response.result;
          getPersonalizeTag();

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

      const listCategory = dataPersonalizeTag.map((item) => {
        return {
          label: item.category,
          value: item.category,
        };
      });

      typeListCategory = [...typeListCategory, ...listCategory];

      personalizeCategoryData = formatTokenDataEachCategory.map((item) => {
        return {
          category: item.category,
          dataPie: handleFormatDataPieChart(item.dataTokens, item.category),
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
        } else if (selectedType === "rank") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataRank,
              },
            ],
          };
        } else if (selectedType === "category") {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: dataCategory,
              },
            ],
          };
        } else {
          const indexOfType = personalizeCategoryData
            .map((item) => item.category)
            .indexOf(selectedType);
          const selectedPersonalizeCategoryData =
            personalizeCategoryData[indexOfType];

          if (
            selectedPersonalizeCategoryData !== undefined &&
            isEmptyDataPie === false
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
          }
        }
      }
    }
  }

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        typeListCategory = [...typeList];
        personalizeCategoryData = [];
        isEmptyDataPie = false;
        selectedDataPie = [];
        getHoldingToken();
      }
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div
    class="xl:text-2xl text-4xl font-medium text-black border-b-[1px] mb-6 pb-4"
  >
    Current Status
  </div>
  <div class="flex flex-col justify-between items-start gap-2 mb-5">
    <div class="font-medium text-black xl:text-xl text-3xl">
      Token breakdown
    </div>
    <div class="flex justify-end gap-5 w-full">
      <div
        class="relative overflow-x-hidden w-full flex gap-3 justify-between items-center"
        bind:this={container}
      >
        <div
          class={`text-white absolute left-0 py-2 rounded-tl-lg rounded-bl-lg ${
            isScrollStart ? "hidden" : "block"
          }`}
          style="background-image: linear-gradient(to right, rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100% );"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            height="24px"
            width="24px"
            viewBox="0 0 24 24"
            class="sc-aef7b723-0 fKbUaI"
            ><path
              d="M15 6L9 12L15 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-miterlimit="10"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg
          >
        </div>
        <div
          class="w-max flex gap-3 overflow-x-auto whitespace-nowrap container"
          bind:this={scrollContainer}
          on:scroll={handleScroll}
        >
          <AnimateSharedLayout>
            {#each typeListCategory as type}
              <div
                class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                on:click={() => (selectedType = type.value)}
              >
                <div
                  class={`relative ${
                    selectedType === type.value && "text-white"
                  }`}
                  style="z-index: 2"
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
                      class="absolute inset-0 rounded-full bg-[#1E96FC]"
                      style="z-index: 1"
                      use:motion
                    />
                  </Motion>
                {/if}
              </div>
            {/each}
          </AnimateSharedLayout>
        </div>
        {#if scrollContainer?.scrollWidth >= container?.offsetWidth}
          <div
            class={`text-white absolute right-0 py-2 rounded-tr-lg rounded-br-lg ${
              isScrollEnd ? "hidden" : "block"
            }`}
            style="background-image: linear-gradient(to left,rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100%);"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              height="24px"
              width="24px"
              viewBox="0 0 24 24"
              class="sc-aef7b723-0 fKbUaI"
              ><path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              /></svg
            >
          </div>
        {/if}
      </div>
      <div class="flex-1">
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
          <div class="xl:text-base text-2xl font-medium text-white">
            Custom your token breakdown
          </div>
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
            <LoadingPremium />
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
    <div>hello</div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
  .container::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .container {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>

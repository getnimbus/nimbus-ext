<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";
  import dayjs from "dayjs";
  import { groupBy, intersection, flatten } from "lodash";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { formatCurrency, getAddressContext, typeList } from "~/utils";
  import { nimbus } from "~/lib/network";

  import type { AnalyticSectorGrowthRes } from "~/types/AnalyticSectorGrowthData";

  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LoadingPremium from "~/components/LoadingPremium.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let selectedType: "category" | "sector" | "rank" = "category";
  let isLoadingSectorGrowth = false;
  let isEmptySectorGrowth = false;
  let dataSector;
  let dataCategory;
  let dataRank;

  let optionLine = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 350px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="font-weight: 500; font-size: 14px; line-height: 12px; color: black; display: flex; align-items: centers; gap: 6px;">
                      ${item.marker}
                      ${item.seriesName}
                    </div>
                    <div style="display:flex; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: #000;">
                      $${formatCurrency(item.value)}
                    </div>
                  </div>`;
                })
                .join("")}
            </div>`;
      },
    },
    legend: {
      lineStyle: {
        type: "solid",
      },
      data: [],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [],
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "${value}",
      },
    },
    series: [],
  };

  let typeListCategory = [...typeList];
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

  const convertCustomArrayToObject = (object, nameKey) => {
    const customArray = object[nameKey];
    for (const item of customArray) {
      const key = Object.keys(item)[0];
      const value = item[key];
      object[key] = value;
    }
    delete object[nameKey];
  };

  const handleFormatDataLineChart = (data, type) => {
    const formatXAxis = data?.map((item) => {
      return dayjs(item.date * 1000).format("YYYY-MM-DD");
    });

    const groupData = data?.map((item) => {
      return {
        date: item.date,
        data: groupBy(item.holding, type),
        keys: Object.getOwnPropertyNames(groupBy(item.holding, type)),
      };
    });

    const eachDataKeys = intersection(
      flatten(groupData?.map((item) => item.keys))
    );

    const formatData = eachDataKeys.map((key) => {
      return {
        name: key,
        type: "line",
        data: groupData.map((item) => {
          const sumValue =
            item?.data[key]?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0;
          return {
            value: sumValue,
          };
        }),
      };
    });

    return {
      series: formatData,
      formatXAxis,
      legend: eachDataKeys.map((item) => {
        return {
          name: item,
        };
      }),
    };
  };

  const getSectorGrowth = async (dataPersonalizeTag) => {
    isLoadingSectorGrowth = true;
    try {
      const response: AnalyticSectorGrowthRes = await sendMessage(
        "getSectorGrowth",
        {
          address: selectedWallet,
          chain: selectedChain,
          // fromDate: "YYYY-MM-DD",
          // toDate: "YYYY-MM-DD",
        }
      );

      if (response === undefined) {
        isEmptySectorGrowth = true;
        isLoadingSectorGrowth = false;
        return;
      } else if (selectedWallet === response?.address) {
        if (response?.result?.length === 0) {
          isEmptySectorGrowth = true;
          isLoadingSectorGrowth = false;
          return;
        }

        const listCategory = dataPersonalizeTag.map((item) => {
          return {
            label: item.category,
            value: item.category,
          };
        });
        typeListCategory = [...typeListCategory, ...listCategory];

        const customDataPersonalizeTag = dataPersonalizeTag.map((item) => {
          return {
            dataTag: item.dataTag.map((data) => {
              return {
                tokens: data.tokens.map((token) => {
                  return {
                    ...token,
                    [token.category]: token.tag,
                  };
                }),
              };
            }),
          };
        });

        const listDataCustom = flatten(
          flatten(customDataPersonalizeTag.map((item) => item.dataTag))?.map(
            (item) => item.tokens
          )
        );

        const formatDataResult = response.result.map((data) => {
          const formatDataHolding = data.holding.map((item) => {
            const selectedListDataCustom = listDataCustom.filter(
              (customData) => {
                return (
                  customData.contractAddress === item.contractAddress &&
                  item.chain === customData.chain
                );
              }
            );

            const findToken = listDataCustom.find((customData) => {
              return (
                customData.contractAddress === item.contractAddress &&
                item.chain === customData.chain
              );
            });

            if (
              findToken?.contractAddress === item.contractAddress &&
              item.chain === findToken?.chain &&
              selectedListDataCustom.length !== 0
            ) {
              const customTokenHolding = {
                ...item,
                custom: selectedListDataCustom.map((item) => {
                  return {
                    [item.category]: item.tag,
                  };
                }),
              };
              convertCustomArrayToObject(customTokenHolding, "custom");

              return customTokenHolding;
            } else {
              return item;
            }
          });

          const dataHolding = formatDataHolding.map((item) => {
            const customCategory = dataPersonalizeTag
              .map((category) => {
                return {
                  category: category.category,
                  isInclude: item.hasOwnProperty(category.category),
                };
              })
              .filter((eachCustom) => !eachCustom.isInclude);

            if (customCategory.length !== 0) {
              const customToken = {
                ...item,
                customCategory: customCategory.map((custom) => {
                  return {
                    [custom.category]: "Other",
                  };
                }),
              };
              convertCustomArrayToObject(customToken, "customCategory");
              return customToken;
            }

            return item;
          });

          return {
            ...data,
            holding: dataHolding,
          };
        });

        personalizeCategoryData = dataPersonalizeTag
          .map((item) => item.category)
          .map((data) => {
            return {
              category: data,
              data: handleFormatDataLineChart(formatDataResult, data),
            };
          });

        dataSector = handleFormatDataLineChart(formatDataResult, "sector");
        dataCategory = handleFormatDataLineChart(formatDataResult, "category");
        dataRank = handleFormatDataLineChart(formatDataResult, "rank");

        isLoadingSectorGrowth = false;
      } else {
        isEmptySectorGrowth = true;
        isLoadingSectorGrowth = false;
      }
    } catch (e) {
      console.log("error: ", e);
      isLoadingSectorGrowth = false;
      isEmptySectorGrowth = true;
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

        getSectorGrowth(formatDataCategory);
      }
    } catch (e) {
      console.log("e: ", e);
    }
  };

  $: {
    if (selectedType) {
      if (dataRank && dataCategory && dataSector && personalizeCategoryData) {
        if (selectedType === "sector") {
          optionLine = {
            ...optionLine,
            legend: {
              ...optionLine.legend,
              data: dataSector.legend,
            },
            xAxis: {
              ...optionLine.xAxis,
              data: dataSector.formatXAxis,
            },
            series: dataSector.series,
          };
        } else if (selectedType === "rank") {
          optionLine = {
            ...optionLine,
            legend: {
              ...optionLine.legend,
              data: dataRank.legend,
            },
            xAxis: {
              ...optionLine.xAxis,
              data: dataRank.formatXAxis,
            },
            series: dataRank.series,
          };
        } else if (selectedType === "category") {
          optionLine = {
            ...optionLine,
            legend: {
              ...optionLine.legend,
              data: dataCategory.legend,
            },
            xAxis: {
              ...optionLine.xAxis,
              data: dataCategory.formatXAxis,
            },
            series: dataCategory.series,
          };
        } else {
          const indexOfType = personalizeCategoryData
            .map((item) => item.category)
            .indexOf(selectedType);
          const selectedPersonalizeCategoryData =
            personalizeCategoryData[indexOfType];

          if (
            selectedPersonalizeCategoryData !== undefined &&
            isEmptySectorGrowth === false
          ) {
            optionLine = {
              ...optionLine,
              legend: {
                ...optionLine.legend,
                data: selectedPersonalizeCategoryData.data.legend,
              },
              xAxis: {
                ...optionLine.xAxis,
                data: selectedPersonalizeCategoryData.data.formatXAxis,
              },
              series: selectedPersonalizeCategoryData.data.series,
            };
          }
        }
      }
    }
  }

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        typeListCategory = [...typeList];
        dataRank = [];
        dataCategory = [];
        dataSector = [];
        personalizeCategoryData = [];
        getPersonalizeTag();
      }
    }
  }
</script>

<div class="border border_0000001a rounded-[20px] p-6">
  <div class="flex flex-col gap-4">
    <div class="xl:text-xl text-3xl font-medium">Sector Growth</div>
    <div
      class="relative overflow-hidden w-full flex gap-3 justify-between items-center"
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
        class="w-max flex gap-3 overflow-x-auto whitespace-nowrap"
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
  </div>
  <div class="mt-6">
    {#if isLoadingSectorGrowth}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full">
        {#if isEmptySectorGrowth}
          <div
            class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[465px]"
          >
            Empty
          </div>
        {:else}
          <div class="relative">
            <EChart
              id="sector-growth"
              theme="white"
              option={optionLine}
              height={465}
              notMerge={true}
              type="full-width"
            />
            <div
              class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 top-1/2 left-1/2"
            >
              <img src={Logo} alt="" width="140" height="140" />
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>

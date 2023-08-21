<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import {
    formatCurrency,
    typeList,
    handleFormatDataPieChart,
    handleFormatDataTable,
    getAddressContext,
  } from "~/utils";
  import { flatten, groupBy } from "lodash";
  import { wallet, chain } from "~/store";

  export let handleSelectedTableTokenHolding = (data, selectDataPieChart) => {};
  export let holdingTokenData;
  export let dataPieChart;
  export let listOptionTypeCategory;
  export let selectedOption;
  export let id;

  import Select from "~/components/Select.svelte";
  import EChart from "~/components/EChart.svelte";

  const MultipleLang = {
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
  };

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

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
                <img src=${
                  params?.data?.logo ||
                  "https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
                } alt="" width=20 height=20 style="border-radius: 100%" />
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                  ${params?.name} ${
          params?.data?.symbol ? `(${params?.data?.symbol})` : ""
        }
                </div>
              </div>

              ${
                params?.data?.name_balance.length !== 0
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
      type: "scroll",
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

  let typeListCategory = [
    {
      label: "All",
      value: "All",
    },
    {
      label: "Chain",
      value: "Chain",
    },
    ...typeList,
  ];
  let dataPersonalizeTag = [];
  let selectedType = {
    label: "All",
    value: "All",
  };

  let tokenDataCustomCategory = [];
  let tokenDataHolding = {
    value: "",
    dataPie: [],
    dataTable: {
      data: {
        name: "All",
        data: [],
      },
      select: [],
    },
  };
  let tokenDataRank = {
    value: "",
    dataPie: [],
    dataTable: {
      data: [],
      select: [],
    },
  };
  let tokenDataCategory = {
    value: "",
    dataPie: [],
    dataTable: {
      data: [],
      select: [],
    },
  };
  let tokenDataSector = {
    value: "",
    dataPie: [],
    dataTable: {
      data: [],
      select: [],
    },
  };
  let tokenDataChain = {
    value: "",
    dataPie: [],
    dataTable: {
      data: [],
      select: [],
    },
  };

  const formatDataPie = (data) => {
    return data.map((item) => {
      if (isNaN(item.value)) {
        return {
          ...item,
          value: 0,
        };
      } else {
        return item;
      }
    });
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

  onMount(() => {
    if (selectedOption && Object.keys(selectedOption).length !== 0) {
      selectedType = selectedOption;
    } else {
      selectedType = {
        label: "All",
        value: "All",
      };
    }
  });

  $: {
    if (selectedOption && Object.keys(selectedOption).length !== 0) {
      selectedType = selectedOption;
    }
  }

  $: {
    if (dataPersonalizeTag && holdingTokenData && dataPieChart) {
      const listCategory = dataPersonalizeTag.map((item) => {
        return {
          label: item.category,
          value: item.category,
        };
      });

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
        const formatDataTokens = holdingTokenData.map((tokenHolding) => {
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

      tokenDataCustomCategory = formatTokenDataEachCategory.map((item) => {
        return {
          value: item.category,
          dataPie: handleFormatDataPieChart(item.dataTokens, item.category),
          dataTable: handleFormatDataTable(item.dataTokens, item.category),
        };
      });

      tokenDataHolding = {
        value: "All",
        dataPie:
          dataPieChart.token.sumOrderBreakdownToken > 0
            ? dataPieChart.token.formatDataPieChartTopFiveToken.concat(
                dataPieChart.token.dataPieChartOrderBreakdownToken
              )
            : dataPieChart.token.formatDataPieChartTopFiveToken,
        dataTable: {
          data: {
            name: "All",
            data: holdingTokenData,
          },
          select: [],
        },
      };

      tokenDataChain = {
        value: "Chain",
        dataPie: handleFormatDataPieChart(holdingTokenData, "chain"),
        dataTable: handleFormatDataTable(holdingTokenData, "chain"),
      };

      tokenDataRank = {
        value: "rank",
        dataPie: handleFormatDataPieChart(holdingTokenData, "rank"),
        dataTable: handleFormatDataTable(holdingTokenData, "rank"),
      };

      tokenDataCategory = {
        value: "category",
        dataPie: handleFormatDataPieChart(holdingTokenData, "category"),
        dataTable: handleFormatDataTable(holdingTokenData, "category"),
      };

      tokenDataSector = {
        value: "sector",
        dataPie: handleFormatDataPieChart(holdingTokenData, "sector"),
        dataTable: handleFormatDataTable(holdingTokenData, "sector"),
      };

      if (listCategory.length !== 0) {
        typeListCategory = [...typeListCategory, ...listCategory].reduce(
          (unique, o) => {
            if (
              !unique.some(
                (obj) => obj.label === o.label && obj.value === o.value
              )
            ) {
              unique.push(o);
            }
            return unique;
          },
          []
        );
      }
    }
  }

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        typeListCategory = [
          {
            label: "All",
            value: "All",
          },
          {
            label: "Chain",
            value: "Chain",
          },
          ...typeList,
        ];
        dataPersonalizeTag = [];
        selectedType = {
          label: "",
          value: "",
        };
        tokenDataCustomCategory = [];
        tokenDataHolding = {
          value: "",
          dataPie: [],
          dataTable: {
            data: {
              name: "",
              data: [],
            },
            select: [],
          },
        };
        tokenDataRank = {
          value: "",
          dataPie: [],
          dataTable: {
            data: [],
            select: [],
          },
        };
        tokenDataCategory = {
          value: "",
          dataPie: [],
          dataTable: {
            data: [],
            select: [],
          },
        };
        tokenDataSector = {
          value: "",
          dataPie: [],
          dataTable: {
            data: [],
            select: [],
          },
        };
        getPersonalizeTag();
      }
    }
  }

  $: {
    if (selectedType) {
      if (selectedType.value === "sector") {
        optionPie = {
          ...optionPie,
          series: [
            {
              ...optionPie.series[0],
              data: formatDataPie(
                tokenDataSector.dataPie.map((item) => {
                  return {
                    ...item,
                    value_balance: 0,
                    name_balance: "",
                  };
                })
              ),
            },
          ],
        };
        handleSelectedTableTokenHolding(tokenDataSector.dataTable, optionPie);
      } else if (selectedType.value === "rank") {
        optionPie = {
          ...optionPie,
          series: [
            {
              ...optionPie.series[0],
              data: formatDataPie(
                tokenDataRank.dataPie.map((item) => {
                  return {
                    ...item,
                    value_balance: 0,
                    name_balance: "",
                  };
                })
              ),
            },
          ],
        };
        handleSelectedTableTokenHolding(tokenDataRank.dataTable, optionPie);
      } else if (selectedType.value === "category") {
        optionPie = {
          ...optionPie,
          series: [
            {
              ...optionPie.series[0],
              data: formatDataPie(
                tokenDataCategory.dataPie.map((item) => {
                  return {
                    ...item,
                    value_balance: 0,
                    name_balance: "",
                  };
                })
              ),
            },
          ],
        };
        handleSelectedTableTokenHolding(tokenDataCategory.dataTable, optionPie);
      } else if (selectedType.value === "All") {
        optionPie = {
          ...optionPie,
          series: [
            {
              ...optionPie.series[0],
              data: formatDataPie(tokenDataHolding.dataPie),
            },
          ],
        };
        handleSelectedTableTokenHolding(tokenDataHolding.dataTable, optionPie);
      } else if (selectedType.value === "Chain") {
        optionPie = {
          ...optionPie,
          series: [
            {
              ...optionPie.series[0],
              data: formatDataPie(
                tokenDataChain.dataPie.map((item) => {
                  return {
                    ...item,
                    value_balance: 0,
                    name_balance: "",
                  };
                })
              ),
            },
          ],
        };
        handleSelectedTableTokenHolding(tokenDataChain.dataTable, optionPie);
      } else {
        const indexOfType = tokenDataCustomCategory
          .map((item) => item.value)
          .indexOf(selectedType.value);

        const selectedData = tokenDataCustomCategory[indexOfType];

        if (selectedData !== undefined) {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: formatDataPie(
                  selectedData.dataPie.map((item) => {
                    return {
                      ...item,
                      value_balance: 0,
                      name_balance: "",
                    };
                  })
                ),
              },
            ],
          };
          handleSelectedTableTokenHolding(selectedData.dataTable, optionPie);
        }
      }
    }
  }
</script>

<div class="w-full">
  {#if listOptionTypeCategory && listOptionTypeCategory.length === 0}
    {#if getAddressContext(selectedWallet)?.type !== "BTC"}
      <div class="flex justify-end mb-5">
        <Select
          type="lang"
          positionSelectList="right-0"
          listSelect={listOptionTypeCategory &&
          listOptionTypeCategory.length !== 0
            ? listOptionTypeCategory
            : typeListCategory}
          bind:selected={selectedType}
        />
      </div>
    {/if}
  {/if}
  <EChart {id} theme="white" notMerge={true} option={optionPie} height={465} />
</div>

<style windi:preflights:global windi:safelist:global></style>

<script lang="ts">
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import {
    formatCurrency,
    typeList,
    handleFormatDataPieChart,
    handleFormatDataTable,
  } from "~/utils";
  import { flatten, groupBy } from "lodash";
  import { wallet, chain } from "~/store";

  export let handleSelectedTableTokenHolding = (data, selectDataPieChart) => {};
  export let holdingTokenData;
  export let dataPieChart;

  import Select from "~/components/Select.svelte";
  import EChart from "~/components/EChart.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

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

  let typeListCategory = [
    {
      label: "All",
      value: "All",
    },
    ...typeList,
  ];
  let dataPersonalizeTag = [];
  let selectedType = {
    label: "",
    value: "",
  };

  let tokensHoldingDataByChain = [];
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

  $: {
    if (dataPersonalizeTag && holdingTokenData && dataPieChart) {
      const listCategory = dataPersonalizeTag.map((item) => {
        return {
          label: item.category,
          value: item.category,
        };
      });

      const listChain = [
        ...new Set(holdingTokenData.map((item) => item.chain)),
      ].map((item) => {
        return {
          label: item,
          value: item,
        };
      });

      const filterTokensHoldingDataByChain = listChain.map((item) => {
        return {
          chain: item.value,
          tokens: holdingTokenData.filter(
            (token) => token.chain === item.value
          ),
        };
      });

      tokensHoldingDataByChain = filterTokensHoldingDataByChain.map((item) => {
        const sumToken = (item.tokens || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const sortTokens = item.tokens.sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });

        const topFiveToken = sortTokens.slice(0, 5).map((item) => {
          return {
            ...item,
            id: item.id || "N/A",
            symbol: item.symbol || "N/A",
            name: item.name || "N/A",
          };
        });

        const orderToken = sortTokens.slice(5, sortTokens.length);

        const sumOrderToken = (orderToken || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const dataPieChartOrderToken = [
          {
            logo: "https://raw.githubusercontent.com/getnimbus/assets/main/token.png",
            name: "Other tokens",
            symbol: "",
            name_ratio: "Ratio",
            value: (sumOrderToken / sumToken) * 100 || 0,
            name_value: "Value",
            value_value: sumOrderToken,
            name_balance: "",
            value_balance: 0,
          },
        ];

        const formatDataPieChartTopFiveToken = topFiveToken.map((item) => {
          return {
            logo: item.logo,
            name: item.name || item.symbol,
            symbol: item.symbol,
            name_ratio: "Ratio",
            value: (Number(item.value) / sumToken) * 100 || 0,
            name_value: "Value",
            value_value: Number(item.value),
            name_balance: "Balance",
            value_balance: Number(item.amount),
          };
        });

        return {
          value: item.chain,
          dataPie:
            item.tokens.length > 5
              ? formatDataPieChartTopFiveToken.concat(dataPieChartOrderToken)
              : formatDataPieChartTopFiveToken,
          dataTable: {
            data: {
              name: item.chain,
              data: sortTokens,
            },
            select: [],
          },
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
        dataPie: dataPieChart.token.formatDataPieChartTopFiveToken.concat(
          dataPieChart.token.dataPieChartOrderBreakdownToken
        ),
        dataTable: {
          data: {
            name: "All",
            data: holdingTokenData,
          },
          select: [],
        },
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

      if (listCategory.length !== 0 && listChain.length !== 0) {
        typeListCategory = [
          ...typeListCategory,
          ...listCategory,
          ...listChain,
        ].reduce((unique, o) => {
          if (
            !unique.some(
              (obj) => obj.label === o.label && obj.value === o.value
            )
          ) {
            unique.push(o);
          }
          return unique;
        }, []);
      }
    }
  }

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        typeListCategory = [
          {
            label: "All",
            value: "All",
          },
          ...typeList,
        ];
        dataPersonalizeTag = [];
        selectedType = {
          label: "",
          value: "",
        };
        tokensHoldingDataByChain = [];
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
      const listData = tokenDataCustomCategory.concat(tokensHoldingDataByChain);

      if (selectedType.value === "sector") {
        optionPie = {
          ...optionPie,
          series: [
            {
              ...optionPie.series[0],
              data: formatDataPie(tokenDataSector.dataPie),
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
              data: formatDataPie(tokenDataRank.dataPie),
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
              data: formatDataPie(tokenDataCategory.dataPie),
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
      } else {
        const indexOfType = listData
          .map((item) => item.value)
          .indexOf(selectedType.value);

        const selectedData = listData[indexOfType];

        if (selectedData !== undefined) {
          optionPie = {
            ...optionPie,
            series: [
              {
                ...optionPie.series[0],
                data: formatDataPie(selectedData.dataPie),
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
  <div class="flex justify-start mb-5">
    <Select
      type="lang"
      listSelect={typeListCategory || []}
      bind:selected={selectedType}
    />
  </div>
  <EChart
    id="pie-chart-token-allocation"
    theme="white"
    notMerge={true}
    option={optionPie}
    height={465}
  />
  <div class="flex items-center gap-3">
    <div class="rounded-[20px] flex-1 bg-[#FAFAFBFF] px-4 pb-3 pt-5">
      <div class="text-base text-[#6E7787FF] relative">
        <div class="border border-[#00A878] absolute -top-1 left-0 w-[40px]" />
        Last week
      </div>
      <div class="text-2xl">$1890.6</div>
      <div class="text-lg flex items-center gap-1">
        <img src={TrendUp} alt="trend" class="mb-1" />
        <div class="text-[#00A878]">16%</div>
      </div>
    </div>
    <div class="rounded-[20px] flex-1 bg-[#FAFAFBFF] px-4 pb-3 pt-5">
      <div class="text-base text-[#6E7787FF] relative">
        <div class="border border-red-500 absolute -top-1 left-0 w-[40px]" />
        This week
      </div>
      <div class="text-2xl">$890.6</div>
      <div class="text-lg flex items-center gap-1">
        <img src={TrendDown} alt="trend" class="mb-1" />
        <div class="text-red-500">8%</div>
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

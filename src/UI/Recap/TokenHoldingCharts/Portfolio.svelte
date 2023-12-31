<script>
  import { i18n } from "~/lib/i18n";
  import { formatCurrency, formatPercent, formatValue } from "~/utils";

  import EChart from "~/components/EChart.svelte";
  import Loading from "~/components/Loading.svelte";

  export let data;
  export let loading;

  import defaultToken from "~/assets/defaultToken.png";

  const MultipleLang = {
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
  };

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
                <img src=${params?.data?.logo || defaultToken}
                onerror="this.onerror=null;this.src='${defaultToken}';"
                alt="" width=20 height=20 style="border-radius: 100%" />
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: white">
                  ${params?.name} ${
                    params?.data?.symbol ? `(${params?.data?.symbol})` : ""
                  }
                </div>
              </div>

              ${
                params?.data?.name_balance.length !== 0
                  ? `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: white">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${MultipleLang[params?.data?.name_balance]}
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                    ${formatCurrency(params?.data?.value_balance)}
                  </div>
                </div>
              `
                  : ""
              }

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: white">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${MultipleLang[params?.data?.name_value]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${formatValue(params?.data?.value_value)}
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); color: white">
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${MultipleLang[params?.data?.name_ratio]}
                </div>
                <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); font-weight: 500; font-size: 14px; line-height: 17px;">
                  ${formatPercent(params?.value)}%
                </div>
              </div>
            </div>`;
      },
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      top: "16%",
      right: "right",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "60%"],
        left: -150,
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
  let isEmptyDataPieTokens = false;

  const formatDataPie = (data) => {
    return data?.map((item) => {
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

  const formatDataHoldingToken = (data) => {
    const formatData =
      data
        ?.map((item) => {
          return {
            ...item,
            value: Number(item?.amount) * Number(item?.price?.price),
          };
        })
        .sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        }) || [];

    formatTokenBreakdown(formatData);
  };

  const formatTokenBreakdown = (data) => {
    if (data && data?.length === 0) {
      isEmptyDataPieTokens = true;
    } else {
      isEmptyDataPieTokens = false;
    }

    const formatData = data.map((item) => {
      return {
        ...item,
        value: Number(item?.amount || 0) * Number(item?.price?.price || 0),
      };
    });

    const sumToken = (formatData || []).reduce(
      (prev, item) => prev + Number(item?.value),
      0
    );

    const sortBreakdownToken = formatData?.sort((a, b) => {
      if (a.value < b.value) {
        return 1;
      }
      if (a.value > b.value) {
        return -1;
      }
      return 0;
    });

    const topFiveBreakdownToken = sortBreakdownToken
      ?.slice(0, 5)
      .map((item) => {
        return {
          ...item,
          id: item.id || "N/A",
          symbol: item.symbol || "N/A",
          name: item.name || "N/A",
        };
      });

    const orderBreakdownToken = sortBreakdownToken?.slice(
      5,
      sortBreakdownToken.length
    );

    const sumOrderBreakdownToken = (orderBreakdownToken || []).reduce(
      (prev, item) => prev + Number(item.value),
      0
    );

    const dataPieChartOrderBreakdownToken = [
      {
        logo: defaultToken,
        name: "Other tokens",
        symbol: "",
        name_ratio: "Ratio",
        value: (sumOrderBreakdownToken / sumToken) * 100,
        name_value: "Value",
        value_value: sumOrderBreakdownToken,
        name_balance: "",
        value_balance: 0,
      },
    ];

    const formatDataPieChartTopFiveToken = topFiveBreakdownToken?.map(
      (item) => {
        return {
          logo: item.logo || defaultToken,
          name: item.name || item.symbol,
          symbol: item.symbol,
          name_ratio: "Ratio",
          value: (Number(item.value) / sumToken) * 100,
          name_value: "Value",
          value_value: Number(item.value),
          name_balance: "Balance",
          value_balance: Number(item.amount || item.balance),
        };
      }
    );

    const dataPieChartToken = {
      sumOrderBreakdownToken,
      formatDataPieChartTopFiveToken,
      dataPieChartOrderBreakdownToken,
    };

    const tokenDataHolding = {
      dataPie:
        dataPieChartToken.sumOrderBreakdownToken > 0
          ? dataPieChartToken.formatDataPieChartTopFiveToken.concat(
              dataPieChartToken.dataPieChartOrderBreakdownToken
            )
          : dataPieChartToken.formatDataPieChartTopFiveToken,
    };

    optionPie = {
      ...optionPie,
      legend: {
        ...optionPie.legend,
        formatter: function (name) {
          const selected = tokenDataHolding.dataPie.find(
            (item) => item.name.toLowerCase() === name.toLowerCase()
          );
          return selected?.symbol || name;
        },
      },
      series: [
        {
          ...optionPie.series[0],
          data: formatDataPie(tokenDataHolding.dataPie),
        },
      ],
    };
  };

  $: {
    if (data && data.length !== 0) {
      formatDataHoldingToken(data);
    }
  }
</script>

<div class="flex-1 flex flex-col p-[24px] rounded-[20px] bg-black">
  <div class="text-white text-xl font-medium">Your Portfolio</div>
  {#if loading}
    <div class="flex justify-center items-center h-full h-[225px]">
      <Loading />
    </div>
  {:else}
    <div>
      {#if isEmptyDataPieTokens}
        <div
          class="flex justify-center items-center h-full xl:text-lg text-xl text-white h-[225px]"
        >
          Empty
        </div>
      {:else}
        <div class="pt-4">
          <EChart
            id="recap-portfolio"
            theme="dark"
            notMerge={true}
            option={optionPie}
            height={225}
          />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>

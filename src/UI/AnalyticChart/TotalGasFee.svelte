<script lang="ts">
  import { wallet, chain, typeWallet } from "~/store";
  import dayjs from "dayjs";
  import { formatBalance, formatCurrency, getAddressContext } from "~/utils";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";

  import CalendarChart from "~/components/CalendarChart.svelte";

  export let packageSelected;
  export let darkMode;

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let sum = 0;
  let option = {
    tooltip: {
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 180px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${dayjs(params.data[0]).format("YYYY-MM-DD")}
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #00b580; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  Gas fee paid
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: #000;">
                  $${formatCurrency(params.data[1])}
                </div>
              </div>
            </div>`;
      },
    },
    visualMap: {
      min: 0,
      max: 1,
      calculable: true,
      type: "piecewise",
      orient: "horizontal",
      top: 0,
      right: 40,
      inRange: {
        color: ["#00A878"],
        opacity: [0.1, 1],
      },
      controller: {
        inRange: {
          color: ["#f4f5f8", "#00A878"],
          opacity: [0.1, 1],
        },
      },
    },
    calendar: {
      top: 80,
      left: 60,
      right: 60,
      cellSize: ["auto", "auto"],
      range: dayjs(new Date()).format("YYYY"),
      itemStyle: {
        borderWidth: 0.5,
      },
      yearLabel: { show: false },
      dayLabel: { show: true, color: "#6b7280" },
      monthLabel: { show: true, color: "#6b7280" },
    },
    dayLabel: {
      nameMap: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    series: {
      type: "heatmap",
      coordinateSystem: "calendar",
      data: [dayjs(new Date()).format("YYYY-MM-DD"), 1],
    },
  };

  const getAnalyticHistorical = async (address, chain) => {
    if (packageSelected === "FREE") {
      return undefined;
    }
    const response = await nimbus.get(
      `/v2/analysis/${address}/historical?chain=${chain}`
    );
    return response.data;
  };

  const formatDataHistorical = (data) => {
    if (data.length !== 0) {
      const maxHistorical = data?.reduce((prev, current) =>
        prev.value > current.value ? prev : current
      );

      sum = data?.reduce((prev, item) => prev + item.value, 0);

      const formatData = data?.map((item) => {
        return [
          dayjs(Number(item.date) * 1000).format("YYYY-MM-DD"),
          Number(formatCurrency(item.value)),
        ];
      });

      option = {
        ...option,
        visualMap: {
          ...option.visualMap,
          max: Number(formatBalance(maxHistorical.value)),
        },
        calendar: {
          ...option.calendar,
          range: dayjs(Number(maxHistorical.date) * 1000).format("YYYY"),
        },
        series: {
          ...option.series,
          data: formatData,
        },
      };
    } else {
      option = {
        tooltip: {
          extraCssText: "z-index: 9997",
          formatter: function (params) {
            return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 180px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                darkMode ? "white" : "black"
              }">
                ${dayjs(params.data[0]).format("YYYY-MM-DD")}
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #00b580; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  Gas fee paid
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px;">
                  $${formatCurrency(params.data[1])}
                </div>
              </div>
            </div>`;
          },
        },
        visualMap: {
          min: 0,
          max: 1,
          calculable: true,
          type: "piecewise",
          orient: "horizontal",
          top: 0,
          right: 40,
          inRange: {
            color: ["#00A878"],
            opacity: [0.1, 1],
          },
          controller: {
            inRange: {
              color: ["#f4f5f8", "#00A878"],
              opacity: [0.1, 1],
            },
          },
        },
        calendar: {
          top: 80,
          left: 60,
          right: 60,
          cellSize: ["auto", "auto"],
          range: dayjs(new Date()).format("YYYY"),
          itemStyle: {
            borderWidth: 0.5,
          },
          yearLabel: { show: false },
          dayLabel: { show: true, color: "#6b7280" },
          monthLabel: { show: true, color: "#6b7280" },
        },
        dayLabel: {
          nameMap: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
        series: {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: [dayjs(new Date()).format("YYYY-MM-DD"), 1],
        },
      };
    }
  };

  $: enabledQuery = Boolean(
    getAddressContext(selectedWallet)?.type === "EVM" ||
      typeWalletAddress === "CEX"
  );

  $: query = createQuery({
    queryKey: ["historical", selectedWallet, selectedChain],
    enabled: enabledQuery,
    queryFn: () => getAnalyticHistorical(selectedWallet, selectedChain),
    staleTime: Infinity,
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      formatDataHistorical($query.data);
    }
  }
</script>

<div
  class={`rounded-[20px] py-6 ${
    darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
  }`}
>
  <CalendarChart
    {option}
    isEmptyDataChart={$query.isError}
    isLoadingChart={$query.isFetching}
    title="Total gas fee paid"
    tooltipTitle=""
    id="total-gasfee-paid"
    {sum}
    type="primary"
  />
</div>

<style windi:preflights:global windi:safelist:global></style>

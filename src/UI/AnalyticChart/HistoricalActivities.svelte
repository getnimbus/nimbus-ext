<script lang="ts">
  import { wallet, chain, typeWallet } from "~/store";
  import dayjs from "dayjs";
  import { nimbus } from "~/lib/network";
  import { formatCurrency } from "~/utils";
  import { createQuery } from "@tanstack/svelte-query";

  import type {
    AnalyticHistoricalRes,
    AnalyticHistoricalFormat,
  } from "~/types/AnalyticHistoricalData";

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

  let option = {
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
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; display: flex; align-items: centers; gap: 6px; color: ${
                  darkMode ? "white" : "black"
                }">
                  <div style="background: #00b580; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  Activity
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  darkMode ? "white" : "black"
                }">
                  ${params.data[1]}
                </div>
              </div>
            </div>`;
      },
    },
    visualMap: {
      min: 0,
      max: 1,
      calculable: true,
      orient: "horizontal",
      top: 0,
      right: 40,
      inRange: {
        color: ["#00A878"],
        opacity: [0.1, 1],
      },
      controller: {
        inRange: {
          opacity: [0.1, 1],
        },
        outOfRange: {
          color: "#f4f5f8",
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

  const formatDataHistorical = (data) => {
    if (data.length !== 0) {
      const maxHistorical = data?.reduce((prev, current) =>
        prev.count > current.count ? prev : current
      );

      const formatData: AnalyticHistoricalFormat = data?.map((item) => {
        return [
          dayjs(Number(item.date) * 1000).format("YYYY-MM-DD"),
          item.count,
        ];
      });

      option = {
        ...option,
        visualMap: {
          ...option.visualMap,
          max: maxHistorical.count,
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
        ...option,
        visualMap: {
          ...option.visualMap,
          max: 0,
        },
        calendar: {
          ...option.calendar,
          range: dayjs(new Date()).format("YYYY"),
        },
        series: {
          ...option.series,
          data: [dayjs(new Date()).format("YYYY-MM-DD"), 1],
        },
      };
    }
  };

  const getAnalyticHistorical = async (address, chain) => {
    const response = await nimbus.get(
      `/v2/analysis/${address}/historical?chain=${chain}`
    );
    return response?.data || [];
  };

  $: enabledQuery =
    selectedWallet === "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0"
      ? true
      : Boolean(
          (typeWalletAddress === "EVM" ||
            typeWalletAddress === "CEX" ||
            typeWalletAddress === "SOL" ||
            typeWalletAddress === "BUNDLE") &&
            selectedWallet.length !== 0 &&
            packageSelected !== "FREE"
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
  class={`rounded-[20px] py-6 relative ${
    darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
  }`}
>
  <CalendarChart
    {option}
    isEmptyDataChart={$query.isError}
    isLoadingChart={$query.isFetching}
    title="Activities"
    tooltipTitle="The chart shows only activities made by this wallet"
    id="historical-activities-analytic"
    type="normal"
  />
  {#if typeWalletAddress === "SOL"}
    <div
      class={`absolute top-0 left-0 rounded-[20px] z-30 w-full h-full flex items-center justify-center ${
        darkMode ? "bg-[#222222e6]" : "bg-white/90"
      } z-10 backdrop-blur-md`}
    >
      <div class="text-2xl xl:text-lg">Coming soon 🚀</div>
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>

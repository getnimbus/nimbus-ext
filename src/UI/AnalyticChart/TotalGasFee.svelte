<script lang="ts">
  import { wallet, chain, typeWallet } from "~/store";
  import dayjs from "dayjs";
  import { formatBalance, formatCurrency } from "~/utils";
  import { listSupported, otherGeneration } from "~/lib/chains";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";

  import CalendarChart from "~/components/CalendarChart.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let packageSelected;
  export let darkMode;
  export let isFetch;

  let sum = 0;
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
                  Gas fee paid
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  darkMode ? "white" : "black"
                }">
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

  const handleValidateAddress = async (address: string) => {
    if (address) {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      return (
        response?.data || {
          address: "",
          type: "",
        }
      );
    }
  };

  $: queryValidate = createQuery({
    queryKey: ["validate", $wallet],
    queryFn: () => handleValidateAddress($wallet),
    staleTime: Infinity,
    retry: false,
    enabled: Boolean($wallet && $wallet?.length !== 0),
  });

  const getAnalyticHistorical = async (chain) => {
    let addressChain = chain;

    if (addressChain === "ALL") {
      const validateAccount = $queryValidate.data;
      addressChain = validateAccount?.type;
    }

    const response = await nimbus.get(
      `/v2/analysis/${$wallet}/historical?chain=${
        addressChain === "BUNDLE" ? "" : addressChain
      }`
    );
    return response?.data || [];
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
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; display: flex; align-items: centers; gap: 6px; color: ${
                  darkMode ? "white" : "black"
                }">
                  <div style="background: #00b580; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  Gas fee paid
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  darkMode ? "white" : "black"
                }">
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
    listSupported.includes($typeWallet) &&
      $wallet &&
      $wallet?.length !== 0 &&
      packageSelected !== "FREE"
  );

  $: query = createQuery({
    queryKey: ["historical", $wallet, $chain],
    queryFn: () => getAnalyticHistorical($chain),
    staleTime: Infinity,
    enabled: enabledQuery && isFetch && !$queryValidate.isFetching,
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      formatDataHistorical($query.data);
    }
  }
</script>

<div
  class={`rounded-[20px] py-4 relative ${
    darkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
  }`}
>
  <div class="flex flex-col gap-1 xl:pl-6">
    <div class="font-medium flex justify-start w-max xl:text-xl text-2xl">
      Total gas fee paid
    </div>
    <div class="text-lg font-medium flex">
      $<TooltipNumber number={sum} type="balance" />
    </div>
  </div>

  <div class="overflow-x-auto w-full mt-2">
    <div class="min-w-[800px]">
      <CalendarChart
        {option}
        isEmptyDataChart={$query.isError}
        isLoadingChart={$query.isFetching}
        isTrxPage={false}
        id="total-gasfee-paid"
        type="primary"
      />
    </div>
  </div>

  {#if otherGeneration.includes($typeWallet)}
    <div
      class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex items-center justify-center z-8 backdrop-blur-md ${
        darkMode ? "bg-black/90" : "bg-white/95"
      }`}
    >
      <div class="text-lg">Coming soon 🚀</div>
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>

<script lang="ts">
  import { getAddressContext } from "~/utils";
  import { sendMessage } from "webext-bridge";
  import { wallet, chain, isOpenReport } from "~/store";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import type {
    AnalyticHistoricalRes,
    AnalyticHistoricalFormat,
  } from "~/types/AnalyticHistoricalData";

  import CalendarChart from "~/components/CalendarChart.svelte";
  import Button from "~/components/Button.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let isLoadingChart = false;
  let isEmptyDataChart = false;

  let option = {
    tooltip: {
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 180px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${dayjs(params.data[0]).format("DD MMM YYYY")}
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #00b580; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  Activity
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: #000;">
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

  const getAnalyticHistorical = async () => {
    if (getAddressContext(selectedWallet).type === "EVM") {
      isLoadingChart = true;
      try {
        const response: AnalyticHistoricalRes = await sendMessage(
          "getAnalytic",
          {
            address: selectedWallet,
            chain: selectedChain,
          }
        );
        if (response && response.length !== 0) {
          const maxHistorical = response.reduce((prev, current) =>
            prev.count > current.count ? prev : current
          );

          const formatData: AnalyticHistoricalFormat = response.map((item) => {
            return [dayjs(item.date).format("YYYY-MM-DD"), item.count];
          });

          option = {
            ...option,
            visualMap: {
              ...option.visualMap,
              max: maxHistorical.count,
            },
            calendar: {
              ...option.calendar,
              range: dayjs(maxHistorical.date).format("YYYY"),
            },
            series: {
              ...option.series,
              data: formatData,
            },
          };
          isLoadingChart = false;
        } else {
          isLoadingChart = false;
          isEmptyDataChart = true;
        }
      } catch (e) {
        console.log("error: ", e);
        isLoadingChart = false;
        isEmptyDataChart = true;
      }
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      isLoadingChart = false;
      isEmptyDataChart = false;
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        getAnalyticHistorical();
      }
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div
    class="xl:text-2xl text-4xl font-medium text-black border-b-[1px] mb-6 pb-4"
  >
    Personality
  </div>
  <div class="flex flex-col gap-6">
    <div class="pb-9 pt-7 border border-[#0000001a] rounded-[20px]">
      <CalendarChart
        {option}
        {isEmptyDataChart}
        {isLoadingChart}
        title="Historical activities"
        tooltipTitle="The chart shows only activities made by this wallet"
        id="historical-activities-personality"
        type="primary"
      />
    </div>
    {#if getAddressContext(selectedWallet)?.type !== "BTC"}
      <div class="flex justify-center mx-auto">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenReport.update((n) => (n = true));
          }}
        >
          Request analytics
        </Button>
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

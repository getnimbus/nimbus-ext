<script lang="ts">
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";

  import type { TrxHistoryDataRes } from "~/types/TrxHistoryData";
  import type {
    AnalyticHistoricalRes,
    AnalyticHistoricalFormat,
  } from "~/types/AnalyticHistoricalData";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import CalendarChart from "~/components/CalendarChart.svelte";
  import HistoricalTransactions from "./HistoricalTransactions.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let isLoading = false;
  let data = [];
  let pageToken = "";
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
        opacity: [0, 1],
      },
      controller: {
        inRange: {
          opacity: [0.2, 1],
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
    isLoadingChart = true;
    try {
      const response: AnalyticHistoricalRes = await sendMessage("getAnalytic", {
        address: selectedWallet,
        chain: selectedChain,
      });
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
      } else {
        isEmptyDataChart = true;
      }
    } catch (e) {
      console.log("error: ", e);
      isEmptyDataChart = true;
    } finally {
      isLoadingChart = false;
    }
  };

  const getListTransactions = async (page: string) => {
    isLoading = true;
    try {
      const response: TrxHistoryDataRes = await sendMessage("getTrxHistory", {
        address: selectedWallet,
        chain: selectedChain,
        pageToken: page,
      });
      if (selectedWallet === response.address) {
        data = [...data, ...response.result.data];
        pageToken = response.result.pageToken;
      } else {
        console.log("response: ", response);
      }
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  const handleLoadMore = (paginate: string) => {
    getListTransactions(paginate);
  };

  $: {
    if (selectedWallet || selectedChain) {
      data = [];
      pageToken = "";
      isLoading = false;
      isLoadingChart = false;
      isEmptyDataChart = false;
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        getListTransactions("");
        getAnalyticHistorical();
      }
    }
  }
</script>

<AddressManagement type="order" title="Transactions">
  <span slot="body">
    <div class="max-w-[2000px] m-auto w-[90%] -mt-32">
      <div
        class="flex flex-col gap-7 bg-white rounded-[20px] p-8"
        style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
      >
        <div
          class="border border-[#0000001a] rounded-[20px] pt-6 pb-9 flex flex-col gap-4"
        >
          <CalendarChart
            {option}
            {isEmptyDataChart}
            {isLoadingChart}
            isTrxPage
            title="Historical Activities"
            tooltipTitle="The chart shows only activities made by this wallet"
            id="HistoricalActivities"
          />
        </div>
        <HistoricalTransactions
          {isLoading}
          {pageToken}
          {data}
          loadMore={handleLoadMore}
        />
      </div>
    </div>
  </span>
</AddressManagement>

<style>
</style>

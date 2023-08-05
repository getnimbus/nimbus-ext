<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain, typeWallet } from "~/store";
  import dayjs from "dayjs";
  import { formatCurrency, getAddressContext } from "~/utils";

  import CalendarChart from "~/components/CalendarChart.svelte";

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

  let isLoadingChart = false;
  let isEmptyDataChart = false;
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

  const getAnalyticHistorical = async () => {
    isLoadingChart = true;
    try {
      const response: any[] = await sendMessage("getAnalytic", {
        address: selectedWallet,
        chain: selectedChain,
      });
      if (response && response.length !== 0) {
        const maxHistorical = response.reduce((prev, current) =>
          prev.value > current.value ? prev : current
        );

        sum = response.reduce((prev, item) => prev + item.value, 0);

        const formatData = response.map((item) => {
          return [dayjs(item.date * 1000).format("YYYY-MM-DD"), item.value];
        });

        option = {
          ...option,
          visualMap: {
            ...option.visualMap,
            max: maxHistorical.value,
          },
          calendar: {
            ...option.calendar,
            range: dayjs(maxHistorical.date * 1000).format("YYYY"),
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
  };

  $: {
    if (selectedWallet || selectedChain) {
      isLoadingChart = false;
      isEmptyDataChart = false;
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        if (
          getAddressContext(selectedWallet)?.type === "EVM" ||
          typeWalletAddress === "CEX"
        ) {
          getAnalyticHistorical();
        }
      }
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] py-6">
  <CalendarChart
    {option}
    {isEmptyDataChart}
    {isLoadingChart}
    title="Total gas fee paid"
    tooltipTitle=""
    id="total-gasfee-paid"
    {sum}
    type="primary"
  />
</div>

<style windi:preflights:global windi:safelist:global></style>

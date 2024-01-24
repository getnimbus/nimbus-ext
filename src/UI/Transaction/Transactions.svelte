<script lang="ts">
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { wallet, chain, typeWallet, isDarkMode } from "~/store";
  import { typeTrx } from "~/utils";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import type { TrxHistoryDataRes } from "~/types/TrxHistoryData";
  import type {
    AnalyticHistoricalRes,
    AnalyticHistoricalFormat,
  } from "~/types/AnalyticHistoricalData";

  import HistoricalTransactions from "./HistoricalTransactions.svelte";
  import AddressManagement from "~/components/AddressManagement.svelte";
  import CalendarChart from "~/components/CalendarChart.svelte";
  import CoinSelector from "~/components/CoinSelector.svelte";
  import Select from "~/components/Select.svelte";

  import All from "~/assets/all.svg";
  import { otherGeneration } from "~/lib/chains";

  const types = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Buy",
      value: "buy",
    },
    {
      label: "Swap",
      value: "swap",
    },
    {
      label: "Sell",
      value: "sell",
    },
    {
      label: "Unknown",
      value: "unknown",
    },
  ];

  let isLoading = false;
  let data = [];
  let pageToken = "";

  let option = {
    tooltip: {
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 180px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                $isDarkMode ? "white" : "black"
              }">
                ${dayjs(params.data[0]).format("YYYY-MM-DD")}
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; display: flex; align-items: centers; gap: 6px; color: ${
                  $isDarkMode ? "white" : "black"
                }">
                  <div style="background: #00b580; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  Activity
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  $isDarkMode ? "white" : "black"
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

  let selectedType = {
    label: "All",
    value: "all",
  };

  let selectedCoin = {
    name: "All",
    logo: All,
    symbol: "all",
  };

  $: selectedTypeValue = selectedType?.value;
  $: selectedCoinValue = selectedCoin?.symbol;

  const getAnalyticHistorical = async (address, chain) => {
    const response: AnalyticHistoricalRes = await nimbus.get(
      `/v2/analysis/${address}/historical?chain=${chain}`
    );
    return response?.data || [];
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

  $: enabledQuery = Boolean(
    ($typeWallet === "EVM" ||
      $typeWallet === "CEX" ||
      $typeWallet === "BUNDLE") &&
      $wallet &&
      $wallet?.length !== 0
  );

  $: query = createQuery({
    queryKey: ["historical", $wallet, $chain],
    enabled: enabledQuery,
    queryFn: () => getAnalyticHistorical($wallet, $chain),
    staleTime: Infinity,
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      formatDataHistorical($query.data);
    }
  }

  const getListTransactions = async (
    page: string,
    type: string,
    coin: string
  ) => {
    isLoading = true;
    try {
      const response: TrxHistoryDataRes = await nimbus.get(
        `/v2/address/${$wallet}/history?chain=${$chain}&pageToken=${page}${
          type !== "all" ? `&type=${type}` : ""
        }${coin !== "all" ? `&coin=${coin}` : ""}`
      );
      if (response && response?.data) {
        data = [...data, ...response?.data?.data];
        pageToken = response.data.pageToken;
      }
    } catch (e) {
      console.error("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  const handleLoadMore = (paginate: string) => {
    getListTransactions(paginate, selectedTypeValue, selectedCoinValue);
  };

  $: {
    if ($wallet) {
      data = [];
      pageToken = "";
      isLoading = false;
      if (
        $wallet?.length !== 0 &&
        $chain?.length !== 0 &&
        !otherGeneration.includes($typeWallet)
      ) {
        getListTransactions("", selectedTypeValue, selectedCoinValue);
      }
    }
  }
</script>

<AddressManagement type="order" title="Transactions">
  <span slot="body">
    <div class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] -mt-32 relative">
      <div class="trx_container flex flex-col gap-7 rounded-[20px] xl:p-8 p-6">
        {#if $typeWallet === "EVM" || $typeWallet === "MOVE" || $typeWallet === "CEX"}
          <div
            class={`rounded-[20px] pt-6 pb-9 flex flex-col gap-4  ${
              $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
            }`}
          >
            <CalendarChart
              {option}
              isEmptyDataChart={$query.isError}
              isLoadingChart={$query.isFetching}
              isTrxPage
              title="Historical Activities"
              tooltipTitle="The chart shows only activities made by this wallet"
              id="historical-activities"
              type="normal"
            />
          </div>
        {/if}

        <div
          class={`rounded-[20px] p-6 flex flex-col gap-4 ${
            $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
          }`}
        >
          <div class="flex flex-col justify-between gap-4 xl:flex-row">
            <div class="xl:text-2xl text-4xl font-medium">
              Historical Transactions
            </div>
            {#if $typeWallet === "EVM" || $typeWallet === "MOVE"}
              <div class="flex items-center gap-4">
                <CoinSelector
                  bind:selected={selectedCoin}
                  positionSelectList="right-0"
                />
                <Select
                  type="lang"
                  bind:selected={selectedType}
                  listSelect={types}
                  positionSelectList="right-0"
                />
              </div>
            {/if}
          </div>
          <HistoricalTransactions
            {isLoading}
            {pageToken}
            {data}
            loadMore={handleLoadMore}
          />
        </div>
      </div>

      {#if otherGeneration.includes($typeWallet)}
        <div
          class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center gap-3 justify-center z-30 backdrop-blur-md ${
            $isDarkMode ? "bg-black/90" : "bg-white/95"
          }`}
        >
          <div class="text-lg">Coming soon 🚀</div>
        </div>
      {/if}
    </div>
  </span>
</AddressManagement>

<style>
  :global(body) .trx_container {
    background: #fff;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1);
  }
  :global(body.dark) .trx_container {
    background: #0f0f0f;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 1);
  }
</style>

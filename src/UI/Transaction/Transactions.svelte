<script lang="ts">
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { wallet, chain, typeWallet } from "~/store";
  import { getAddressContext, typeTrx } from "~/utils";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";

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

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let isLoading = false;
  let data = [];
  let pageToken = "";

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

  let selectedType = "all";
  let searchValue = "";
  let timerSearchDebounce;

  const debounceSearch = (value) => {
    clearTimeout(timerSearchDebounce);
    timerSearchDebounce = setTimeout(() => {
      searchValue = value;
    }, 300);
  };

  const getAnalyticHistorical = async (address, chain) => {
    const response: AnalyticHistoricalRes = await nimbus.get(
      `/v2/analysis/${address}/historical?chain=${chain}`
    );
    return response.data;
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

  const getListTransactions = async (page: string) => {
    isLoading = true;
    try {
      const response: TrxHistoryDataRes = await nimbus.get(
        `/v2/address/${selectedWallet}/history?chain=${selectedChain}&pageToken=${page}`
      );
      if (response && response.data) {
        data = [...data, ...response.data.data];
        pageToken = response.data.pageToken;
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
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        getListTransactions("");
      }
    }
  }
</script>

<AddressManagement type="order" title="Transactions">
  <span slot="body">
    <div class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] -mt-32">
      <div
        class="flex flex-col gap-7 bg-white rounded-[20px] xl:p-8"
        style="box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.10);"
      >
        {#if getAddressContext(selectedWallet)?.type === "EVM" || typeWalletAddress === "CEX"}
          <div
            class="border border-[#0000001a] rounded-[20px] pt-6 pb-9 flex flex-col gap-4"
          >
            {#if data.length !== 0}
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
            {/if}
          </div>
        {/if}

        <div
          class="border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-4"
        >
          <div class="flex flex-col justify-between gap-4 xl:flex-row">
            <div class="xl:text-2xl text-4xl font-medium text-black">
              Historical Transactions
            </div>
            <div class="flex items-center justify-end gap-2">
              <!-- <div class="flex items-center gap-1">
                <AnimateSharedLayout>
                  {#each typeTrx as type}
                    <div
                      class="relative cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all"
                      on:click={() => (selectedType = type.value)}
                    >
                      <div
                        class={`relative z-20 ${
                          selectedType === type.value && "text-white"
                        }`}
                      >
                        {type.label}
                      </div>
                      {#if type.value === selectedType}
                        <Motion
                          let:motion
                          layoutId="active-pill"
                          transition={{ type: "spring", duration: 0.6 }}
                        >
                          <div
                            class="absolute inset-0 rounded-[100px] bg-[#1E96FC] z-10"
                            use:motion
                          />
                        </Motion>
                      {/if}
                    </div>
                  {/each}
                </AnimateSharedLayout>
              </div>
              <input
                on:keyup={({ target: { value } }) => debounceSearch(value)}
                on:keydown={(event) => {
                  if (event.which == 13 || event.keyCode == 13) {
                    console.log("HELLO");
                  }
                }}
                value={searchValue}
                placeholder={"Filter by hash/token"}
                type="text"
                class="xl:w-[250px] w-full text-sm py-2 xl:px-3 px-2 rounded-[1000px] text-[#00000099] placeholder-[#00000099] border border-[#00000070] focus:outline-none focus:ring-0"
              /> -->
            </div>
          </div>
          <HistoricalTransactions
            {isLoading}
            {pageToken}
            {data}
            loadMore={handleLoadMore}
          />
        </div>
      </div>
    </div>
  </span>
</AddressManagement>

<style>
</style>

<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import mixpanel from "mixpanel-browser";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { useNavigate } from "svelte-navigator";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { isDarkMode, selectedPackage } from "~/store";
  import { filterDuplicates } from "~/utils";

  import Loading from "~/components/Loading.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import PublicPortfolioItem from "~/components/PublicPortfolioItem.svelte";
  import Button from "~/components/Button.svelte";
  import Tooltip from "~/components/Tooltip.svelte";

  const MultipleLang = {
    whale: i18n("newtabPage.whale", "Whale 🐳"),
    whales_page_title: i18n(
      "newtabPage.whale-page-title",
      "Start earning by copying from Experienced"
    ),
    market_search_symbol: i18n(
      "newtabPage.market-search-symbol",
      "Find by symbol, name or token contract"
    ),
    market_search_amount: i18n(
      "newtabPage.market-search-amount",
      "Enter a USD amount higher than 10000"
    ),
  };

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const whalesFilter: {
    value: string;
    label: "ALL" | "SMART" | "FRESH" | "KOL";
  }[] = [
    { value: "All", label: "ALL" },
    { value: "Smart Wallet", label: "SMART" },
    { value: "Fresh Wallet", label: "FRESH" },
    { value: "KOL", label: "KOL" },
  ];

  let selectedFilter = whalesFilter[0];
  let keysort = {
    eth_balance: { title: "eth_balance", type: "sortBalance" },
    pnl_1d: { title: "pnl_1d", type: "sort1DPnl" },
    pnl_7d: { title: "pnl_7d", type: "sort7DPnl" },
    pnl_30d: { title: "pnl_30d", type: "sort30DPnl" },
    realized_profit: { title: "realized_profit", type: "sortRealizedProfit" },
    txs_30d: { title: "txs_30d", type: "sort30DTXS" },
    avg_hold_time: { title: "avg_hold_time", type: "sortAHT" },
    last_active: { title: "last_active", type: "sortLastTime" },
  };

  let whalesData = [];
  let tooltipRPT = false;
  let tooltipAHT = false;

  let sortBalance = "default";
  let sort1DPnl = "default";
  let sort7DPnl = "default";
  let sort30DPnl = "default";
  let sortRealizedProfit = "default";
  let sort30DTXS = "default";
  let sortAHT = "default";
  let sortLastTime = "default";

  const getPublicPortfolio = async (type) => {
    const res = await nimbus
      .get(`/whales?type=${type}`)
      .then((res) => res?.data?.result);
    return res;
  };

  $: queryWhalesList = createQuery({
    queryKey: ["whaleslist", selectedFilter],
    queryFn: () => getPublicPortfolio(selectedFilter.label),
    staleTime: Infinity,
  });

  onMount(() => {
    mixpanel.track("market_page");
  });

  const toggleSortWhalesList = (key, sortType) => {
    let sortingType = "default";
    switch (sortType) {
      case "sortBalance":
        sort1DPnl = "default";
        sort7DPnl = "default";
        sort30DPnl = "default";
        sortRealizedProfit = "default";
        sort30DTXS = "default";
        sortAHT = "default";
        sortLastTime = "default";
        switch (sortBalance) {
          case "default":
            sortingType = sortBalance = "asc";
            break;
          case "asc":
            sortingType = sortBalance = "desc";
            break;
          case "desc":
            sortingType = sortBalance = "default";
            break;
          default:
            sortingType = sortBalance = "default";
        }
        break;
      case "sort1DPnl":
        sortBalance = "default";
        sort7DPnl = "default";
        sort30DPnl = "default";
        sortRealizedProfit = "default";
        sort30DTXS = "default";
        sortAHT = "default";
        sortLastTime = "default";

        switch (sort1DPnl) {
          case "default":
            sortingType = sort1DPnl = "asc";
            break;
          case "asc":
            sortingType = sort1DPnl = "desc";
            break;
          case "desc":
            sortingType = sort1DPnl = "default";
            break;
          default:
            sortingType = sort1DPnl = "default";
        }
        break;
      case "sort7DPnl":
        sortBalance = "default";
        sort1DPnl = "default";
        sort30DPnl = "default";
        sortRealizedProfit = "default";
        sort30DTXS = "default";
        sortAHT = "default";
        sortLastTime = "default";
        switch (sort7DPnl) {
          case "default":
            sortingType = sort7DPnl = "asc";
            break;
          case "asc":
            sortingType = sort7DPnl = "desc";
            break;
          case "desc":
            sortingType = sort7DPnl = "default";
            break;
          default:
            sortingType = sort7DPnl = "default";
        }
        break;
      case "sort30DPnl":
        sortBalance = "default";
        sort1DPnl = "default";
        sort7DPnl = "default";
        sortRealizedProfit = "default";
        sort30DTXS = "default";
        sortAHT = "default";
        sortLastTime = "default";
        switch (sort30DPnl) {
          case "default":
            sortingType = sort30DPnl = "asc";
            break;
          case "asc":
            sortingType = sort30DPnl = "desc";
            break;
          case "desc":
            sortingType = sort30DPnl = "default";
            break;
          default:
            sortingType = sort30DPnl = "default";
        }
        break;
      case "sortRealizedProfit":
        sortBalance = "default";
        sort1DPnl = "default";
        sort7DPnl = "default";
        sort30DPnl = "default";
        sort30DTXS = "default";
        sortAHT = "default";
        sortLastTime = "default";
        switch (sortRealizedProfit) {
          case "default":
            sortingType = sortRealizedProfit = "asc";
            break;
          case "asc":
            sortingType = sortRealizedProfit = "desc";
            break;
          case "desc":
            sortingType = sortRealizedProfit = "default";
            break;
          default:
            sortingType = sortRealizedProfit = "default";
        }
        break;
      case "sort30DTXS":
        sortBalance = "default";
        sort1DPnl = "default";
        sort7DPnl = "default";
        sort30DPnl = "default";
        sortRealizedProfit = "default";
        sortAHT = "default";
        sortLastTime = "default";
        switch (sort30DTXS) {
          case "default":
            sortingType = sort30DTXS = "asc";
            break;
          case "asc":
            sortingType = sort30DTXS = "desc";
            break;
          case "desc":
            sortingType = sort30DTXS = "default";
            break;
          default:
            sortingType = sort30DTXS = "default";
        }
        break;
      case "sortAHT":
        sortBalance = "default";
        sort1DPnl = "default";
        sort7DPnl = "default";
        sort30DPnl = "default";
        sortRealizedProfit = "default";
        sort30DTXS = "default";
        sortLastTime = "default";
        switch (sortAHT) {
          case "default":
            sortingType = sortAHT = "asc";
            break;
          case "asc":
            sortingType = sortAHT = "desc";
            break;
          case "desc":
            sortingType = sortAHT = "default";
            break;
          default:
            sortingType = sortAHT = "default";
        }
        break;
      case "sortLastTime":
        sortBalance = "default";
        sort1DPnl = "default";
        sort7DPnl = "default";
        sort30DPnl = "default";
        sortRealizedProfit = "default";
        sort30DTXS = "default";
        sortAHT = "default";
        switch (sortLastTime) {
          case "default":
            sortingType = sortLastTime = "asc";
            break;
          case "asc":
            sortingType = sortLastTime = "desc";
            break;
          case "desc":
            sortingType = sortLastTime = "default";
            break;
          default:
            sortingType = sortLastTime = "default";
        }
        break;
      default:
        sortingType = "asc";
    }

    if (sortingType === "asc") {
      whalesData = whalesData.sort((a, b) => b[key] - a[key]);
    }
    if (sortingType === "desc") {
      whalesData = whalesData.sort((a, b) => a[key] - b[key]);
    }
    if (sortingType === "default") {
      whalesData = whalesData.sort((a, b) => b.pnl_30d - a.pnl_30d);
    }
  };

  $: sortIcon = (sortType) => {
    return `<svg
                    height="0.9rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0" /><g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M16.0686 15H7.9313C7.32548 15 7.02257 15 6.88231 15.1198C6.76061 15.2238 6.69602 15.3797 6.70858 15.5393C6.72305 15.7232 6.93724 15.9374 7.36561 16.3657L11.4342 20.4344C11.6323 20.6324 11.7313 20.7314 11.8454 20.7685C11.9458 20.8011 12.054 20.8011 12.1544 20.7685C12.2686 20.7314 12.3676 20.6324 12.5656 20.4344L16.6342 16.3657C17.0626 15.9374 17.2768 15.7232 17.2913 15.5393C17.3038 15.3797 17.2392 15.2238 17.1175 15.1198C16.9773 15 16.6744 15 16.0686 15Z"
                        stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "desc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.9313 9.00005H16.0686C16.6744 9.00005 16.9773 9.00005 17.1175 8.88025C17.2393 8.7763 17.3038 8.62038 17.2913 8.46082C17.2768 8.27693 17.0626 8.06274 16.6342 7.63436L12.5656 3.56573C12.3676 3.36772 12.2686 3.26872 12.1544 3.23163C12.054 3.199 11.9458 3.199 11.8454 3.23163C11.7313 3.26872 11.6323 3.36772 11.4342 3.56573L7.36561 7.63436C6.93724 8.06273 6.72305 8.27693 6.70858 8.46082C6.69602 8.62038 6.76061 8.7763 6.88231 8.88025C7.02257 9.00005 7.32548 9.00005 7.9313 9.00005Z"
                         stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "asc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                  </svg>`;
  };

  $: {
    if (selectedFilter && !$queryWhalesList.isError && $queryWhalesList.data) {
      whalesData = $queryWhalesList.data.sort((a, b) => b.pnl_30d - a.pnl_30d);
    }
  }
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col xl:gap-10 gap-6"
  >
    <div
      class="flex xl:flex-row flex-col justify-between xl:items-end xl:gap-0 gap-4"
    >
      <div class="flex flex-col gap-2">
        <div class="text-4xl font-semibold">
          {MultipleLang.whale}
        </div>
        <div class="xl:text-xl text-2xl w-max">
          {MultipleLang.whales_page_title}
        </div>
      </div>
      <div class="flex items-center gap-1">
        <AnimateSharedLayout>
          {#each whalesFilter as item}
            <div
              id={item.label}
              class="relative cursor-pointer xl:text-base text-xl font-medium py-1 px-3 rounded-[100px] transition-all"
              on:click={() => {
                selectedFilter = item;
                queryClient.invalidateQueries(["whaleslist"]);
              }}
            >
              <div
                class={`relative z-2 ${selectedFilter === item && "text-white"}`}
              >
                {item.value}
              </div>
              {#if item === selectedFilter}
                <Motion
                  let:motion
                  layoutId="active-pill"
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <div
                    class="absolute inset-0 z-1 rounded-full bg-[#1E96FC]"
                    use:motion
                  />
                </Motion>
              {/if}
            </div>
          {/each}
        </AnimateSharedLayout>
      </div>
    </div>

    <div
      class={`rounded-[10px] border border_0000000d xl:overflow-visible overflow-x-auto ${
        $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
      } ${
        ($queryWhalesList.isLoading && $queryWhalesList.isError) ||
        (whalesData && whalesData?.length === 0)
          ? "h-screen"
          : ""
      }`}
    >
      <table class="table-auto xl:w-full w-[2800px] h-full">
        <thead class="sticky top-0 z-9">
          <tr class="bg_f4f5f8">
            <th
              class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8"
            >
              <div class="text-left xl:text-xs text-lg uppercase font-medium">
                Address
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-lg uppercase font-medium"
              >
                ETH Balance
                <div
                  on:click={() => {
                    toggleSortWhalesList(
                      keysort.eth_balance.title,
                      keysort.eth_balance.type
                    );
                  }}
                  class="cursor-pointer"
                >
                  {@html sortIcon(sortBalance)}
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs . uppercase font-medium"
              >
                1D Pnl
                <div
                  on:click={() => {
                    toggleSortWhalesList(
                      keysort.pnl_1d.title,
                      keysort.pnl_1d.type
                    );
                  }}
                  class="cursor-pointer"
                >
                  {@html sortIcon(sort1DPnl)}
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs uppercase font-medium"
              >
                7D Pnl
                <div
                  on:click={() => {
                    toggleSortWhalesList(
                      keysort.pnl_7d.title,
                      keysort.pnl_7d.type
                    );
                  }}
                  class="cursor-pointer"
                >
                  {@html sortIcon(sort7DPnl)}
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs uppercase font-medium"
              >
                30D Pnl
                <div
                  on:click={() => {
                    toggleSortWhalesList(
                      keysort.pnl_30d.title,
                      keysort.pnl_30d.type
                    );
                  }}
                  class="cursor-pointer"
                >
                  {@html sortIcon(sort30DPnl)}
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs uppercase font-medium"
              >
                Realized Profit

                <div
                  on:click={() => {
                    toggleSortWhalesList(
                      keysort.realized_profit.title,
                      keysort.realized_profit.type
                    );
                  }}
                  class="cursor-pointer"
                >
                  {@html sortIcon(sortRealizedProfit)}
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs uppercase font-medium"
              >
                30D TXs
                <div
                  on:click={() => {
                    toggleSortWhalesList(
                      keysort.txs_30d.title,
                      keysort.txs_30d.type
                    );
                  }}
                  class="cursor-pointer"
                >
                  {@html sortIcon(sort30DTXS)}
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-1 gap-4 text-right xl:text-xs uppercase font-medium relative"
              >
                AHT
                <div
                  on:mouseenter={() => {
                    tooltipAHT = true;
                  }}
                  on:mouseleave={() => {
                    tooltipAHT = false;
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="currentColor"
                      d="M512 64a448 448 0 1 1 0 896a448 448 0 0 1 0-896m0 832a384 384 0 0 0 0-768a384 384 0 0 0 0 768m48-176a48 48 0 1 1-96 0a48 48 0 0 1 96 0m-48-464a32 32 0 0 1 32 32v288a32 32 0 0 1-64 0V288a32 32 0 0 1 32-32"
                    />
                  </svg>
                </div>
                {#if tooltipAHT}
                  <div
                    class="absolute -top-8 left-1/3 transform -translate-x-1/4"
                  >
                    <Tooltip text="Average Holding Time" />
                  </div>
                {/if}
                <div
                  on:click={() => {
                    toggleSortWhalesList(
                      keysort.avg_hold_time.title,
                      keysort.avg_hold_time.type
                    );
                  }}
                  class="cursor-pointer"
                >
                  {@html sortIcon(sortAHT)}
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs uppercase font-medium"
              >
                Last Time
                <div
                  on:click={() => {
                    toggleSortWhalesList(
                      keysort.last_active.title,
                      keysort.last_active.type
                    );
                  }}
                  class="cursor-pointer"
                >
                  {@html sortIcon(sortLastTime)}
                </div>
              </div>
            </th>
            <th class="pr-3 py-3 rounded-tr-[10px]">
              <div
                class="flex gap-1 justify-end items-center text-right xl:text-xs uppercase font-medium relative"
              >
                RPT
                <div
                  on:mouseenter={() => {
                    tooltipRPT = true;
                  }}
                  on:mouseleave={() => {
                    tooltipRPT = false;
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="currentColor"
                      d="M512 64a448 448 0 1 1 0 896a448 448 0 0 1 0-896m0 832a384 384 0 0 0 0-768a384 384 0 0 0 0 768m48-176a48 48 0 1 1-96 0a48 48 0 0 1 96 0m-48-464a32 32 0 0 1 32 32v288a32 32 0 0 1-64 0V288a32 32 0 0 1 32-32"
                    />
                  </svg>
                </div>
                {#if tooltipRPT}
                  <div
                    class="absolute -top-8 left-1/3 transform -translate-x-1/4"
                  >
                    <Tooltip text="Recently Purchased Tokens" />
                  </div>
                {/if}
              </div>
            </th>
          </tr>
        </thead>

        {#if $queryWhalesList.isLoading}
          <tbody>
            <tr>
              <td colspan="11">
                <div class="flex justify-center items-center h-full py-3 px-3">
                  <Loading />
                </div>
              </td>
            </tr>
          </tbody>
        {:else}
          <tbody class="relative">
            {#if whalesData && whalesData?.length === 0}
              <tr>
                <td colspan="11">
                  <div
                    class="flex justify-center items-center h-full py-4 px-3 text-lg text-gray-400"
                  >
                    Empty
                  </div>
                </td>
              </tr>
            {:else}
              <!-- {#each whalesData as data} -->
              {#each (filterDuplicates(whalesData) || [])?.slice(0, $selectedPackage === "FREE" ? 10 : undefined) as data, whalePosition}
                <PublicPortfolioItem
                  {data}
                  typeData={selectedFilter.label}
                  {whalePosition}
                />
              {/each}
              {#if $selectedPackage === "FREE"}
                <tr>
                  <td colspan="8">
                    {#if whalesData.length > 5}
                      <tr
                        class={`absolute z-9 left-0 right-0 bottom-0 top-[270px] flex justify-center pt-10 backdrop-blur-md bg-gradient-to-t to-transparent ${
                          $isDarkMode
                            ? "bg-black/90 from-[#000] via-[#222222]"
                            : "bg-white/95 from-white via-white"
                        }`}
                      >
                        <td
                          colspan="5"
                          class="flex flex-col items-center gap-1"
                        >
                          <div class="text-lg font-medium">
                            Use Nimbus at its full potential
                          </div>
                          <div class="text-base text-gray-500">
                            Upgrade to Premium to access all other <span
                              class="font-medium"
                              >{whalesData.length - 5 > 0
                                ? whalesData.length - 5
                                : ""}</span
                            > opportunities
                          </div>
                          <div class="mt-2 w-max">
                            <Button
                              variant="premium"
                              on:click={() => navigate("/upgrade")}
                            >
                              Upgrade Plan
                            </Button>
                          </div>
                        </td>
                      </tr>
                    {:else}
                      <tr
                        class={`absolute z-9 left-0 right-0 bottom-0 top-[120px] flex justify-center pt-10 backdrop-blur-md bg-gradient-to-t to-transparent ${
                          $isDarkMode
                            ? "bg-black/90 from-[#000] via-[#222222]"
                            : "bg-white/95 from-white via-white"
                        }`}
                      >
                        <td
                          colspan="5"
                          class="flex flex-col items-center gap-1"
                        >
                          <div class="text-lg font-medium">
                            Use Nimbus at its full potential
                          </div>
                          <div class="text-base text-gray-500">
                            Upgrade to Premium to access all other <span
                              class="font-medium"
                              >{whalesData.length - 5 > 0
                                ? whalesData.length - 5
                                : ""}</span
                            > opportunities
                          </div>
                          <div class="mt-2 w-max">
                            <Button
                              variant="premium"
                              on:click={() => navigate("/upgrade")}
                            >
                              Upgrade Plan
                            </Button>
                          </div>
                        </td>
                      </tr>
                    {/if}
                  </td>
                </tr>
              {/if}
            {/if}
          </tbody>
        {/if}
      </table>
    </div>

    <!-- <div class="flex justify-center gap-3 xl:-mt-4">
      <div class="w-[50px]">
        {#if pageValue === 0}
          <Button variant="disabled" disabled>
            <div class="text-2xl -mt-1">&lsaquo;</div>
          </Button>
        {:else}
          <Button
            variant="secondary"
            on:click={() => {
              if (pageValue > 1) {
                pageValue = pageValue - 1;
              } else {
                pageValue = 0;
              }
              getPublicPortfolio();
            }}
          >
            <div class="text-2xl -mt-1">&lsaquo;</div>
          </Button>
        {/if}
      </div>
      <div class="w-[50px]">
        {#if whalesData && whalesData.length === 0}
          <Button variant="disabled" disabled>
            <div class="text-2xl -mt-1">&rsaquo;</div>
          </Button>
        {:else}
          <Button
            variant="secondary"
            on:click={() => {
              pageValue = pageValue + 1;
              getPublicPortfolio();
            }}
          >
            <div class="text-2xl -mt-1">&rsaquo;</div>
          </Button>
        {/if}
      </div>
    </div> -->
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>

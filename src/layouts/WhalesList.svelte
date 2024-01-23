<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import mixpanel from "mixpanel-browser";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { useNavigate } from "svelte-navigator";

  import { isDarkMode, selectedPackage, wallet } from "~/store";

  import Loading from "~/components/Loading.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import PublicPortfolioItem from "~/components/PublicPortfolioItem.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import Button from "~/components/Button.svelte";
  import FilterModal from "~/UI/WhalesList/FilterModal.svelte";
  import AppOverlay from "~/components/Overlay.svelte";

  const navigate = useNavigate();

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

  let whalesFilter: {
    value: "ALL" | "SMART" | "FRESH" | "KOL";
    label: "ALL" | "SMART" | "FRESH" | "KOL";
  }[] = [
    { value: "ALL", label: "ALL" },
    { value: "SMART", label: "SMART" },
    { value: "FRESH", label: "FRESH" },
    { value: "KOL", label: "KOL" },
  ];
  let selectedFilter = whalesFilter[0];

  let whalesData = [];
  let isLoading = false;

  let pageValue = 0;
  let isOpenFilterModal = false;
  let filterParams = "";
  let search = "";

  let sortNetWorth = "default";
  let sortSharpeRatio = "default";
  let sortChange1D = "default";
  let sortChange7D = "default";
  let sortChange30D = "default";
  let sortChange1Y = "default";
  let sortMaxDrawDown = "default";
  let sortVolatility = "default";

  const getPublicPortfolio = async (type) => {
    try {
      isLoading = true;
      const res = await nimbus
        .get(`/whales?type=${type}`)
        .then((res) => res?.data?.result);

      whalesData = res?.map((item) => {
        return {
          ...item,
          ethBalance: Number(item.eth_balance || 0),
          realizedProfit: Number(item?.realized_profit || 0),
          realizedProfit7D: Number(item?.realized_profit_7d || 0),
          lastActive: Number(item?.last_active || 0),
          txs30d: Number(item?.txs_30d || 0),
          avgHoldTime: Number(item?.avg_hold_time || 0),
        };
      });
    } catch (e) {
      console.error("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    mixpanel.track("market_page");
    getPublicPortfolio(selectedFilter.value);
  });

  const closeModal = () => {
    isOpenFilterModal = false;
  };

  const resetFilter = () => {
    filterParams = "";
    search = "";
    getPublicPortfolio(selectedFilter.value);
  };

  $: {
    if (selectedFilter) {
      getPublicPortfolio(selectedFilter.value);
    }
  }

  $: {
    console.log({ whalesData });
  }

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
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col xl:gap-10 gap-6"
  >
    <div class="flex justify-between items-end">
      <div class="flex flex-col gap-2">
        <div class="xl:text-5xl text-7xl font-semibold">
          {MultipleLang.whale}
        </div>
        <div class="xl:text-xl text-3xl w-max">
          {MultipleLang.whales_page_title}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <AnimateSharedLayout>
          {#each whalesFilter as item}
            <div
              id={item.value}
              class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
              on:click={() => {
                selectedFilter = item;
              }}
            >
              <div
                class={`relative ${selectedFilter === item && "text-white"}`}
                style="z-index: 2"
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
                    class="absolute inset-0 rounded-full bg-[#1E96FC]"
                    style="z-index: 1"
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
        isLoading || (whalesData && whalesData?.length === 0) ? "h-screen" : ""
      }`}
    >
      <table class="table-auto xl:w-full w-[2800px] h-full">
        <thead class="sticky top-0 z-10">
          <tr class="bg_f4f5f8">
            <th
              class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8"
            >
              <div class="text-left xl:text-xs text-xl uppercase font-medium">
                Address
              </div>
            </th>
            <!-- <th class="py-3">
              <div class="text-left xl:text-xs text-xl uppercase font-medium">
                Tokens
              </div>
            </th> -->
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                ETH Balance
                <div
                  on:click={() => {
                    // toggleSortNetWorth();
                  }}
                  class="cursor-pointer"
                >
                  <!-- {@html sortIcon(sortNetWorth)} -->
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                1D Pnl
                <div
                  on:click={() => {
                    // toggleSortChange1D();
                  }}
                  class="cursor-pointer"
                >
                  <!-- {@html sortIcon(sortChange1D)} -->
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                7D Pnl
                <div
                  on:click={() => {
                    // toggleSortChange7D();
                  }}
                  class="cursor-pointer"
                >
                  <!-- {@html sortIcon(sortChange7D)} -->
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                30D Pnl
                <div
                  on:click={() => {
                    // toggleSortChange30D();
                  }}
                  class="cursor-pointer"
                >
                  <!-- {@html sortIcon(sortChange30D)} -->
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                Realized Profit

                <div
                  on:click={() => {
                    // toggleSortVolatility();
                  }}
                  class="cursor-pointer"
                >
                  <!-- {@html sortIcon(sortVolatility)} -->
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                30D TXs
                <div
                  on:click={() => {
                    // toggleSortMaxDrawDown();
                  }}
                  class="cursor-pointer"
                >
                  <!-- {@html sortIcon(sortMaxDrawDown)} -->
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                <TooltipTitle tooltipText={"Average Holding Time."} isBigIcon>
                  AHT
                </TooltipTitle>
                <div
                  on:click={() => {
                    // toggleSortSharpeRatio();
                  }}
                  class="cursor-pointer"
                >
                  <!-- {@html sortIcon(sortSharpeRatio)} -->
                </div>
              </div>
            </th>
            <th class="pr-3 py-3 rounded-tr-[10px]">
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                Last Time
              </div>
            </th>
          </tr>
        </thead>

        {#if isLoading}
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
              {#each (whalesData || [])?.slice(0, $selectedPackage === "FREE" ? 10 : undefined) as data}
                <PublicPortfolioItem {data} />
              {/each}
              {#if $selectedPackage === "FREE"}
                <tr>
                  <td colspan="8">
                    {#if whalesData.length > 5}
                      <tr
                        class={`absolute z-10 left-0 right-0 bottom-0 top-[270px] flex justify-center pt-10 backdrop-blur-md bg-gradient-to-t to-transparent ${
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
                              >Upgrade Plan</Button
                            >
                          </div>
                        </td>
                      </tr>
                    {:else}
                      <tr
                        class={`absolute z-10 left-0 right-0 bottom-0 top-[120px] flex justify-center pt-10 backdrop-blur-md bg-gradient-to-t to-transparent ${
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
                              >Upgrade Plan</Button
                            >
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

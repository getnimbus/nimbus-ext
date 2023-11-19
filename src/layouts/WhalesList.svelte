<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import mixpanel from "mixpanel-browser";
  import { isDarkMode, user, userPublicAddress } from "~/store";
  import { whaleCategories } from "~/utils";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { createQuery } from "@tanstack/svelte-query";

  import Loading from "~/components/Loading.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import PublicPortfolioItem from "~/components/PublicPortfolioItem.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import Button from "~/components/Button.svelte";
  import FilterModal from "~/UI/WhalesList/FilterModal.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import WhalesCategoriesIcon from "~/components/WhalesCategoriesIcon.svelte";

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

  let whalesData = [];
  let isLoading = false;

  let pageValue = 0;
  let isOpenFilterModal = false;
  let filterParams = "";
  let search = "";
  let listCategories;

  let sortNetWorth = "default";
  let sortSharpeRatio = "default";
  let sortChange1D = "default";
  let sortChange7D = "default";
  let sortChange30D = "default";
  let sortChange1Y = "default";
  let sortMaxDrawDown = "default";
  let sortVolatility = "default";

  let selectedType:
    | "RECOMMENDED"
    | "VENTURES_CAPITAL"
    | "SMART_MONEY"
    | "HAND_PICKED"
    | "" = "";
  let selectedCategoryId = "";
  let categoriesPageValue = 0;

  const getPublicPortfolioCategories = async (category, page) => {
    const response = await nimbus.get(
      `/market/portfolio/categories?category=${category}&page=${page}`
    );
    return response.data;
  };

  $: query = createQuery({
    queryKey: ["whale-categories", selectedType, categoriesPageValue],
    queryFn: () =>
      getPublicPortfolioCategories(selectedType, categoriesPageValue),
    staleTime: Infinity,
    retry: false,
    enabled: selectedType.length !== 0 && selectedType !== "RECOMMENDED",
  });

  const getPublicPortfolio = async () => {
    try {
      isLoading = true;
      const res = await nimbus
        .get(
          `/market/portfolio/search?q=${filterParams}&token=${search}&page=${pageValue}&sort=networth:${sortNetWorth},sharpeRatio:${sortSharpeRatio},change24H:${sortChange1D},change7D:${sortChange7D},change30D:${sortChange30D},change1Y:${sortChange1Y},drawDown:${sortMaxDrawDown},volatility:${sortVolatility}&category=${selectedType}&category_id=${selectedCategoryId}&address=${$userPublicAddress}`
        )
        .then((response) => response.data);

      whalesData = res?.map((item) => {
        return {
          ...item,
          change1D: Number(item.change24H || 0),
          change7D: Number(item.change7D || 0),
          change30D: Number(item.change30D || 0),
          change1Y: Number(item.change1Y || 0),
          networth: Number(item?.networth || 0),
          drawDown: Number(item?.drawDown || 0),
          volatility: Number(item?.volatility || 0),
          sharpeRatio: Number(item?.sharpeRatio || 0),
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
    getPublicPortfolio();
  });

  const closeModal = () => {
    isOpenFilterModal = false;
  };

  const resetFilter = () => {
    filterParams = "";
    search = "";
    getPublicPortfolio();
  };

  const handleSubmitFilter = (formValue) => {
    const filterValue = {
      selectedNetWorth: formValue.selectedNetWorth,
      selectedSharpeRatio: formValue.selectedSharpeRatio,
      selectedVolatility: formValue.selectedVolatility,
      listSelectedReturn: formValue.listSelectedReturn,
    };

    search = formValue.searchValue;

    filterParams = encodeURIComponent(
      [
        filterValue.selectedNetWorth,
        filterValue.selectedSharpeRatio,
        filterValue.selectedVolatility,
        ...filterValue.listSelectedReturn,
      ]
        .filter((_) => _)
        .join(" AND ")
    );
    getPublicPortfolio();
  };

  const toggleSortNetWorth = () => {
    switch (sortNetWorth) {
      case "default":
        sortNetWorth = "asc";
        break;
      case "asc":
        sortNetWorth = "desc";
        break;
      case "desc":
        sortNetWorth = "default";
        break;
      default:
        sortNetWorth = "default";
    }

    sortSharpeRatio = "default";
    sortChange1D = "default";
    sortChange7D = "default";
    sortChange30D = "default";
    sortChange1Y = "default";
    sortMaxDrawDown = "default";
    sortVolatility = "default";

    getPublicPortfolio();
  };

  const toggleSortChange1D = () => {
    switch (sortChange1D) {
      case "default":
        sortChange1D = "asc";
        break;
      case "asc":
        sortChange1D = "desc";
        break;
      case "desc":
        sortChange1D = "default";
        break;
      default:
        sortChange1D = "default";
    }

    sortNetWorth = "default";
    sortSharpeRatio = "default";
    sortChange7D = "default";
    sortChange30D = "default";
    sortChange1Y = "default";
    sortMaxDrawDown = "default";
    sortVolatility = "default";

    getPublicPortfolio();
  };

  const toggleSortChange7D = () => {
    switch (sortChange7D) {
      case "default":
        sortChange7D = "asc";
        break;
      case "asc":
        sortChange7D = "desc";
        break;
      case "desc":
        sortChange7D = "default";
        break;
      default:
        sortChange7D = "default";
    }

    sortNetWorth = "default";
    sortSharpeRatio = "default";
    sortChange1D = "default";
    sortChange30D = "default";
    sortChange1Y = "default";
    sortMaxDrawDown = "default";
    sortVolatility = "default";

    getPublicPortfolio();
  };

  const toggleSortChange30D = () => {
    switch (sortChange30D) {
      case "default":
        sortChange30D = "asc";
        break;
      case "asc":
        sortChange30D = "desc";
        break;
      case "desc":
        sortChange30D = "default";
        break;
      default:
        sortChange30D = "default";
    }

    sortNetWorth = "default";
    sortSharpeRatio = "default";
    sortChange1D = "default";
    sortChange7D = "default";
    sortChange1Y = "default";
    sortMaxDrawDown = "default";
    sortVolatility = "default";

    getPublicPortfolio();
  };

  const toggleSortChange1Y = () => {
    switch (sortChange1Y) {
      case "default":
        sortChange1Y = "asc";
        break;
      case "asc":
        sortChange1Y = "desc";
        break;
      case "desc":
        sortChange1Y = "default";
        break;
      default:
        sortChange1Y = "default";
    }

    sortNetWorth = "default";
    sortSharpeRatio = "default";
    sortChange1D = "default";
    sortChange7D = "default";
    sortChange30D = "default";
    sortMaxDrawDown = "default";
    sortVolatility = "default";

    getPublicPortfolio();
  };

  const toggleSortMaxDrawDown = () => {
    switch (sortMaxDrawDown) {
      case "default":
        sortMaxDrawDown = "asc";
        break;
      case "asc":
        sortMaxDrawDown = "desc";
        break;
      case "desc":
        sortMaxDrawDown = "default";
        break;
      default:
        sortMaxDrawDown = "default";
    }

    sortNetWorth = "default";
    sortSharpeRatio = "default";
    sortChange1D = "default";
    sortChange7D = "default";
    sortChange30D = "default";
    sortChange1Y = "default";
    sortVolatility = "default";

    getPublicPortfolio();
  };

  const toggleSortSharpeRatio = () => {
    switch (sortSharpeRatio) {
      case "default":
        sortSharpeRatio = "asc";
        break;
      case "asc":
        sortSharpeRatio = "desc";
        break;
      case "desc":
        sortSharpeRatio = "default";
        break;
      default:
        sortSharpeRatio = "default";
    }

    sortNetWorth = "default";
    sortChange1D = "default";
    sortChange7D = "default";
    sortChange30D = "default";
    sortChange1Y = "default";
    sortMaxDrawDown = "default";
    sortVolatility = "default";

    getPublicPortfolio();
  };

  const toggleSortVolatility = () => {
    switch (sortVolatility) {
      case "default":
        sortVolatility = "asc";
        break;
      case "asc":
        sortVolatility = "desc";
        break;
      case "desc":
        sortVolatility = "default";
        break;
      default:
        sortVolatility = "default";
    }

    sortNetWorth = "default";
    sortSharpeRatio = "default";
    sortChange1D = "default";
    sortChange7D = "default";
    sortChange30D = "default";
    sortChange1Y = "default";
    sortMaxDrawDown = "default";

    getPublicPortfolio();
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

  $: listCategories =
    Object.keys($user).length === 0
      ? whaleCategories.slice(1, whaleCategories.length)
      : whaleCategories;

  $: {
    if (selectedType.length !== 0 && selectedType === "RECOMMENDED") {
      selectedCategoryId = "";
    }
  }

  $: console.log("categoriesPageValue: ", categoriesPageValue);
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-6"
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
      <div class="w-[140px]">
        <Button variant="tertiary" on:click={() => (isOpenFilterModal = true)}>
          <div class="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="none"
                stroke="#fff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="m16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            <div class="xl:text-base text-2xl font-medium text-white">
              Filter
            </div>
          </div>
        </Button>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <AnimateSharedLayout>
        {#each listCategories as type}
          <div
            class="relative cursor-pointer xl:text-base text-xl font-medium py-2 px-3 rounded-xl transition-all"
            on:click={() => {
              if (selectedType.length !== 0 && selectedType === type.value) {
                selectedType = "";
              } else {
                selectedType = type.value;
              }
              getPublicPortfolio();
            }}
          >
            <div
              class={`relative z-[19] flex items-center gap-2 ${
                selectedType === type.value && "text-white"
              }`}
            >
              <WhalesCategoriesIcon typeCategory={type.value} />
              {type.label}
            </div>
            {#if type.value === selectedType}
              <Motion
                let:motion
                layoutId="active-pill"
                transition={{ type: "spring", duration: 0.6 }}
              >
                <div
                  class="absolute inset-0 rounded-full bg-[#1E96FC] -z-10"
                  use:motion
                />
              </Motion>
            {/if}
          </div>
        {/each}
      </AnimateSharedLayout>
    </div>

    {#if selectedType.length !== 0 && selectedType !== "RECOMMENDED"}
      {#if $query.isFetching}
        <div class="flex items-center justify-center h-screen">
          <Loading />
        </div>
      {:else}
        <div
          class={`flex flex-col gap-6 ${
            selectedCategoryId.length === 0 ? "h-screen" : ""
          }`}
        >
          <div class="grid grid-cols-3 grid-rows-2 gap-6">
            {#each $query.data || [] as item}
              <div
                class={`rounded-[10px] border border_0000000d p-3 cursor-pointer flex flex-col gap-2 ${
                  $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
                }`}
                on:click={() => {
                  selectedCategoryId = item?.id;
                  getPublicPortfolio();
                }}
              >
                <div class="flex flex-col gap-1">
                  <div class="xl:text-lg text-xl font-medium">{item?.name}</div>
                  <div class="xl:text-base text-lg">{item?.description}</div>
                </div>
                <div class="xl:text-sm text-base text-gray-400">
                  {item?.address?.length} wallets
                </div>
              </div>
            {/each}
          </div>
          <div class="flex justify-center gap-3">
            <div class="w-[50px]">
              {#if categoriesPageValue === 0}
                <Button variant="disabled" disabled>
                  <div class="text-2xl -mt-1">&lsaquo;</div>
                </Button>
              {:else}
                <Button
                  variant="secondary"
                  on:click={() => {
                    if (categoriesPageValue > 1) {
                      categoriesPageValue = categoriesPageValue - 1;
                    } else {
                      categoriesPageValue = 0;
                    }
                  }}
                >
                  <div class="text-2xl -mt-1">&lsaquo;</div>
                </Button>
              {/if}
            </div>
            <div class="w-[50px]">
              <Button
                variant="secondary"
                on:click={() => {
                  categoriesPageValue = categoriesPageValue + 1;
                }}
              >
                <div class="text-2xl -mt-1">&rsaquo;</div>
              </Button>
            </div>
          </div>
        </div>
      {/if}
    {/if}

    {#if selectedType.length !== 0 && selectedType !== "RECOMMENDED" && selectedCategoryId.length === 0}
      <div />
    {:else}
      <div
        class={`rounded-[10px] border border_0000000d xl:overflow-visible overflow-x-auto ${
          $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
        } ${
          isLoading || (whalesData && whalesData?.length === 0)
            ? "h-screen"
            : ""
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
              <th class="py-3">
                <div class="text-left xl:text-xs text-xl uppercase font-medium">
                  Tokens
                </div>
              </th>
              <th class="py-3">
                <div
                  class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
                >
                  Net Worth
                  <div on:click={toggleSortNetWorth} class="cursor-pointer">
                    {@html sortIcon(sortNetWorth)}
                  </div>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
                >
                  1D
                  <div on:click={toggleSortChange1D} class="cursor-pointer">
                    {@html sortIcon(sortChange1D)}
                  </div>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
                >
                  7D
                  <div on:click={toggleSortChange7D} class="cursor-pointer">
                    {@html sortIcon(sortChange7D)}
                  </div>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
                >
                  30D
                  <div on:click={toggleSortChange30D} class="cursor-pointer">
                    {@html sortIcon(sortChange30D)}
                  </div>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
                >
                  1Y
                  <div on:click={toggleSortChange1Y} class="cursor-pointer">
                    {@html sortIcon(sortChange1Y)}
                  </div>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
                >
                  <TooltipTitle
                    tooltipText={"Volatility measures the extent of price fluctuations for an asset over time."}
                    isBigIcon
                  >
                    Volatility
                  </TooltipTitle>
                  <div on:click={toggleSortVolatility} class="cursor-pointer">
                    {@html sortIcon(sortVolatility)}
                  </div>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
                >
                  <TooltipTitle
                    tooltipText={"Max drawdown is the biggest loss experienced by an investment or portfolio."}
                    isBigIcon
                  >
                    Max drawdown
                  </TooltipTitle>
                  <div on:click={toggleSortMaxDrawDown} class="cursor-pointer">
                    {@html sortIcon(sortMaxDrawDown)}
                  </div>
                </div>
              </th>
              <th class="py-3">
                <div
                  class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
                >
                  <TooltipTitle
                    tooltipText={"The Sharpe ratio measures how well an investment performs relative to its risk."}
                    isBigIcon
                  >
                    Sharpe ratio
                  </TooltipTitle>
                  <div on:click={toggleSortSharpeRatio} class="cursor-pointer">
                    {@html sortIcon(sortSharpeRatio)}
                  </div>
                </div>
              </th>
              <th class="pr-3 py-3 rounded-tr-[10px]">
                <div
                  class="text-right xl:text-xs text-xl uppercase font-medium"
                >
                  Last 30D
                </div>
              </th>
            </tr>
          </thead>

          {#if isLoading}
            <tbody>
              <tr>
                <td colspan="11">
                  <div
                    class="flex justify-center items-center h-full py-3 px-3"
                  >
                    <Loading />
                  </div>
                </td>
              </tr>
            </tbody>
          {:else}
            <tbody>
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
                {#each whalesData as data}
                  <PublicPortfolioItem {data} />
                {/each}
              {/if}
            </tbody>
          {/if}
        </table>
      </div>

      <div class="flex justify-center gap-3 xl:-mt-4">
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
      </div>
    {/if}
  </div>
</ErrorBoundary>

<AppOverlay
  clickOutSideToClose
  isOpen={isOpenFilterModal}
  on:close={() => {
    isOpenFilterModal = false;
  }}
>
  <FilterModal {closeModal} submit={handleSubmitFilter} {resetFilter} />
</AppOverlay>

<style windi:preflights:global windi:safelist:global></style>

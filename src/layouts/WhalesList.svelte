<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import mixpanel from "mixpanel-browser";
  import { isDarkMode } from "~/store";

  import Loading from "~/components/Loading.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import PublicPortfolioItem from "~/components/PublicPortfolioItem.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import Button from "~/components/Button.svelte";
  import FilterModal from "~/UI/WhalesList/FilterModal.svelte";
  import AppOverlay from "~/components/Overlay.svelte";

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

  let data = [];
  let isLoading = false;

  let pageValue = 0;
  let isOpenFilterModal = false;
  let filterParams = "";
  let search = "";

  let sortNetWorth = "default";
  let sortChange1D = "default";
  let sortChange7D = "default";
  let sortChange30D = "default";
  let sortChange1Y = "default";
  let sortSharpeRatio = "default";
  let sortMaxDrawDown = "default";
  let sortVolatility = "default";

  const getPublicPortfolio = async () => {
    try {
      isLoading = true;
      data = await nimbus
        .get(
          `/market/portfolio/search?q=${filterParams}&token=${search}&page=${pageValue}`
        )
        .then((response) => response.data);
    } catch (e) {
      console.error("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  $: whalesData = data?.map((item) => {
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

  const handleResetSort = () => {
    whalesData = data?.map((item) => {
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
  };

  const toggleSortNetWorth = () => {
    switch (sortNetWorth) {
      case "default":
        sortNetWorth = "ascend";
        break;
      case "ascend":
        sortNetWorth = "descend";
        break;
      case "descend":
        sortNetWorth = "default";
        break;
      default:
        sortNetWorth = "default";
    }

    if (sortNetWorth === "ascend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.networth > b.networth) {
          return 1;
        }
        if (a.networth < b.networth) {
          return -1;
        }
        return 0;
      });
    }
    if (sortNetWorth === "descend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.networth < b.networth) {
          return 1;
        }
        if (a.networth > b.networth) {
          return -1;
        }
        return 0;
      });
    }
    if (sortNetWorth === "default") {
      handleResetSort();
    }
  };

  const toggleSortChange1D = () => {
    switch (sortChange1D) {
      case "default":
        sortChange1D = "ascend";
        break;
      case "ascend":
        sortChange1D = "descend";
        break;
      case "descend":
        sortChange1D = "default";
        break;
      default:
        sortChange1D = "default";
    }

    if (sortChange1D === "ascend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.change1D > b.change1D) {
          return 1;
        }
        if (a.change1D < b.change1D) {
          return -1;
        }
        return 0;
      });
    }
    if (sortChange1D === "descend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.change1D < b.change1D) {
          return 1;
        }
        if (a.change1D > b.change1D) {
          return -1;
        }
        return 0;
      });
    }
    if (sortChange1D === "default") {
      handleResetSort();
    }
  };

  const toggleSortChange7D = () => {
    switch (sortChange7D) {
      case "default":
        sortChange7D = "ascend";
        break;
      case "ascend":
        sortChange7D = "descend";
        break;
      case "descend":
        sortChange7D = "default";
        break;
      default:
        sortChange7D = "default";
    }

    if (sortChange7D === "ascend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.change7D > b.change7D) {
          return 1;
        }
        if (a.change7D < b.change7D) {
          return -1;
        }
        return 0;
      });
    }
    if (sortChange7D === "descend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.change7D < b.change7D) {
          return 1;
        }
        if (a.change7D > b.change7D) {
          return -1;
        }
        return 0;
      });
    }
    if (sortChange7D === "default") {
      handleResetSort();
    }
  };

  const toggleSortChange30D = () => {
    switch (sortChange30D) {
      case "default":
        sortChange30D = "ascend";
        break;
      case "ascend":
        sortChange30D = "descend";
        break;
      case "descend":
        sortChange30D = "default";
        break;
      default:
        sortChange30D = "default";
    }

    if (sortChange30D === "ascend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.change30D > b.change30D) {
          return 1;
        }
        if (a.change30D < b.change30D) {
          return -1;
        }
        return 0;
      });
    }
    if (sortChange30D === "descend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.change30D < b.change30D) {
          return 1;
        }
        if (a.change30D > b.change30D) {
          return -1;
        }
        return 0;
      });
    }
    if (sortChange30D === "default") {
      handleResetSort();
    }
  };

  const toggleSortChange1Y = () => {
    switch (sortChange1Y) {
      case "default":
        sortChange1Y = "ascend";
        break;
      case "ascend":
        sortChange1Y = "descend";
        break;
      case "descend":
        sortChange1Y = "default";
        break;
      default:
        sortChange1Y = "default";
    }

    if (sortChange1Y === "ascend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.change1Y > b.change1Y) {
          return 1;
        }
        if (a.change1Y < b.change1Y) {
          return -1;
        }
        return 0;
      });
    }
    if (sortChange1Y === "descend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.change1Y < b.change1Y) {
          return 1;
        }
        if (a.change1Y > b.change1Y) {
          return -1;
        }
        return 0;
      });
    }
    if (sortChange1Y === "default") {
      handleResetSort();
    }
  };

  const toggleSortMaxDrawDown = () => {
    switch (sortMaxDrawDown) {
      case "default":
        sortMaxDrawDown = "ascend";
        break;
      case "ascend":
        sortMaxDrawDown = "descend";
        break;
      case "descend":
        sortMaxDrawDown = "default";
        break;
      default:
        sortMaxDrawDown = "default";
    }

    if (sortMaxDrawDown === "ascend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.drawDown > b.drawDown) {
          return 1;
        }
        if (a.drawDown < b.drawDown) {
          return -1;
        }
        return 0;
      });
    }
    if (sortMaxDrawDown === "descend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.drawDown < b.drawDown) {
          return 1;
        }
        if (a.drawDown > b.drawDown) {
          return -1;
        }
        return 0;
      });
    }
    if (sortMaxDrawDown === "default") {
      handleResetSort();
    }
  };

  const toggleSortSharpeRatio = () => {
    switch (sortSharpeRatio) {
      case "default":
        sortSharpeRatio = "ascend";
        break;
      case "ascend":
        sortSharpeRatio = "descend";
        break;
      case "descend":
        sortSharpeRatio = "default";
        break;
      default:
        sortSharpeRatio = "default";
    }

    if (sortSharpeRatio === "ascend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.sharpeRatio > b.sharpeRatio) {
          return 1;
        }
        if (a.sharpeRatio < b.sharpeRatio) {
          return -1;
        }
        return 0;
      });
    }
    if (sortSharpeRatio === "descend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.sharpeRatio < b.sharpeRatio) {
          return 1;
        }
        if (a.sharpeRatio > b.sharpeRatio) {
          return -1;
        }
        return 0;
      });
    }
    if (sortSharpeRatio === "default") {
      handleResetSort();
    }
  };

  const toggleSortVolatility = () => {
    switch (sortVolatility) {
      case "default":
        sortVolatility = "ascend";
        break;
      case "ascend":
        sortVolatility = "descend";
        break;
      case "descend":
        sortVolatility = "default";
        break;
      default:
        sortVolatility = "default";
    }

    if (sortVolatility === "ascend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.volatility > b.volatility) {
          return 1;
        }
        if (a.volatility < b.volatility) {
          return -1;
        }
        return 0;
      });
    }
    if (sortVolatility === "descend") {
      whalesData = whalesData.sort((a, b) => {
        if (a.volatility < b.volatility) {
          return 1;
        }
        if (a.volatility > b.volatility) {
          return -1;
        }
        return 0;
      });
    }
    if (sortVolatility === "default") {
      handleResetSort();
    }
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.2em"
                    viewBox="0 0 320 512"
                    fill={$isDarkMode ? "#fff" : "#000"}
                    ><path
                      d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                    /></svg
                  >
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                1D
                <div on:click={toggleSortChange1D} class="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.2em"
                    viewBox="0 0 320 512"
                    fill={$isDarkMode ? "#fff" : "#000"}
                    ><path
                      d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                    /></svg
                  >
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                7D
                <div on:click={toggleSortChange7D} class="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.2em"
                    viewBox="0 0 320 512"
                    fill={$isDarkMode ? "#fff" : "#000"}
                    ><path
                      d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                    /></svg
                  >
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                30D
                <div on:click={toggleSortChange30D} class="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.2em"
                    viewBox="0 0 320 512"
                    fill={$isDarkMode ? "#fff" : "#000"}
                    ><path
                      d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                    /></svg
                  >
                </div>
              </div>
            </th>
            <th class="py-3">
              <div
                class="flex items-center justify-end xl:gap-2 gap-4 text-right xl:text-xs text-xl uppercase font-medium"
              >
                1Y
                <div on:click={toggleSortChange1Y} class="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.2em"
                    viewBox="0 0 320 512"
                    fill={$isDarkMode ? "#fff" : "#000"}
                    ><path
                      d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                    /></svg
                  >
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.2em"
                    viewBox="0 0 320 512"
                    fill={$isDarkMode ? "#fff" : "#000"}
                    ><path
                      d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                    /></svg
                  >
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.2em"
                    viewBox="0 0 320 512"
                    fill={$isDarkMode ? "#fff" : "#000"}
                    ><path
                      d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                    /></svg
                  >
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1.2em"
                    viewBox="0 0 320 512"
                    fill={$isDarkMode ? "#fff" : "#000"}
                    ><path
                      d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                    /></svg
                  >
                </div>
              </div>
            </th>
            <th class="pr-3 py-3 rounded-tr-[10px]">
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                Last 30D
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

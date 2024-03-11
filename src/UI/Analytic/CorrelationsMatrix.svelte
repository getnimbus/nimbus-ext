<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import {
    user,
    chain,
    wallet,
    selectedPackage,
    typeWallet,
    isDarkMode,
  } from "~/store";
  import {
    correlationsMatrixColor,
    equalizeArrayLengths,
    formatPercent,
  } from "~/utils";
  import { listSupported } from "~/lib/chains";
  import { defillama, nimbus } from "~/lib/network";
  import dayjs from "dayjs";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Loading from "~/components/Loading.svelte";
  import Button from "~/components/Button.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import Image from "~/components/Image.svelte";

  import All from "~/assets/all.svg";
  import defaultToken from "~/assets/defaultToken.png";

  export let address;
  export let isShowSoon;
  export let isSync = false;
  export let enabledFetchAllData = false;

  $: isFetch = isSync ? enabledFetchAllData : true;

  let listCoinPrice = [];
  let dataTokenHolding = [];
  let listTokenHolding = [];
  let isOpenModal = false;
  let listToken = [];
  let searchValue = "";
  let timerDebounce;
  let matrix = [];
  let colImg = false;

  let colIndex = undefined;

  const calculateCorrelation = (priceArray1, priceArray2) => {
    if (priceArray1.length !== priceArray2.length) {
      throw new Error("Input arrays must have the same length");
    }

    const n = priceArray1.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXSquare = 0;
    let sumYSquare = 0;

    for (let i = 0; i < n; i++) {
      const x = priceArray1[i];
      const y = priceArray2[i];

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXSquare += x * x;
      sumYSquare += y * y;
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominatorX = Math.sqrt(n * sumXSquare - sumX * sumX);
    const denominatorY = Math.sqrt(n * sumYSquare - sumY * sumY);

    if (denominatorX === 0 || denominatorY === 0) {
      return 0; // Return 0 if there's no variation in one of the arrays
    }

    const correlation = numerator / (denominatorX * denominatorY);
    return correlation;
  };

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      searchValue = value;
    }, 300);
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
  });

  const getCoinPrice = async (coinName) => {
    try {
      const result = await defillama.get(
        `/chart/coingecko:${coinName}?start=${dayjs()
          .subtract(30, "day")
          .unix()}&span=${30}&period=1d&searchWidth=600`
      );
      return result;
    } catch (e) {
      console.error(e);
    }
  };

  // query token holding
  const getHoldingToken = async (chain) => {
    let addressChain = chain;

    if (addressChain === "ALL") {
      const validateAccount = $queryValidate.data;
      addressChain = validateAccount?.type;
    }

    const response: HoldingTokenRes = await nimbus
      .get(
        `/v2/address/${$wallet}/holding?chain=${
          addressChain === "BUNDLE" ? "" : addressChain
        }`
      )
      .then((response) => response.data);
    return response;
  };

  $: queryHoldingToken = createQuery({
    queryKey: ["token-holding", $wallet, $chain],
    queryFn: () => getHoldingToken($chain),
    staleTime: Infinity,
    enabled: enabledQuery && isFetch && !$queryValidate.isFetching,
  });

  $: {
    if (!$queryHoldingToken.isError && $queryHoldingToken.data !== null) {
      formatDataHoldingToken($queryHoldingToken.data);
    }
  }

  const formatDataHoldingToken = (data) => {
    if (data && data.length !== 0) {
      const formatDataTokenHolding = data.map((item) => {
        return {
          ...item,
          value: Number(item?.price?.price) * Number(item?.amount),
        };
      });
      dataTokenHolding = formatDataTokenHolding.filter(
        (item) => item.value > 1
      );
    }
  };

  // get list all token
  const getListAllToken = async () => {
    const res = await nimbus.get("/tokens/coingecko").then((res) => res?.data);
    return res || [];
  };

  $: queryListToken = createQuery({
    queryKey: ["list-all-token"],
    enabled: enabledQuery && isFetch,
    queryFn: () => getListAllToken(),
    staleTime: Infinity,
  });

  $: {
    if (!$queryListToken.isError && $queryListToken?.data) {
      formatListAllToken($queryListToken?.data);
    }
  }

  const formatListAllToken = (data) => {
    listToken = data?.map((item) => {
      return {
        name: item?.symbol,
        full_name: item?.name,
        value: item?.api_symbol,
        logo: item?.large,
      };
    });
  };

  $: {
    if (
      listToken &&
      listToken.length !== 0 &&
      dataTokenHolding &&
      dataTokenHolding.length !== 0
    ) {
      const formatDataTokeHolding = dataTokenHolding.map((item) => {
        const selectedToken = listToken.find(
          (eachToken) =>
            eachToken?.full_name === item?.name ||
            eachToken?.name === item?.symbol
        );
        return {
          ...item,
          cg_id:
            selectedToken !== undefined ? selectedToken?.value : item?.cg_id,
        };
      });

      listTokenHolding = formatDataTokeHolding
        .filter((item) => item.value > 1 && item.cg_id)
        .map((item) => {
          return {
            chain: item.chain,
            name: item?.symbol,
            value: item?.cg_id,
            logo: item?.logo || All,
          };
        });
    }
  }

  $: searchDataResult = searchValue
    ? listToken?.filter(
        (item) =>
          item.name.toLowerCase() === searchValue.toLowerCase() ||
          item.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : listToken?.slice(0, 100);

  const handleRemoveCoin = (selectedCoin) => {
    listTokenHolding = listTokenHolding.filter(
      (item) =>
        item.value !== selectedCoin.value ||
        item.name !== selectedCoin.name ||
        item.chain !== selectedCoin.chain
    );
  };

  const handleSelectToken = (selectedCoin) => {
    const isDuplicateCoin = listTokenHolding.some(
      (item) =>
        item.value === selectedCoin.value ||
        item.name.toLowerCase() === selectedCoin.name.toLowerCase()
    );

    if (isDuplicateCoin) {
      return;
    }

    listTokenHolding = [
      ...listTokenHolding,
      {
        name: selectedCoin.name,
        logo: selectedCoin.logo,
        value: selectedCoin.value,
      },
    ];

    isOpenModal = false;
  };

  const handleGetPriceEachToken = async (data) => {
    const formatData = await Promise.all(
      data.map(async (item) => {
        const res = await getCoinPrice(item.value);
        return {
          symbol: res?.coins[`coingecko:${item.value}`]?.symbol || undefined,
          prices:
            res?.coins[`coingecko:${item.value}`]?.prices.map((dataPrice) => {
              return dataPrice?.price;
            }) || undefined,
        };
      })
    );

    let formatFilterListCoinPrice = [];

    const structListCoinPrice = formatData.map((item, index) => {
      return {
        symbol:
          item.symbol !== undefined
            ? item.symbol
            : listTokenHolding[index]?.name.toUpperCase(),
        prices: item.prices !== undefined ? item.prices : [],
      };
    });

    const filterListCoinPrice = listTokenHolding.map((item) => {
      const selectedToken = structListCoinPrice.find(
        (eachToken) =>
          eachToken.symbol.toLowerCase() === item.name.toLowerCase()
      );
      return {
        symbol: `${selectedToken?.symbol}(${item?.chain})`,
        logo: item?.logo || "",
        chain: item?.chain || "",
        prices: selectedToken?.prices || [],
      };
    });

    for (let i = 0; i < filterListCoinPrice.length; i++) {
      for (let l = i; l < filterListCoinPrice.length; l++) {
        let value: any = "N/A";

        if (filterListCoinPrice[i].symbol === filterListCoinPrice[l].symbol) {
          value = null;
        } else {
          if (
            filterListCoinPrice[i].prices.length !== 0 &&
            filterListCoinPrice[l].prices.length !== 0
          ) {
            if (
              filterListCoinPrice[i].prices.length ===
              filterListCoinPrice[l].prices.length
            ) {
              value = calculateCorrelation(
                filterListCoinPrice[i].prices,
                filterListCoinPrice[l].prices
              );
            }

            if (
              filterListCoinPrice[i].prices.length !==
              filterListCoinPrice[l].prices.length
            ) {
              if (
                filterListCoinPrice[i].prices.length < 7 ||
                filterListCoinPrice[l].prices.length < 7
              ) {
                value = "N/A";
              }

              if (
                filterListCoinPrice[i].prices.length > 7 &&
                filterListCoinPrice[l].prices.length > 7
              ) {
                const [newArrayA, newArrayB] = equalizeArrayLengths(
                  filterListCoinPrice[i].prices,
                  filterListCoinPrice[l].prices
                );
                value = calculateCorrelation(newArrayA, newArrayB);
              }
            }
          }

          if (
            filterListCoinPrice[i].prices.length === 0 ||
            filterListCoinPrice[l].prices.length === 0
          ) {
            value = "N/A";
          }
        }

        formatFilterListCoinPrice.push({
          chain: filterListCoinPrice[i].chain,
          logo: filterListCoinPrice[i].logo,
          pair: `${filterListCoinPrice[i].symbol} - ${filterListCoinPrice[l].symbol}`,
          value,
        });
      }
    }

    matrix = filterListCoinPrice.map((item) => {
      return filterListCoinPrice.map((tokenPair) => {
        const pairData = formatFilterListCoinPrice.find(
          (row) =>
            row.pair === `${item.symbol} - ${tokenPair.symbol}` ||
            row.pair === `${tokenPair.symbol} - ${item.symbol}`
        );
        return {
          chain: tokenPair.chain,
          pair: `${item.symbol} - ${tokenPair.symbol}`,
          value: item.symbol === tokenPair.symbol ? item.logo : pairData?.value,
        };
      });
    });
  };

  $: {
    if (listTokenHolding && listTokenHolding.length !== 0) {
      handleGetPriceEachToken(listTokenHolding);
    }
  }

  $: enabledQuery = Boolean(
    listSupported.includes($typeWallet) && $wallet && $wallet?.length !== 0
  );
</script>

<div class="flex flex-col gap-5">
  <div class="xl:text-2xl text-3xl font-medium">
    <TooltipTitle
      tooltipText={"Positively correlated variables tend to move together, negatively correlated variables move inversely to each other, and uncorrelated variables move independently of each other."}
      isBigIcon
    >
      Correlations Matrix
    </TooltipTitle>
  </div>
  <div
    class={`flex flex-col gap-2 rounded-[20px] xl:p-6 py-3 relative ${
      $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
    }`}
  >
    <div
      class={`flex flex-col gap-1 text-sm ${
        $isDarkMode ? "text-[#ebebeb]" : "text-gray-700"
      } `}
    >
      <div class="flex items-start xl:gap-1 gap-5">
        <div class="w-max">🟩</div>
        <div class="flex-1">
          Positive Value A positive value indicates a positive correlation
          between two variables
        </div>
      </div>
      <div class="flex items-start xl:gap-1 gap-5">
        <div class="w-max">🟥</div>
        <div class="flex-1">
          Negative Value A negative value indicates a negative correlation
          between two variables
        </div>
      </div>
      <div>
        Learn more <a
          class="text-blue-500 hover:underline"
          href="https://docs.getnimbus.io/metrics/correlation-matrix/"
          target="blank">How to use correlation to reduce risk?</a
        >
      </div>
    </div>

    {#if $queryHoldingToken.isFetching && listTokenHolding && listTokenHolding.length === 0}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div>
        {#if $queryHoldingToken.isError}
          <div
            class="flex justify-center items-center p-[6px] text-lg text-gray-400"
          >
            Empty
          </div>
        {:else}
          <div class="flex gap-9 relative">
            <div class="flex flex-col flex-[0.2]">
              <div class="font-medium text-base py-[6px]">Selected Coins</div>
              <div class="flex flex-col items-center justify-center w-full">
                {#each listTokenHolding as item}
                  <div
                    class={`border-b last:border-none py-2 px-1 w-full text-center flex items-center justify-between ${
                      $isDarkMode ? "border-[#0f0f0f]" : "border-gray-200"
                    }`}
                  >
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 mx-auto rounded-full overflow-hidden">
                        <Image logo={item.logo} defaultLogo={defaultToken} />
                      </div>
                      <div class="text-base">
                        {item.name.toLocaleUpperCase()}
                      </div>
                    </div>
                    <div
                      class="cursor-pointer text-gray-500"
                      on:click={handleRemoveCoin(item)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><line x1="18" y1="6" x2="6" y2="18" /><line
                          x1="6"
                          y1="6"
                          x2="18"
                          y2="18"
                        /></svg
                      >
                    </div>
                  </div>
                {/each}
              </div>

              <div
                class={`pt-4 border-t ${
                  $isDarkMode ? "border-[#0f0f0f]" : "border-gray-200"
                }`}
              >
                <Button
                  variant="primary"
                  on:click={() => {
                    isOpenModal = true;
                  }}
                >
                  <div class="xl:block hidden">Compare more</div>
                  <div class="xl:hidden block">More</div>
                </Button>
              </div>
            </div>

            {#if listTokenHolding && listTokenHolding.length === 0}
              <div
                class="flex justify-center items-center p-[6px] text-lg text-gray-400 flex-1"
              >
                Empty
              </div>
            {:else}
              <div class="overflow-x-auto w-full flex-1">
                <table class="rounded-[10px] lg:w-full w-[1800px]">
                  <tbody on:mouseleave={() => (colIndex = undefined)}>
                    {#each listTokenHolding as tokenItem, index}
                      <th
                        class={`py-[6px] text-base font-medium ${
                          colIndex === index
                            ? $isDarkMode
                              ? "bg-[#cdcdcd26]"
                              : "bg-[#dbeafe]"
                            : ""
                        }`}
                        on:mouseenter={() => (colIndex = index)}
                      >
                        {tokenItem.name}
                      </th>
                    {/each}
                    {#each matrix as data, indexY}
                      <tr
                        class={`border ${
                          $isDarkMode ? "border-[#0f0f0f]" : "border-gray-200"
                        } ${!colImg ? "active" : ""}`}
                      >
                        {#each data as item, indexX}
                          {#if indexX == indexY}
                            <td
                              class={`py-2 px-1 ${
                                colIndex === indexX
                                  ? $isDarkMode
                                    ? "bg-[#cdcdcd26]"
                                    : "bg-[#dbeafe]"
                                  : ""
                              }`}
                              on:mouseenter={() => {
                                colIndex = undefined;
                                colImg = true;
                              }}
                              on:mouseleave={() => {
                                colImg = false;
                              }}
                            >
                              <div
                                class="w-6 h-6 mx-auto rounded-full overflow-hidden"
                              >
                                <Image
                                  logo={item.value}
                                  defaultLogo={defaultToken}
                                />
                              </div>
                            </td>
                          {:else}
                            <td
                              class={`py-2 px-1 text-base text-center border ${
                                $isDarkMode
                                  ? "border-[#0f0f0f]"
                                  : "border-gray-200"
                              } ${
                                colIndex === indexX
                                  ? $isDarkMode
                                    ? "bg-[#cdcdcd26]"
                                    : "bg-[#dbeafe]"
                                  : ""
                              }`}
                              style={`background: ${
                                item.value === "N/A"
                                  ? "transparent"
                                  : correlationsMatrixColor(item.value)
                              }`}
                              on:mouseenter={() => (colIndex = indexX)}
                            >
                              {item.value === "N/A"
                                ? "N/A"
                                : formatPercent(item.value)}
                            </td>
                          {/if}
                        {/each}
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    {#if isShowSoon && $user && Object.keys($user).length === 0}
      <div
        class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col justify-center items-center gap-3 z-8 backdrop-blur-md ${
          $isDarkMode ? "bg-black/90" : "bg-white/95"
        }`}
      >
        {#if $selectedPackage === "FREE"}
          <div class="flex flex-col items-center gap-1">
            <div class="text-lg font-medium">
              Use Nimbus at its full potential
            </div>
            <div class="text-base text-gray-500">
              Upgrade to Premium to access Analytics feature
            </div>
          </div>
        {/if}
        {#if $selectedPackage !== "FREE" && $typeWallet === "BTC"}
          <div class="text-lg">Coming soon 🚀</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Modal search token -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModal}
  on:close={() => (isOpenModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="font-medium xl:title-3 title-2">Search market token</div>
    <div class="flex flex-col">
      <div
        class={`border focus:outline-none w-full py-[6px] px-3 rounded-lg ${
          searchValue && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
        }`}
      >
        <input
          on:keyup={({ target: { value } }) => debounceSearch(value)}
          value={searchValue}
          placeholder={"Find by token name"}
          class={`w-full p-0 border-none focus:outline-none focus:ring-0 text-base font-normal ${
            searchValue && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
          } ${
            $isDarkMode ? "text-white" : "text-[#5E656B] placeholder-[#5E656B]"
          }`}
        />
      </div>
      {#if $queryHoldingToken.isFetching}
        <div class="flex items-center justify-center h-[465px]">
          <Loading />
        </div>
      {:else}
        <div>
          {#if $queryHoldingToken.isError}
            <div
              class="flex justify-center items-center p-[6px] text-base text-gray-400 h-[465px]"
            >
              Empty
            </div>
          {:else}
            <div
              class="mt-2 flex flex-col max-h-[500px] h-[500px] overflow-y-auto"
            >
              {#if searchDataResult.length === 0}
                <div
                  class="flex justify-center items-center p-[6px] text-base text-gray-400"
                >
                  No result
                </div>
              {:else}
                {#each searchDataResult || [] as item}
                  <div
                    class={`border-b last:border-none py-3 px-1 w-full text-center flex items-center justify-start gap-2 cursor-pointer ${
                      $isDarkMode ? "border-[#222222]" : "border-gray-200"
                    }`}
                    on:click={handleSelectToken(item)}
                  >
                    <div class="w-7 h-7 rounded-full overflow-hidden">
                      <Image logo={item.logo} defaultLogo={defaultToken} />
                    </div>
                    <div class="text-sm">
                      {item.full_name}
                      <span
                        class={`${
                          $isDarkMode ? "text-gray-600" : "text-gray-400"
                        }`}
                        >{item.name.toLocaleUpperCase()}
                      </span>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</AppOverlay>

<style global windi:preflights:global windi:safelist:global>
  :global(body) .active:hover {
    background: #dbeafe;
  }
  :global(body.dark) .active:hover {
    background: #cdcdcd26;
  }
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }
</style>

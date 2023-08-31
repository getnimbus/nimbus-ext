<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import axios from "axios";
  import {
    chain,
    wallet,
    selectedPackage,
    typeWallet,
    isDarkMode,
  } from "~/store";
  import { equalizeArrayLengths, getAddressContext } from "~/utils";
  import { nimbus } from "~/lib/network";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  import AppOverlay from "~/components/Overlay.svelte";
  import "~/components/Loading.custom.svelte";

  import Search from "~/assets/search.svg";
  import bnb from "./../../assets/bnb.png";
  import type { matrix } from "echarts";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let packageSelected = "";
  selectedPackage.subscribe((value) => {
    packageSelected = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let listCoinPrice = [];
  let dataTokenHolding = [];
  let listTokenHolding = [];
  let isOpenModal = false;
  let listToken = [];
  let searchValue = "";
  let timerDebounce;
  let matrix = [];

  let colIndex = undefined;
  let matrixData = [
    ["", "BTC", "ETH", "USDC"],
    ["BTC", bnb, 0.95, 0.0],
    ["ETH", 0.95, bnb, -0.1],
    ["USDC", 0.0, -0.1, bnb],
  ];

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

  const getCoinPrice = async (coinName) => {
    try {
      const result = await axios
        .get(
          `https://coins.llama.fi/chart/coingecko:${coinName}?start=1664364537&span=10&period=2d&searchWidth=600`
        )
        .then((res) => res.data);
      return result;
    } catch (e) {
      console.error(e);
    }
  };

  // get token holding
  const getHoldingToken = async (address, chain) => {
    if (packageSelected === "FREE") {
      return null;
    }
    const response: HoldingTokenRes = await nimbus.get(
      `/v2/address/${address}/holding?chain=${chain}`
    );
    return response?.data;
  };

  $: queryHoldingToken = createQuery({
    queryKey: ["holding-token", selectedWallet, selectedChain],
    enabled: enabledQuery,
    queryFn: () => getHoldingToken(selectedWallet, selectedChain),
    staleTime: Infinity,
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
    const result = await axios
      .get("https://api.coingecko.com/api/v3/search")
      .then((res) => res.data);
    return result;
  };

  $: queryListToken = createQuery({
    queryKey: ["list-all-token"],
    enabled: enabledQuery,
    queryFn: () => getListAllToken(),
    staleTime: Infinity,
  });

  $: {
    if (!$queryListToken.isError && $queryListToken?.data) {
      formatListAllToken($queryListToken?.data?.coins);
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
            name: item?.symbol,
            value: item?.cg_id,
            logo: item?.logo,
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
    : listToken?.slice(0, 1000);

  const handleRemoveCoin = (selectedCoin) => {
    listTokenHolding = listTokenHolding.filter(
      (item) =>
        item.value !== selectedCoin.value || item.name !== selectedCoin.name
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

  const handleGetPriceEachToken = (data) => {
    Promise.all(
      data.map(async (item) => {
        const res = await getCoinPrice(item.value);
        return res.coins[`coingecko:${item.value}`];
      })
    ).then((res) => {
      const formatListCoinPrice = res.map((item) => {
        return {
          symbol: item?.symbol,
          prices: item?.prices.map((price) => price.price),
        };
      });
      listCoinPrice = formatListCoinPrice;
    });
  };

  $: {
    if (listTokenHolding && listTokenHolding.length !== 0) {
      handleGetPriceEachToken(listTokenHolding);
    }
  }

  $: {
    if (listCoinPrice && listCoinPrice.length !== 0) {
      let formatFilterListCoinPrice = [];

      const filterListCoinPrice = listCoinPrice
        .map((item, index) => {
          return {
            symbol:
              item.symbol !== undefined
                ? item.symbol
                : listTokenHolding[index]?.name.toUpperCase(),
            prices: item.prices !== undefined ? item.prices : [],
          };
        })
        .map((item) => {
          const selectedToken = listTokenHolding.find(
            (eachToken) =>
              eachToken.name.toLowerCase() === item.symbol.toLowerCase()
          );
          return {
            ...item,
            logo: selectedToken?.logo || "",
          };
        });

      for (let i = 0; i < filterListCoinPrice.length; i++) {
        for (let l = i; l < filterListCoinPrice.length; l++) {
          let value: any = "NaN";

          if (filterListCoinPrice[i].symbol === filterListCoinPrice[l].symbol) {
            value = null;
          } else {
            if (
              filterListCoinPrice[i].prices.length !== 0 &&
              filterListCoinPrice[l].prices.length !== 0 &&
              filterListCoinPrice[i].prices.length !==
                filterListCoinPrice[l].prices.length
            ) {
              equalizeArrayLengths(
                filterListCoinPrice[i].prices,
                filterListCoinPrice[l].prices
              );
              value = calculateCorrelation(
                filterListCoinPrice[i].prices,
                filterListCoinPrice[l].prices
              );
            }
            if (
              filterListCoinPrice[i].prices.length !== 0 &&
              filterListCoinPrice[l].prices.length !== 0 &&
              filterListCoinPrice[i].prices.length ===
                filterListCoinPrice[l].prices.length
            ) {
              value = calculateCorrelation(
                filterListCoinPrice[i].prices,
                filterListCoinPrice[l].prices
              );
            }
            if (
              filterListCoinPrice[i].prices.length === 0 ||
              filterListCoinPrice[l].prices.length === 0
            ) {
              value = "NaN";
            }
          }

          formatFilterListCoinPrice.push({
            logo: filterListCoinPrice[i].logo,
            pair: `${filterListCoinPrice[i].symbol} - ${filterListCoinPrice[l].symbol}`,
            value,
          });
        }
      }

      matrix = filterListCoinPrice.map((item) => {
        return formatFilterListCoinPrice
          .filter((eachItem) => {
            const [firstPart, secondPart] = eachItem.pair.split(" - ");
            return firstPart === item.symbol || secondPart === item.symbol;
          })
          .map((tokenPair) => {
            return {
              pair: tokenPair.pair,
              value:
                tokenPair.value === null ? tokenPair.logo : tokenPair.value,
            };
          });
      });
      console.log("matrix: ", matrix);
    }
  }

  const result = [];
  let matrixRender = [];

  const getMetrix = (var1, var2, index) => {
    return (
      result[index][var1 + " - " + var2] || result[index][var2 + " - " + var1]
    );
  };

  $: {
    for (let i = 0; i < matrix.length; i++) {
      result.push({});
      for (let j = 0; j < matrix.length; j++) {
        result[i][matrix[i][j].pair] = matrix[i][j].value;
      }
    }

    // console.log("list token name: ", listTokenHolding[0].name);
  }

  $: {
    if (result[1]) {
      for (let i = 0; i < listTokenHolding.length; i++) {
        matrixRender.push([]);
        for (let j = 0; j < listTokenHolding.length; j++) {
          matrixRender[i].push([]);
          // const a = getMetrix(
          //   listTokenHolding[i].name,
          //   listTokenHolding[j].name,
          //   i
          // );
          // console.log("list token name: ", a);
          matrixRender[i][j] = getMetrix(
            listTokenHolding[i].name,
            listTokenHolding[j].name,
            i
          );
        }
      }
      matrixRender.unshift([]);
      for (let i = 0; i < listTokenHolding.length; i++) {
        matrixRender[0].push(listTokenHolding[i].name);
      }
    }
  }

  // $: {
  //   if (result[1]) {
  //     console.log("tokenname", result[0]);
  //   }
  // }

  $: {
    console.log("listTokenHolding: ", listTokenHolding);
  }

  $: {
    console.log("result from matrix", result);
  }

  $: {
    console.log("matrixRender: ", matrixRender);
  }

  $: enabledQuery = Boolean(
    getAddressContext(selectedWallet)?.type === "EVM" ||
      typeWalletAddress === "CEX"
  );
</script>

<div class="flex gap-9">
  <div class="flex-[0.2] flex flex-col gap-2">
    <div class="2xl:text-lg text-2xl">Selected Coins</div>
    <div class="flex flex-col gap-1 items-center justify-center w-full">
      {#each listTokenHolding as item}
        <div
          class="border-b border-gray-500 py-2 px-1 w-full text-center flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2">
            <img src={item.logo} alt="" class="w-6 h-6" />
            <div class="2xl:text-base text-xl">
              {item.name.toLocaleUpperCase()}
            </div>
          </div>
          <div class="cursor-pointer" on:click={handleRemoveCoin(item)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
      class="text-3xl text-center cursor-pointer"
      on:click={() => {
        isOpenModal = true;
      }}
    >
      +
    </div>
  </div>

  <div class="flex-1">
    <table class="">
      <tbody on:mouseleave={() => (colIndex = undefined)}>
        <!-- {#each matrixRender as data, indexY}
          <tr class="hover:bg-blue-300">
            {#each data as item, indexX}
              {#if indexY == 0}
                <th class={`py-1`} on:mouseenter={() => (colIndex = undefined)}
                  >{item}</th
                >
              {:else if indexX + 1 == indexY}
                <td class={`p-2 ${colIndex == indexX && "bg-blue-300"}`}>
                  <img
                    src={item}
                    alt="Bnb coin"
                    style="width: 30px; height: 30px; margin: auto;"
                  />
                </td>
              {:else}
                <td
                  class={`p-2 text-center ${
                    colIndex == indexX && "bg-blue-300"
                  }`}
                  on:mouseenter={() => (colIndex = indexX)}>{item}</td
                >
              {/if}
            {/each}
            <td />
          </tr>
        {/each} -->
      </tbody>
    </table>
  </div>
</div>

<!-- Modal search token -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModal}
  on:close={() => (isOpenModal = false)}
>
  <div class="font-medium xl:title-3 title-1">List market token</div>
  <div
    class={`xl:pl-4 pl-3 flex items-center rounded-[1000px] gap-2 mt-2 ${
      darkMode ? "bg-[#212121]" : "bg-[#525B8C]"
    }`}
  >
    <img src={Search} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
    <input
      on:keyup={({ target: { value } }) => debounceSearch(value)}
      value={searchValue}
      placeholder={"Find by token name"}
      class={`w-full xl:py-2 py-3 rounded-r-[1000px] text-[#ffffff80] xl:text-sm text-xl placeholder-[#ffffff80] border-none focus:outline-none focus:ring-0 ${
        darkMode ? "bg-[#212121]" : "bg-[#525B8C]"
      }`}
    />
  </div>
  {#if $queryHoldingToken.isFetching}
    <div class="flex items-center justify-center h-[465px]">
      <loading-icon />
    </div>
  {:else}
    <div>
      {#if $queryHoldingToken.isError}
        <div
          class="flex justify-center items-center py-4 px-3 text-lg text-gray-400"
        >
          Empty
        </div>
      {:else}
        <div class="mt-2 flex flex-col max-h-[500px] overflow-y-auto">
          {#each searchDataResult || [] as item}
            <div
              class="border-b last:border-none border-gray-500 py-3 px-1 w-full text-center flex items-center justify-start gap-2 cursor-pointer"
              on:click={handleSelectToken(item)}
            >
              <img src={item.logo} alt="" class="w-6 h-6" />
              <div class="2xl:text-base text-xl">
                {item.full_name} ({item.name.toLocaleUpperCase()})
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</AppOverlay>

<style global windi:preflights:global windi:safelist:global></style>

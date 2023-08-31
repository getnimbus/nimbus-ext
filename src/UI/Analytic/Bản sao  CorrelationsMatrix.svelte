<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import bnb from "./../../assets/bnb.png";
  import axios from "axios";
  import { A } from "flowbite-svelte";
  import {
    chain,
    wallet,
    selectedPackage,
    typeWallet,
    isDarkMode,
  } from "~/store";
  import { getAddressContext } from "~/utils";
  import { nimbus } from "~/lib/network";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  import AppOverlay from "~/components/Overlay.svelte";

  import Search from "~/assets/search.svg";

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

  let listTokenHolding = [];
  let isOpenModal = false;
  let listToken = [];
  let searchValue = "";
  let timerDebounce;

  let correlationCoefficient = 0;
  let colIndex = undefined;
  let coinName = "bitcoin";
  let result = {};

  let btcarr = [];

  // let result2 = [
  //   ["", "bnb", "btc", "eth", "doge"],
  //   ["bnb", 1, 2, 3, 4],
  //   ["bnb", 1, 2, 3, 4],
  //   ["bnb", 1, 2, 3, 4],
  //   ["bnb", 1, 2, 3, 4],
  // ];

  let matrixData = [
    ["", "bnb", "btc", "eth", "doge"],
    ["bnb", 1, 2, 3, 4],
    ["bnb", 1, 2, 3, 4],
    ["bnb", 1, 2, 3, 4],
    ["bnb", 1, 2, 3, 4],
  ];

  let matrixD = [];

  let coinList = ["ethereum", "bitcoin", "binancecoin", "dogecoin"];

  const handleCoinPrice = async (coinName) => {
    const result = await axios
      .get(
        `https://coins.llama.fi/chart/coingecko:${coinName}?start=1664364537&span=10&period=2d&searchWidth=600`
      )
      .then((res) => res.data);
    return result;
  };

  const calculateCorrelation = (priceArray1, priceArray2) => {
    if (priceArray1.length !== priceArray2.length) {
      // throw new Error("Input arrays must have the same length");
      if (priceArray1.length > priceArray2.length) {
        const a = priceArray1.length - priceArray2.length;
        priceArray1.slice(0, -a);

        const n = priceArray1.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXSquare = 0;
        let sumYSquare = 0;

        for (let i = 0; i < n; i++) {
          const x = priceArray1[i].price;
          const y = priceArray2[i].price;

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
      } else {
        const a = priceArray1.length - priceArray2.length;
        priceArray1.slice(0, -a);

        const n = priceArray1.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXSquare = 0;
        let sumYSquare = 0;

        for (let i = 0; i < n; i++) {
          const x = priceArray1[i].price;
          const y = priceArray2[i].price;

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
      }
    }
    const n = priceArray1.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXSquare = 0;
    let sumYSquare = 0;

    for (let i = 0; i < n; i++) {
      const x = priceArray1[i].price;
      const y = priceArray2[i].price;

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

  const getMetrix = (var1, var2) => {
    return result[var1 + " - " + var2] || result[var2 + " - " + var1];
  };

  // Example usage
  const tokenPriceArray1 = [15, 20, 32, 12, 23];
  const tokenPriceArray2 = [20, 5, 21, 6, 12];

  const handleETH = async () => {
    const a = await handleCoinPrice(coinList[0]);
    const b = a.coins[`coingecko:${coinList[0]}`];
    return { symbol: b.symbol, prices: b.prices };
  };
  const handleBTC = async () => {
    const a = await handleCoinPrice(coinList[1]);
    const b = a.coins[`coingecko:${coinList[1]}`];
    return { symbol: b.symbol, prices: b.prices };
  };
  const handleBNB = async () => {
    const a = await handleCoinPrice(coinList[2]);
    const b = a.coins[`coingecko:${coinList[2]}`];
    return { symbol: b.symbol, prices: b.prices };
  };
  const handleDOGE = async () => {
    const a = await handleCoinPrice(coinList[3]);
    const b = a.coins[`coingecko:${coinList[3]}`];
    return { symbol: b.symbol, prices: b.prices };
  };

  Promise.all([handleETH(), handleBTC(), handleBNB(), handleDOGE()]).then(
    (values) => {
      btcarr = values;
    }
  );

  $: {
    let dataArrNow = [" ", ...btcarr];
    matrixData[0] = dataArrNow.map((item) => (item == " " ? " " : item.symbol));
    const arrdata = btcarr.map((item) => {
      const arr = [...item.prices];
      return arr;
    });

    for (let n = 0; n < matrixData.length; n++) {
      matrixData[n][0] = matrixData[0][n];
    }

    for (let i = 0; i < arrdata.length; i++) {
      for (let j = i; j < arrdata.length; j++) {
        if (coinList[i] === coinList[j]) {
          result[coinList[i] + " - " + coinList[j]] = null;
        } else {
          result[coinList[i] + " - " + coinList[j]] = calculateCorrelation(
            arrdata[i],
            arrdata[j]
          ).toFixed(2);
        }
      }
    }
    for (let i = 1; i <= coinList.length; i++) {
      for (let j = 1; j <= coinList.length; j++) {
        matrixData[i][j] = getMetrix(coinList[i - 1], coinList[j - 1]);
      }
    }
  }

  $: console.log("result data", result);

  $: console.log("matrixData: ", matrixData);

  $: console.log("listTokenHolding: ", listTokenHolding);

  // get token history price
  $: queryTokenPrices = createQuery({
    queryKey: ["correlation-matrix", coinName],
    enabled: enabledQuery,
    queryFn: () => getCoinPrice(coinName),
    staleTime: Infinity,
  });

  const getCoinPrice = async (coinName) => {
    const result = await axios
      .get(
        `https://coins.llama.fi/chart/coingecko:${coinName}?start=1664364537&span=10&period=2d&searchWidth=600`
      )
      .then((res) => res.data);
    return result;
  };

  // get token holding
  const getHoldingToken = async (address, chain) => {
    if (packageSelected === "FREE") {
      return null;
    }
    const response: HoldingTokenRes = await nimbus.get(
      `/v2/address/${address}/holding?chain=${chain}`
    );
    console.log("response: ", response);
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
      listTokenHolding = formatDataTokenHolding
        .filter((item) => item.value > 1)
        .map((item) => {
          return {
            name: item.symbol,
            value: item.cg_id,
            logo: item.logo,
          };
        });
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
    if (!$queryListToken.isError && listTokenHolding.length !== 0) {
      formatListAllToken($queryListToken?.data?.coins);
    }
  }

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      searchValue = value;
    }, 300);
  };

  const formatListAllToken = (data) => {
    listToken = data?.map((item) => {
      return {
        name: item?.symbol,
        full_name: item?.name,
        value: item?.id,
        logo: item?.large,
      };
    });
  };

  $: searchDataResult = searchValue
    ? listToken?.filter(
        (item) =>
          item.name.toLowerCase() === searchValue.toLowerCase() ||
          item.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : listToken?.slice(0, 1000);

  $: enabledQuery = Boolean(
    getAddressContext(selectedWallet)?.type === "EVM" ||
      typeWalletAddress === "CEX"
  );

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
</script>

<div class="flex gap-9">
  <div class="flex-[0.3] flex flex-col gap-2">
    <div class="2xl:text-lg text-2xl">Selected Coins</div>
    <div class="flex flex-col gap-1 items-center justify-center w-full">
      {#each listTokenHolding as item}
        <div
          class="border-b border-gray-500 py-2 px-1 w-full text-center flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2">
            <img src={item.logo} alt="" class="w-6 h-6" />
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div>
    <table>
      <tbody on:mouseleave={() => (colIndex = undefined)}>
        {#each matrixData as data, indexY}
          <tr class={`${indexY != 0 && "hover:bg-blue-300"}`}>
            {#each data as item, indexX}
              {#if indexY == 0}
                <th
                  class={`p-3 ${colIndex == indexX && "bg-blue-300"}`}
                  on:mouseenter={() => (colIndex = indexX)}>{item}</th
                >
              {:else if indexX == indexY}
                <td
                  class={`p-3 ${colIndex == indexX && "bg-blue-300"}`}
                  on:mouseenter={() => (colIndex = undefined)}
                >
                  <img
                    src={bnb}
                    alt="Bnb coin"
                    style="width: 30px; height: 30px; margin: auto;"
                  />
                </td>
              {:else}
                <td
                  class={`p-3 text-center ${
                    indexX == colIndex && "bg-blue-300"
                  } ${indexX == 0 && "font-bold"}`}
                  on:mouseenter={() => (colIndex = indexX)}>{item}</td
                >
              {/if}
            {/each}
            <td />
          </tr>
        {/each}
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
  <div class="mt-2 flex flex-col max-h-[500px] overflow-y-auto">
    <!-- {#each searchDataResult || [] as item}
      <div
        class="border-b last:border-none border-gray-500 py-3 px-1 w-full text-center flex items-center justify-start gap-2 cursor-pointer"
        on:click={handleSelectToken(item)}
      >
        <img src={item.logo} alt="" class="w-6 h-6" />
        <div class="2xl:text-base text-xl">
          {item.full_name} ({item.name.toLocaleUpperCase()})
        </div>
      </div>
    {/each} -->
  </div>
</AppOverlay>

<style global windi:preflights:global windi:safelist:global></style>

<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import bnb from "./../../assets/bnb.png";
  import axios from "axios";
  import { A } from "flowbite-svelte";
  import { chain, wallet, selectedPackage, typeWallet } from "~/store";
  import { getAddressContext } from "~/utils";

  import type { HoldingTokenRes } from "~/types/HoldingTokenData";
  import { nimbus } from "~/lib/network";

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

  let correlationCoefficient = 0;
  let dataArr;
  let colIndex = undefined;
  let coinName = "bitcoin";

  let matrixData = [
    ["", "BTC", "ETH", "BNB"],
    ["BTC", 1, 0.95, -0.0],
    ["ETH", 0.95, 1, 0.13],
    ["BNB", -0.0, 0.13, 1],
  ];

  let coinList = ["ethereum", "bitcoin", "celo", "dogecoin"];

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
      console.log("data: ", data);
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

  $: enabledQuery = Boolean(
    getAddressContext(selectedWallet)?.type === "EVM" ||
      typeWalletAddress === "CEX"
  );
</script>

<div class="w-full">
  <div class="w-4/5 flex gap-5">
    <div id="Side Selected Coin">
      <h1>Selected Coins</h1>
      <ul class="flex flex-col items-center justify-center w-full">
        {#each listTokenHolding as item}
          <li class="border-b border-black py-2 w-full text-center">
            <img src={item.logo} alt="" class="w-6 h-6" />
            <div>{item.name.toLocaleUpperCase()}</div>
          </li>
        {/each}
      </ul>
      <button>Plus</button>
    </div>

    <div id="Correlations Matrix">
      <table class="bg-green-50">
        <tbody on:mouseleave={() => (colIndex = undefined)}>
          {#each matrixData as data, indexY}
            <tr class="hover:bg-blue-300">
              {#each data as item, indexX}
                {#if indexY == 0}
                  <th class={`p-3`} on:mouseenter={() => (colIndex = undefined)}
                    >{item}</th
                  >
                {:else if indexX == indexY}
                  <td class={`p-3 ${colIndex == indexX && "bg-blue-300"}`}>
                    <img
                      src={bnb}
                      alt="Bnb coin"
                      style="width: 30px; height: 30px; margin: auto;"
                    />
                  </td>
                {:else}
                  <td
                    class={`p-3 text-center ${
                      colIndex == indexX && "bg-blue-300"
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

  <!-- <button on:click={() => handleCoinPrice("bitcoin")}>choose bitcoin</button>
  <button on:click={() => handleCoinPrice("ethereum")}>choose ethereum</button> -->
</div>

<style></style>

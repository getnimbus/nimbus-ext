<script>
  import { createQuery } from "@tanstack/svelte-query";
  import bnb from "./../../assets/bnb.png";
  import axios from "axios";
  import { A } from "flowbite-svelte";

  let correlationCoefficient = 0;
  let dataArr;
  let colIndex = undefined;
  let coinName = "bitcoin";

  let matrixData = [
    ["", "BTC", "ETH", "BNB", "DOGE"],
    ["BTC", 1, 2, 3, 4],
    ["ETH", 1, 2, 3, 4],
    ["BNB", 1, 2, 3, 4],
    ["DOGE", 1, 2, 3, 4],
  ];

  let coinList = ["ethereum", "bitcoin", "celo", "dogecoin"];

  const handleCoinPrice = async (coinName) => {
    const result = await axios
      .get(
        `https://coins.llama.fi/chart/coingecko:${coinName}?start=1664364537&span=10&period=2d&searchWidth=600`
      )
      .then((res) => res.data);

    // console.log("result", result);
    return result;
  };

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

  // let ethArrays = ethereum.coins["coingecko:ethereum"].prices;
  // let btcArrays = bitcoin.coins["coingecko:bitcoin"].prices;

  // $: {
  //   ethArray =
  //     ethereum.coins !== undefined
  //       ? ethereum.coins["coingecko:ethereum"].prices.map(
  //           (price) => price.price
  //         )
  //       : {};

  //   btcArray =
  //     bitcoin.coins !== undefined
  //       ? bitcoin.coins["coingecko:bitcoin"].prices.map((price) => price.price)
  //       : {};

  //   console.log("ethereum", ethArray);
  //   console.log("bitcoin", btcArray);
  // }

  // Example usage
  const tokenPriceArray1 = [15, 20, 32, 12, 23];
  const tokenPriceArray2 = [20, 5, 21, 6, 12];

  $: {
    coinList.map((c) => {
      const handledata = async () => {
        const a = await handleCoinPrice(c);
        let b = a.coins[`coingecko:${c.toLocaleLowerCase()}`];
        // console.log("reasda", b);
        let symbol = b.symbol;
        return b.prices;
      };
      // const a = handledata();

      // console.log("das", handledata());
    });
  }

  $: {
  }

  // $: {
  //   if (ethereum.coins && bitcoin.coins !== undefined) {
  //     // correlationCoefficient = calculateCorrelation(btcArray, ethArray);
  //     // console.log("correlationCoefficient", correlationCoefficient);
  //   }
  // }

  $: query = createQuery({
    queryKey: ["correlation-matrix", coinName],
    queryFn: () => handleCoinPrice(coinName),
    staleTime: Infinity,
  });
</script>

<div class="w-full">
  <div class="w-4/5 flex gap-5">
    <div id="Side Selected Coin">
      <h1>Selected Coins</h1>
      <ul class="flex flex-col items-center justify-center w-full">
        {#each coinList as item}
          <li class="border-b border-black py-2 w-full text-center">
            {item.toLocaleUpperCase()}
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

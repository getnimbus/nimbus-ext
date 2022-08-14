<svelte:options tag="native-token-info" />

<script>
  import { onMount } from "svelte";
  import { coinGeko } from "./network";
  import { isEmpty, get } from "lodash";
  import { formatCurrency, getCgLogo, getLocalImg } from "./utils";

  import "./CoinChart.svelte";
  import "./PriceConvert.svelte";

  export let name;
  export let id;
  export let popup = true;

  let isLoading = false;
  let price = 0;

  let coinInfo = {};

  import MetaMaskIcon from "../assets/metamask-icon.png";
  import CoinMarketCapIcon from "../assets/CoinMarketCap_logo.png";
  import CoinGekoIcon from "../assets/coingecko-logo.png";
  import CoinDefaultIcon from "../assets/coin-default.svg";

  const loadSymbolInfo = async () => {
    isLoading = true;
    try {
      const [priceData, coinData] = await Promise.all([
        coinGeko
          .get(`simple/price?ids=${id}&vs_currencies=usd`)
          .then((response) => response.data),
        coinGeko
          .get(
            `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`
          )
          .then((response) => response.data),
      ]);
      price = priceData?.[id]?.usd;

      coinInfo = {
        symbol: coinData?.symbol,
        name: coinData?.name,
        logo_url: coinData?.image?.large,
      };
    } catch (e) {
      console.log(e);
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    loadSymbolInfo();
  });
</script>

<div
  class={`rounded-lg bg-white shadow-xl font-sans text-sm text-gray-400 transition-all overflow-hidden min-w-[350px] max-w-[400px] max-h-[600px] ${
    isLoading && "w-[350px] max-w-[400px] max-h-[120px]"
  }`}
  class:shadow-xl={popup}
>
  {#if isLoading}
    <div class="w-full h-[120px] flex justify-center items-center">
      <loading-icon />
    </div>
  {/if}

  {#if coinInfo}
    <coin-chart symbol={id} />
    <div class="p-3 text-center">
      <img
        class="w-[72px] h-[72px] rounded-[50%]"
        src={getCgLogo(id)}
        alt={name}
      />
      <div>
        {name} - <span class="text-gray-400">{coinInfo?.name}</span>
      </div>
      <div>
        Price: <strong>${formatCurrency(price)}</strong>
      </div>

      {#if price}
        <price-convert symbol={name} {price} />
      {/if}

      <div class="flex gap-4 justify-between items-center my-2">
        <div
          on:click={() => alert("Comming soon")}
          class="flex items-center justyfy-center gap-1 btn-border px-3 py-1 text-sky-500 cursor-pointer"
        >
          <img src={getLocalImg(MetaMaskIcon)} width={14} height={14} alt="" /> Add
          to MetaMask
        </div>
        <div class="flex gap-2">
          <a href="https://coinmarketcap.com/currencies/bitcoin" target="blank">
            <img
              src={getLocalImg(CoinMarketCapIcon)}
              width={22}
              height={22}
              alt=""
            />
          </a>
          <a href={`https://www.coingecko.com/en/coins/${id}`} target="blank">
            <img
              src={getLocalImg(CoinGekoIcon)}
              width={22}
              height={22}
              alt=""
            />
          </a>
        </div>
      </div>
    </div>
  {/if}

  <nimbus-footer />
</div>

<style>
  .btn-border {
    border: 1px solid #0ea5e9;
  }
</style>

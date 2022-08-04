<svelte:options tag="native-token-info" />

<script>
  import { onMount } from "svelte";
  import { coinGeko } from "./network";
  import { isEmpty, get } from "lodash";
  import { formatCurrency } from "./utils";

  import "./CoinChart.svelte";
  import "./PriceConvert.svelte";

  export let name;
  export let id;
  export let isPopup = true;

  let isLoading = false;

  let symbolInfo = {
    price: 0,
    logo_url: "",
  };

  import MetaMaskIcon from "../assets/metamask-icon.png";
  import CoinMarketCapIcon from "../assets/CoinMarketCap_logo.png";
  import CoinGekoIcon from "../assets/coingecko-logo.png";
  import CoinDefaultIcon from "../assets/coin-default.svg";

  const loadSymbolInfo = async () => {
    isLoading = true;
    try {
      const data = await coinGeko
        .get(`simple/price?ids=${id}&vs_currencies=usd`)
        .then((response) => response.data);
      symbolInfo.price = data?.[id]?.usd;
      isLoading = false;
    } catch (e) {
      console.log(e);
      isLoading = false;
    }
  };

  onMount(() => {
    loadSymbolInfo();
  });
</script>

<div
  class={`py-2 px-3 rounded-lg bg-white shadow-xl font-sans text-sm text-gray-400 transition-all overflow-hidden min-w-[350px] max-w-[400px] max-h-[600px] ${
    isLoading && "w-[350px] max-w-[400px] max-h-[120px]"
  }`}
  class:shadow-xl={isPopup}
>
  {#if isLoading}
    <div class="w-full h-[120px] flex justify-center items-center">
      <loading-icon />
    </div>
  {/if}

  {#if symbolInfo}
    <coin-chart symbol={id} />
    <div class="py-4 pr-4 text-center">
      <img
        class="w-[72px] h-[72px] rounded-[50%]"
        src={symbolInfo.logo_url || CoinDefaultIcon}
        alt={name}
      />
      <div>
        {name} - <span class="text-gray-400">{id}</span>
      </div>
      <div>
        Price: <strong>${formatCurrency(symbolInfo.price)}</strong>
      </div>

      {#if symbolInfo.price}
        <price-convert symbol={name} price={symbolInfo.price} />
      {/if}

      <div class="flex gap-4 justify-between items-center my-2">
        <div
          on:click={() => alert("Comming soon")}
          class="flex items-center justyfy-center gap-1 btn-border px-3 py-1 text-sky-500 cursor-pointer"
        >
          <img src={MetaMaskIcon} with={14} height={14} alt="" /> Add to MetaMask
        </div>
        <div class="flex gap-2">
          <a href="https://coinmarketcap.com/currencies/bitcoin" target="blank">
            <img src={CoinMarketCapIcon} with={22} height={22} alt="" />
          </a>
          <a href={`https://www.coingecko.com/en/coins/${id}`} target="blank">
            <img src={CoinGekoIcon} with={22} height={22} alt="" />
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

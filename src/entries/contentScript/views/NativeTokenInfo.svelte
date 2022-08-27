<svelte:options tag="native-token-info" />

<script lang="ts">
  import { onMount } from "svelte";
  import { coinGeko } from "./network";
  import { sendMessage } from "webext-bridge";
  import { formatCurrency, getCgLogo } from "./utils";

  import "./CoinChart.svelte";
  import "./PriceConvert.svelte";

  export let name;
  export let id;
  export let popup = true;

  let isLoading = false;
  let price = 0;

  let coinInfo = {
    symbol: "",
    name: "",
    logo_url: "",
  };

  export let loaded;

  const loadSymbolInfo = async () => {
    isLoading = true;
    try {
      const data = (await sendMessage("tokenInfoData", { id: id })) as any;

      price = data?.priceData?.[id]?.usd;

      coinInfo = {
        symbol: data?.coinData?.symbol,
        name: data?.coinData?.name,
        logo_url: data?.coinData?.image?.large,
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
  class={`rounded bg-white shadow font-sans text-sm text-gray-400 transition-all overflow-hidden w-full max-h-[600px] ${
    isLoading && "w-full max-h-[120px]"
  }`}
>
  {#if isLoading}
    <div class="w-full h-[120px] flex justify-center items-center">
      <loading-icon />
    </div>
  {/if}

  {#if coinInfo}
    <div class="p-3">
      <div class="flex gap-4 items-center">
        <img
          class="w-[52px] h-[52px] rounded-[50%]"
          src={getCgLogo(id)}
          alt={name}
        />
        <div class="flex flex-col text-gray-900 text-sm">
          <div class="flex flex-col">
            <div class="flex font-medium">
              {name} - {coinInfo?.name}
            </div>
            <div class="flex items-center">
              Price: <span class="font-medium ml-1">
                ${price && formatCurrency(price)}
              </span>
            </div>
          </div>
          <div class="font-medium">Goverment token of stepN App</div>
        </div>
      </div>
      <div class="flex gap-2 flex-wrap mt-2">
        <div
          class="flex items-center text-xs justyfy-center px-1 py-1 text-sky-500 bg-sky-100 rounded"
        >
          Label 1
        </div>
        <div
          class="flex items-center text-xs justyfy-center px-1 py-1 text-sky-500 bg-sky-100 rounded"
        >
          Label 2
        </div>
        <div
          class="flex items-center text-xs justyfy-center px-1 py-1 text-sky-500 bg-sky-100 rounded"
        >
          Label 3
        </div>
      </div>

      <coin-chart symbol={id} {loaded} />

      {#if price}
        <price-convert symbol={name} {price} />
      {:else}
        <div>No data price</div>
      {/if}

      <!-- <div class="flex gap-4 items-center my-4">
        <div
          on:click={() => alert("Comming soon")}
          class="flex items-center justyfy-center btn-border px-3 py-2 text-white bg-sky-500 rounded cursor-pointer"
        >
          More info
        </div>
        <div
          on:click={() => alert("Comming soon")}
          class="flex items-center justyfy-center btn-border px-3 py-2 text-sky-500 rounded cursor-pointer"
        >
          Follow this coin
        </div>
      </div> -->
    </div>
  {/if}
</div>

<style>
  .btn-border {
    border: 1px solid #0ea5e9;
  }
</style>

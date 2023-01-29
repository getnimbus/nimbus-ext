<svelte:options tag="native-token-info" />

<script lang="ts">
  import { onMount } from "svelte";
  import { coinGeko } from "../../../lib/network";
  import { sendMessage } from "webext-bridge";
  import { formatCurrency, getCgLogo } from "./utils";

  import "~/components/ResetStyle.custom.svelte";
  import "~/components/CoinChart.custom.svelte";
  import "~/components/PriceConvert.custom.svelte";

  export let name;
  export let id;
  export let popup = true;

  let isLoading = false;
  let price = 0;

  let coinInfo = {
    symbol: "",
    name: "",
    logo_url: "",
    categories: [],
  };

  export let loaded;

  const loadSymbolInfo = async () => {
    isLoading = true;
    try {
      const data = (await sendMessage("tokenInfoData", { id: id })) as any;

      price = data?.price?.usd;
      coinInfo = {
        symbol: data?.symbol,
        name: data?.name,
        logo_url: data?.image?.large,
        categories: data?.categories || [],
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

<reset-style>
  <div
    class={`rounded bg-white shadow font-sans text-sm leading-5 text-gray-400 transition-all overflow-hidden w-full max-h-[600px] ${
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
          <a href={`https://www.coingecko.com/en/coins/${id}`} target="_blank">
            <img
              class="w-[52px] h-[52px] rounded-full"
              src={getCgLogo(id)}
              alt={name}
            />
          </a>
          <div class="flex flex-col text-gray-900 text-sm leading-5">
            <div class="flex flex-col">
              <a
                href={`https://www.coingecko.com/en/coins/${id}`}
                target="_blank"
                class="no-underline text-gray-800 hover:text-gray-900"
              >
                <div class="flex flex-col font-medium">
                  <div class="flex items-center">
                    {name}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="ml-1 w-4 h-4"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                        clip-rule="evenodd"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  {coinInfo?.name ? coinInfo?.name : "-"}
                </div>
              </a>
              <div class="flex items-center">
                Price: <span class="font-medium ml-1">
                  {price ? `$${formatCurrency(price)}` : "--"}
                </span>
              </div>
            </div>
            <!-- <div class="font-medium">Goverment token of stepN App</div> -->
          </div>
        </div>

        <div class="flex gap-2 flex-wrap mt-2 mx-auto">
          {#each coinInfo.categories.slice(0, 3) as category}
            <div
              class="flex items-center text-xs justyfy-center px-2 py-1 text-sky-500 bg-sky-100 rounded"
            >
              {category}
            </div>
          {/each}
        </div>

        <div class="mt-2">
          <coin-chart symbol={id} {loaded} />
        </div>

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
</reset-style>

<style>
  .btn-border {
    border: 1px solid #0ea5e9;
  }
</style>

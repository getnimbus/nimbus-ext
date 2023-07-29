<script lang="ts">
  import { onMount } from "svelte";
  import { wallet, chain } from "~/store";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let chainParams = urlParams.get("chain");
    let addressParams = urlParams.get("address");

    if (APP_TYPE.TYPE === "EXT") {
      const params = decodeURIComponent(window.location.hash)
        .split("?")[1]
        .split("&")
        .reduce(function (result, param) {
          var [key, value] = param.split("=");
          result[key] = value;
          return result;
        }, {});

      chainParams = params.chain;
      addressParams = params.address;
    }

    if (chainParams && addressParams) {
      selectedWallet = addressParams;
      selectedChain = chainParams;
    }
  });
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col gap-2 justify-center">
      <div class="xl:text-5xl text-7xl text-black font-semibold">Compare</div>
      <div class="xl:text-xl text-3xl text-black font-medium">
        <Copy address={selectedWallet} iconColor="#000" color="#000" />
      </div>
    </div>
    <div class="border border-red-500 flex items-center gap-6">
      <div class="flex-1">token allocation</div>
      <div class="flex-1">compare form</div>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>

<script lang="ts">
  import { onMount } from "svelte";
  import { getAddressContext } from "~/utils";
  import { wallet } from "~/store";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import Personality from "./Personality.svelte";
  import CurrentStatus from "./CurrentStatus.svelte";
  import PastPerformance from "./PastPerformance.svelte";
  import Button from "~/components/Button.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let isShowSoon = false;
  $: {
    if (selectedWallet) {
      if (getAddressContext(selectedWallet)?.type === "BTC") {
        isShowSoon = true;
      } else {
        isShowSoon = false;
      }
    }
  }
</script>

<AddressManagement type="order" title="Analytic">
  <span slot="body">
    <div class="max-w-[2000px] m-auto w-[90%] -mt-32 relative">
      <div
        class="flex flex-col gap-7 bg-white rounded-[20px] p-8"
        style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
      >
        <CurrentStatus />
        <PastPerformance />
        <Personality />
      </div>
      {#if isShowSoon}
        <div
          class="absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center justify-center gap-3 bg-white/85 z-30 backdrop-blur-md"
        >
          <div class="text-lg">Comming soon 🚀</div>
          <a href="https://forms.gle/kg23ZmgXjsTgtjTN7" target="_blank">
            <Button variant="secondary" width={140} size="supper-small">
              Request analytics
            </Button>
          </a>
        </div>
      {/if}
    </div>
  </span>
</AddressManagement>

<style>
</style>

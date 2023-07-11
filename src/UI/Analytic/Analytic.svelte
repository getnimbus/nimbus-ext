<script lang="ts">
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
    <div class="max-w-[2000px] m-auto -mt-32 xl:w-[90%] w-[96%] relative">
      <div
        class="flex flex-col gap-7 bg-white rounded-[20px] xl:p-8 xl:shadow-md"
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

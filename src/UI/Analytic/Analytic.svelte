<script lang="ts">
  import { getAddressContext } from "~/utils";
  import { wallet, chain } from "~/store";
  import { useNavigate } from "svelte-navigator";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import Personality from "./Personality.svelte";
  import CurrentStatus from "./CurrentStatus.svelte";
  import PastPerformance from "./PastPerformance.svelte";
  import Button from "~/components/Button.svelte";
  import Risk from "../AnalyticChart/Risk.svelte";
  import Compare from "../Portfolio/Compare.svelte";
  import MoneyFlow from "../AnalyticChart/MoneyFlow.svelte";
  import RiskReturnChart from "../AnalyticChart/RiskReturnChart.svelte";
  import ReturnChart from "../AnalyticChart/ReturnChart.svelte";

  const navigate = useNavigate();

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
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

<AddressManagement type="order" title="Analytics">
  <span slot="body">
    <div class="max-w-[2000px] m-auto -mt-32 xl:w-[90%] w-[96%] relative">
      <div
        class="flex flex-col gap-7 bg-white rounded-[20px] xl:p-8 xl:shadow-md space-y-4"
      >
        <CurrentStatus />

        <div
          class="flex justify-between items-center border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="font-medium text-black xl:text-xl text-3xl">
            Minimize risk & maximize return by rebalance your portfolio
          </div>
          <div class="w-max">
            <Button
              variant="tertiary"
              on:click={() => {
                navigate(
                  `/virtual-portfolio?chain=${encodeURIComponent(
                    selectedChain
                  )}&address=${encodeURIComponent(selectedWallet)}`
                );
              }}
            >
              <div class="xl:text-base text-2xl font-medium text-white">
                Get suggestion
              </div>
            </Button>
          </div>
        </div>

        <Risk />

        <ReturnChart />

        <RiskReturnChart />

        <MoneyFlow />

        <PastPerformance />

        <!-- <Personality /> -->
      </div>
      {#if isShowSoon}
        <div
          class="absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center justify-center gap-3 bg-white/85 z-30 backdrop-blur-md"
        >
          <div class="text-lg">Comming soon 🚀</div>
          <a href="https://forms.gle/kg23ZmgXjsTgtjTN7" target="_blank">
            <Button variant="secondary">Request analytics</Button>
          </a>
        </div>
      {/if}
    </div>
  </span>
</AddressManagement>

<style>
</style>

<script lang="ts">
  import { getAddressContext } from "~/utils";
  import { wallet, chain } from "~/store";
  import { useNavigate } from "svelte-navigator";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import Personality from "./Personality.svelte";
  import CurrentStatus from "./CurrentStatus.svelte";
  import PastPerformance from "./PastPerformance.svelte";
  import Button from "~/components/Button.svelte";
  import Compare from "../Portfolio/Compare.svelte";
  import MoneyFlow from "../AnalyticChart/MoneyFlow.svelte";
  import RiskChart from "../AnalyticChart/RiskChart.svelte";
  import ReturnChart from "../AnalyticChart/ReturnChart.svelte";
  import RiskReturnChart from "../AnalyticChart/RiskReturnChart.svelte";

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

        <section class="overflow-hidden">
          <div
            class="mx-auto max-w-c-1390 px-4 py-4 rounded-[20px] bg-gradient-to-t from-[#F8F9FF] to-[#DEE7FF]"
          >
            <div
              class="flex flex-wrap gap-8 md:flex-nowrap md:items-center md:justify-between md:gap-0"
            >
              <div
                class="animate_left"
                data-sr-id="39"
                style="visibility: visible; opacity: 1; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transition: opacity 2.8s cubic-bezier(0.5, 0, 0, 1) 0s, transform 2.8s cubic-bezier(0.5, 0, 0, 1) 0s;"
              >
                <h2
                  class="px-2 py-3 text-xl font-medium text-black xl:text-sectiontitle4"
                >
                  Minimize risk & maximize return by rebalance your portfolio 🚀
                </h2>
              </div>
              <div
                class="animate_right lg:w-[45%]"
                data-sr-id="43"
                style="visibility: visible; opacity: 1; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transition: opacity 2.8s cubic-bezier(0.5, 0, 0, 1) 0s, transform 2.8s cubic-bezier(0.5, 0, 0, 1) 0s;"
              >
                <div class="flex items-center justify-end">
                  <a
                    class="inline-flex items-center gap-2.5 font-medium text-white bg-black rounded-full py-3 px-6"
                    href={`/compare?address=${encodeURIComponent(
                      selectedWallet
                    )}`}
                    on:click|preventDefault={() => {
                      navigate(
                        `/compare?address=${encodeURIComponent(selectedWallet)}`
                      );
                    }}
                  >
                    Get suggestion
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <RiskChart />

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

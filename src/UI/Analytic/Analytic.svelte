<script lang="ts">
  import { timeFrame } from "~/utils";
  import { wallet, selectedPackage, isDarkMode, typeWallet } from "~/store";
  import { useNavigate } from "svelte-navigator";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import mixpanel from "mixpanel-browser";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import Button from "~/components/Button.svelte";
  import CurrentStatus from "./CurrentStatus.svelte";
  import PastPerformance from "./PastPerformance.svelte";
  import MoneyFlow from "../AnalyticChart/MoneyFlow.svelte";
  import RiskChart from "../AnalyticChart/RiskChart.svelte";
  import ReturnChart from "../AnalyticChart/ReturnChart.svelte";
  import RiskReturnChart from "../AnalyticChart/RiskReturnChart.svelte";
  import CorrelationsMatrix from "./CorrelationsMatrix.svelte";
  import ClosedHoldingToken from "./ClosedHoldingToken.svelte";
  import Personality from "./Personality.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";

  const navigate = useNavigate();

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let packageSelected = "";
  selectedPackage.subscribe((value) => {
    packageSelected = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let isShowSoon = false;
  let selectedTimeFrame: "7D" | "30D" | "3M" | "1Y" | "ALL" = "30D";

  $: {
    if (selectedWallet) {
      if (typeWalletAddress === "BTC" || packageSelected === "FREE") {
        isShowSoon = true;
      } else {
        isShowSoon = false;
      }
    }
  }
</script>

<AddressManagement type="order" title="Analytics">
  <span slot="body">
    <div class="max-w-[2000px] m-auto -mt-32 xl:w-[90%] w-[90%] relative">
      <div class="analytic_container rounded-[20px] xl:p-8 p-6 space-y-4">
        <div class="flex items-center justify-end gap-1">
          <div class="mr-1 xl:text-base text-2xl">Timeframe</div>
          <AnimateSharedLayout>
            {#each timeFrame as type}
              <div
                class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                on:click={() => {
                  selectedTimeFrame = type.value;
                }}
              >
                <div
                  class={`relative z-20 ${
                    type.value === selectedTimeFrame && "text-white"
                  }`}
                >
                  {type.label}
                </div>
                {#if type.value === selectedTimeFrame}
                  <Motion
                    let:motion
                    layoutId="active-pill"
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <div
                      class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                      use:motion
                    />
                  </Motion>
                {/if}
              </div>
            {/each}
          </AnimateSharedLayout>
        </div>

        <div class="flex flex-col gap-7">
          <CurrentStatus {packageSelected} {selectedTimeFrame} />

          <section class="overflow-hidden">
            <div
              class={`mx-auto max-w-c-1390 px-6 py-7 rounded-[20px] bg-gradient-to-t flex justify-between gap-10 ${
                darkMode
                  ? "from-[#0f0f0f] to-[#222222]"
                  : "from-[#F8F9FF] to-[#DEE7FF]"
              }`}
            >
              <div class="text-2xl xl:text-xl font-medium">
                Minimize risk & maximize return by rebalance your portfolio 🚀
              </div>
              <div class="xl:w-[164px] w-[284px]">
                <Button
                  on:click={() => {
                    navigate(
                      `/compare?address=${encodeURIComponent(selectedWallet)}`
                    );
                    mixpanel.track("user_compare");
                  }}
                >
                  <div class="xl:text-base text-2xl">Get suggestion</div>
                </Button>
              </div>
            </div>
          </section>

          <RiskChart {selectedTimeFrame} />

          <ReturnChart {selectedTimeFrame} />

          <RiskReturnChart {selectedTimeFrame} />

          <CorrelationsMatrix />

          <ClosedHoldingToken />

          <MoneyFlow {packageSelected} {selectedTimeFrame} />

          <PastPerformance {packageSelected} />

          <!-- <Personality /> -->
        </div>
      </div>

      {#if isShowSoon && selectedWallet !== "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0"}
        <div
          class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center gap-3 pt-62 ${
            darkMode ? "bg-[#222222e6]" : "bg-white/90"
          } z-30 backdrop-blur-md`}
        >
          {#if packageSelected === "FREE"}
            <div class="flex flex-col items-center gap-1">
              <div class="text-lg font-medium">
                Use Nimbus at its full potential
              </div>
              <div class="text-base text-gray-500">
                Upgrade to Premium to access Analytics feature
              </div>
            </div>
            <div class="mt-2 w-max">
              <Button variant="premium" on:click={() => navigate("/upgrade")}
                >Start 30-day Trial</Button
              >
            </div>
          {/if}
          {#if packageSelected !== "FREE" && typeWalletAddress === "BTC"}
            <div class="text-lg">Coming soon 🚀</div>
            <div class="w-max">
              <button
                data-featurebase-feedback
                class="button btn-container secondary small"
                >Request analytics</button
              >
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </span>
</AddressManagement>

<style>
  :global(body) .analytic_container {
    background: #fff;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1);
  }
  :global(body.dark) .analytic_container {
    background: #0f0f0f;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 1);
  }
</style>

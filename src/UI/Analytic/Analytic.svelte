<script lang="ts">
  import { getAddressContext, timeFrame } from "~/utils";
  import { wallet, selectedPackage, isDarkMode } from "~/store";
  import { useNavigate } from "svelte-navigator";
  import { AnimateSharedLayout, Motion } from "svelte-motion";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import Button from "~/components/Button.svelte";
  import CurrentStatus from "./CurrentStatus.svelte";
  import PastPerformance from "./PastPerformance.svelte";
  import MoneyFlow from "../AnalyticChart/MoneyFlow.svelte";
  import RiskChart from "../AnalyticChart/RiskChart.svelte";
  import ReturnChart from "../AnalyticChart/ReturnChart.svelte";
  import RiskReturnChart from "../AnalyticChart/RiskReturnChart.svelte";
  import Personality from "./Personality.svelte";
  import Compare from "../Portfolio/Compare.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import CorrelationsMatrix from "./CorrelationsMatrix.svelte";

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

  let isShowSoon = false;
  let selectedTimeFrame: "7D" | "30D" | "3M" | "1Y" | "ALL" = "30D";

  $: {
    if (selectedWallet) {
      if (
        getAddressContext(selectedWallet)?.type === "BTC" ||
        getAddressContext(selectedWallet)?.type === "SOL" ||
        packageSelected === "FREE"
      ) {
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
              class={`mx-auto max-w-c-1390 px-4 py-4 rounded-[20px] bg-gradient-to-t ${
                darkMode
                  ? "from-[#0f0f0f] to-[#222222]"
                  : "from-[#F8F9FF] to-[#DEE7FF]"
              }`}
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
                    class="px-2 py-3 text-xl font-medium xl:text-sectiontitle4"
                  >
                    Minimize risk & maximize return by rebalance your portfolio
                    🚀
                  </h2>
                </div>
                <div
                  class="animate_right lg:w-[45%]"
                  data-sr-id="43"
                  style="visibility: visible; opacity: 1; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transition: opacity 2.8s cubic-bezier(0.5, 0, 0, 1) 0s, transform 2.8s cubic-bezier(0.5, 0, 0, 1) 0s;"
                >
                  <div class="flex items-center justify-end">
                    <div class="xl:w-[164px] w-max">
                      {#if selectedWallet === "0xc02ad7b9a9121fc849196e844dc869d2250df3a6"}
                        <Button disabled>
                          <div class="xl:text-base text-2xl">
                            Get suggestion
                          </div>
                        </Button>
                      {:else}
                        <Button
                          on:click={() => {
                            navigate(
                              `/compare?address=${encodeURIComponent(
                                selectedWallet
                              )}`
                            );
                          }}
                        >
                          <div class="xl:text-base text-2xl">
                            Get suggestion
                          </div>
                        </Button>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <RiskChart {selectedTimeFrame} />

          <ReturnChart {selectedTimeFrame} />

          <RiskReturnChart {selectedTimeFrame} />

          <CorrelationsMatrix />

          <MoneyFlow {packageSelected} {selectedTimeFrame} />

          <PastPerformance {packageSelected} />

          <!-- <Personality /> -->
        </div>
      </div>

      {#if isShowSoon && selectedWallet !== "0xc02ad7b9a9121fc849196e844dc869d2250df3a6"}
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
          {#if packageSelected !== "FREE" && (getAddressContext(selectedWallet)?.type === "BTC" || getAddressContext(selectedWallet)?.type === "SOL")}
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

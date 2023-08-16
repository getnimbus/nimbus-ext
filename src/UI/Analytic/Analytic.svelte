<script lang="ts">
  import { getAddressContext } from "~/utils";
  import { wallet, chain, selectedPackage, typeWallet } from "~/store";
  import { useNavigate } from "svelte-navigator";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";

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

  let packageSelected = "";
  selectedPackage.subscribe((value) => {
    packageSelected = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let isShowSoon = false;
  let dataRiskBreakdown = [];

  const queryClient = useQueryClient();
  const query = createQuery({
    queryKey: ["compare"],
    queryFn: () => getAnalyticCompare(),
    staleTime: 300000, // 5 minutes
    onSuccess: () => getRiskBreakdown(),
  });

  const getAnalyticCompare = async () => {
    if (packageSelected === "FREE") {
      return;
    }
    const response: any = await nimbus.get(
      `/v2/analysis/${selectedWallet}/compare?compareAddress=${""}`
    );
    return response.data;
  };

  const getRiskBreakdown = async () => {
    try {
      const response = await nimbus.get(
        `/v2/analysis/${selectedWallet}/risk-breakdown`
      );
      if (response && response?.data) {
        dataRiskBreakdown = response?.data;
      }
    } catch (e) {
      console.error(e);
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        if (
          getAddressContext(selectedWallet)?.type === "EVM" ||
          typeWalletAddress === "CEX"
        ) {
          queryClient.invalidateQueries(["compare"]);
        }
      }
    }
  }

  $: {
    if (selectedWallet) {
      if (
        getAddressContext(selectedWallet)?.type === "BTC" ||
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
      <div
        class="flex flex-col gap-7 bg-white rounded-[20px] xl:p-8 space-y-4"
        style="box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.10);"
      >
        <CurrentStatus {packageSelected} />

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

        <RiskChart
          data={$query.data}
          isLoadingDataCompare={$query.isFetching}
          isEmptyDataCompare={$query.isError}
          {dataRiskBreakdown}
        />

        <ReturnChart
          data={$query.data}
          isLoadingDataCompare={$query.isFetching}
          isEmptyDataCompare={$query.isError}
        />

        <RiskReturnChart
          data={$query.data}
          isLoadingDataCompare={$query.isFetching}
          isEmptyDataCompare={$query.isError}
          {dataRiskBreakdown}
        />

        <MoneyFlow {packageSelected} />

        <PastPerformance {packageSelected} />

        <!-- <Personality /> -->
      </div>
      {#if isShowSoon}
        <div
          class="absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center justify-center gap-3 bg-white/85 z-30 backdrop-blur-md"
        >
          {#if packageSelected === "FREE"}
            <div class="flex flex-col items-center gap-1">
              <div class="text-lg font-medium">
                Use Nimbus at its full potential
              </div>
              <div class="text-gray-500 text-base">
                Upgrade to Premium to access Analytics feature
              </div>
            </div>
            <div class="w-max mt-2">
              <Button variant="premium" on:click={() => navigate("/upgrade")}
                >Start 30-day Trial</Button
              >
            </div>
          {:else}
            <div class="text-lg">Comming soon 🚀</div>
            <div class="w-max">
              <a href="https://forms.gle/kg23ZmgXjsTgtjTN7" target="_blank">
                <Button variant="secondary">Request analytics</Button>
              </a>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </span>
</AddressManagement>

<style>
</style>

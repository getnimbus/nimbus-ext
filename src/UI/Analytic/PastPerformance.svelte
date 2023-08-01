<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain, isOpenReport } from "~/store";
  import { getAddressContext } from "~/utils";

  import DateRangePicker from "~/components/DateRangePicker.svelte";
  import SectorGrowth from "../AnalyticChart/SectorGrowth.svelte";
  import TotalGasFee from "../AnalyticChart/TotalGasFee.svelte";
  import TotalValueHistory from "../AnalyticChart/TotalValueHistory.svelte";
  import DailyPnL from "../AnalyticChart/DailyPnL.svelte";
  import ProfitGrows from "../AnalyticChart/ProfitGrows.svelte";
  import Button from "~/components/Button.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let isLoading = false;
  let isEmpty = false;
  let dataTotalValueHistory = [];
  let dataDailyPnL = [];

  // const handleGetDateRange = (data) => {
  //   console.log(data);
  // };

  const getTotalValueHistoryAndDailyGain = async () => {
    if (getAddressContext(selectedWallet).type === "EVM") {
      isLoading = true;
      try {
        const response: any = await sendMessage("getTotalValueHistory", {
          address: selectedWallet,
          chain: selectedChain,
          // fromDate: "YYYY-MM-DD",
          // toDate: "YYYY-MM-DD",
        });

        if (response === undefined) {
          isEmpty = true;
          isLoading = false;
          return;
        } else if (selectedWallet === response?.address) {
          if (response?.result?.length === 0) {
            isEmpty = true;
            isLoading = false;
            return;
          }
          dataTotalValueHistory = response?.result?.holdingHistory;
          dataDailyPnL = response?.result?.returnsChange;

          isLoading = false;
        } else {
          isEmpty = true;
          isLoading = false;
        }
      } catch (e) {
        console.log("error: ", e);
      }
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        getTotalValueHistoryAndDailyGain();
      }
    }
  }
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-center">
    <div class="xl:text-2xl text-4xl font-medium text-black">
      Historical Activities
    </div>
    <!-- <DateRangePicker onChange={handleGetDateRange} /> -->
  </div>
  <div class="flex flex-col gap-6">
    <!-- <ProfitGrows {isLoading} {isEmpty} {dataTotalValueHistory} />
    <TotalValueHistory {isLoading} {isEmpty} {dataTotalValueHistory} />
    <DailyPnL {isLoading} {isEmpty} {dataDailyPnL} />
    <SectorGrowth /> -->
    <TotalGasFee />
    {#if getAddressContext(selectedWallet)?.type !== "BTC"}
      <div class="flex justify-center mx-auto">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenReport.update((n) => (n = true));
          }}
        >
          Request analytics
        </Button>
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

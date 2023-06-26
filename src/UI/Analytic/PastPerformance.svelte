<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";

  import DateRangePicker from "~/components/DateRangePicker.svelte";
  import SectorGrowth from "../AnalyticChart/SectorGrowth.svelte";
  import TotalGasFee from "../AnalyticChart/TotalGasFee.svelte";
  import InflowOutflow from "../AnalyticChart/InflowOutflow.svelte";
  import TotalValueHistory from "../AnalyticChart/TotalValueHistory.svelte";
  import DailyGain from "../AnalyticChart/DailyGain.svelte";
  import ProfitGrows from "../AnalyticChart/ProfitGrows.svelte";

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
  let dataDailyGain = [];

  const handleGetDateRange = (data) => {
    console.log(data);
  };

  const getTotalValueHistoryAndDailyGain = async () => {
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
      } else if (selectedWallet === response.address) {
        if (response?.result?.length === 0) {
          isEmpty = true;
          isLoading = false;
          return;
        }
        dataTotalValueHistory = response?.result?.holdingHistory;
        dataDailyGain = response?.result?.returnsChange;

        isLoading = false;
      } else {
        isEmpty = true;
        isLoading = false;
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        getTotalValueHistoryAndDailyGain();
      }
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div class="flex justify-between items-center border-b-[1px] mb-6 pb-4">
    <div class="text-2xl font-medium text-black">Past Performance</div>
    <DateRangePicker onChange={handleGetDateRange} />
  </div>
  <div class="flex flex-col gap-6">
    <ProfitGrows {isLoading} {isEmpty} {dataTotalValueHistory} />
    <TotalValueHistory {isLoading} {isEmpty} {dataTotalValueHistory} />
    <DailyGain {isLoading} {isEmpty} {dataDailyGain} />
    <SectorGrowth />
    <InflowOutflow />
    <TotalGasFee />
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

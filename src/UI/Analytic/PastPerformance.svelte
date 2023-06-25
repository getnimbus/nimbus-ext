<script lang="ts">
  import DateRangePicker from "~/components/DateRangePicker.svelte";
  import SectorGrowth from "../AnalyticChart/SectorGrowth.svelte";
  import TotalGasFee from "../AnalyticChart/TotalGasFee.svelte";

  const handleGetDateRange = (data) => {
    console.log(data);
  };
</script>

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div class="flex justify-between items-center border-b-[1px] mb-6 pb-4">
    <div class="text-2xl font-medium text-black">Past Performance</div>
    <DateRangePicker onChange={handleGetDateRange} />
  </div>
  <div class="flex flex-col gap-6">
    <SectorGrowth />
    <TotalGasFee />
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

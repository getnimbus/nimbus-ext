<script lang="ts">
  import { isDarkMode } from "~/store";

  import LendingStakePosition from "./LendingStakePosition.svelte";
  import BorrowPosition from "./BorrowPosition.svelte";
  import VestPosition from "./VestPosition.svelte";
  import AmmPosition from "./AMMPosition.svelte";
  import ClmmPosition from "./CLMMPosition.svelte";
  import FarmPosition from "./FarmPosition.svelte";

  export let data;
</script>

<div
  class={`flex flex-col gap-4 rounded-[20px] xl:p-6 py-4 px-3 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
  }`}
>
  <div class="flex justify-between items-center">
    <div class="text-xl">
      {data?.protocol || ""}
    </div>
    <div class="text-xl">$0</div>
  </div>

  {#each data?.data as item}
    {#if item.type === "Lending" || item.type === "Staking"}
      <LendingStakePosition data={item.data} />
    {:else if item.type === "Borrow"}
      <BorrowPosition data={item.data} />
    {:else if item.type === "Vest"}
      <VestPosition data={item.data} />
    {:else if item.type === "AMM"}
      <AmmPosition data={item.data} />
    {:else if item.type === "CLMM"}
      <ClmmPosition data={item.data} />
    {:else if item.type === "Farm"}
      <FarmPosition data={item.data} />
    {/if}
  {/each}
</div>

<style></style>

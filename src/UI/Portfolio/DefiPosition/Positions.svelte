<script lang="ts">
  import LendingPosition from "./LendingPosition.svelte";
  import StakePosition from "./StakePosition.svelte";
  import BorrowPosition from "./BorrowPosition.svelte";
  import VestPosition from "./VestPosition.svelte";
  import AmmPosition from "./AMMPosition.svelte";
  import ClmmPosition from "./CLMMPosition.svelte";
  import FarmPosition from "./FarmPosition.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let data;
</script>

<div class="flex flex-col gap-4 rounded-[20px] py-4">
  <div class="flex justify-between items-center">
    <div class="text-xl font-medium">
      {data?.protocol || ""}
    </div>
    <div class="text-xl font-medium">
      <TooltipNumber number={data?.sum} type="value" />
    </div>
  </div>

  {#each data?.data as item}
    {#if item.type === "Lending"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">{item.type}</div>
        <LendingPosition data={item.data} />
      </div>
    {:else if item.type === "Staking"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">{item.type}</div>
        <StakePosition data={item.data} />
      </div>
    {:else if item.type === "Borrow"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">{item.type}</div>
        <BorrowPosition data={item.data} />
      </div>
    {:else if item.type === "Vest"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">{item.type}</div>
        <VestPosition data={item.data} />
      </div>
    {:else if item.type === "AMM"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">Liquidity Pool</div>
        <AmmPosition data={item.data} />
      </div>
    {:else if item.type === "CLMM"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">Liquidity Pool</div>
        <ClmmPosition data={item.data} />
      </div>
    {:else if item.type === "Farm"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">{item.type}</div>
        <FarmPosition data={item.data} />
      </div>
    {/if}
  {/each}
</div>

<style></style>

<script>
  export let data;

  import { formatBalance } from "~/utils";
  import LpProvider from "./LPProvider.svelte";
  import Staking from "./Staking.svelte";
  import StakingLocked from "./StakingLocked.svelte";
  import LendingProvider from "./LendingProvider.svelte";
  import LendingBorrow from "./LendingBorrow.svelte";
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-3">
      <img src={data.logo} alt="logo" width={40} height={40} />
      <a
        href={data.url}
        target="_blank"
        class="text-lg font-semibold uppercase"
      >
        {data.protocol}
      </a>
    </div>
    <div class="flex flex-col gap-1">
      <div class="text-3xl font-semibold text-right">
        ${formatBalance(data.currentValue)}
      </div>
      <div class="text-lg font-medium text-gray-600">
        Claimable: ${formatBalance(data.claimable)}
      </div>
    </div>
  </div>

  {#if data.positions && data.positions.length}
    {#each data.positions as position}
      <div class="flex flex-col gap-2">
        <div class="text-base font-semibold">{position.type}</div>
        <div class="border border-[#0000000d] rounded-[10px] overflow-x-scroll">
          {#if position.type === "LP-Provider"}
            <LpProvider data={position} />
          {:else if position.type === "Staking"}
            <Staking data={position} />
          {:else if position.type === "Staking-Locked"}
            <StakingLocked data={position} />
          {:else if position.type === "Lending-Provider"}
            <LendingProvider data={position} />
          {:else if position.type === "Lending-Borrow"}
            <LendingBorrow data={position} />
          {/if}
        </div>
      </div>
    {/each}
  {:else}
    <div>Empty</div>
  {/if}
</div>

<style></style>

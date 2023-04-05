<script>
  import { i18n } from "~/lib/i18n";
  import { formatBalance } from "~/utils";
  import LpProvider from "./LPProvider.svelte";
  import Staking from "./Staking.svelte";
  import StakingLocked from "./StakingLocked.svelte";
  import LendingProvider from "./LendingProvider.svelte";
  import LendingBorrow from "./LendingBorrow.svelte";

  export let data;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };
</script>

<div class="flex flex-col">
  <div class="flex justify-between items-center my-6">
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
        {MultipleLang.claimable}: ${formatBalance(data.claimable)}
      </div>
    </div>
  </div>
  {#if data.positions && data.positions.length !== 0}
    {#each data.positions as position}
      <div class="flex flex-col gap-2 -mt-3">
        <div class="text-base font-semibold">{position.type}</div>
        <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
          {#if position.type === "LP-Provider"}
            <LpProvider data={position} />
          {:else if position.type === "Staking"}
            <Staking data={position} />
          {:else if position.type === "Staking locked"}
            <StakingLocked data={position} />
          {:else if position.type === "Lending provider"}
            <LendingProvider data={position} />
          {:else if position.type === "Lending borrow"}
            <LendingBorrow data={position} />
          {/if}
        </div>

        {#if position.type === "LP-Provider"}
          <div class="text-xs text-gray-400 text-right mb-5">
            Profit is calculated by buying & hold on every time you add/remove
            liquidity
          </div>
        {/if}
      </div>
    {/each}
  {:else}
    <div>Empty</div>
  {/if}
</div>

<style>
  .test {
    border: 1px solid red;
  }
</style>

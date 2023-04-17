<script>
  import LpProvider from "./LPProvider.svelte";
  import LpProviderV2 from "./LPProviderV2.svelte";
  import Staking from "./Staking.svelte";
  import StakingLocked from "./StakingLocked.svelte";
  import LendingProvider from "./LendingProvider.svelte";
  import LendingBorrow from "./LendingBorrow.svelte";

  export let data;

  let types = Object.getOwnPropertyNames(data.positions);
</script>

{#if types && types.length !== 0}
  {#each types as position}
    <div class="flex flex-col mb-10">
      {#if position === "LP-Provider"}
        <LpProvider
          positions={data?.positions?.["LP-Provider"] || []}
          {data}
          {position}
        />
      {:else if position === "LP-Provider v2"}
        <LpProviderV2
          positions={data?.positions?.["LP-Provider v2"] || []}
          {data}
          {position}
        />
      {:else if position === "Staking"}
        <Staking
          positions={data?.positions?.["Staking"] || []}
          {data}
          {position}
        />
      {:else if position === "Staking locked"}
        <StakingLocked
          positions={data?.positions?.["Staking locked"] || []}
          {data}
          {position}
        />
      {:else if position === "Lending"}
        <LendingProvider
          positions={data?.positions?.["Lending"] || []}
          {data}
          {position}
        />
      {:else if position === "Borrow"}
        <LendingBorrow
          positions={data?.positions["Borrow"] || []}
          {data}
          {position}
        />
      {/if}

      {#if position === "LP-Provider"}
        <div class="text-xs text-gray-400 text-right mt-2">
          Profit is calculated by buying & hold on every time you add/remove
          liquidity
        </div>
      {/if}
    </div>
  {/each}
{:else}
  <div>Empty</div>
{/if}

<style>
  .test {
    border: 1px solid red;
  }
</style>

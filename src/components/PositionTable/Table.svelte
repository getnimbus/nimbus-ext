<script>
  import { i18n } from "~/lib/i18n";

  import LpProvider from "./LPProvider.svelte";
  import LpProviderV2 from "./LPProviderV2.svelte";
  import Staking from "./Staking.svelte";
  import StakingLocked from "./StakingLocked.svelte";
  import LendingProvider from "./LendingProvider.svelte";
  import LendingBorrow from "./LendingBorrow.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

  export let data;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };

  let types = Object.getOwnPropertyNames(data.positions);
</script>

<div class="flex flex-col gap-2 border border-[#00000014] rounded-[10px] p-4">
  <div class="flex items-center gap-3 border-b border-[#00000014] pb-3 mb-3">
    <img src={data.logo} alt="logo" width={40} height={40} />
    <a href={data.url} target="_blank" class="text-lg font-semibold uppercase">
      {data.protocol}
    </a>
  </div>
  {#if types && types.length !== 0}
    {#each types as position}
      <div class="flex flex-col mb-10 test">
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
</div>

<style>
</style>

<script>
  import { i18n } from "~/lib/i18n";
  import { formatBalance } from "~/utils";

  import LpProvider from "./LPProvider.svelte";
  import LpProviderV2 from "./LPProviderV2.svelte";
  import Staking from "./Staking.svelte";
  import StakingLocked from "./StakingLocked.svelte";
  import LendingProvider from "./LendingProvider.svelte";
  import LendingBorrow from "./LendingBorrow.svelte";

  export let data;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };

  let types = Object.getOwnPropertyNames(data.positions);
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
  {#if types && types.length !== 0}
    {#each types as position}
      <div class="flex flex-col gap-2 -mt-3">
        <div class="text-base font-semibold">{position}</div>
        <div class="border border-[#0000000d] rounded-[10px]">
          <table class="table-auto w-full">
            {#if position === "LP-Provider"}
              <LpProvider data={data?.positions?.["LP-Provider"] || []} />
            {:else if position === "LP-Provider v2"}
              <LpProviderV2 data={data?.positions?.["LP-Provider v2"] || []} />
            {:else if position === "Staking"}
              <Staking data={data?.positions?.["Staking"] || []} />
            {:else if position === "Staking locked"}
              <StakingLocked data={data?.positions?.["Staking locked"] || []} />
            {:else if position === "Lending provider"}
              <LendingProvider
                data={data?.positions?.["Lending provider"] || []}
              />
            {:else if position === "Lending borrow"}
              <LendingBorrow data={data?.positions["Lending borrow"] || []} />
            {/if}
          </table>
        </div>
        {#if position === "LP-Provider"}
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
</style>

<script>
  import LpProvider from "./LPProvider.svelte";
  import LpProviderV2 from "./LPProviderV2.svelte";
  import Staking from "./Staking.svelte";
  import StakingLocked from "./StakingLocked.svelte";
  import LendingProvider from "./LendingProvider.svelte";
  import LendingBorrow from "./LendingBorrow.svelte";

  export let data;

  $: types = data.positions.map((type) => Object.getOwnPropertyNames(type)[0]);
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
            {position}
            positions={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].data || []}
            sum={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum || 0}
            sum_claimable={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum_claimable || 0}
          />
        {:else if position === "LP-Provider v2"}
          <LpProviderV2
            {position}
            positions={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].data || []}
            sum={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum || 0}
            sum_claimable={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum_claimable || 0}
          />
        {:else if position === "Staking"}
          <Staking
            positions={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].data || []}
            {position}
            sum={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum || 0}
            sum_claimable={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum_claimable || 0}
          />
        {:else if position === "Staking locked"}
          <StakingLocked
            {position}
            positions={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].data || []}
            sum={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum || 0}
            sum_claimable={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum_claimable || 0}
          />
        {:else if position === "Lending"}
          <LendingProvider
            {position}
            positions={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].data || []}
            sum={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum || 0}
            sum_claimable={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum_claimable || 0}
          />
        {:else if position === "Borrow"}
          <LendingBorrow
            {position}
            positions={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].data || []}
            sum={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum || 0}
            sum_claimable={data.positions.filter((item) => {
              return Object.getOwnPropertyNames(item)[0] === position;
            })[0][position].sum_claimable || 0}
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

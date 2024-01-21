<script>
  import { detectedChain } from "~/lib/utils";

  import LpProvider from "./LPProvider.svelte";
  import LpProviderV2 from "./LPProviderV2.svelte";
  import LpStaking from "./LPStaking.svelte";
  import Staking from "./Staking.svelte";
  import StakingLocked from "./StakingLocked.svelte";
  import LendingProvider from "./LendingProvider.svelte";
  import LendingBorrow from "./LendingBorrow.svelte";
  import Mcd from "./MCD.svelte";

  export let data;

  $: types = data.positions.map((type) => Object.getOwnPropertyNames(type)[0]);
</script>

<div class="flex flex-col gap-2 border border-[#00000014] rounded-[10px] p-4">
  <div class="flex items-center gap-3 border-b border-[#00000014] pb-3 mb-3">
    <div class="relative">
      <img src={data.logo} alt="" width={50} height={50} />
      <!-- <div class="absolute -top-2 -right-1">
        <img
          src={detectedChain(data?.chain)}
          alt=""
          width="20"
          height="20"
          class="rounded-full"
        />
      </div> -->
    </div>
    <a
      href={data.url}
      target="_blank"
      class="xl:text-lg text-2xl font-semibold uppercase"
    >
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
        {:else if position === "LP Staking"}
          <LpStaking
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
        {:else if position === "MCD"}
          <Mcd
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
      </div>
    {/each}
  {:else}
    <div class="flex justify-center items-center text-lg text-gray-400">
      Empty
    </div>
  {/if}
</div>

<style>
</style>

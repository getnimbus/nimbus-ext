<script>
  export let data;
  import StakingItem from "./TableItem/StakingItem.svelte";
</script>

<thead>
  <tr class="bg-[#f4f5f880]">
    <th class="pl-3 py-3">
      <div class="text-sm font-semibold text-black uppercase text-left">
        Pool
      </div>
    </th>
    <th class="py-3">
      <div class="text-right text-sm font-semibold text-black uppercase">
        Entry ($)
      </div>
    </th>
    <!-- <th class="py-3">
      <div class="text-right text-sm font-semibold text-black uppercase">
        Entry Time
      </div>
    </th> -->
    <th class="py-3">
      <div class="text-right text-sm font-semibold text-black uppercase">
        Claimable (ETH)
      </div>
    </th>
    <th class="py-3">
      <div class="text-sm font-semibold text-black uppercase text-right">
        Value ($)
      </div>
    </th>
    <th class="pr-3 py-3">
      <div class="text-sm font-semibold text-black uppercase text-right">
        Profit & Loss
      </div>
    </th>
  </tr>
</thead>
{#each data as item}
  <StakingItem data={item} />
{/each}

<style>
</style>

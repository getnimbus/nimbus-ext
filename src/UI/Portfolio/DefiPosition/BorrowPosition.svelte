<script lang="ts">
  import LendingStake from "./LendingStake.svelte";
  import TokenStatePosition from "./TokenStatePosition.svelte";

  export let data;

  $: dataBorrowLendingStaking = data.find(
    (item) => item.type === "BorrowLendingStaking"
  );

  $: dataBorrow = data.find((item) => item.type === "Borrow");
</script>

{#if dataBorrowLendingStaking && dataBorrowLendingStaking?.data.length !== 0}
  <div class="flex flex-col gap-4">
    {#each dataBorrowLendingStaking?.data as itemRow}
      <LendingStake data={itemRow?.input} />
      <TokenStatePosition data={itemRow?.current?.tokens} type="borrow" />
    {/each}
  </div>
{/if}

{#if dataBorrow && dataBorrow?.data.length !== 0}
  <div class="flex flex-col gap-4">
    {#each dataBorrow?.data as itemRow}
      <TokenStatePosition data={itemRow?.input} type="supplied" />
      <TokenStatePosition data={itemRow?.current?.tokens} type="borrow" />
    {/each}
  </div>
{/if}

<style></style>

<script lang="ts">
  import { groupBy } from "lodash";
  import LendingPosition from "./LendingPosition.svelte";
  import StakePosition from "./StakePosition.svelte";

  export let data;

  let formatData = [];

  $: {
    if (data) {
      const groupType = groupBy(data, "type");
      const typeList = Object.getOwnPropertyNames(groupType);
      formatData = typeList.map((item) => {
        return {
          type: item,
          data: groupType[item],
        };
      });
    }
  }
</script>

{#each formatData as item}
  {#if item?.data?.length !== 0}
    {#if item.type === "Lending"}
      <LendingPosition data={item.data} />
    {:else if item.type === "Staking"}
      <StakePosition data={item.data} />
    {/if}
  {/if}
{/each}

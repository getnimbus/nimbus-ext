<svelte:options tag="change-list" />

<script>
  import "./MoneyMove.custom.svelte";
  import NoResultsIcon from "../../assets/no-results.png";
  import { getLocalImg } from "../../utils";

  export let data;
  export let id;
  export let explorer;
  export let from;
  export let to;
  export let enable;

  $: changeList = enable
    ? data.filter((item) => {
        return (
          item.from.toLowerCase() === from.toLowerCase() ||
          item.to.toLowerCase() === to.toLowerCase() ||
          item.from.toLowerCase() === to.toLowerCase() ||
          item.to.toLowerCase() === from.toLowerCase()
        );
      })
    : data;
</script>

{#if changeList && changeList.length}
  <div class="flex flex-col gap-10 h-full overflow-y-auto">
    {#each changeList as change}
      <money-move data={change} {id} {explorer} {from} {to} />
    {/each}
  </div>
{:else}
  <div class="flex justify-center items-center h-full">
    <img
      class="w-[84px] h-[84px]"
      src={getLocalImg(NoResultsIcon)}
      alt="no-results"
    />
  </div>
{/if}

<style></style>

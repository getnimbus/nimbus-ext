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
          item.to.toLowerCase() === to.toLowerCase()
        );
      })
    : data;
</script>

<div class="flex flex-col gap-10">
  {#if changeList && changeList.length}
    {#each changeList as change}
      <money-move data={change} {id} {explorer} {from} {to} />
    {/each}
  {:else}
    <img
      class="w-[84px] h-[84px] mx-auto"
      src={getLocalImg(NoResultsIcon)}
      alt="no-results"
    />
  {/if}
</div>

<style></style>

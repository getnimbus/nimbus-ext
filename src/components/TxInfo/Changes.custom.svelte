<svelte:options tag="change-list" />

<script>
  import "./MoneyMove.custom.svelte";
  import NoResultsIcon from "~/entries/contentScript/assets/no-results.png";
  import { getLocalImg } from "~/entries/contentScript/views/utils";

  export let data;
  export let id;
  export let explorer;
  export let from;
  export let to;
  export let enable;

  $: changeList = enable
    ? data.filter((item) => {
        return item.from === from || item.to === from;
      })
    : data;
</script>

<div class="flex flex-col gap-5">
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

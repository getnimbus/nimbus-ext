<script lang="ts">
  import { i18n } from "~/lib/i18n";

  export let data;
  export let isLoading;

  import Table from "../PositionTable/Table.svelte";
  import "~/components/Loading.custom.svelte";

  const MultipleLang = {
    positions: i18n("newtabPage.positions", "Positions"),
  };
</script>

<div class="flex flex-col gap-4">
  <div class="text-2xl font-medium text-black">
    {MultipleLang.positions}
  </div>

  {#if isLoading}
    <div class="flex items-center justify-center pt-6">
      <loading-icon />
    </div>
  {:else}
    <div class="flex flex-col gap-7">
      {#if data && data.length !== 0}
        {#each data as position}
          <Table data={position} />
        {/each}
      {:else}
        <div>No data</div>
      {/if}
    </div>
  {/if}
</div>

<style>
</style>

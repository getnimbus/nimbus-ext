<script lang="ts">
  import { i18n } from "~/lib/i18n";

  export let data;
  export let isLoading;

  import NewCard from "../NewCard.svelte";

  const MultipleLang = {
    news: i18n("newtabPage.news", "News"),
    view_more: i18n("newtabPage.view-more", "View more"),
  };
</script>

<div class="flex flex-col gap-10 border border-[#0000001a] rounded-[20px] p-6">
  <div class="flex justify-between border-b border-[#00000014] pb-4">
    <div class="text-2xl font-medium text-black">
      {MultipleLang.news}
    </div>
    <div
      class="font-bold text-base cursor-pointer"
      on:click={() => {
        chrome.tabs.create({
          url: "src/entries/news/index.html",
        });
      }}
    >
      {MultipleLang.view_more}
    </div>
  </div>
  {#if isLoading}
    <div class="flex items-center justify-center">
      <loading-icon />
    </div>
  {:else}
    <div
      class={`grid ${
        data && data.length
          ? "2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1"
          : "grid-cols-1"
      } gap-10`}
    >
      {#if data && data.length !== 0}
        {#each data as news}
          <NewCard data={news} />
        {/each}
      {:else}
        <div>No data</div>
      {/if}
    </div>
  {/if}
</div>

<style>
</style>

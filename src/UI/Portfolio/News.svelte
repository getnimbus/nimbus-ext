<script lang="ts">
  import { i18n } from "~/lib/i18n";

  export let data;
  export let isLoading;

  import Loading from "~/components/Loading.svelte";
  import NewsCard from "~/components/NewsCard.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  const MultipleLang = {
    news: i18n("newtabPage.news", "News"),
    view_more: i18n("newtabPage.view-more", "View more"),
  };
</script>

<ErrorBoundary>
  <div class="flex flex-col gap-10 border border_0000001a rounded-[20px] p-6">
    <div class="flex justify-between border-b border-[#00000014] pb-4">
      <div class="text-2xl font-medium">
        {MultipleLang.news}
      </div>
      <div class="font-bold text-base cursor-pointer">
        {MultipleLang.view_more}
      </div>
    </div>
    {#if isLoading}
      <div class="flex items-center justify-center">
        <Loading />
      </div>
    {:else}
      <div>
        {#if data && data.length !== 0}
          <div class="grid 2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1 gap-10">
            {#each data as news}
              <NewsCard data={news} />
            {/each}
          </div>
        {:else}
          <div class="flex items-center justify-center text-lg text-gray-400">
            Empty
          </div>
        {/if}
      </div>
    {/if}
  </div>
</ErrorBoundary>

<style>
</style>

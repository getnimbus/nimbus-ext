<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";

  import NewsCard from "~/components/NewsCard.svelte";
  import "~/components/Loading.custom.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";

  const MultipleLang = {
    news: i18n("newtabPage.news", "News"),
    news_page_title: i18n(
      "newtabPage.news-page-title",
      "Check out the latest blockchain and crypto articles we've put together"
    ),
  };

  let pageValue = 1;
  let isLoading = false;
  let newsData = [];

  const getNews = async () => {
    try {
      isLoading = true;
      const res = await nimbus
        .get(`/news?page=${pageValue}`)
        .then((response) => response.data);
      newsData = [...newsData, ...res.news];
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    getNews();
    mixpanel.track("news_page");
  });
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col gap-2 justify-center">
      <div class="xl:text-5xl text-7xl font-semibold">
        {MultipleLang.news}
      </div>
      <div class="xl:text-xl text-3xl font-medium">
        {MultipleLang.news_page_title}
      </div>
    </div>
    <div class="flex flex-col gap-4">
      {#if isLoading && pageValue === 1}
        <div class="w-full h-screen flex justify-center items-center">
          <loading-icon />
        </div>
      {:else}
        <div
          class={`grid gap-10 ${
            newsData && newsData.length === 0
              ? "grid-cols-1"
              : "2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2"
          }`}
        >
          {#if newsData.length === 0}
            <div class="text-lg text-gray-400">Empty</div>
          {:else}
            {#each newsData as data}
              <NewsCard {data} />
            {/each}
          {/if}
        </div>
      {/if}
      {#if newsData.length !== 0}
        <div class="mx-auto mt-6">
          <div class="w-[140px]">
            <Button
              variant="secondary"
              on:click={() => {
                pageValue = pageValue + 1;
                getNews();
              }}
              disabled={isLoading}
              {isLoading}
            >
              Load more
            </Button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</ErrorBoundary>

<style>
</style>

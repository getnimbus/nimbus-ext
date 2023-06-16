<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import NewsCard from "~/components/NewsCard.svelte";
  import "~/components/Loading.custom.svelte";
  import ErrorBoundary from "../ErrorBoundary.svelte";
  import { nimbus } from "~/lib/network";
  import { onMount } from "svelte";
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
  });

  const handleLoadMore = (e) => {
    e.preventDefault();
    pageValue = pageValue + 1;
    getNews();
  };
</script>

<ErrorBoundary>
  <div class="max-w-[2000px] m-auto w-[90%] py-8 flex flex-col gap-10">
    <div class="flex flex-col justify-center">
      <div class="text-3xl text-black font-semibold">{MultipleLang.news}</div>
      <div class="text-lg text-black font-medium">
        {MultipleLang.news_page_title}
      </div>
      <hr class="m-5 pt-5" />
      <div>
        {#if isLoading}
          {#if (newsData.length === 0)}
            <div class="flex justify-center items-center py-4 px-3">
              <loading-icon />
            </div>
          {:else}
            <NewsCard data={newsData} />
            <div class="flex justify-center items-center py-4 px-3">
              <loading-icon />
            </div>
          {/if}
        {:else if newsData.length === 0}
          Empty
        {:else}
          <NewsCard data={newsData} />
          <div class="lmbtnlayout m-10">
            <Button
              variant="secondary"
              on:click={(e) => handleLoadMore(e)}
              disabled={isLoading}
              {isLoading}>Load more</Button
            >
          </div>
        {/if}
      </div>
    </div>
  </div>
</ErrorBoundary>

<style>
  .lmbtnlayout {
    justify-content: center;
    align-items: center;
    display: flex;
  }
</style>

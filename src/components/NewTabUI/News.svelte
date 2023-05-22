<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { nimbus } from "../../lib/network";
  import { i18n } from "~/lib/i18n";

  import type { NewData } from "~/types/NewData";

  import NewCard from "~/components/NewCard.svelte";
  import "~/components/Loading.custom.svelte";

  const MultipleLang = {
    news: i18n("newtabPage.news", "News"),
    news_page_title: i18n(
      "newtabPage.news-page-title",
      "Check out the latest blockchain and crypto articles we've put together"
    ),
  };

  let newsData: NewData = [];
  let isLoading = false;

  const getNewsData = async () => {
    isLoading = true;
    try {
      const response: NewData = await nimbus
        .get("/news")
        .then((response) => response.data.news);
      newsData = response;
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    getNewsData();
  });
</script>

<div class="max-w-[2000px] m-auto w-[90%] py-8 flex flex-col gap-10">
  <div class="flex flex-col">
    <div class="text-3xl text-black font-semibold">{MultipleLang.news}</div>
    <div class="text-lg text-black font-medium">
      {MultipleLang.news_page_title}
    </div>
  </div>
  {#if isLoading}
    <div class="w-full h-[120px] flex justify-center items-center">
      <loading-icon />
    </div>
  {:else}
    <div
      class={`grid ${
        newsData && newsData.length
          ? "2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1"
          : "grid-cols-1"
      } gap-10`}
    >
      {#if newsData && newsData.length !== 0}
        {#each newsData as news}
          <NewCard data={news} />
        {/each}
      {:else}
        <div>Empty</div>
      {/if}
    </div>
  {/if}
</div>

<style></style>

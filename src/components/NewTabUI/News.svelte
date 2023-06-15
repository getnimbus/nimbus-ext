<script lang="ts">
  import { i18n } from "~/lib/i18n";

  // import NewCard from "~/components/NewCard.svelte";
  // import "~/components/Loading.custom.svelte";
  import ErrorBoundary from "../ErrorBoundary.svelte";

  const MultipleLang = {
    news: i18n("newtabPage.news", "News"),
    news_page_title: i18n(
      "newtabPage.news-page-title",
      "Check out the latest blockchain and crypto articles we've put together"
    ),
  };
</script>

<ErrorBoundary>
  <div class="max-w-[2000px] m-auto w-[90%] py-8 flex flex-col gap-10">
    <div class="flex flex-col">
      <div class="text-3xl text-black font-semibold">{MultipleLang.news}</div>
      <div class="text-lg text-black font-medium">
        {MultipleLang.news_page_title}
      </div>
    </div>
  </div>
</ErrorBoundary>

<style></style>

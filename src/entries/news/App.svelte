<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { nimbusApi, test } from "../../lib/network";

  import type { NewData } from "~/types/NewData";

  import NewCard from "~/components/NewCard.svelte";
  import "~/components/Loading.custom.svelte";

  import logo from "../../assets/logo-1.svg";

  let newsData: NewData = [];
  let isLoading = false;

  const getNewsData = async () => {
    isLoading = true;
    try {
      const response: NewData = await test
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

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });
</script>

<div class="max-w-[2000px] m-auto w-[90%] py-8 flex flex-col gap-10">
  <img src={logo} alt="logo" width={200} class="-ml-6" />
  <div class="flex flex-col gap-1 -mt-6">
    <div class="text-4xl text-black font-semibold">News</div>
    <div class="text-xl text-black font-medium">
      Check out the latest blockchain and crypto articles we've put together
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
        <div>No data</div>
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global>
</style>

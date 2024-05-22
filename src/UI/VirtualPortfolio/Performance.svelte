<script lang="ts">
  import { isDarkMode } from "~/store";

  import EChart from "~/components/EChart.svelte";
  import Loading from "~/components/Loading.svelte";

  export let isLoading;
</script>

<div
  class={`rounded-[20px] xl:p-6 py-4 px-3 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
  }`}
>
  <div class="text-3xl font-medium xl:text-2xl mb-6">Performance</div>

  {#if isLoading}
    <div class="flex items-center justify-center h-[465px]">
      <Loading />
    </div>
  {:else}
    <div class="h-full">
      {#if true}
        <div
          class="flex justify-center items-center h-[465px] text-base text-gray-400"
        >
          Empty
        </div>
      {:else}
        <div>hello</div>
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>

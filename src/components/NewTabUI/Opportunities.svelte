<script lang="ts">
  import { i18n } from "~/lib/i18n";

  export let data;
  export let isLoading;

  import OpportunityCard from "../OpportunityCard.svelte";

  const MultipleLang = {
    opportunities: i18n("newtabPage.opportunities", "Opportunities"),
  };
</script>

<div
  class="xl:w-[35%] w-full flex flex-col border border-[#0000001a] rounded-[20px] p-6 relative"
>
  <div
    class="absolute top-0 left-0 w-full h-full bg-[#fff] opacity-70 flex justify-center items-center rounded-[20px]"
  >
    <div class="text-black text-base font-semibold text-center mx-4">
      Investment opportunities to optimize your holding. <br /> Coming soon 🥳
    </div>
  </div>
  <div class="text-2xl font-medium text-black mb-6 blur-sm">
    {MultipleLang.opportunities}
  </div>
  <div class="flex flex-col gap-4 xl:basis-0 grow blur-sm">
    {#if isLoading}
      <div class="flex items-center justify-center">
        <loading-icon />
      </div>
    {:else}
      <div>
        {#if data && data.length !== 0}
          {#each data as opportunity}
            <OpportunityCard data={opportunity} />
          {/each}
        {:else}
          <div>No data</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
</style>

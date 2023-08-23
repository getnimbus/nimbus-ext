<script lang="ts">
  import { i18n } from "~/lib/i18n";

  export let data;
  export let isLoading;

  import "~/components/Loading.custom.svelte";
  import OpportunityCard from "~/components/OpportunityCard.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";

  const MultipleLang = {
    opportunities: i18n("newtabPage.opportunities", "Opportunities"),
  };
</script>

<ErrorBoundary>
  <div
    class="xl:w-[30%] w-full flex flex-col border border_0000001a rounded-[20px] p-6 relative"
  >
    <div
      class="absolute top-0 left-0 w-full h-full bg-[#ffffffb3] flex flex-col justify-center items-center gap-4 rounded-[20px]"
    >
      <div class=" text-base font-semibold text-center mx-4">
        Investment opportunities to optimize your holding. <br /> Coming soon 🥳
      </div>
      <a href="https://forms.gle/HfmvSTzd5frPPYDz8" target="_blank">
        <Button variant="tertiary" className="opacity-100">Notify me</Button>
      </a>
    </div>
    <div class="text-2xl font-medium mb-6 blur-sm">
      {MultipleLang.opportunities}
    </div>
    {#if isLoading}
      <div class="flex items-center justify-center h-full">
        <loading-icon />
      </div>
    {:else}
      <div class="h-full">
        {#if data && data.length !== 0}
          <div class="flex flex-col gap-4 xl:basis-0 grow blur-sm">
            {#each data as opportunity}
              <OpportunityCard data={opportunity} />
            {/each}
          </div>
        {:else}
          <div
            class="flex justify-center items-center h-full text-lg text-gray-400"
          >
            Empty
          </div>
        {/if}
      </div>
    {/if}
  </div>
</ErrorBoundary>

<style>
</style>

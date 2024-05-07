<script lang="ts">
  import { typeWallet } from "~/store";
  import { formatDataProtocol } from "./DefiPosition/utils";

  import Loading from "~/components/Loading.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Positions from "./DefiPosition/Positions.svelte";

  export let data;
  export let isLoading;

  let positionsData = [];

  $: {
    if (data) {
      positionsData = formatDataProtocol(data);
    }
  }

  $: console.log("this : ", positionsData);
</script>

<ErrorBoundary>
  <div class="flex flex-col gap-2 xl:px-3">
    <div class="text-2xl font-medium">Positions</div>
    {#if $typeWallet === "MOVE" || $typeWallet === "EVM"}
      {#if data.length === 0 && !isLoading}
        <div class="flex justify-center items-center min-h-[300px]">Empty</div>
      {:else}
        <div class="flex flex-col gap-6">
          {#each positionsData as item}
            <Positions data={item} />
          {/each}
          {#if isLoading}
            <div class="flex justify-center items-center min-h-[300px]">
              <Loading />
            </div>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="text-lg min-h-[300px] flex items-center justify-center">
        Coming soon 🚀
      </div>
    {/if}
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>

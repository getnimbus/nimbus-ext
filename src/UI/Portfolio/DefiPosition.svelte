<script lang="ts">
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import LendingStakePosition from "./DefiPosition/LendingStakePosition.svelte";
  import { protocolData } from "./DefiPosition/hardCodeDefiData";
</script>

<ErrorBoundary>
  <div class="flex flex-col gap-4 px-3">
    <div class="xl:text-2xl text-3xl font-medium">Positions</div>
    <div class="flex flex-col gap-4">
      {#each protocolData as data}
        {#if data.type === "Lending" || data.type === "Stake"}
          <LendingStakePosition {data} />
        {:else if data.type === "Borrow"}{/if}
      {/each}
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>

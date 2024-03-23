<script lang="ts">
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import LendingStakePosition from "./DefiPosition/LendingStakePosition.svelte";
</script>

<ErrorBoundary>
  <div class="flex flex-col gap-4 px-3">
    <div class="xl:text-2xl text-3xl font-medium">Positions</div>
    <LendingStakePosition />
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>

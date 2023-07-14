<script>
  import Button from "./Button.svelte";
  import { isOpenReport } from "~/store";

  export let error = null;
  export let onError = null;

  $: if ($error && onError) onError($error);
</script>

{#if $error}
  <div class="flex flex-col justify-center items-center gap-2 mt-2">
    Something when wrong! Please reload your browser to try again
    <Button
      variant="secondary"
      on:click={() => {
        isOpenReport.update((n) => (n = true));
      }}>Report</Button
    >
  </div>
{:else}
  <slot />
{/if}

<style>
</style>

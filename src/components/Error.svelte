<script>
  export let error = null;
  export let onError = null;

  $: if ($error && onError) onError($error);
  $: if ($error) {
    console.log("Render error");
    console.log($error);
  }
</script>

{#if $error}
  <div class="flex flex-col justify-center items-center gap-2 mt-2">
    Something when wrong! Please reload your browser to try again
  </div>
{:else}
  <slot />
{/if}

<style>
</style>

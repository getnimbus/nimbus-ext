<svelte:options tag="app-btn" />

<script>
  export let secondary = false;
</script>

<button
  class="bg-sky-500 px-2 py-3 rounded border-none text-white cursor-pointer w-full"
>
  <slot />
</button>

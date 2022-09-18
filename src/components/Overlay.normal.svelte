<svelte:options tag="app-overlay" />

<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let isOpen = false;

  const handleClose = () => {
    dispatch("close");
  };
</script>

{#if isOpen}
  <div
    class="w-screen h-screen fixed top-0 left-0 flex justify-center items-center bg-gray-900 opacity-90 z-10"
    on:click={handleClose}
  >
    <div
      class="bg-gray-100 rounded-md px-8 py-10 relative min-w-lg opacity-95"
      on:click|stopPropagation
    >
      <div
        class="absolute top-2 right-3 text-4xl text-gray-500 cursor-pointer"
        on:click={handleClose}
      >
        &times;
      </div>
      <slot />
    </div>
  </div>
{/if}

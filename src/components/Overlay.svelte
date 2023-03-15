<svelte:options tag="app-overlay" />

<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let isOpen = false;
  export let clickOutSideToClose = false;

  const handleClose = () => {
    dispatch("close");
  };

  $: if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "unset";
  }
</script>

{#if isOpen}
  <div
    class="w-screen h-screen fixed top-0 left-0 flex justify-center items-center bg-[#000000cc]"
    style="z-index: 2147483647;"
    on:click={clickOutSideToClose ? handleClose : null}
  >
    <div
      class="bg-white rounded-md px-8 py-10 relative min-w-lg"
      on:click|stopPropagation
    >
      <div
        class="absolute top-2 right-3 text-4xl text-gray-500 hover:text-sky-500 transition-all cursor-pointer"
        on:click|stopPropagation={handleClose}
      >
        &times;
      </div>
      <slot />
    </div>
  </div>
{/if}

<svelte:options tag="app-overlay" />

<script>
  import { createEventDispatcher } from "svelte";
  import { Motion } from "svelte-motion";
  const dispatch = createEventDispatcher();

  const variants = {
    visible: { opacity: 1, y: 0, display: "block" },
    hidden: { opacity: 0, y: -50, display: "none" },
  };

  export let isOpen = false;
  export let clickOutSideToClose = false;

  const handleClose = () => {
    dispatch("close");
  };

  // Prevent layout flick
  // $: if (isOpen) {
  //   document.body.style.overflow = "hidden";
  // } else {
  //   document.body.style.overflow = "unset";
  // }
</script>

{#if isOpen}
  <div
    class="w-screen h-screen fixed top-0 left-0 flex justify-center items-center bg-[#000000cc]"
    style="z-index: 2147483647;"
    on:click={clickOutSideToClose ? handleClose : null}
  >
    <Motion
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      {variants}
      let:motion
    >
      <div
        class="bg-white rounded-xl px-6 pt-9 pb-7 relative min-w-lg"
        style="box-shadow: 0px 4px 20px 0px #00000026;"
        on:click|stopPropagation
        use:motion
      >
        <div
          class="absolute top-3 right-5 text-4xl text-gray-500 cursor-pointer"
          on:click|stopPropagation={handleClose}
        >
          &times;
        </div>
        <slot />
      </div>
    </Motion>
  </div>
{/if}

<script>
  import { createEventDispatcher } from "svelte";
  import { Motion } from "svelte-motion";
  import { showOverlayAnimationVariants } from "~/utils";
  const dispatch = createEventDispatcher();

  export let isOpen;
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
      variants={showOverlayAnimationVariants}
      let:motion
    >
      <div
        class="bg-white rounded-xl px-6 pt-9 pb-7 mx-6 relative xl:min-w-xl min-w-4xl"
        style="box-shadow: 0px 4px 20px 0px #00000026;"
        on:click|stopPropagation
        use:motion
      >
        <div
          class="absolute top-3 right-5 xl:text-4xl text-6xl text-gray-500 cursor-pointer"
          on:click|stopPropagation={handleClose}
        >
          &times;
        </div>
        <slot />
      </div>
    </Motion>
  </div>
{/if}

<style></style>

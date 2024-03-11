<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { Motion } from "svelte-motion";
  import { isDarkMode } from "~/store";
  import { showOverlayAnimationVariants } from "~/utils";
  const dispatch = createEventDispatcher();

  export let isOpen;
  export let clickOutSideToClose = false;
  export let isTableContent = false;

  const handleClose = () => {
    dispatch("close");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  // Prevent layout flick
  $: if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "unset";
  }
</script>

{#if isOpen}
  <div
    class="w-screen h-screen fixed top-0 left-0 flex overflow-y-auto justify-center items-center"
    style="z-index: 10; background-color: rgba(0, 0, 0, 0.55); backdrop-blur: blur(4px);"
    on:click={clickOutSideToClose ? handleClose : null}
  >
    <Motion
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      variants={showOverlayAnimationVariants}
      let:motion
    >
      <div
        class={`relative ${
          isTableContent
            ? "xl:min-w-7xl max-w-4xl xl:w-max w-full"
            : "xl:min-w-2xl max-w-4xl xl:w-max w-full"
        }`}
        style="box-shadow: 0px 4px 20px 0px #00000026;"
        on:click|stopPropagation
        use:motion
      >
        <div class={`rounded-xl ${$isDarkMode ? "bg-[#0f0f0f]" : "bg-white"}`}>
          <div
            class="absolute top-3 right-5 xl:text-4xl text-6xl text-gray-500 cursor-pointer"
            on:click|stopPropagation={handleClose}
          >
            &times;
          </div>
          <div class="px-6 pt-9 pb-7">
            <slot />
          </div>
        </div>
      </div>
    </Motion>
  </div>
{/if}

<style>
</style>

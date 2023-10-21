<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { Motion } from "svelte-motion";
  import { isDarkMode } from "~/store";
  import { showOverlayAnimationVariants } from "~/utils";
  const dispatch = createEventDispatcher();

  export let isOpen;
  export let clickOutSideToClose = false;
  export let isTableContent = false;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

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
    class="w-screen h-screen fixed top-0 left-0 flex overflow-y-auto justify-center items-center bg-[#000000cc]"
    style="z-index: 9999999;"
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
        <div class={`rounded-xl ${darkMode ? "bg-[#0f0f0f]" : "bg-white"}`}>
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

<!-- <div
  class={`xl:hidden block fixed inset-0 h-screen w-full mobile ${
    isOpen
      ? "opacity-100 transform translate-x-[0px]"
      : "opacity-0 transform translate-x-[-100vw]"
  }`}
>
  <div class={`h-full ${darkMode ? "bg-[#0f0f0f]" : "bg-white"}`}>
    <div
      class="h-[100px] max-w-[100vw] m-auto w-[90%] flex justify-end items-center"
    >
      <div
        class="cursor-pointer xl:text-4xl text-6xl text-gray-500 z-10"
        on:click={handleClose}
      >
        &times;
      </div>
    </div>
    <div class="max-w-[100vw] m-auto w-[90%] -mt-14 h-full">
      <slot />
    </div>
  </div>
</div> -->

<style>
  /* .mobile {
    z-index: 2147483649;

    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

    --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
      0 8px 10px -6px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
      var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  } */
</style>

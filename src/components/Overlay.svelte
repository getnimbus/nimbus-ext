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

  // Prevent layout flick
  // $: if (isOpen) {
  //   document.body.style.overflow = "hidden";
  // } else {
  //   document.body.style.overflow = "unset";
  // }

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
</script>

{#if isOpen}
  <div
    class="w-screen h-screen fixed top-0 left-0 flex overflow-y-auto justify-center items-center bg-[#000000cc]"
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
        class={`relative border border-red-500 ${
          isTableContent ? "xl:min-w-7xl min-w-4xl" : "xl:min-w-2xl min-w-4xl"
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

<style></style>

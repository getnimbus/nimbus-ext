<svelte:options tag="report-modal" />

<script>
  import "./StartRating.svelte";

  let show = false;
  export function handleShowModal() {
    show = true;
  }
  export function handleHiddenModal() {
    show = false;
  }

  const wheel = (node, options) => {
    let { show } = options;
    const handler = (e) => {
      if (show) e.preventDefault();
    };
    node.addEventListener("wheel", handler, { passive: false });
    return {
      update(options) {
        show = options.show;
      },
      destroy() {
        node.removeEventListener("wheel", handler, { passive: false });
      },
    };
  };
</script>

<svelte:window
  on:keydown={(e) => e.keyCode === 27 && handleHiddenModal()}
  use:wheel={{ show }}
/>

{#if show}
  <div
    style="z-index: 99999;"
    class="bg-black bg-opacity-50 fixed inset-0 h-full w-full flex justify-center items-center"
  >
    <div
      class="rounded-lg bg-white max-w-[350px] px-[0.8rem] pt-[0.4rem] pb-[1.6rem] my-0 mx-auto absolute left-0 right-0 flex flex-col"
    >
      <div class="flex justify-end pr-[1rem]">
        <div
          class="cursor-pointer text-3xl"
          on:click={() => handleHiddenModal()}
        >
          &times;
        </div>
      </div>
      <slot />
    </div>
  </div>
{/if}

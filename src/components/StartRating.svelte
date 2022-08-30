<svelte:options tag="star-rating" />

<script>
  import { fade, slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  import "./Start.svelte";
  import { nimbus } from "~/entries/contentScript/views/network";
  export let hidden = () => {};

  const stars = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

  let rating = null;
  let hoverRating = null;

  let feedbackCompleted = false;
  let feedbackError = false;

  const handleHover = (id) => () => {
    hoverRating = id;
  };

  const handleRate = (id) => (event) => {
    if (rating && rating.toString() === event.srcElement.dataset.starid) {
      return;
    }
    rating = id;
  };

  const handleCollectFeedback = async (e) => {
    const textareaValue = e.srcElement.querySelector("textarea").value;
    let response;

    try {
      if (textareaValue && rating) {
        const structDataForm = {
          rating,
          detail: textareaValue,
        };
        response = await nimbus.post(
          "https://getnimbus.xyz/api/report",
          structDataForm
        );
        feedbackCompleted = true;
      }
    } catch (e) {
      console.error(e);
      feedbackCompleted = true;
      feedbackError = true;
    }
  };
</script>

<div class="flex flex-col justify-center items-center gap-1">
  <div class="text-base font-bold">Report</div>
  {#if !feedbackCompleted}
    <div class="text-sm">Rate your experience</div>
  {/if}
  <div class="flex justify-center items-center w-full">
    <div
      class="group -ml-[18px]"
      class:feedbackContainerDisabled={feedbackCompleted}
    >
      {#if !feedbackCompleted}
        <div class="flex justify-center items-center w-full ml-[10px]">
          <div
            class="pt-[6px] px-1 space-x-1 inline-block transition-all rounded-lg group-hover:bg-[#efefef]"
          >
            {#each stars as star (star.id)}
              <star-icon
                filled={hoverRating
                  ? hoverRating >= star.id
                  : rating >= star.id}
                id={star.id}
                on:mouseover={handleHover(star.id)}
                on:mouseleave={() => (hoverRating = null)}
                on:click={handleRate(star.id)}
              />
            {/each}
          </div>
        </div>
      {/if}

      {#if feedbackCompleted && !feedbackError}
        <div class="text-center text-xs -pl-2">
          Thank you for your report 😍
        </div>
      {:else if feedbackCompleted && feedbackError}
        <div class="text-center text-xs -pl-2">
          There are some problem. Please try again later 😢
        </div>
      {:else}
        <div class="w-74 transition-all mt-2">
          <form
            on:submit|preventDefault={handleCollectFeedback}
            transition:slide={{ duration: 450 }}
          >
            <div class="mb-1 text-xs">Tell us what's happened 🥹</div>
            <textarea
              class="block w-full h-20 resize-none p-2 border rounded"
            />
            <div class="flex justify-between gap-1 mt-2">
              <button
                class="py-2 px-3 rounded border-none text-white cursor-pointer w-max bg-sky-500"
                >Send</button
              >
              <button
                on:click={hidden}
                type="button"
                class="bg-transparent border-none cursor-pointer -mr-5"
              >
                No Thanks
              </button>
            </div>
          </form>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .feedbackContainerDisabled {
    pointer-events: none;
  }
</style>

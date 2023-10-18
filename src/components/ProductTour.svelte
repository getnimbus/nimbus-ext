<script lang="ts">
  import Shepherd from "shepherd.js";

  let isOnTour: boolean = true;

  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: "shadow-md bg-white rounded-lg z-50 px-3 py-2 z-50 text",
      scrollTo: true,
    },
  });

  //   Add wallet or view Demo wallet
  tour.addStep({
    id: "view-add-wallet",
    text: "Add wallet or view Demo wallet",
    attachTo: {
      element: ".view-add-wallet-tour",
      on: "bottom",
    },
    classes: "px-3 py-2 z-50 text-white",
    buttons: [
      {
        text: "Next",
        action: tour.next,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
      {
        text: "Skip",
        action: tour.cancel,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
    ],
  });

  //   Viewing the PnL for Token and NFT
  tour.addStep({
    id: "view-PNL",
    text: "Viewing the PnL for Token and NFT",
    attachTo: {
      element: ".view-PNL-tour",
      on: "bottom",
    },
    classes: "",
    buttons: [
      {
        text: "Next",
        action: tour.next,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
      {
        text: "Skip",
        action: tour.cancel,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
    ],
  });

  //   View token detail
  tour.addStep({
    id: "view-token-detail",
    text: "View token detail",
    attachTo: {
      element: ".view-token-detail-tour",
      on: "bottom",
    },
    buttons: [
      {
        text: "Next",
        action: tour.next,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
      {
        text: "Skip",
        action: tour.cancel,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
    ],
  });

  //   View NFT detail
  tour.addStep({
    id: "view-nft-detail",
    text: "View NFT detail",
    attachTo: {
      element: ".view-nft-detail-tour",
      on: "bottom",
    },
    buttons: [
      {
        text: "Next",
        action: tour.next,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
      {
        text: "Skip",
        action: tour.cancel,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
    ],
  });

  // View closed positions
  tour.addStep({
    id: "view-closed-position",
    text: "View closed positions",
    attachTo: {
      element: ".view-closed-position-tour",
      on: "bottom",
    },
    buttons: [
      {
        text: "Next",
        action: tour.next,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
      {
        text: "Skip",
        action: tour.cancel,
        classes: "border px-3 py-1 rounded-lg mr-2",
      },
    ],
  });

  const handleOnTour = () => {
    tour.start();
  };
</script>

<slot />

{#if isOnTour}
  <div class="h-screen w-screen bg-[#000000cc] fixed top-0 left-0 z-50">
    <div
      class="text-white example-css-selector text-center bg-[#000000cc]"
      on:click={handleOnTour}
    >
      This is example
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>

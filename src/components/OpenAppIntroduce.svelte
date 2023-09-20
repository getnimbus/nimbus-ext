<script>
  import Button from "./Button.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import installicon from "~/assets/install-app-icon.svg";
  import { nimbus } from "~/lib/network";

  let isShow = true;
  let mobileOperationSystem;

  $: {
    const introduce = localStorage.getItem("no-introduce-app");
    if (introduce === "true") {
      isShow = false;
    } else {
      isShow = true;
    }
  }

  const getMobileOperatingSystem = () => {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return (mobileOperationSystem = "Windows Phone");
    }

    if (/android/i.test(userAgent)) {
      return (mobileOperationSystem = "Android");
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return (mobileOperationSystem = "iOS");
    }

    return (mobileOperationSystem = "unknown");
  };

  const data = getMobileOperatingSystem();
</script>

<div class="xl:hidden">
  <AppOverlay
    clickOutSideToClose
    isOpen={isShow}
    on:close={() => {
      isShow = false;
      localStorage.setItem("no-introduce-app", "true");
    }}
  >
    <div
      class="w-full min-h-[30vh] flex flex-col gap-10 items-center justify-center"
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          version="1.1"
          fill="currentColor"
          x="0px"
          y="0px"
          height="128"
          width="128"
          viewBox="0 0 100 125"
          style="enable-background:new 0 0 100 100;"
          xml:space="preserve"
        >
          <path
            d="M71.9,0.8H29.8c-3.2,0-6,2.7-6,6v7.5c-1,0-1.8,0.8-1.8,1.8v8.4c0,1,0.8,1.8,1.8,1.8V29c-1,0-1.8,0.8-1.8,1.8v2.9  c0,1,0.8,1.8,1.8,1.8v57.8c0,3.2,2.7,6,6,6h16.1c0.3-0.4,0.7-0.7,1.2-0.7h7.4c0.5,0,1,0.3,1.2,0.7h16.1c3.2,0,6-2.7,6-6V6.8  C77.9,3.6,75.1,0.8,71.9,0.8z M74.8,93.3c0,1.7-1.2,2.9-2.9,2.9H29.8c-1.7,0-2.9-1.2-2.9-2.9V6.8c0-1.7,1.2-2.9,2.9-2.9h5.9l0.2,4.7  c0,1,0.8,1.7,1.7,1.7H64c1,0,1.7-0.8,1.7-1.7l0.3-4.7h5.9c1.7,0,2.9,1.2,2.9,2.9V93.3z"
          />
          <path
            d="M64.9,65.5H37.3c-0.8,0-1.4,0.6-1.4,1.4c0,0.8,0.6,1.4,1.4,1.4h27.7c0.8,0,1.4-0.6,1.4-1.4  C66.3,66.1,65.7,65.5,64.9,65.5z"
          />
          <path
            d="M50.2,61.3c0.3,0.2,0.6,0.4,0.9,0.4s0.7-0.1,0.9-0.4L62.1,52c0.3-0.3,0.4-0.6,0.4-1c0-0.4-0.1-0.7-0.4-1  c-0.3-0.3-0.6-0.4-1-0.4c-0.4,0-0.7,0.1-1,0.4l-7.7,7.1V34.2c0-0.8-0.6-1.4-1.4-1.4c-0.8,0-1.4,0.6-1.4,1.4v22.9L42,49.9  c-0.3-0.3-0.6-0.4-1-0.4c-0.4,0-0.7,0.2-1,0.4c-0.3,0.3-0.4,0.6-0.4,1c0,0.4,0.2,0.7,0.4,1L50.2,61.3z"
          />
        </svg>
      </div>
      {#if mobileOperationSystem === "Android"}
        <div class="lg:text-2xl text-3xl text-center leading-snug">
          Please open Nimbus app in your browser to install this app Click on
          <span class="font-medium">Three Vertical Dots</span>
          ->
          <span class="font-medium">Install App </span>
        </div>
      {:else if mobileOperationSystem === "iOS"}
        <div class="lg:text-2xl text-3xl text-center leading-snug">
          In your Safari browser menu , tap the Share icon and choose <span
            class="font-medium">Add to Home Screen</span
          > in the options. Then open Nimbus.app in your home screen
        </div>
      {/if}

      <div class="w-max mx-auto w-[300px]">
        <Button
          variant="tertiary"
          on:click={() => {
            localStorage.setItem("no-introduce-app", "true");
            isShow = false;
          }}
        >
          <div class="font-medium text-white text-2xl">Don't show again</div>
        </Button>
      </div>
    </div>
  </AppOverlay>
</div>

<style></style>

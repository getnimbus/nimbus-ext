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
        {#if mobileOperationSystem === "iOS"}
          <!-- icon ios -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="128"
            width="128"
            viewBox="0 0 40 50"
            x="0px"
            y="0px"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M109,36 C108.447715,36 108,35.5522847 108,35 L108,15 C108,14.4477153 108.447715,14 109,14 L116,14 C116.552285,14 117,14.4477153 117,15 C117,15.5522847 116.552285,16 116,16 L110,16 L110,34 L130,34 L130,16 L124,16 C123.447715,16 123,15.5522847 123,15 C123,14.4477153 123.447715,14 124,14 L131,14 C131.552285,14 132,14.4477153 132,15 L132,35 C132,35.5522847 131.552285,36 131,36 L109,36 Z M121,7.66814811 L121,26.9975383 C121,27.5511826 120.556135,28 120,28 C119.447715,28 119,27.5605417 119,26.9975383 L119,7.66814811 L116.243294,10.7291701 C115.873835,11.1394141 115.241545,11.172671 114.831035,10.8034513 C114.420525,10.4342317 114.387247,9.80235152 114.756706,9.39210747 L119.335933,4.30737367 C119.703075,3.89970297 120.297313,3.90013327 120.664067,4.30737367 L125.243294,9.39210747 C125.612753,9.80235152 125.579475,10.4342317 125.168965,10.8034513 C124.758455,11.172671 124.126165,11.1394141 123.756706,10.7291701 L121,7.66814811 Z"
              transform="translate(-100)"
            />
          </svg>
        {:else if mobileOperationSystem === "Android"}
          <!-- icon androids -->
          <svg
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:cc="http://creativecommons.org/ns#"
            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:svg="http://www.w3.org/2000/svg"
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            height="128"
            width="128"
            viewBox="0 0 100 125"
            x="0px"
            y="0px"
            ><g transform="translate(0,-952.36216)"
              ><path
                d="m 21.689918,957.36216 c -3.247298,0 -5.861545,2.61425 -5.861545,5.86154 l 0,78.2769 c 0,3.2473 2.614247,5.8616 5.861545,5.8616 l 43.661673,0 c 3.247298,0 5.861554,-2.6143 5.861554,-5.8616 l 0,-11.0309 a 1.1076944,1.1076944 0 0 0 -1.108197,-1.1074 l -4.707565,0 a 1.1076944,1.1076944 0 0 0 -1.107431,1.1074 l 0,4.6603 c 0,0.64 -0.515466,1.1555 -1.155519,1.1555 l -39.228113,0 c -0.640053,0 -1.154754,-0.5155 -1.154754,-1.1555 l 0,-69.68989 c 0,-0.64006 0.514701,-1.15476 1.154754,-1.15476 l 39.228113,0 c 0.640053,0 1.155519,0.5147 1.155519,1.15476 l 0,32.26295 -9.860837,0 c -2.380814,2e-4 -3.868946,2.31424 -2.678912,4.16564 l 13.322811,20.7193 c 1.190727,1.8509 4.166342,1.8509 5.357068,0 l 13.322812,-20.7193 c 1.190024,-1.8514 -0.298098,-4.16544 -2.678912,-4.16564 l -9.860837,0 0,-34.47936 c 0,-3.24729 -2.614256,-5.86154 -5.861554,-5.86154 l -43.661673,0 z m 16.292513,83.07684 11.076647,0 c 0.767078,0 1.384487,0.6174 1.384487,1.3844 0,0.7672 -0.617409,1.3846 -1.384487,1.3846 l -11.076647,0 c -0.767079,0 -1.385243,-0.6174 -1.385243,-1.3846 0,-0.767 0.618164,-1.3844 1.385243,-1.3844 z"
                style="opacity:1;fill:currentColor;fill-opacity:1;stroke:none;stroke-width:0.30000001;stroke-linecap:butt;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"
              /></g
            ></svg
          >
        {/if}
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

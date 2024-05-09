<script lang="ts">
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import type { WalletState } from "nimbus-sui-kit";
  import { suiWalletInstance } from "~/store";
  import { triggerFirework } from "~/utils";
  import { isDarkMode } from "~/store";

  import Button from "~/components/Button.svelte";

  import suiBackground from "~/assets/campaign/flipCoin/sui-background-img.png";
  import betterLuck from "~/assets/campaign/flipCoin/better-luck.png";
  import flipCoin2 from "~/assets/campaign/flipCoin/flip-coin2.png";
  import gmPoints from "~/assets/Gold4.svg";

  let toastMsg = "";
  let isSuccessToast: boolean = false;
  let counter = 3;
  let showToast: boolean = false;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  let finishedQuest = false;
  let openScreenResult = false;
  let startFlip = false; // swipe to flip
  let isUserWin = true; // state user win or lose

  const triggerFlipResult = async (type: number) => {
    // trigger the api in here
    isUserWin && triggerFirework();
    openScreenResult = true;
  };

  const handleStartFlip = () => {
    if (
      (($suiWalletInstance as WalletState) &&
        ($suiWalletInstance as WalletState).status === "disconnected") ||
      !finishedQuest
    ) {
      console.log({
        finishedQuest,
        status: ($suiWalletInstance as WalletState).status === "disconnected",
      });

      if (($suiWalletInstance as WalletState).status === "disconnected") {
        toastMsg = "Connect your SUI Wallet to Flip!";
      }

      if (!finishedQuest) {
        toastMsg = "Completed all the Start Quest to Flip!";
      }

      isSuccessToast = false;
      trigger();

      return;
    }

    startFlip = true;
  };

  $: {
    if ($suiWalletInstance as WalletState) {
      console.log("HELLO WORLD: ", $suiWalletInstance as WalletState);
    }
  }
</script>

<div
  class={`col-span-2 flex flex-col items-center gap-10 relative rounded-[10px] py-10 px-8 overflow-hidden ${$isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"}`}
>
  <img
    src={suiBackground}
    alt=""
    class="absolute right-[-21px] top-[50%] -translate-y-1/2 object-contain h-full z-1"
  />

  <div class="font-semibold sm:text-5xl text-3xl uppercase">Flip The GM</div>

  <div class="relative z-2 h-[110px]">
    <img src={flipCoin2} alt="" class="h-full h-full object-contain" />
  </div>

  <div class="text-amber-400 font-medium text-center relative z-2">
    No Loss: Pay Gas > Flip GM Points > Get Rewards
  </div>

  <div
    class="bg-[#424C81] text-white rounded-md flex flex-col items-center justify-center py-2 px-20 relative z-2"
  >
    <div class="text-2xl">Rewards</div>

    <div class="flex items-center gap-2 py-2">
      <div class="p-2 rounded-[10px] bg-[#27326F]">
        <img src={gmPoints} alt="" class="h-7 w-7" />
      </div>
      <div class="sm:text-[44px] text-2xl font-medium">1000</div>
    </div>
  </div>

  <div class="relative z-2">
    {#if !startFlip}
      <div class="w-max">
        <Button variant="tertiary" on:click={handleStartFlip}>
          <div class="font-medium sm:text-2xl text-lg py-4 px-5">
            Flip Now 👑
          </div>
        </Button>
      </div>
    {:else}
      <div class="w-full flex justify-between gap-4">
        <button
          class="rounded-[12px] text-white bg-[#FFB800] w-full py-4 px-5 font-medium sm:text-2xl text-lg"
          on:click={() => triggerFlipResult(1)}
        >
          Head
        </button>
        <button
          class="rounded-[12px] text-white bg-[#FFB800] w-full py-4 px-5 font-medium sm:text-2xl text-lg"
          on:click={() => triggerFlipResult(0)}
        >
          Tail
        </button>
      </div>
    {/if}
  </div>
</div>

{#if showToast}
  <div class="fixed top-3 right-3 w-full" style="z-index: 2147483648;">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

{#if openScreenResult}
  <div
    class="fixed h-screen w-screen top-0 left-0 z-10 flex items-center justify-center bg-[#000000cc]"
    on:click={() => {
      setTimeout(() => {
        openScreenResult = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      {#if isUserWin}
        <div class="text-4xl text-[#FFD569] font-medium">Stonk Stonk</div>
        <img src={gmPoints} alt="" class="w-40 h-40" />
        <div class="text-[34px] text-white font-medium">+1000 GMs</div>
      {:else}
        <div class="text-4xl text-[#FFD569] font-medium">
          ohh...it's stink stink
        </div>
        <img src={betterLuck} alt="" class="w-40 h-40 object-contain" />
        <div class="text-[34px] text-white font-medium">Try again...</div>
      {/if}
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>

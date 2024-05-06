<script>
  import { triggerFirework } from "~/utils";
  import { isDarkMode } from "~/store";

  import suiBackground from "~/assets/campaign/flipCoin/sui-background-img.png";
  import betterLuck from "~/assets/campaign/flipCoin/better-luck.png";
  import flipCoin2 from "~/assets/campaign/flipCoin/flip-coin2.png";
  import gmPoints from "~/assets/Gold4.svg";

  let finishedQuest = false; // state open when user done his quest
  let openScreenResult = false;
  let startFlip = false; // swipe to flip
  let isUserWin = true; // state user win or lose

  const triggerFlipResult = async () => {
    // trigger the api in here
    isUserWin && triggerFirework();
    openScreenResult = true;
  };
</script>

<div
  class={`col-span-2 flex flex-col items-center gap-10 relative rounded-[20px] py-10 px-8 overflow-hidden ${$isDarkMode ? "bg-[#222222] text-white" : "border"}`}
>
  <img
    src={suiBackground}
    alt=""
    class="absolute right-[-21px] top-[50%] -translate-y-1/2 object-contain h-full"
  />

  <div class="font-semibold sm:text-5xl text-3xl uppercase">Flip The GM</div>

  <div>
    <img src={flipCoin2} alt="" class="h-[110px] object-contain" />
  </div>

  <div class="text-[#FFD569] text-center">
    No Loss: Pay Gas > Flip GM Points > Get Rewards
  </div>

  <div
    class="bg-[#424C81] text-white rounded-md flex flex-col items-center justify-center py-2 px-20"
  >
    <div class="text-2xl">Rewards</div>

    <div class="flex items-center gap-2 py-2">
      <div class="p-2 rounded-[10px] bg-[#27326F]">
        <img src={gmPoints} alt="" class="h-7 w-7" />
      </div>
      <div class="sm:text-[44px] text-2xl font-medium">1000</div>
    </div>
  </div>

  {#if !finishedQuest}
    <button
      class="rounded-[20px] text-white bg-[#1E96FC] py-4 px-5 font-medium sm:text-2xl text-lg shadow-bottom shadow-[#005298]"
      style="z-index: 1;"
      on:click={() => (finishedQuest = true)}
    >
      Complete all the starter quest to flip
    </button>
  {:else if !startFlip}
    <button
      class="rounded-[20px] text-white bg-[#1E96FC] py-4 px-5 font-medium text-2xl shadow-bottom shadow-[#005298]"
      style="z-index: 1;"
      on:click={() => (startFlip = true)}
    >
      Flip Now 👑
    </button>
  {:else}
    <div class="w-full flex justify-between gap-4">
      <button
        class="rounded-[20px] text-white bg-[#FFB800] w-full py-4 px-5 font-medium text-2xl shadow-bottom shadow-[#c48c00]"
        style="z-index: 1;"
        on:click={triggerFlipResult}
      >
        Head
      </button>
      <button
        class="rounded-[20px] text-white bg-[#FFB800] w-full py-4 px-5 font-medium text-2xl shadow-bottom shadow-[#c48c00]"
        style="z-index: 1;"
        on:click={triggerFlipResult}
      >
        Tail
      </button>
    </div>
  {/if}
</div>

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
  .shadow-bottom:hover {
    box-shadow: 2px 6px 0 0 var(--tw-shadow-color);
  }
</style>

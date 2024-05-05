<script>
  import Button from "../Button.svelte";
  import { triggerFirework } from "~/utils";
  import { wait } from "~/entries/background/utils";

  import suiBackground from "~/assets/campaign/sui-background-img.png";
  import flipCoin from "~/assets/campaign/flipCoin/flip-coin.png";
  import flipCoin2 from "~/assets/campaign/flipCoin/flip-coin2.png";
  import gmPoints from "~/assets/Gold4.svg";
  import betterLuck from "~/assets/campaign/flipCoin/better-luck.png";

  let openScreenResult = false;
  let startFlip = false;
  let isUserWin = true;

  const triggerFlipResult = async () => {
    // trigger the api in here
    isUserWin && triggerFirework();
    openScreenResult = true;
  };
</script>

<div class="w-full flex">
  <div
    class="mx-auto flex flex-col gap-10 relative rounded-[20px] border border-white bg-[#27326F] py-[60px] px-5"
  >
    <img src={suiBackground} alt="" class="absolute right-0 top-0 w-[200px]" />

    {#if startFlip}
      <img src={flipCoin2} alt="" class="object-contain h-[160px] mx-auto" />
    {:else}
      <img src={flipCoin} alt="" class="object-contain h-[160px] mx-auto" />
    {/if}

    <div class="flex flex-col items-center gap-4">
      <div class="text-[#FFD569]">
        No Loss: Pay Gas > Flip GM Points > Get Rewards
      </div>

      <div
        class="bg-[#424C81] text-white rounded-[20px] flex flex-col items-center justify-center w-full py-2"
      >
        <div class="text-2xl">Rewards</div>

        <div class="flex items-center gap-2 py-2">
          <div class="p-2 rounded-[10px] bg-[#27326F]">
            <img src={gmPoints} alt="" class="h-7 w-7" />
          </div>
          <div class="text-[44px] font-medium">1000</div>
        </div>
      </div>
    </div>
    {#if startFlip}
      <div class="w-full flex justify-between gap-4">
        <button
          class="rounded-[20px] text-white bg-green-500 w-full py-4 px-5 font-medium text-2xl shadow-bottom shadow-[#007A57]"
          style="z-index: 1;"
          on:click={triggerFlipResult}
        >
          Head
        </button>
        <button
          class="rounded-[20px] text-white bg-red-500 w-full py-4 px-5 font-medium text-2xl shadow-bottom shadow-[#AF4846]"
          style="z-index: 1;"
          on:click={triggerFlipResult}
        >
          Tail
        </button>
      </div>
    {:else}
      <button
        class="rounded-[20px] text-white bg-[#1E96FC] py-4 px-5 font-medium text-2xl shadow-bottom shadow-[#005298]"
        style="z-index: 1;"
        on:click={() => (startFlip = true)}
      >
        Flip Now 👑
      </button>
    {/if}
  </div>
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
        <img src={betterLuck} alt="" class="w-40 h-40" />
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

<script lang="ts">
  import { isDarkMode } from "~/store";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  export let isRedeem = false;
  export let redeemData;
  export let handleRedeem = (value) => {};
  export let isLoadingRedeem;

  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import Crown from "~/assets/crown.svg";

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 5;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 5;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };
</script>

<div
  class={`py-4 sm:w-[438px] w-full min-h-[280px] rounded-[16px] border border_0000000d flex flex-col justify-between gap-4 ${
    $isDarkMode ? "bg-[#212121]" : "bg-white"
  }`}
>
  <div class="px-[16px] flex items-center h-full gap-[27px]">
    <div
      class={`w-[135px] rounded-2xl p-2 flex items-center h-full justify-center ${
        $isDarkMode ? "" : "bg-white"
      }`}
    >
      <div class="w-20 h-20">
        <img
          src={redeemData?.logo}
          alt=""
          class="w-full h-full object-contain"
        />
      </div>
    </div>

    <div class="flex-1 flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <img src={Crown} alt="" class="w-[26px] h-[26px]" />
        <div class="text-[#FFB800] text-lg font-medium uppercase">Premium</div>
      </div>
      <div class="lg:text-4xl text-3xl font-normal">
        {redeemData?.title}
      </div>
      <div class="text-sm font-normal">
        {redeemData?.description}
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-5 pb-1">
    <div class="relative border-b-2 border-dashed">
      <div
        class={`w-4 h-10 rounded-l-none rounded-full absolute -left-[1px] -bottom-5 border-r border-t border-b border_0000000d ${
          $isDarkMode ? "bg-[#161616]" : "bg-[#fff]"
        }`}
      />
      <div
        class={`w-4 h-10 rounded-r-none rounded-full absolute -right-[1px] -bottom-5 border-l border-t border-b border_0000000d ${
          $isDarkMode ? "bg-[#161616]" : "bg-[#fff]"
        } `}
      />
    </div>

    <div class="px-[16px]">
      {#if isRedeem}
        <div
          class="flex items-center md:justify-start justify-between gap-[40px]"
        >
          <div class="w-[220px] text-base font-normal text-center">
            {#if redeemData?.remains === 0}
              Out of stock
            {:else}
              {redeemData?.remains} left
            {/if}
          </div>

          {#if redeemData?.remains === 0}
            <div class="relative w-full">
              <Button
                variant="tertiary"
                on:click={() => {
                  toastMsg = "There are not available now";
                  isSuccessToast = false;
                  trigger();
                }}
              >
                <div class="flex items-center gap-1">
                  <img src={goldImg} alt="" class="w-[28px] h-[28px]" />
                  <div class="text-white sm:text-lg text-smxs font-medium">
                    {redeemData?.cost}
                  </div>
                </div>
                <div class="text-white text-smxs">Redeem</div>
              </Button>
            </div>
          {:else}
            <Button
              variant="tertiary"
              on:click={() => {
                if (!isLoadingRedeem) {
                  handleRedeem(redeemData);
                }
              }}
              disabled={isLoadingRedeem}
            >
              <div class="flex items-center gap-1">
                <img src={goldImg} alt="" class="w-[28px] h-[28px]" />
                <div class="text-white sm:text-lg text-smxs font-medium">
                  {redeemData?.cost}
                </div>
              </div>
              <div class="text-white text-smxs">Redeem</div>
            </Button>
          {/if}
        </div>
      {:else}
        <div
          class="flex items-center justify-between p-[12px] bg-[#EEEEEE] rounded-[12px]"
        >
          <div class="text-[#131313] text-sm">Your gift code</div>
          {#if redeemData?.code}
            <Copy
              address={redeemData?.code || "N/A"}
              iconColor="#000"
              iconSize={20}
              color="#000"
              isShorten
            />
          {:else}
            <div class="text-black">N/A</div>
          {/if}
        </div>
      {/if}
    </div>
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
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
  @media (max-width: 320) {
    .text-smxs {
      font-size: 14px;
      line-height: 20px;
    }

    .gap-320-sx {
      grid-gap: 10px !important;
      gap: 10px !important;
    }
  }
</style>

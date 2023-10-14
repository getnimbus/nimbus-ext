<script lang="ts">
  import { isDarkMode, user, userPublicAddress } from "~/store";

  export let isRedeem = false;
  export let redeemData;
  export let handleRedeem = (value) => {};

  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";

  import Crown from "~/assets/crown.svg";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });
</script>

<div
  class={`py-[16px] w-[438px] min-h-[280px] rounded-[16px] flex flex-col gap-[30px] ${
    darkMode ? "bg-[#212121]" : "bg-white"
  }`}
>
  <div class="px-[16px] flex items-center gap-[47px]">
    <div
      class={`flex-[0.6] rounded-2xl p-2 flex items-center justify-center ${
        darkMode ? "bg-gray-200" : "bg-white"
      }`}
    >
      <img src={redeemData?.logo} class="w-20 h-20 object-contain" />
    </div>

    <div class="flex-1 flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <img src={Crown} class="w-[26px] h-[26px]" />
        <div class="text-[#FFB800] xl:text-lg text-xl font-medium uppercase">
          Premium
        </div>
      </div>
      <div class="text-4xl font-normal">
        {redeemData?.title}
      </div>
      <div class="text-sm font-normal">
        {redeemData?.description}
      </div>
    </div>
  </div>

  <div class="relative border-b-2 border-dashed">
    <div
      class={`absolute rounded-full w-10 h-10 -top-[18px] -left-6 ${
        darkMode ? "bg-[#161616]" : "bg-white"
      }`}
    />
    <div
      class={`absolute rounded-full w-10 h-10 -top-[18px] -right-6 ${
        darkMode ? "bg-[#161616]" : "bg-white"
      }`}
    />
  </div>

  <div class="px-[16px]">
    {#if isRedeem}
      <div class="flex items-center gap-[47px]">
        <div class="w-[100px] xl:text-base text-xl font-normal">
          {redeemData?.remains} left
        </div>

        {#if redeemData?.remains === 0}
          <Button disabled>
            <div class="flex items-center gap-1">
              <img
                src="https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg"
                class="w-[28px] h-[28px]"
              />
              <div class="text-white xl:text-lg text-2xl font-semibold">
                {redeemData?.cost}
              </div>
            </div>
            <div class="text-white xl:text-lg text-2xl font-semibold">
              Redeem
            </div>
          </Button>
        {:else}
          <Button
            variant="tertiary"
            on:click={() => {
              handleRedeem(redeemData);
            }}
          >
            <div class="flex items-center gap-1">
              <img
                src="https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg"
                class="w-[28px] h-[28px]"
              />
              <div class="text-white xl:text-lg text-2xl font-semibold">
                {redeemData?.cost}
              </div>
            </div>
            <div class="text-white xl:text-lg text-2xl font-semibold">
              Redeem
            </div>
          </Button>
        {/if}
      </div>
    {:else}
      <div
        class="flex items-center justify-between p-[12px] bg-[#EEEEEE] rounded-[12px]"
      >
        <div class="text-[#131313] xl:text-sm text-base">Your gift code</div>
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

<style>
</style>

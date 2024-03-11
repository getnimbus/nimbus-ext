<script lang="ts">
  import { isDarkMode } from "~/store";

  export let isRedeem = false;
  export let redeemData;
  export let handleRedeem = (value) => {};

  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";

  import goldImg from "~/assets/Gold4.svg";

  import Crown from "~/assets/crown.svg";
</script>

<div
  class={`py-4 sm:w-[438px] w-full min-h-[280px] rounded-[16px] border border_0000000d flex flex-col justify-between gap-4 ${
    $isDarkMode ? "bg-[#212121]" : "bg-white"
  }`}
>
  <div class="px-[16px] flex items-center h-full gap-[47px]">
    <div
      class={`flex-[0.6] rounded-2xl p-2 flex items-center h-full justify-center ${
        $isDarkMode ? "bg-gray-200" : "bg-white"
      }`}
    >
      <img src={redeemData?.logo} alt="" class="w-20 h-20 object-contain" />
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
        <div class="flex items-center gap-[40px]">
          <div class="w-[100px] text-base font-normal text-right">
            {redeemData?.remains} left
          </div>

          {#if redeemData?.remains === 0}
            <Button disabled>
              <div class="flex items-center gap-1">
                <img src={goldImg} alt="" class="w-[28px] h-[28px]" />
                <div class="text-white sm:text-lg text-smxs font-medium">
                  {redeemData?.cost}
                </div>
              </div>
              <div class="text-white text-smxs">Redeem</div>
            </Button>
          {:else}
            <Button
              variant="tertiary"
              on:click={() => {
                handleRedeem(redeemData);
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

<style>
  @media (max-width: 320) {
    .text-smxs {
      font-size: 14px;
      line-height: 20px;
    }
  }
</style>

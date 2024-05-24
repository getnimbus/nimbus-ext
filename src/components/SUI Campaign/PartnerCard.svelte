<script lang="ts">
  import { isDarkMode } from "~/store";
  import dayjs from "dayjs";
  import isBetween from "dayjs/plugin/isBetween";
  import duration from "dayjs/plugin/duration";
  dayjs.extend(isBetween);
  dayjs.extend(duration);
  import { triggerToast } from "~/utils/functions";

  import Button from "~/components/Button.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import Crown from "~/assets/crown.svg";

  export let isRedeem = false;
  export let data;
  export let handleRedeemPartnerCard = (value) => {};
  export let isLoadingRedeem;
  export let totalPoint;
</script>

<div
  class={`py-4 max-w-[438px] w-full min-h-[280px] rounded-[16px] border border_0000000d flex flex-col justify-between gap-4 mx-auto ${
    $isDarkMode ? "bg-[#212121]" : "bg-white"
  }`}
>
  <div class="px-[16px] flex items-center h-full gap-[27px]">
    <div
      class={`w-[135px] rounded-2xl p-2 flex items-center h-full justify-center ${
        $isDarkMode ? "" : "bg-white"
      }`}
    >
      <div class="w-20 h-20 rounded-[10px]">
        <img
          src={data?.logo}
          alt=""
          class="w-full h-full object-contain rounded-[10px]"
        />
      </div>
    </div>

    <div class="flex-1 flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <img src={Crown} alt="" class="w-[26px] h-[26px]" />
        <div class="text-[#FFB800] text-lg font-medium uppercase">
          NIMBUS ON SUI
        </div>
      </div>
      <div class="text-3xl font-normal">
        {data?.title}
      </div>
      <div class="text-sm font-normal">
        {data?.description}
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
        }`}
      />
    </div>

    <div class="px-[16px]">
      {#if isRedeem}
        <div
          class="flex items-center md:justify-start justify-between gap-[40px]"
        >
          {#if isRedeem}
            <div class="w-[220px] text-base font-normal text-center">
              {#if Number(data.cap) - Number(data.sold) > 0}
                {Number(data.cap) - Number(data.sold)} lefts
              {:else}
                Out of stock
              {/if}
            </div>
          {/if}

          {#if Number(data.cap) - Number(data.sold) > 0 && isRedeem && totalPoint >= data?.cost}
            <Button
              variant="tertiary"
              on:click={() => {
                if (!isLoadingRedeem) {
                  handleRedeemPartnerCard(data);
                }
              }}
              disabled={isLoadingRedeem}
            >
              <div class="flex items-center gap-1">
                <img src={goldImg} alt="" class="w-[28px] h-[28px]" />
                <div class="text-white sm:text-lg text-smxs font-medium">
                  {data?.cost}
                </div>
              </div>
              <div class="text-white text-smxs">Redeem</div>
            </Button>
          {:else}
            <Button
              variant="tertiary"
              on:click={() => {
                if (totalPoint < data.cost) {
                  triggerToast(
                    "You are not enough GM Points to Redeem",
                    "fail"
                  );
                } else {
                  triggerToast("There are not available now", "fail");
                }
              }}
            >
              <div class="flex items-center gap-1">
                <img src={goldImg} alt="" class="w-[28px] h-[28px]" />
                <div class="text-white sm:text-lg text-smxs font-medium">
                  {data?.cost}
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
          <div class="text-[#131313] text-sm">Owned</div>
        </div>
      {/if}
    </div>
  </div>
</div>

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

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { isDarkMode } from "~/store";
  import dayjs from "dayjs";
  import isBetween from "dayjs/plugin/isBetween";
  import duration from "dayjs/plugin/duration";
  dayjs.extend(isBetween);
  dayjs.extend(duration);

  import Button from "~/components/Button.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import Crown from "~/assets/crown.svg";

  export let isRedeem = false;
  export let data;
  export let handleRedeemTicket = (value) => {};
  export let isLoadingRedeem;
  export let totalPoint;

  let showDisabled = false;
  let timeCountDown = "";
  let intervalId = null;
  let interval: ReturnType<typeof setInterval>;

  const checkTicketValidate = () => {
    const today = dayjs().format("YYYY-MM-DD");
    return dayjs(today).isBetween(data?.fromDate, data?.toDate, "day", "[)");
  };

  const updateCountdown = () => {
    const now = dayjs();
    const targetDate = dayjs(data?.toDate);
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (now.isAfter(targetDate)) {
      clearInterval(interval);
    } else {
      const duration = dayjs.duration(targetDate.diff(now));
      days = duration.days();
      hours = duration.hours();
      minutes = duration.minutes();
      seconds = duration.seconds();
      timeCountDown =
        days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
    }
  };

  onMount(() => {
    updateCountdown(); // Initial update
    interval = setInterval(updateCountdown, 1000);
  });

  onDestroy(() => {
    clearInterval(intervalId);
    clearInterval(interval);
  });
</script>

<div
  class={`py-4 sm:w-[438px] w-full min-h-[280px] rounded-[16px] border border_0000000d flex flex-col justify-between gap-4 mx-auto ${
    $isDarkMode ? "bg-[#212121]" : "bg-white"
  }`}
>
  <div class="px-[16px] flex items-center h-full gap-[27px]">
    <div
      class={`w-[135px] relative rounded-2xl p-2 flex items-center h-full justify-center ${
        $isDarkMode ? "" : "bg-white"
      }`}
    >
      <div class="w-20 h-20">
        <img src={data?.logo} alt="" class="w-full h-full object-contain" />
      </div>

      {#if isRedeem}
        <div
          class="absolute -bottom-2 w-full text-center whitespace-nowrap left-timee italic text-sm"
        >
          {timeCountDown}
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-2">
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
          class="flex items-center md:justify-start justify-between md:gap-[100px] gap-[40px]"
        >
          <div class="w-[150px] text-base font-normal text-right">
            {#if checkTicketValidate()}
              Unlimited
            {:else}
              Out of stock
            {/if}
          </div>
          {#if checkTicketValidate() && totalPoint >= 1000}
            <Button
              variant="tertiary"
              on:click={() => {
                if (!isLoadingRedeem) {
                  handleRedeemTicket(data);
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
            <div
              class="relative"
              on:mouseenter={() => (showDisabled = true)}
              on:mouseleave={() => (showDisabled = false)}
            >
              <Button disabled>
                <div class="flex items-center gap-1">
                  <img src={goldImg} alt="" class="w-[28px] h-[28px]" />
                  <div class="text-white sm:text-lg text-smxs font-medium">
                    {data?.cost}
                  </div>
                </div>
                <div class="text-white text-smxs">Redeem</div>
              </Button>
              {#if showDisabled}
                <div
                  class="absolute transform left-1/2 -translate-x-1/2 -top-8"
                  style="z-index: 2147483648;"
                >
                  <div
                    class="max-w-[360px] text-white bg-black py-1 px-2 text-xs rounded relative w-max normal-case"
                  >
                    {#if totalPoint < 1000}
                      You are not enough GM Points to Redeem
                    {:else}
                      There are not available now
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
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

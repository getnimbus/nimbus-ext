<script lang="ts">
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import Button from "~/components/Button.svelte";
  import { dailyCheckinTypePortfolio } from "~/utils";

  let selectedTypePerformance: "amount" | "history" = "amount";

  const array7 = [
    {
      day: 1,
      dayActive: true,
    },
    {
      day: 2,
      dayActive: false,
    },
    {
      day: 3,
      dayActive: false,
    },
    {
      day: 4,
      dayActive: false,
    },
    {
      day: 5,
      dayActive: false,
    },
    {
      day: 6,
      dayActive: false,
    },
    {
      day: 7,
      dayActive: false,
    },
  ];

  const diamondImg = "./../assets/Diamond4.svg";
</script>

<div class="bg-white text-black rounded-lg flex flex-col gap-10 p-5">
  <div class="flex flex-col gap-3">
    <div class="text-3xl font-medium mb-4">My Nimbus Diamonds</div>
    <div class="text-gray-500">
      Collect Nimbus Diamonds and redeem them for exclusive rewards and special
      offers
    </div>
    <div
      class="flex flex-col gap-5 bg-[#1589EB] text-white px-6 py-5 rounded-lg w-[400px]"
    >
      <span class="text-sm">My diamonds </span>
      <span class="text-4xl font-medium"> 10 </span>
    </div>
  </div>
  <div>
    <div class="flex items-center gap-2 mb-2">
      <AnimateSharedLayout>
        {#each dailyCheckinTypePortfolio as type}
          <div
            class="relative cursor-pointer xl:text-base text-2xl font-medium py-2 px-3 rounded-xl transition-all"
            on:click={() => (selectedTypePerformance = type.value)}
          >
            <div
              class={`relative z-20 ${
                selectedTypePerformance === type.value && "text-white"
              }`}
            >
              {type.label}
            </div>
            {#if type.value === selectedTypePerformance}
              <Motion
                let:motion
                layoutId="active-pill"
                transition={{ type: "spring", duration: 0.6 }}
              >
                <div
                  class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                  use:motion
                />
              </Motion>
            {/if}
          </div>
        {/each}
      </AnimateSharedLayout>
    </div>
    <div class="flex flex-col gap-5 py-3">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-2">
          <span class="font-medium text-2xl">
            Collect your diamonds every day
          </span>
          <span>Log in 7 day in a row, your rewards will grow </span>
        </div>
        <!-- <div class="bg-gray-500 text-white py-3 px-4 rounded-lg">
          15:31:31 to collect your next Diamonds
        </div> -->
        <div class="w-[230px]">
          <Button variant="primary">
            <div class="py-1">👋 GM Now</div>
          </Button>
        </div>
      </div>
      <div class="grid grid-cols-7 gap-5">
        {#each array7 as item}
          <div
            class={`flex flex-col gap-2 items-center rounded-xl py-10 px-6 ${
              item.dayActive ? "text-white bg-black" : "bg-gray-100"
            } `}
          >
            <span class={` ${item.dayActive ? "text-white" : "text-gray-500"}`}>
              Day {item.day}
            </span>
            <span class="">
              <img src={diamondImg} alt="" class="w-12" />
            </span>
            <span class="text-3xl">+ 10</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

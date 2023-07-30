<script lang="ts">
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { formatCurrencyV2, returnType } from "~/utils";
  import dayjs, { unix } from "dayjs";

  export let data;
  export let isLoadingDataCompare;

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import "~/components/Loading.custom.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;
  let container;

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  let selectedTypeReturn: "overview" | "month" = "overview";
</script>

<ErrorBoundary>
  <div class="flex xl:flex-row flex-col justify-between gap-6">
    <div class="xl:w-1/2 w-full border border-[#0000001a] rounded-[20px] p-6">
      {#if isLoadingDataCompare}
        <div class="flex items-center justify-center h-[200px]">
          <loading-icon />
        </div>
      {:else}
        <div class="flex flex-col gap-4">
          <div class="xl:text-2xl text-4xl font-medium text-black">Risk</div>
          <div class="flex flex-col gap-5">
            <div class="grid grid-cols-5">
              <div class="col-span-2">
                <div class="xl:text-lg text-2xl text-black flex justify-start">
                  <TooltipTitle tooltipText={"Hello World"} isBigIcon>
                    Sharpe ratio
                  </TooltipTitle>
                </div>
              </div>
              <div class="col-span-3 flex items-center gap-1 justify-end">
                <div
                  class={`xl:text-lg text-2xl ${
                    data?.base?.sharpeRatio < 0
                      ? "text-red-500"
                      : "text-[#00A878]"
                  }`}
                >
                  <TooltipNumber
                    number={Math.abs(data?.base?.sharpeRatio)}
                    type="percent"
                  />
                </div>
                {#if data?.base?.sharpeRatio < 0}
                  <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
                {:else}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      stroke="#00A878"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                    />
                  </svg>
                {/if}
              </div>
            </div>
            <div class="grid grid-cols-5">
              <div class="col-span-2">
                <div class="xl:text-lg text-2xl text-black flex justify-start">
                  <TooltipTitle tooltipText={"Hello World"} isBigIcon>
                    Volatility
                  </TooltipTitle>
                </div>
              </div>
              <div class="col-span-3 flex items-center gap-1 justify-end">
                <div
                  class={`xl:text-lg text-2xl ${
                    data?.base?.volatility < 0
                      ? "text-red-500"
                      : "text-[#00A878]"
                  }`}
                >
                  <TooltipNumber
                    number={Math.abs(data?.base?.volatility)}
                    type="percent"
                  />
                </div>
                {#if data?.base?.volatility < 0}
                  <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
                {:else}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      stroke="#00A878"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                    />
                  </svg>
                {/if}
              </div>
            </div>
            <div class="grid grid-cols-5">
              <div class="col-span-2">
                <div class="xl:text-lg text-2xl text-black flex justify-start">
                  <TooltipTitle tooltipText={"Hello World"} isBigIcon>
                    Max draw down
                  </TooltipTitle>
                </div>
              </div>
              <div class="col-span-3 flex items-center gap-1 justify-end">
                <div
                  class={`xl:text-lg text-2xl ${
                    data?.base?.drawDown < 0 ? "text-red-500" : "text-[#00A878]"
                  }`}
                >
                  <TooltipNumber
                    number={Math.abs(data?.base?.drawDown)}
                    type="percent"
                  />
                </div>
                {#if data?.base?.drawDown < 0}
                  <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
                {:else}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      stroke="#00A878"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                    />
                  </svg>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    <div class="xl:w-1/2 w-full border border-[#0000001a] rounded-[20px] p-6">
      {#if isLoadingDataCompare}
        <div class="flex items-center justify-center h-[200px]">
          <loading-icon />
        </div>
      {:else}
        <div class="flex flex-col gap-4">
          <div class="flex justify-between">
            <div class="xl:text-2xl text-4xl font-medium text-black">
              Return
            </div>
            <div class="flex items-center gap-2">
              <AnimateSharedLayout>
                {#each returnType as type}
                  <div
                    class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                    on:click={() => (selectedTypeReturn = type.value)}
                  >
                    <div
                      class={`relative z-20 ${
                        selectedTypeReturn === type.value && "text-white"
                      }`}
                    >
                      {type.label}
                    </div>
                    {#if type.value === selectedTypeReturn}
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
          </div>
          {#if selectedTypeReturn === "overview"}
            <div class="grid grid-cols-4">
              <div class="flex flex-col gap-5">
                <div class="xl:text-lg text-2xl text-black">1 Day</div>
                <div class="flex items-center gap-1">
                  <div
                    class={`xl:text-lg text-2xl ${
                      data?.base?.netWorthChange?.networth1D < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.netWorthChange?.networth1D)}
                      type="percent"
                    />%
                  </div>
                  {#if data?.base?.netWorthChange?.networth1D < 0}
                    <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
                  {:else}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="none"
                        stroke="#00A878"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  {/if}
                </div>
              </div>
              <div class="flex flex-col gap-5">
                <div class="xl:text-lg text-2xl text-black">7 Days</div>
                <div class="flex items-center gap-1">
                  <div
                    class={`xl:text-lg text-2xl ${
                      data?.base?.netWorthChange?.networth7D < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.netWorthChange?.networth7D)}
                      type="percent"
                    />%
                  </div>
                  {#if data?.base?.netWorthChange?.networth7D < 0}
                    <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
                  {:else}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="none"
                        stroke="#00A878"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  {/if}
                </div>
              </div>
              <div class="flex flex-col gap-5">
                <div class="xl:text-lg text-2xl text-black">30 Days</div>
                <div class="flex items-center gap-1">
                  <div
                    class={`xl:text-lg text-2xl ${
                      data?.base?.netWorthChange?.networth30D < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.netWorthChange?.networth30D)}
                      type="percent"
                    />%
                  </div>
                  {#if data?.base?.netWorthChange?.networth30D < 0}
                    <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
                  {:else}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="none"
                        stroke="#00A878"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  {/if}
                </div>
              </div>
              <div class="flex flex-col gap-5">
                <div class="xl:text-lg text-2xl text-black">1 Year</div>
                <div class="flex items-center gap-1">
                  <div
                    class={`xl:text-lg text-2xl ${
                      data?.base?.netWorthChange?.networth1Y < 0
                        ? "text-red-500"
                        : "text-[#00A878]"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(data?.base?.netWorthChange?.networth1Y)}
                      type="percent"
                    />%
                  </div>
                  {#if data?.base?.netWorthChange?.networth1Y < 0}
                    <div class="xl:text-lg text-2xl text-red-500">⚠️</div>
                  {:else}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="none"
                        stroke="#00A878"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  {/if}
                </div>
              </div>
            </div>
          {:else}
            <div class="w-full">
              <div
                class="relative overflow-x-hidden w-full flex gap-3 justify-between items-center"
                bind:this={container}
              >
                <div
                  class={`text-white absolute left-0 py-2 rounded-tl-lg rounded-bl-lg ${
                    isScrollStart ? "hidden" : "block"
                  }`}
                  style="background-image: linear-gradient(to right, rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100% );"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    height="24px"
                    width="24px"
                    viewBox="0 0 24 24"
                    class="sc-aef7b723-0 fKbUaI"
                    ><path
                      d="M15 6L9 12L15 18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-miterlimit="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg
                  >
                </div>
                <div
                  class="w-max flex gap-4 overflow-x-auto whitespace-nowrap container"
                  bind:this={scrollContainer}
                  on:scroll={handleScroll}
                >
                  {#each data?.base?.monthlyPerformance || [] as item}
                    <div
                      class="rounded-[20px] bg-[#FAFAFBFF] px-4 py-3 flex flex-col gap-2"
                      style="z-index: 2"
                    >
                      <div class="xl:text-base text-xl text-gray-500">
                        {dayjs.unix(item.timestamp).format("MMM YYYY")}
                      </div>
                      <div
                        class={`xl:text-2xl text-3xl ${
                          item.percentChange < 0
                            ? "text-red-500"
                            : "text-[#00A878]"
                        }`}
                      >
                        {formatCurrencyV2(Math.abs(item.percentChange))}%
                      </div>
                    </div>
                  {/each}
                </div>
                {#if scrollContainer?.scrollWidth >= container?.offsetWidth}
                  <div
                    class={`text-white absolute right-0 py-2 rounded-tr-lg rounded-br-lg ${
                      isScrollEnd ? "hidden" : "block"
                    }`}
                    style="background-image: linear-gradient(to left,rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100%);"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      height="24px"
                      width="24px"
                      viewBox="0 0 24 24"
                      class="sc-aef7b723-0 fKbUaI"
                      ><path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      /></svg
                    >
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
  .container::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .container {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>

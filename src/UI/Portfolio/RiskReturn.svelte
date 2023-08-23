<script lang="ts">
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import {
    formatCurrencyV2,
    getAddressContext,
    getTooltipContent,
    returnType,
  } from "~/utils";
  import dayjs, { unix } from "dayjs";
  import { nimbus } from "~/lib/network";
  import { wallet, chain, typeWallet, isDarkMode } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import "~/components/Loading.custom.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";

  import VolatilityExplain from "~/assets/explain/volatility-explain.mp4";
  import SharpeRatioExplain from "~/assets/explain/sharpe-ratio-explain.mp4";
  import MaxDrawdownExplain from "~/assets/explain/max-drawdown-explain.mp4";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let selectedTypeReturn: "overview" | "month" = "overview";
  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;
  let container;

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  const getAnalyticCompare = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/compare?compareAddress=${""}`
    );
    return response.data;
  };

  $: query = createQuery({
    queryKey: ["compare", selectedWallet, selectedChain],
    enabled: enabledQuery,
    queryFn: () => getAnalyticCompare(selectedWallet),
    staleTime: Infinity,
  });

  $: enabledQuery = Boolean(
    getAddressContext(selectedWallet)?.type === "EVM" ||
      typeWalletAddress === "CEX"
  );
</script>

<ErrorBoundary>
  <div class="grid xl:grid-cols-2 grid-cols-1 gap-6">
    <div class="border border_0000001a rounded-[20px] p-6">
      {#if $query.isFetching}
        <div class="flex items-center justify-center h-[200px]">
          <loading-icon />
        </div>
      {:else}
        <div
          class={`flex flex-col gap-4 relative ${
            $query.isError ? "h-[200px]" : ""
          }`}
        >
          <div class="xl:text-2xl text-4xl font-medium">Risks</div>
          {#if $query.isError}
            <div
              class={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 ${
                darkMode ? "bg-black/95" : "bg-white/95"
              } z-30 backdrop-blur-md xl:text-xs text-lg`}
            >
              {#if typeWalletAddress === "CEX"}
                Not enough data. CEX integration can only get data from the day
                you connect
              {:else}
                Empty
              {/if}
            </div>
          {:else}
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-5">
                <div class="col-span-2">
                  <div class="xl:text-base text-2xl flex justify-start">
                    <TooltipTitle
                      tooltipText={getTooltipContent(
                        "The Sharpe ratio measures how well an investment performs relative to its risk.",
                        SharpeRatioExplain,
                        "360px"
                      )}
                      isBigIcon
                      isExplainVideo
                    >
                      Sharpe ratio
                    </TooltipTitle>
                  </div>
                </div>
                <div class="col-span-3 flex items-center justify-end">
                  <div class="xl:text-base text-2xl">
                    <span
                      class={`${
                        $query.data?.base?.sharpeRatio <
                        $query.data?.btc?.sharpeRatio
                          ? "text-red-500"
                          : "text-[#00A878]"
                      }`}
                    >
                      <TooltipNumber
                        number={$query.data?.base?.sharpeRatio}
                        type="percent"
                      />
                    </span> <span class="text-gray-400">/</span>
                    <span
                      use:tooltip={{
                        content: `<tooltip-detail text="Bitcoin" />`,
                        allowHTML: true,
                        placement: "top",
                        interactive: true,
                      }}
                    >
                      <TooltipNumber
                        number={$query.data?.btc?.sharpeRatio}
                        type="percent"
                      />
                    </span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-5">
                <div class="col-span-2">
                  <div class="xl:text-base text-2xl flex justify-start">
                    <TooltipTitle
                      tooltipText={getTooltipContent(
                        "Volatility measures the extent of price fluctuations for an asset over time.",
                        VolatilityExplain,
                        "360px"
                      )}
                      isExplainVideo
                      isBigIcon
                    >
                      Volatility
                    </TooltipTitle>
                  </div>
                </div>
                <div class="col-span-3 flex items-center justify-end">
                  <div class="xl:text-base text-2xl">
                    <span
                      class={`${
                        $query.data?.base?.volatility >
                        $query.data?.btc?.volatility
                          ? "text-red-500"
                          : "text-[#00A878]"
                      }`}
                    >
                      <TooltipNumber
                        number={$query.data?.base?.volatility}
                        type="percent"
                      />%</span
                    > <span class="text-gray-400">/</span>
                    <span
                      use:tooltip={{
                        content: `<tooltip-detail text="Bitcoin" />`,
                        allowHTML: true,
                        placement: "top",
                        interactive: true,
                      }}
                    >
                      <TooltipNumber
                        number={$query.data?.btc?.volatility}
                        type="percent"
                      />%
                    </span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-5">
                <div class="col-span-2">
                  <div class="xl:text-base text-2xl flex justify-start">
                    <TooltipTitle
                      tooltipText={getTooltipContent(
                        "Max drawdown is the biggest loss experienced by an investment or portfolio.",
                        MaxDrawdownExplain,
                        "360px"
                      )}
                      isExplainVideo
                      isBigIcon
                    >
                      Max drawdown
                    </TooltipTitle>
                  </div>
                </div>
                <div class="col-span-3 flex items-center justify-end">
                  <div class="xl:text-base text-2xl">
                    <span
                      class={`${
                        $query.data?.base?.drawDown > $query.data?.btc?.drawDown
                          ? "text-red-500"
                          : "text-[#00A878]"
                      }`}
                    >
                      <TooltipNumber
                        number={$query.data?.base?.drawDown}
                        type="percent"
                      />%
                    </span>
                    <span class="text-gray-400">/</span>
                    <span
                      use:tooltip={{
                        content: `<tooltip-detail text="Bitcoin" />`,
                        allowHTML: true,
                        placement: "top",
                        interactive: true,
                      }}
                    >
                      <TooltipNumber
                        number={$query.data?.btc?.drawDown}
                        type="percent"
                      />%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="border border_0000001a rounded-[20px] p-6">
      {#if $query.isFetching}
        <div class="flex items-center justify-center h-[200px]">
          <loading-icon />
        </div>
      {:else}
        <div
          class={`flex flex-col gap-4 relative ${
            $query.isError ? "h-[200px]" : ""
          }`}
        >
          <div class="flex justify-between">
            <div class="xl:text-2xl text-4xl font-medium">Returns</div>
            {#if !$query.isError}
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
            {/if}
          </div>
          {#if $query.isError}
            <div
              class={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-3 ${
                darkMode ? "bg-black/95" : "bg-white/95"
              } z-30 backdrop-blur-md xl:text-xs text-lg`}
            >
              {#if typeWalletAddress === "CEX"}
                Not enough data. CEX integration can only get data from the day
                you connect
              {:else}
                Empty
              {/if}
            </div>
          {:else}
            <div>
              {#if selectedTypeReturn === "overview"}
                <div class="flex gap-4">
                  <div
                    class="rounded-[20px] bg_fafafbff px-4 py-3 flex flex-col gap-2"
                    style="z-index: 2"
                  >
                    <div class="xl:text-base text-xl">1D</div>
                    <div
                      class={`xl:text-base text-xl ${
                        $query.data?.base?.netWorthChange?.networth1D < 0
                          ? "text-red-500"
                          : "text-[#00A878]"
                      }`}
                    >
                      <TooltipNumber
                        number={Math.abs(
                          $query.data?.base?.netWorthChange?.networth1D
                        )}
                        type="percent"
                      />%
                    </div>
                  </div>

                  <div
                    class="rounded-[20px] bg_fafafbff px-4 py-3 flex flex-col gap-2"
                    style="z-index: 2"
                  >
                    <div class="xl:text-base text-xl">7D</div>
                    <div
                      class={`xl:text-base text-xl ${
                        $query.data?.base?.netWorthChange?.networth7D < 0
                          ? "text-red-500"
                          : "text-[#00A878]"
                      }`}
                    >
                      <TooltipNumber
                        number={Math.abs(
                          $query.data?.base?.netWorthChange?.networth7D
                        )}
                        type="percent"
                      />%
                    </div>
                  </div>

                  <div
                    class="rounded-[20px] bg_fafafbff px-4 py-3 flex flex-col gap-2"
                    style="z-index: 2"
                  >
                    <div class="xl:text-base text-xl">30D</div>
                    <div
                      class={`xl:text-base text-xl ${
                        $query.data?.base?.netWorthChange?.networth30D < 0
                          ? "text-red-500"
                          : "text-[#00A878]"
                      }`}
                    >
                      <TooltipNumber
                        number={Math.abs(
                          $query.data?.base?.netWorthChange?.networth30D
                        )}
                        type="percent"
                      />%
                    </div>
                  </div>

                  <div
                    class="rounded-[20px] bg_fafafbff px-4 py-3 flex flex-col gap-2"
                    style="z-index: 2"
                  >
                    <div class="xl:text-base text-xl">1Y</div>
                    <div
                      class={`xl:text-base text-xl ${
                        $query.data?.base?.netWorthChange?.networth1Y < 0
                          ? "text-red-500"
                          : "text-[#00A878]"
                      }`}
                    >
                      <TooltipNumber
                        number={Math.abs(
                          $query.data?.base?.netWorthChange?.networth1Y
                        )}
                        type="percent"
                      />%
                    </div>
                  </div>

                  <div
                    class="rounded-[20px] bg_fafafbff px-4 py-3 flex flex-col gap-2"
                    style="z-index: 2"
                  >
                    <div class="xl:text-base text-xl">Lifetime</div>
                    <div
                      class={`xl:text-base text-xl ${
                        $query.data?.base?.changeLF?.portfolioChange < 0
                          ? "text-red-500"
                          : "text-[#00A878]"
                      }`}
                    >
                      <TooltipNumber
                        number={Math.abs(
                          $query.data?.base?.changeLF?.portfolioChange
                        )}
                        type="percent"
                      />%
                    </div>
                  </div>
                </div>
              {:else}
                <div class="w-full">
                  <div
                    class="relative overflow-hidden w-full flex gap-3 justify-between items-center"
                    bind:this={container}
                  >
                    <div
                      class={`text-white absolute left-0 py-2 rounded-tl-lg rounded-bl-lg z-10 ${
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
                      class="w-max flex gap-4 overflow-x-auto whitespace-nowrap"
                      bind:this={scrollContainer}
                      on:scroll={handleScroll}
                    >
                      {#each $query.data?.base?.monthlyPerformance.sort((a, b) => a.timestamp - b.timestamp) || [] as item}
                        <div
                          class="rounded-[20px] bg_fafafbff px-4 py-3 flex flex-col gap-2"
                          style="z-index: 2"
                        >
                          <div class="xl:text-base text-xl">
                            {dayjs.unix(item.timestamp).format("MMM YYYY")}
                          </div>
                          <div
                            class={`xl:text-base text-xl ${
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
                        class={`text-white absolute right-0 py-2 rounded-tr-lg rounded-br-lg z-10 ${
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
      {/if}
    </div>
  </div>
</ErrorBoundary>

<style>
</style>

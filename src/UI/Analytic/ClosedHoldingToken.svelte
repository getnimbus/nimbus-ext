<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { isDarkMode, typeWallet, wallet, chain } from "~/store";
  import { AnimateSharedLayout, Motion } from "svelte-motion";

  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";

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

  const typeChart = [
    {
      label: "Value",
      value: "value",
    },
    {
      label: "Percent",
      value: "percent",
    },
  ];

  let closedHoldingPosition: TokenData = [];
  let selectedTypeChart = "value";

  const getHoldingToken = async (address, chain) => {
    const response: HoldingTokenRes = await nimbus
      .get(`/v2/address/${address}/holding?chain=${chain}`)
      .then((response) => response.data);
    return response;
  };

  const formatDataHoldingToken = (dataTokenHolding) => {
    const formatData = dataTokenHolding
      .map((item) => {
        return {
          ...item,
          value:
            Number(item?.amount) * Number(item?.price?.price || item?.rate),
        };
      })
      .sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

    closedHoldingPosition = formatData
      .filter((item) => item?.profit?.realizedProfit)
      .filter((item) => Number(item.amount) === 0);
  };

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedWallet, selectedChain],
    queryFn: () => getHoldingToken(selectedWallet, selectedChain),
    staleTime: Infinity,
    enabled: enabledQuery,
  });

  $: {
    if (!$queryTokenHolding.isError && $queryTokenHolding.data !== undefined) {
      formatDataHoldingToken($queryTokenHolding.data);
    }
  }

  $: enabledQuery = Boolean(
    (typeWalletAddress === "EVM" ||
      typeWalletAddress === "CEX" ||
      typeWalletAddress === "BUNDLE") &&
      selectedWallet.length !== 0
  );

  $: console.log("closedHoldingPosition: ", closedHoldingPosition);
</script>

<AnalyticSection>
  <span slot="title">
    <div class="flex justify-start text-4xl font-medium xl:text-2xl">
      Closed Positions
    </div>
  </span>

  <span slot="overview">
    {#if !$queryTokenHolding.isFetching && !$queryTokenHolding.isError}
      <div class="mb-4 text-3xl font-medium xl:text-xl px-6 pt-6">Overview</div>
    {/if}
    {#if $queryTokenHolding.isFetching}
      <div class="flex items-center justify-center h-[465px]">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full relative min-h-[465px]">
        {#if $queryTokenHolding.isError}
          <div
            class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
              darkMode ? "bg-[#222222e6]" : "bg-white/90"
            }`}
          >
            {#if typeWalletAddress === "CEX"}
              Not enough data. CEX integration can only get data from the day
              you connect
            {:else}
              Empty
            {/if}
          </div>
        {:else}
          <div class="flex flex-col gap-4 px-6 pb-6">
            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div class="flex justify-start text-2xl xl:text-base">
                  Biggest win
                </div>
              </div>
              <div class="flex items-center justify-end col-span-1">
                <div class={`xl:text-base text-2xl`}>hello</div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div class="flex justify-start text-2xl xl:text-base">
                  Worse lose
                </div>
              </div>
              <div class="flex items-center justify-end col-span-1">
                <div class={`xl:text-base text-2xl`}>hello</div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="col-span-1">
                <div class="flex justify-start text-2xl xl:text-base">
                  Total realized profit
                </div>
              </div>
              <div class="flex items-center justify-end col-span-1">
                <div class={`xl:text-base text-2xl`}>hello</div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </span>

  <span slot="chart">
    {#if $queryTokenHolding.isFetching}
      <div class="flex items-center justify-center h-[465px] p-6">
        <LoadingPremium />
      </div>
    {:else}
      <div class="h-full relative">
        {#if $queryTokenHolding.isError}
          <div
            class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-xs text-lg ${
              darkMode ? "bg-[#222222e6]" : "bg-white/90"
            }`}
          >
            {#if typeWalletAddress === "CEX"}
              Not enough data. CEX integration can only get data from the day
              you connect
            {:else}
              Empty
            {/if}
          </div>
        {:else}
          <div class="flex flex-row p-6">
            <AnimateSharedLayout>
              {#each typeChart as type}
                <div
                  class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                  on:click={() => (selectedTypeChart = type.value)}
                >
                  <div
                    class={`relative z-20 ${
                      selectedTypeChart === type.value && "text-white"
                    }`}
                  >
                    {type.label}
                  </div>
                  {#if type.value === selectedTypeChart}
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
          <div>chart</div>
        {/if}
      </div>
    {/if}
  </span>
</AnalyticSection>

<style windi:preflights:global windi:safelist:global>
</style>

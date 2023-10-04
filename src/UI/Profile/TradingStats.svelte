<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { formatBalance } from "~/utils";
  import { user, isDarkMode } from "~/store";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";
  import EChart from "~/components/EChart.svelte";

  export let selectedAddress;

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  const getTradingStats = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/trading-stats`
    );
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  $: queryTradingStats = createQuery({
    queryKey: ["trading-stats", selectedAddress],
    queryFn: () => getTradingStats(selectedAddress),
    staleTime: Infinity,
    retry: false,
    enabled:
      Object.keys(userInfo).length !== 0 &&
      selectedAddress !== "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0",
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: console.log("queryTradingStats: ", $queryTradingStats);
</script>

<div class="xl:col-span-4 col-span-2 border border_0000001a rounded-xl">
  {#if $queryTradingStats.isFetching}
    <div class="flex items-center justify-center h-[465px] p-6">
      <LoadingPremium />
    </div>
  {:else}
    <div class="h-full">
      {#if $queryTradingStats.isError}
        <div
          class={`rounded-[20px] absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center gap-3 z-30 backdrop-blur-md xl:text-base text-xl ${
            darkMode ? "bg-[#222222e6]" : "bg-white/90"
          }`}
        >
          Empty
        </div>
      {:else}
        <div>hello world</div>
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global>
</style>

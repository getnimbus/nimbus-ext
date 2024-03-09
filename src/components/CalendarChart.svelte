<script lang="ts">
  import { isDarkMode } from "~/store";

  import EChart from "~/components/EChart.svelte";

  export let option;
  export let isLoadingChart;
  export let isEmptyDataChart;
  export let isTrxPage = false;
  export let id;
  export let type;

  import LoadingPremium from "./LoadingPremium.svelte";
  import Loading from "./Loading.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  $: theme = $isDarkMode ? "dark" : "white";
</script>

{#if isTrxPage}
  <div class="h-full">
    {#if isEmptyDataChart}
      <div
        class="flex justify-center items-center h-full text-base text-gray-400 h-[152px]"
      >
        Empty
      </div>
    {:else}
      <div class="relative xl:-mt-12">
        <EChart
          {id}
          {theme}
          option={{
            ...option,
            calendar: {
              ...option.calendar,
              itemStyle: {
                ...option.calendar.itemStyle,
                color: "transparent",
              },
            },
          }}
          notMerge={true}
        />

        <div
          class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 top-2/3 left-1/2 pointer-events-none"
        >
          <img
            src={$isDarkMode ? LogoWhite : Logo}
            alt=""
            width="140"
            height="140"
          />
        </div>
      </div>
    {/if}
  </div>
{:else if isLoadingChart}
  <div class="flex items-center justify-center h-[152px]">
    {#if type === "primary"}
      <LoadingPremium />
    {:else}
      <Loading />
    {/if}
  </div>
{:else}
  <div class="h-full">
    {#if isEmptyDataChart}
      <div
        class="flex justify-center items-center h-full text-base text-gray-400 h-[152px]"
      >
        Empty
      </div>
    {:else}
      <div class="relative xl:-mt-12">
        <EChart
          {id}
          {theme}
          option={{
            ...option,
            calendar: {
              ...option.calendar,
              itemStyle: {
                ...option.calendar.itemStyle,
                color: "transparent",
              },
            },
          }}
          notMerge={true}
        />

        <div
          class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 top-2/3 left-1/2 pointer-events-none"
        >
          <img
            src={$isDarkMode ? LogoWhite : Logo}
            alt=""
            width="140"
            height="140"
          />
        </div>
      </div>
    {/if}
  </div>
{/if}

<style></style>

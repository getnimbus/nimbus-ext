<script lang="ts">
  export let data;
  export let isLoadingDataCompare;

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import "~/components/Loading.custom.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
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
              <div class="col-span-3 flex items-center gap-1">
                <div
                  class={`xl:text-lg text-2xl ${
                    data?.base?.sharpeRatio < 0
                      ? "text-red-500"
                      : "text-[#00A878]"
                  }`}
                >
                  <TooltipNumber
                    number={Math.abs(data?.base?.sharpeRatio)}
                    type="balance"
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
              <div class="col-span-3 flex items-center gap-1">
                <div
                  class={`xl:text-lg text-2xl ${
                    data?.base?.volatility < 0
                      ? "text-red-500"
                      : "text-[#00A878]"
                  }`}
                >
                  <TooltipNumber
                    number={Math.abs(data?.base?.volatility)}
                    type="balance"
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
              <div class="col-span-3 flex items-center gap-1">
                <div
                  class={`xl:text-lg text-2xl ${
                    data?.base?.drawDown < 0 ? "text-red-500" : "text-[#00A878]"
                  }`}
                >
                  <TooltipNumber
                    number={Math.abs(data?.base?.drawDown)}
                    type="balance"
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
          <div class="xl:text-2xl text-4xl font-medium text-black">Return</div>
          <div>hello</div>
        </div>
      {/if}
    </div>
  </div>
</ErrorBoundary>

<style></style>

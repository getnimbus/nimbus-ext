<script lang="ts">
  import { isDarkMode } from "~/store";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Image from "~/components/Image.svelte";
  import type { Farm } from "./hardCodeDefiData";

  import defaultToken from "~/assets/defaultToken.png";

  // export let data: Farm;

  // $: dataInput = data.input;

  export let data;
</script>

<div>hello</div>

<!-- {#each dataInput as itemInput}
  <div
    class={`rounded-[10px] overflow-hidden w-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    <div class="bg_f4f5f8 grid grid-cols-5">
      <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
        <div class="text-left xl:text-xs text-xl uppercase font-medium">
          Invested
        </div>
      </div>

      <div class="py-3">
        <div class="xl:text-xs text-xl uppercase font-medium">Token</div>
      </div>

      <div class="py-3">
        <div class="xl:text-xs text-xl uppercase font-medium">Yield</div>
      </div>

      <div class="py-3 pr-3 rounded-tr-[10px]">
        <div class="text-right xl:text-xs text-xl uppercase font-medium">
          PnL
        </div>
      </div>
    </div>

    <div class={`grid grid-cols-5 group transition-all`}>
      <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
        <div class="flex items-center gap-2 m-auto h-full">
          <div class="flex flex-col gap-2">
            {#each itemInput.input as item}
              <div class="flex items-center gap-3">
                <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                  <Image defaultLogo={defaultToken} logo={item.token.logo} />
                </div>
                <div class="text-left xl:text-xs text-xl uppercase font-medium">
                  {item.token.chain}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="py-3">
        <div
          class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each itemInput.current.tokens as token}
              <div class="flex items-center gap-1">
                <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                  <Image defaultLogo={defaultToken} logo={defaultToken} />
                </div>
                <TooltipNumber number={token.amount} type="amount" />
                {token.token.symbol}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="py-3">
        <div
          class="text-left xl:text-xs text-xl font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each itemInput.current.yield as yieldData}
              <div class="flex items-center gap-1">
                <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                  <Image defaultLogo={defaultToken} logo={defaultToken} />
                </div>
                <TooltipNumber number={yieldData.amount} type="amount" />
                {yieldData.token.symbol}
                {#if yieldData.claimable}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 36 36"
                  >
                    <rect width="36" height="36" fill="none" />
                    <circle cx="18" cy="18" r="18" fill="#78b159" />
                  </svg>
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 36 36"
                  >
                    <rect width="10" height="10" fill="none" />
                    <circle cx="18" cy="18" r="18" fill="#dd2e44" />
                  </svg>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="py-3 pr-3 rounded-tr-[10px]">
        <div
          class="text-right xl:text-xs text-xl uppercase font-medium flex justify-end h-full"
        >
          <div class="my-auto">
            <TooltipNumber number={0} type="value" />
          </div>
        </div>
      </div>
    </div>
  </div>
{/each}

<div
  class={`rounded-[10px] overflow-hidden w-full ${
    $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
  }`}
>
  <div class="bg_f4f5f8 grid grid-cols-5">
    <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
      <div class="text-left xl:text-xs text-xl uppercase font-medium">Farm</div>
    </div>

    <div class="py-3">
      <div class="xl:text-xs text-xl uppercase font-medium">Current value</div>
    </div>

    <div class="py-3">
      <div class="xl:text-xs text-xl uppercase font-medium">Fee Collected</div>
    </div>

    <div class="py-3 pr-3 rounded-tr-[10px]">
      <div class="text-right xl:text-xs text-xl uppercase font-medium">PnL</div>
    </div>
  </div>

  <div class={`grid grid-cols-5 group transition-all`}>
    <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
      <div class="text-left xl:text-xs text-xl uppercase font-medium">
        {data.chain}
      </div>
    </div>

    <div class="py-3">
      <div
        class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4 h-full"
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-1">
            <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
              <Image
                defaultLogo={defaultToken}
                logo={data?.current?.token?.logo || defaultToken}
              />
            </div>
            <TooltipNumber number={data?.current?.amount || 0} type="amount" />
            {data?.current?.token?.symbol || ""}
          </div>
        </div>
      </div>
    </div>

    <div class="py-3">
      <div
        class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4 h-full"
      >
        <div class="flex flex-col gap-2">
          {#each data?.feeCollected || [] as fee}
            <div class="flex items-center gap-1">
              <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                <Image
                  defaultLogo={defaultToken}
                  logo={fee?.token?.logo || defaultToken}
                />
              </div>
              <TooltipNumber number={fee?.amount || 0} type="amount" />
              {fee?.token?.symbol || ""}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="py-3 pr-3 rounded-tr-[10px]">
      <div
        class="text-right xl:text-xs text-xl uppercase font-medium flex justify-end h-full"
      >
        <div class="my-auto">
          <TooltipNumber number={0} type="value" />
        </div>
      </div>
    </div>
  </div>
</div> -->

<style windi:preflights:global windi:safelist:global></style>

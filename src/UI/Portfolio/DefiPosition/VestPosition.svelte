<script lang="ts">
  import { isDarkMode } from "~/store";
  import dayjs from "dayjs";

  import Image from "~/components/Image.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import type { Vest } from "./hardCodeDefiData";

  import defaultToken from "~/assets/defaultToken.png";

  export let data;
</script>

<div
  class={`rounded-[10px] overflow-hidden w-full ${
    $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
  }`}
>
  <div class="bg_f4f5f8 grid grid-cols-6">
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

    <div class="py-3">
      <div class="xl:text-xs text-xl uppercase font-medium">End Date</div>
    </div>

    <div class="py-3 pr-3 rounded-tr-[10px]">
      <div class="text-right xl:text-xs text-xl uppercase font-medium">PnL</div>
    </div>
  </div>

  {#each data as itemRow}
    <div class="grid grid-cols-6 group transition-all">
      <div
        class={`col-spans-2 pl-3 py-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div class="flex items-center gap-2 m-auto h-full">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
              <div class="rounded-full w-6 h-6 overflow-hidden">
                <Image
                  defaultLogo={defaultToken}
                  logo={itemRow?.input?.token?.logo || defaultToken}
                />
              </div>
              <div class="text-left xl:text-xs text-xl uppercase font-medium">
                {itemRow.chain || ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class={`py-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each itemRow?.current.tokens || [] as token}
              <div class="flex items-center gap-1">
                <div class="rounded-full w-6 h-6 overflow-hidden">
                  <Image defaultLogo={defaultToken} logo={token.token.logo} />
                </div>
                <TooltipNumber number={token?.amount || 0} type="amount" />
                {token?.token?.symbol || ""}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div
        class={`py-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each itemRow?.current?.yield || [] as yieldData}
              <div class="flex items-center gap-1">
                <div class="rounded-full w-6 h-6 overflow-hidden">
                  <Image
                    defaultLogo={defaultToken}
                    logo={yieldData?.token?.logo || defaultToken}
                  />
                </div>
                <TooltipNumber number={yieldData?.amount || 0} type="amount" />
                {yieldData?.token?.symbol || ""}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div
        class={`py-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4 h-full"
        >
          {dayjs(itemRow?.current?.endDate).format("DD/MM/YYYY")}
        </div>
      </div>

      <div
        class={`py-3 pr-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-right xl:text-xs text-xl uppercase font-medium flex justify-end h-full"
        >
          <div class="my-auto">
            <TooltipNumber number={0} type="value" />
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>

<style windi:preflights:global windi:safelist:global></style>

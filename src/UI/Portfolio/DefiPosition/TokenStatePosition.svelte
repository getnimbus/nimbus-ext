<script lang="ts">
  import { isDarkMode } from "~/store";

  import Image from "~/components/Image.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import defaultToken from "~/assets/defaultToken.png";

  export let data;
  export let type;
</script>

<!-- Desktop view -->
<div
  class={`xl:block hidden rounded-[10px] overflow-hidden w-full ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000000d"
  }`}
>
  <div class="grid grid-cols-4">
    <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
      <div class="text-left text-xs uppercase font-medium">{type}</div>
    </div>

    <div class="py-3">
      <div class="text-xs uppercase font-medium">Balance</div>
    </div>

    <div class="py-3 pr-3 rounded-tr-[10px]">
      <div class="text-right text-xs uppercase font-medium">Value</div>
    </div>
  </div>

  {#each data || [] as item}
    <div class="grid grid-cols-4 group transition-all">
      <div
        class={`col-spans-2 pl-3 py-3 ${
          $isDarkMode
            ? "bg-[#222222] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div class="flex flex-col gap-2 m-auto h-full">
          <div class="flex items-center gap-3">
            <div class="rounded-full w-6 h-6 overflow-hidden">
              <Image
                defaultLogo={defaultToken}
                logo={item?.token?.logo || defaultToken}
              />
            </div>
            <div class="text-left text-sm font-medium">
              {item?.token?.name || ""}
            </div>
          </div>
        </div>
      </div>

      <div
        class={`py-3 ${
          $isDarkMode
            ? "bg-[#222222] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-left text-sm text_00000099 font-medium gap-2 flex items-center gap-1"
        >
          <TooltipNumber number={item?.amount || 0} type="amount" />
          {item?.token?.symbol}
        </div>
      </div>

      <div
        class={`py-3 pr-3 ${
          $isDarkMode
            ? "bg-[#222222] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-right text-sm text_00000099 font-medium flex justify-end h-full"
        >
          <div class="my-auto">
            <TooltipNumber number={item?.value || 0} type="value" />
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>

<!-- Mobile view -->
<div
  class={`xl:hidden block rounded-[10px] p-2 overflow-hidden w-full ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000000d"
  }`}
>
  {#each data as item}
    <div
      class="flex flex-col gap-4 border-b-[1px] border_0000000d last:border-none py-4"
    >
      <div class="flex justify-between items-start">
        <div class="text-right text-sm uppercase font-medium">
          {type}
        </div>
        <div
          class="flex items-center justify-end font-medium text-sm text_00000099"
        >
          <div class="flex flex-col gap-2 m-auto h-full">
            <div class="flex items-center gap-3">
              <div class="rounded-full w-6 h-6 overflow-hidden">
                <Image
                  defaultLogo={defaultToken}
                  logo={item?.token?.logo || defaultToken}
                />
              </div>
              <div class="text-left text-sm font-medium">
                {item?.token?.name || ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-start">
        <div class="text-right text-sm uppercase font-medium">Balance</div>
        <div
          class="flex items-center justify-end font-medium text-sm text_00000099"
        >
          <TooltipNumber number={item?.amount || 0} type="amount" />
          {item?.token?.symbol}
        </div>
      </div>

      <div class="flex justify-between items-start">
        <div class="text-right text-sm uppercase font-medium">Value</div>
        <div
          class="flex items-center justify-end font-medium text-sm text_00000099"
        >
          <TooltipNumber number={item?.value || 0} type="value" />
        </div>
      </div>
    </div>
  {/each}
</div>

<style windi:preflights:global windi:safelist:global></style>

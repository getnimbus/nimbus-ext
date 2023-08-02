<script lang="ts">
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { typeWallet, wallet } from "~/store";
  import { detectedChain, getAddressContext, shorterName } from "~/utils";

  export let data;

  let typeWalletAddress = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let selectedWallet = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
</script>

<tr class="group transition-all">
  <td
    class="pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-9 bg-white xl:w-[230px] w-[280px] group-hover:bg-gray-100"
  >
    <div class="text-left flex items-center gap-3">
      <div class="relative">
        <img
          src={data.logo}
          alt=""
          width="30"
          height="30"
          class="rounded-full"
        />
        {#if getAddressContext(selectedWallet)?.type !== "BTC" && typeWalletAddress === "DEX"}
          <div class="absolute -top-2 -right-1">
            <img
              src={detectedChain(data.chain)}
              alt=""
              width="15"
              height="15"
              class="rounded-full"
            />
          </div>
        {/if}
      </div>
      <div class="flex flex-col gap-1">
        <div
          class="text-black xl:text-sm text-xl font-medium relative"
          on:mouseover={() => {
            isShowTooltipName = true;
          }}
          on:mouseleave={() => (isShowTooltipName = false)}
        >
          {#if data.name === undefined}
            N/A
          {:else}
            {data?.name?.length > 20 ? shorterName(data.name, 20) : data.name}
          {/if}
          {#if isShowTooltipName && data?.name?.length > 20}
            <div class="absolute -top-8 left-0" style="z-index: 2147483648;">
              <tooltip-detail text={data.name} />
            </div>
          {/if}
        </div>
        <div
          class="text-[#00000080] text-xs font-medium relative"
          on:mouseover={() => {
            isShowTooltipSymbol = true;
          }}
          on:mouseleave={() => (isShowTooltipSymbol = false)}
        >
          {#if data.symbol === undefined}
            N/A
          {:else}
            {shorterName(data.symbol, 20)}
          {/if}
          {#if isShowTooltipSymbol && data.symbol.length > 20}
            <div class="absolute -top-8 left-0" style="z-index: 2147483648;">
              <tooltip-detail text={data.symbol} />
            </div>
          {/if}
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        {#if data.suggest && data.suggest.length}
          {#each data.suggest as item}
            <a
              href={item.url}
              target="_blank"
              class="flex items-center justyfy-center px-2 py-1 text-[#27326F] text-[10px] font-medium bg-[#1e96fc33] rounded-[1000px]"
            >
              {item.tile}
            </a>
          {/each}
        {/if}
      </div>
    </div>
  </td>

  <td class="py-3 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
    >
      $<TooltipNumber number={data?.price?.price} type="balance" />
    </div>
  </td>

  <td class="py-3 pr-3 group-hover:bg-gray-100">
    <div
      class={`xl:text-sm text-xl ${
        data?.ratio > 0 ? "text-[#00A878]" : "text-red-500"
      } font-medium flex justify-end`}
    >
      <TooltipNumber number={data?.ratio} type="percent" />%
    </div>
  </td>
</tr>

<style></style>

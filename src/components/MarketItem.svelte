<script>
  import { shorterAddress } from "~/utils";
  import TooltipBalance from "./TooltipBalance.svelte";

  export let data;

  import Etherscan from "~/assets/etherscan.jpg";
</script>

<tr class="hover:bg-gray-100 transition-all">
  <td class="pl-3 py-4 w-[250px]">
    <div class="text-left text-black text-sm font-medium">
      {data?.price_from?.symbol} - {data?.price_to?.symbol}
    </div>
  </td>

  <td class="py-4">
    <div class="text-sm text-red-500 font-medium flex justify-start gap-1">
      <TooltipBalance number={data?.amountOut} />
      {data?.price_to?.symbol} |
      <span
        >$<TooltipBalance
          number={data?.amountOut * data?.price_to?.price}
        /></span
      >
    </div>
  </td>

  <td class="py-4">
    <div class="text-sm text-[#00A878] font-medium flex justify-start gap-1">
      <TooltipBalance number={data?.amountIn} />
      {data?.price_from?.symbol} |
      <span
        >$<TooltipBalance
          number={data?.amountIn * data?.price_from?.price}
        /></span
      >
    </div>
  </td>

  <td class="py-4 w-[170px]">
    <div
      class="text-sm text-[#00000099] hover:text-[#0d6efd] font-medium flex justify-center"
    >
      {#if APP_TYPE.TYPE === "EXT"}
        <div
          on:click={() => {
            browser.tabs.create({
              url: `src/entries/newTab/index.html?address=${data?.sender}`,
            });
          }}
        >
          {shorterAddress(data?.sender)}
        </div>
      {:else}
        <a
          href={`https://app.getnimbus.io/?address=${data?.sender}`}
          target="_blank"
        >
          {shorterAddress(data?.sender)}
        </a>
      {/if}
    </div>
  </td>

  <td class="pr-3 py-4 w-[190px]">
    <div class="flex items-center justify-end">
      <a
        href={`https://etherscan.io/tx/${data?.transaction_hash}`}
        target="_blank"
      >
        <img src={Etherscan} alt="" class="w-5 h-5 rounded-full" />
      </a>
    </div>
  </td>
</tr>

<style>
</style>

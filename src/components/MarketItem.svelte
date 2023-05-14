<script>
  import { shorterAddress } from "~/utils";
  import TooltipBalance from "./TooltipBalance.svelte";
  import Etherscan from "~/assets/etherscan.jpg";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  export let data;
</script>

<tr class="hover:bg-gray-100 transition-all">
  <td class="pl-3 py-4">
    <div
      class="text-left text-[#00000080] text-xs font-medium flex items-end gap-1"
    >
      <div class="flex flex-col justify-start gap-1">
        <img
          src={data?.from_token_logo}
          class="rounded-full"
          width="20"
          height="20"
        />
        {data?.price_from?.symbol}
      </div>
      <div>-</div>
      <div class="flex flex-col justify-start gap-1">
        <img
          src={data?.to_token_logo}
          class="rounded-full"
          width="20"
          height="20"
        />
        {data?.price_to?.symbol}
      </div>
    </div>
  </td>

  <td class="py-4">
    <div class="text-left text-black text-sm font-medium">
      {dayjs(data?.timestamp).format("YYYY-MM-DD HH:mm:ss")}
      <br />
      <span class="text-[#00000080]">
        {dayjs(data?.timestamp).fromNow()}
      </span>
    </div>
  </td>

  <td class="py-4">
    <div
      class="text-sm text-red-500 font-medium flex flex-col justify-start gap-1"
    >
      <div>
        <TooltipBalance number={data?.amountOut} />
        {data?.price_to?.symbol}
      </div>
      <div>
        $<TooltipBalance number={data?.amountOut * data?.price_to?.price} />
      </div>
    </div>
  </td>

  <td class="py-4">
    <div
      class="text-sm text-[#00A878] font-medium flex flex-col justify-start gap-1"
    >
      <div>
        <TooltipBalance number={data?.amountIn} />
        {data?.price_from?.symbol}
      </div>
      <div>
        $<TooltipBalance number={data?.amountIn * data?.price_from?.price} />
      </div>
    </div>
  </td>

  <td class="py-4">
    <div
      class="text-sm text-blue-500 hover:text-[#0d6efd] cursor-pointer font-medium flex justify-center"
    >
      {#if APP_TYPE.TYPE === "EXT"}
        <div
          on:click={() => {
            browser.tabs.create({
              url: `src/entries/newTab/index.html?address=${data?.sender}`,
            });
          }}
        >
          {shorterAddress(data?.sender?.toLowerCase())}
        </div>
      {:else}
        <a
          href={`https://app.getnimbus.io/?address=${data?.sender}`}
          target="_blank"
        >
          {shorterAddress(data?.sender?.toLowerCase())}
        </a>
      {/if}
    </div>
  </td>

  <td class="pr-3 py-4">
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

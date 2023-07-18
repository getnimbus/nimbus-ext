<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { formatBalance, shorterAddress } from "~/utils";
  dayjs.extend(relativeTime);

  export let data;

  import TooltipNumber from "./TooltipNumber.svelte";

  import Etherscan from "~/assets/etherscan.jpg";
  import TwitterLogo from "~/assets/twitter.svg";

  $: tweet = `${shorterAddress(
    data?.sender
  )} made a trade worth $${formatBalance(data?.trade_value)} \n
➖ ${formatBalance(data?.amountIn)} ${
    data?.price_from?.symbol
  } - $${formatBalance(data?.amountIn * data?.price_from?.price)}
➕ ${formatBalance(data?.amountOut)} ${
    data?.price_to?.symbol
  } - $${formatBalance(data?.amountOut * data?.price_to?.price)} \n
The Whale portfolio: https://app.getnimbus.io/?address=${data?.sender}
Tx: https://etherscan.io/tx/${data?.transaction_hash} \n
via @get_nimbus`;
</script>

<tr class="group transition-all">
  <td
    class="pl-3 py-4 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-9 bg-white group-hover:bg-gray-100"
  >
    <div class="text-left text-black xl:text-sm text-xl font-medium">
      <div class="flex space-x-3">
        <img
          src={data?.from_token_logo}
          class="rounded-full"
          width="30"
          height="30"
        />
        <img
          src={data?.to_token_logo}
          class="rounded-full"
          width="30"
          height="30"
        />
      </div>
      <div class="text-[#00000080] xl:text-xs text-base mt-1">
        {data?.price_from?.symbol} - {data?.price_to?.symbol}
      </div>
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div class="text-left text-black xl:text-sm text-xl font-medium">
      {dayjs(data?.timestamp).format("YYYY-MM-DD, hh:mm A")}
      <br />
      <span class="text-[#00000080]">
        {dayjs(data?.timestamp).fromNow()}
      </span>
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-xl text-red-500 font-medium flex flex-col justify-start gap-1"
    >
      <div>
        <TooltipNumber number={data?.amountIn} type="amount" />
        {data?.price_from?.symbol}
      </div>
      <div>
        $<TooltipNumber number={data?.amountIn * data?.price_from?.price} />
      </div>
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-xl text-[#00A878] font-medium flex flex-col justify-start gap-1"
    >
      <div>
        <TooltipNumber number={data?.amountOut} type="amount" />
        {data?.price_to?.symbol}
      </div>
      <div>
        $<TooltipNumber number={data?.amountOut * data?.price_to?.price} />
      </div>
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-xl text-blue-500 hover:text-[#0d6efd] cursor-pointer font-medium flex justify-center"
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

  <td class="pr-3 py-4 w-[190px] group-hover:bg-gray-100">
    <div class="flex items-center justify-end gap-3">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURI(tweet)}`}
        target="_blank"
      >
        <img src={TwitterLogo} alt="" class="w-7 h-7 rounded-full" />
      </a>
      <a
        href={`https://etherscan.io/tx/${data?.transaction_hash}`}
        target="_blank"
      >
        <img src={Etherscan} alt="" class="w-7 h-7 rounded-full" />
      </a>
    </div>
  </td>
</tr>

<style>
</style>

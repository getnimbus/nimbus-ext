<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { formatBalance, shorterAddress } from "~/utils";
  import { isDarkMode } from "~/store";
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
    class={`pl-3 py-3 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-9 ${
      $isDarkMode
        ? "bg-[#110c2a] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left xl:text-sm text-2xl font-medium">
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
      <div class="text_00000080 xl:text-xs text-xl mt-1">
        {data?.price_from?.symbol} - {data?.price_to?.symbol}
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left xl:text-sm text-2xl font-medium">
      {dayjs(data?.timestamp).format("YYYY-MM-DD, hh:mm A")}
      <br />
      <span class="text_00000080">
        {dayjs(data?.timestamp).fromNow()}
      </span>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-red-500 font-medium flex flex-col justify-start gap-1"
    >
      <div class="flex items-center gap-1">
        <TooltipNumber number={data?.amountIn} type="balance" />
        {data?.price_from?.symbol}
      </div>
      <div class="flex items-center">
        $<TooltipNumber
          number={data?.amountIn * data?.price_from?.price}
          type="balance"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-[#00A878] font-medium flex flex-col justify-start gap-1"
    >
      <div class="flex items-center gap-1">
        <TooltipNumber number={data?.amountOut} type="balance" />
        {data?.price_to?.symbol}
      </div>
      <div class="flex items-center">
        $<TooltipNumber
          number={data?.amountOut * data?.price_to?.price}
          type="balance"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-blue-500 hover:text-[#0d6efd] cursor-pointer font-medium flex justify-center"
    >
      <a
        href={`https://app.getnimbus.io/?address=${data?.sender}`}
        target="_blank"
      >
        {shorterAddress(data?.sender?.toLowerCase())}
      </a>
    </div>
  </td>

  <td
    class={`pr-3 py-3 w-[190px] ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
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

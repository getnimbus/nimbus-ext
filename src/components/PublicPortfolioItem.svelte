<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";

  import tooltip from "~/entries/contentScript/views/tooltip";
  import { isDarkMode } from "~/store";
  import { formatAHT, formatActiveTime, handleImgError } from "~/utils";
  dayjs.extend(relativeTime);

  export let data;

  import TooltipNumber from "./TooltipNumber.svelte";
  import Copy from "./Copy.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import defaultToken from "~/assets/defaultToken.png";
</script>

<tr
  class={`group transition-all ${
    $isDarkMode ? "text-gray-400" : "text-[#666666]"
  }`}
>
  <td
    class={`pl-3 py-4 xl:static xl:bg-transparent text-left sticky left-0 z-9 ${
      $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="flex gap-2 items-center">
      {#if data?.avatar}
        <img src={data?.avatar} alt="" class="w-5 h-5 rounded-full" />
      {/if}
      {#if data?.name}
        <a
          class={`text-ellipsis max-w-[150px] overflow-hidden whitespace-nowrap xl:text-sm text-2xl hover:text-blue-500 ${
            $isDarkMode ? "text-white" : "text-black"
          }`}
          href={`/?type=EVM&chain=ALL&address=${data?.address}`}
          target="_blank"
        >
          {data?.name}
        </a>
      {:else}
        <div class="xl:text-sm text-2xl">
          <Copy
            address={data?.address}
            textTooltip="Copy address to clipboard"
            iconColor={$isDarkMode ? "#fff" : "#000"}
            color={$isDarkMode ? "#fff" : "#000"}
            isShorten={true}
            isLink={true}
            link={`/?type=EVM&chain=ALL&address=${data?.address}`}
          />
        </div>
      {/if}
      {#if data?.twitter_username}
        <a
          href={`https://twitter.com/${data?.twitter_username}`}
          target="_blank"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            class="transition duration-500 group-hover:bg-black rounded-sm"
          >
            <path
              fill="group-hover:white"
              d="M18.205 2.25h3.308l-7.227 8.26l8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"
            />
          </svg>
        </a>
      {/if}
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="text-right xl:text-sm text-2xl font-medium flex justify-end gap-1"
    >
      <TooltipNumber number={Number(data?.eth_balance)} type="balance" />
      <span>ETH</span>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex flex-col items-end gap-1"
    >
      {#if data?.pnl_1d === null}
        <div>--</div>
      {:else}
        <div
          class={`flex items-center ${
            data?.pnl_1d * 100 >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          <TooltipNumber
            number={Math.abs(Number(data?.pnl_1d * 100))}
            type={Math.abs(Number(data?.pnl_1d * 100)) > 999999
              ? "balance"
              : "percent"}
          />
          <span>%</span>
          <img
            src={data?.pnl_1d * 100 >= 0 ? TrendUp : TrendDown}
            alt="trend"
            class="ml-1 mb-1 w-4 h-4"
          />
        </div>
      {/if}
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex flex-col items-end gap-1"
    >
      {#if data?.pnl_7d === null}
        <div>--</div>
      {:else}
        <div
          class={`flex items-center ${
            data?.pnl_7d * 100 >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          <TooltipNumber
            number={Math.abs(Number(data?.pnl_7d * 100))}
            type={Math.abs(Number(data?.pnl_7d * 100)) > 999999
              ? "balance"
              : "percent"}
          />
          <span>%</span>
          <img
            src={data?.pnl_7d * 100 >= 0 ? TrendUp : TrendDown}
            alt="trend"
            class="ml-1 mb-1 w-4 h-4"
          />
        </div>
      {/if}
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex flex-col items-end gap-1"
    >
      {#if data?.pnl_30d === null}
        <div>--</div>
      {:else}
        <div
          class={`flex items-center ${
            data?.pnl_30d * 100 >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          <TooltipNumber
            number={Math.abs(Number(data?.pnl_30d * 100))}
            type={Math.abs(Number(data?.pnl_30d * 100)) > 999999
              ? "balance"
              : "percent"}
          />
          <span>%</span>
          <img
            src={data?.pnl_30d * 100 >= 0 ? TrendUp : TrendDown}
            alt="trend"
            class="ml-1 mb-1 w-4 h-4"
          />
        </div>
      {/if}
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex flex-col items-end gap-1"
    >
      {#if data?.realized_profit === null}
        <div>--</div>
      {:else}
        <div class="flex items-center">
          $<TooltipNumber
            number={Math.abs(Number(data?.realized_profit))}
            type="balance"
          />
        </div>
      {/if}
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    {#if data?.txs_30d === null}
      <div class="text-right">--</div>
    {:else}
      <div
        class="xl:text-sm text-2xl text-right font-medium flex justify-end items-center"
      >
        {Number(data?.txs_30d)}
      </div>
    {/if}
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    {#if data?.avg_hold_time === null}
      <div class="text-right">--</div>
    {:else}
      <div
        class="xl:text-sm text-2xl text-right font-medium flex justify-end items-center"
      >
        {formatAHT(Number(data?.avg_hold_time * 1000))}
      </div>
    {/if}
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    {#if data?.last_active === null}
      <div class="text-right">--</div>
    {:else}
      <div
        class="xl:text-sm text-2xl text-right font-medium flex justify-end items-center"
      >
        {formatActiveTime(Number(data?.last_active * 1000))}
      </div>
    {/if}
  </td>

  <td
    class={`py-3 pr-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end items-center -space-x-2 pl-3">
      {#each data?.recent_buy_tokens as token}
        <img
          src={token.logo || defaultToken}
          use:tooltip={{
            content: `${token.symbol}`,
            allowHTML: true,
            placement: "top",
            interactive: true,
          }}
          alt=""
          class="w-5 h-5 object-contain rounded-full bg-white"
          on:error={(e) => handleImgError(e, defaultToken)}
        />
      {/each}
    </div>
  </td>
</tr>

<style>
</style>

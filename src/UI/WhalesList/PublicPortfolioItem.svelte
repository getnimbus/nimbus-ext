<script lang="ts">
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";

  import Tooltip from "~/components/Tooltip.svelte";
  import { isDarkMode } from "~/store";
  import { formatAHT, formatActiveTime, handleImgError } from "~/utils";
  dayjs.extend(relativeTime);

  export let data;
  export let whalePosition;
  export let typeData: "ALL" | "SMART" | "FRESH" | "KOL" = "ALL";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Copy from "~/components/Copy.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import defaultToken from "~/assets/defaultToken.png";

  let isShowSymbol = false;
  let selectedToken;
</script>

<tr
  class={`group transition-all ${
    $isDarkMode ? "text-gray-400" : "text-[#666666]"
  }`}
>
  <td
    class={`pl-3 xl:py-3 py-6 xl:static xl:bg-transparent text-left sticky w-[170px] left-0 ${
      $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="flex gap-2 items-center max-w-[250px]">
      {#if typeData === "KOL"}
        {#if data?.avatar}
          <img src={data?.avatar} alt="" class="w-5 h-5 rounded-full" />
        {/if}
        {#if data?.name}
          <a
            class={`text-ellipsis overflow-hidden whitespace-nowrap xl:text-sm text-xl hover:text-blue-500 ${
              $isDarkMode ? "text-white" : "text-black"
            }`}
            href={`/?type=EVM&chain=ALL&address=${data?.address}`}
            target="_blank"
          >
            {data?.name}
          </a>
        {:else}
          <div class="xl:text-sm text-xl">
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
              class="transition duration-500 rounded-sm"
            >
              <path
                fill={$isDarkMode ? "white" : "black"}
                d="M18.205 2.25h3.308l-7.227 8.26l8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"
              />
            </svg>
          </a>
        {/if}
      {:else}
        <div class="xl:text-sm text-xl">
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
    </div>
  </td>

  <td
    class={`xl:py-3 py-6 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="text-right xl:text-sm text-xl font-medium flex justify-end gap-1"
    >
      <TooltipNumber number={Number(data?.eth_balance)} type="balance" />
      <span>ETH</span>
    </div>
  </td>

  <td
    class={`xl:py-3 py-6 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-xl text-right font-medium flex flex-col items-end gap-1"
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
    class={`xl:py-3 py-6 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-xl text-right font-medium flex flex-col items-end gap-1"
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
    class={`xl:py-3 py-6 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-xl text-right font-medium flex flex-col items-end gap-1"
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
    class={`xl:py-3 py-6 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-xl text-right font-medium flex flex-col items-end gap-1"
    >
      {#if data?.realized_profit === null}
        <div>--</div>
      {:else}
        <div
          class={`flex items-center ${
            data?.realized_profit >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          $<TooltipNumber
            number={Math.abs(Number(data?.realized_profit))}
            type={Math.abs(Number(data?.realized_profit)) > 999999
              ? "balance"
              : "percent"}
          />
          <img
            src={data?.realized_profit >= 0 ? TrendUp : TrendDown}
            alt="trend"
            class="ml-1 mb-1 w-4 h-4"
          />
        </div>
      {/if}
    </div>
  </td>

  <td
    class={`xl:py-3 py-6 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    {#if data?.txs_30d === null}
      <div class="text-right">--</div>
    {:else}
      <div
        class="xl:text-sm text-xl text-right font-medium flex justify-end items-center"
      >
        {Number(data?.txs_30d)}
      </div>
    {/if}
  </td>

  <td
    class={`xl:py-3 py-6 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    {#if data?.avg_hold_time === null}
      <div class="text-right">--</div>
    {:else}
      <div
        class="xl:text-sm text-xl text-right font-medium flex justify-end items-center"
      >
        {formatAHT(Number(data?.avg_hold_time * 1000))}
      </div>
    {/if}
  </td>

  <td
    class={`xl:py-3 py-6 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    {#if data?.last_active === null}
      <div class="text-right">--</div>
    {:else}
      <div
        class="xl:text-sm text-xl text-right font-medium flex justify-end items-center"
      >
        {formatActiveTime(Number(data?.last_active * 1000))}
      </div>
    {/if}
  </td>

  <td
    class={`xl:py-3 py-6 pr-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end items-center -space-x-2 pl-3">
      {#each data?.recent_buy_tokens as token, index}
        <div
          class={`relative z-1 ${index > 0 && "-ml-2"}`}
          on:mouseenter={() => {
            isShowSymbol = true;
            selectedToken = token;
          }}
          on:mouseleave={() => {
            isShowSymbol = false;
            selectedToken = undefined;
          }}
        >
          <img
            src={token.logo || defaultToken}
            alt=""
            class="xl:w-7 xl:h-7 h-10 w-10 object-contain rounded-full bg-white"
            on:error={(e) => handleImgError(e, defaultToken)}
          />
          {#if isShowSymbol && selectedToken === token}
            <div
              class={`absolute transform -translate-x-1/2 ${
                whalePosition == 0 ? "top-7 left-1/2" : "-top-8 left-1/2"
              }`}
              style="z-index: 2147483648;"
            >
              <Tooltip text={token.symbol.toUpperCase()} />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </td>
</tr>

<style windi:preflights:global windi:safelist:global>
</style>

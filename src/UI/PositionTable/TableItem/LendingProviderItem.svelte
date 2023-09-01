<script>
  import dayjs from "dayjs";
  import { isDarkMode } from "~/store";

  import "~/components/Tooltip.custom.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  $: profit = data.market_price * data?.amount + (data.inputValue || 0);
  $: value = data.market_price * data?.amount;
  $: profitPercent =
    Math.abs(data.inputValue || 0) === 0
      ? 0
      : profit / Math.abs(data.inputValue);
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-4 xl:static xl:bg-transparent sticky left-0 z-9 ${
      darkMode
        ? "bg-[#110c2a] group-hover:bg-[#00000033]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left flex items-center gap-2">
      {#each data.tokens as token}
        <img
          src={token.logo}
          alt={token.symbol}
          width="30"
          height="30"
          class="rounded-full"
        />
      {/each}
      <div class="flex flex-col gap-1">
        <div class=" xl:text-sm text-xl font-medium">
          {data.name}
        </div>
        {#if data.tokens && data.tokens.length}
          <div class="flex items-center gap-1">
            {#each data.tokens as token, index}
              <div class="text_00000080 text-xs font-medium">
                {token.symbol}
              </div>
              {#if index < data.tokens.length - 1}
                <div class="text_00000080 text-xs font-medium">-</div>
              {/if}
            {/each}
          </div>
        {:else}
          <div>None</div>
        {/if}
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end xl:text-sm text-xl text_00000099 font-medium">
      <TooltipNumber number={data?.amount} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end xl:text-sm text-xl text_00000099 font-medium">
      $<TooltipNumber number={Math.abs(data.inputValue)} type="balance" />
    </div>
  </td>

  <!-- <td   class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}>
    <div class="text-right xl:text-sm text-xl text_00000099 font-medium">
      {dayjs(data.inputTime).format("YYYY-MM-DD, hh:mm A")}
    </div>
  </td>

  <td   class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}>
    <div class="text-right xl:text-sm text-xl text_00000099 font-medium">
      {formatBalance(data.apy)}
    </div>
  </td> -->

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end xl:text-sm text-xl text_00000099 font-medium">
      $<TooltipNumber number={value} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-xl font-medium flex flex-col">
      <div
        class={`flex justify-end ${
          profit >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        $<TooltipNumber number={Math.abs(profit)} type="balance" />
      </div>
      <div class="flex items-center justify-end gap-1">
        <div
          class={`flex items-center ${
            profit >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          <TooltipNumber
            number={Math.abs(profitPercent) * 100}
            type="percent"
          />
          <span>%</span>
        </div>
        <img src={profit >= 0 ? TrendUp : TrendDown} alt="trend" class="mb-1" />
      </div>
    </div>
  </td>
</tr>

<style>
</style>

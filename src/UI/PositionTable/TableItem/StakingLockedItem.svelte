<script>
  import { isDarkMode } from "~/store";
  import dayjs from "dayjs";

  import "~/components/Tooltip.custom.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  let profit = Math.random() * 100 * (Math.random() > 0.5 ? 1 : -1);
  let profitPercent =
    Math.abs(data?.inputValue || 0) === 0
      ? 0
      : profit / Math.abs(data?.inputValue);
</script>

<tbody>
  <tr class="group transition-all">
    <td
      class={`pl-3 py-4 xl:static xl:bg-transparent sticky left-0 z-9 ${
        $isDarkMode
          ? "bg-[#110c2a] group-hover:bg-[#000]"
          : "bg-white group-hover:bg-gray-100"
      }`}
    >
      <div class="text-left flex items-center gap-2">
        <img
          src={data.logo}
          alt="token"
          width="30"
          height="30"
          class="rounded-full"
        />
        <div class="flex flex-col gap-1">
          <div class="xl:text-sm text-2xl font-medium">
            {data.name}
          </div>
          {#if data.tokens && data.tokens.length}
            <div class="flex items-center gap-1">
              {#each data.tokens as token, index}
                <div class="text_00000080 xl:text-xs text-sm font-medium">
                  {token.symbol}
                </div>
                {#if index < data.tokens.length - 1}
                  <div class="text_00000080 xl:text-xs text-sm font-medium">
                    -
                  </div>
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
      class={`py-3  ${
        $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
      }`}
    >
      <div class="text-right xl:text-sm text-2xl text_00000099 font-medium">
        $<TooltipNumber number={data.inputValue} type="balance" />
      </div>
    </td>

    <td
      class={`py-3  ${
        $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
      }`}
    >
      <div class="text-right xl:text-sm text-2xl text_00000099 font-medium">
        {dayjs(data.inputTime).format("YYYY-MM-DD, hh:mm A")}
      </div>
    </td>

    <td
      class={`py-3  ${
        $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
      }`}
    >
      <div class="text-right xl:text-sm text-2xl text_00000099 font-medium">
        {dayjs(data.releaseTime).format("YYYY-MM-DD, hh:mm A")}
      </div>
    </td>

    <td
      class={`py-3  ${
        $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
      }`}
    >
      <div class="text-right xl:text-sm text-2xl text_00000099 font-medium">
        <TooltipNumber number={data.claimable} type="balance" />
      </div>
    </td>

    <td
      class={`py-3  ${
        $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
      }`}
    >
      <div
        class="text-right xl:text-sm text-2xl text_00000099 font-medium relative"
      >
        $<TooltipNumber number={data.currentValue} type="balance" />
      </div>
    </td>

    <td
      class={`py-3 pr-3 ${
        $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
      }`}
    >
      <div class="xl:text-sm text-2xl font-medium flex flex-col">
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
          <img
            src={profit >= 0 ? TrendUp : TrendDown}
            alt="trend"
            class="mb-1"
          />
        </div>
      </div>
    </td>
  </tr>
</tbody>

<style>
</style>

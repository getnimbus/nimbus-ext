<script lang="ts">
  import { isDarkMode } from "~/store";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let data;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  $: costBuy = Number(data?.quantity_in) * Number(data?.to_price);
  $: costSell = Number(data?.quantity_out) * Number(data?.from_price);
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 w-[100px] ${
      darkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-2xl font-medium flex justify-start">
      {#if Number(data?.quantity_out) === 0}
        <div class="flex items-center text-[#00A878]">
          <div>+</div>
          <TooltipNumber number={data?.quantity_in} type="balance" />
        </div>
      {:else}
        <div class="flex items-center text-red-500">
          <div>-</div>
          <TooltipNumber number={data?.quantity_out} type="balance" />
        </div>
      {/if}
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-2xl font-medium flex justify-end">
      {#if Number(data?.quantity_out) === 0}
        <div class="text_00000099">
          <TooltipNumber number={costBuy} type="value" />
        </div>
      {:else}
        <div class="flex items-center text-red-500">
          <div>-</div>
          <TooltipNumber number={costSell} type="value" />
        </div>
      {/if}
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end">
      {#if Number(data?.quantity_out) === 0}
        <TooltipNumber number={data?.to_price} type="value" />
      {:else}
        <TooltipNumber number={data?.from_price} type="value" />
      {/if}
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-2xl text_00000099 font-medium text-right">
      {dayjs(data?.created_at * 1000).fromNow()}
    </div>
  </td>
</tr>

<style>
</style>

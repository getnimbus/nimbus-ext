<script lang="ts">
  import { isDarkMode } from "~/store";
  import { detectedChain, linkExplorer } from "~/lib/chains";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let data;

  $: withinLast24Hours = dayjs().diff(dayjs(data?.timestamp), "hour");
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 w-[100px] ${
      $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-sm font-medium flex justify-start">
      {data?.tokenId}
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-sm text_00000099 font-medium flex justify-end gap-1">
      <TooltipNumber type="amount" number={Number(data?.price)} />{data?.chain} |
      <TooltipNumber type="value" number={Number(data?.priceUst)} />
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-sm text_00000099 font-medium flex justify-end">
      <div
        class="w-max px-2 py-1 text_27326F font-normal bg-[#6AC7F533] rounded-[5px] capitalize"
      >
        {data?.owner?.toLowerCase() === data?.fromAddress?.toLowerCase()
          ? "Sell"
          : "Buy"}
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-sm text_00000099 font-medium text-right">
      {withinLast24Hours < 24
        ? dayjs(data?.timestamp).fromNow()
        : dayjs(data?.timestamp).format("YYYY-MM-DD")}
    </div>
  </td>

  <td
    class={`py-3 w-10 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex items-center justify-center">
      <a
        href={data.transactionHash
          ? linkExplorer(data.chain, data.transactionHash).trx
          : ""}
        target="_blank"
        class="cursor-pointer"
      >
        <img
          src={detectedChain(data?.chain)?.logo}
          alt=""
          width="22"
          height="22"
          class="rounded-full"
        />
      </a>
    </div>
  </td>
</tr>

<style></style>

<script lang="ts">
  import { isDarkMode } from "~/store";
  import { compareTable } from "~/UI/PricePackage/DataTable";

  const compareResult = (item: any) => {
    if (item.state === "available") {
      return "✅";
    } else if (item.state === "unavailable") {
      return "⛔";
    } else {
      return "⚠️";
    }
  };
</script>

<div class="flex flex-col gap-4">
  <div class="xl:text-xl text-2xl font-medium w-full">
    Compare with other apps
  </div>
  <div
    class="rounded-[10px] border border_0000000d xl:overflow-hidden overflow-x-auto"
  >
    <table class="xl:w-full w-[1400px] table-auto">
      <thead>
        <tr class="bg_f4f5f8">
          <th
            class="py-3 pl-3 rounded-tl-[10px] xl:static xl:bg-transparent w-[180px] sm:w-auto sticky left-0 bg_f4f5f8"
          >
            <div class="text-left xl:text-sm uppercase font-medium">#</div>
          </th>
          <th class="py-3">
            <div class="text-left xl:text-sm uppercase font-medium">Nimbus</div>
          </th>
          <th class="py-3">
            <div class="text-left xl:text-sm uppercase font-medium">Excel</div>
          </th>
          <th class="py-3">
            <div class="text-left xl:text-sm uppercase font-medium">
              CoinStats
            </div>
          </th>
          <th class="py-3">
            <div class="text-left xl:text-sm uppercase font-medium">DeBank</div>
          </th>
          <th class="py-3 rounded-tr-[10px]">
            <div class="text-left xl:text-sm uppercase font-medium">Nansen</div>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each compareTable as item}
          <tr class="group transition-all">
            <td
              class={`pl-3 py-4 xl:static xl:bg-transparent sticky w-[180px] sm:w-auto left-0 ${
                $isDarkMode
                  ? "bg-[#131313] group-hover:bg-[#000]"
                  : "bg-white group-hover:bg-gray-100"
              }`}
            >
              <div class="text-left">
                {item.title}
              </div>
            </td>

            <td
              class={`py-3 w-[210px] ${
                $isDarkMode
                  ? "group-hover:bg-[#000]"
                  : "group-hover:bg-gray-100"
              }`}
            >
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.nimbus)}
                </span>
                {item.content.nimbus.description}
              </div>
            </td>

            <td
              class={`py-3 w-[210px] ${
                $isDarkMode
                  ? "group-hover:bg-[#000]"
                  : "group-hover:bg-gray-100"
              }`}
            >
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.excel)}
                </span>
                {item.content.excel.description}
              </div>
            </td>

            <td
              class={`py-3 w-[210px] ${
                $isDarkMode
                  ? "group-hover:bg-[#000]"
                  : "group-hover:bg-gray-100"
              }`}
            >
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.coinstats)}
                </span>
                {item.content.coinstats.description}
              </div>
            </td>

            <td
              class={`py-3 w-[210px] ${
                $isDarkMode
                  ? "group-hover:bg-[#000]"
                  : "group-hover:bg-gray-100"
              }`}
            >
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.debank)}
                </span>
                {item.content.debank.description}
              </div>
            </td>

            <td
              class={`py-3 w-[210px] ${
                $isDarkMode
                  ? "group-hover:bg-[#000]"
                  : "group-hover:bg-gray-100"
              }`}
            >
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.nansen)}
                </span>
                {item.content.nansen.description}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>

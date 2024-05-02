<script lang="ts">
  import { isDarkMode } from "~/store";

  import Button from "~/components/Button.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import playIcon from "~/assets/play-icon.svg";
</script>

<div
  class={`flex-1 w-full flex flex-col gap-3 rounded-[10px] xl:p-4 py-3 px-2 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
  }`}
>
  <div class="text-xl font-medium">Quests</div>
  <div
    class={`md:block hidden rounded-[10px] border border_0000000d overflow-hidden ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
    }`}
  >
    <table class="table-auto w-full h-full">
      <thead>
        <tr class="bg_f4f5f8">
          <th class="pl-3 py-3 rounded-tl-[10px] bg_f4f5f8">
            <div class="text-left xl:text-xs text-lg uppercase font-medium">
              Task
            </div>
          </th>

          <th class="py-3">
            <div
              class="flex items-center justify-start xl:gap-2 gap-4 text-right xl:text-xs uppercase font-medium"
            >
              GM Points
            </div>
          </th>

          <th class="pr-3 py-3 rounded-tr-[10px]">
            <div
              class="flex gap-1 justify-end items-center text-right xl:text-xs uppercase font-medium relative"
            >
              Status
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          class={`group transition-all ${
            $isDarkMode ? "text-gray-400" : "text-[#666666]"
          }`}
        >
          <td
            class={`xl:py-3 py-6 pl-3 ${
              $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
            }`}
          >
            <div class="text-left xl:text-xs uppercase font-medium">
              Like this tweet
            </div>
          </td>

          <td
            class={`xl:py-3 py-6 ${
              $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
            }`}
          >
            <div
              class="text-left xl:text-xs uppercase font-medium flex justify-start items-center gap-1"
            >
              <img src={goldImg} alt="" class="w-4 h-4" />
              300
            </div>
          </td>

          <td
            class={`xl:py-3 py-6 pr-3 ${
              $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
            }`}
          >
            <div
              class="text-right xl:text-xs uppercase font-medium flex justify-end items-center gap-2"
            >
              <div class="w-[50px]">
                <Button>
                  <img src={playIcon} alt="" class="w-4 h-4" />
                </Button>
              </div>
              <div class="w-[90px]">
                <Button variant="tertiary">Check</Button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div
    class={`md:hidden block rounded-[10px] p-2 overflow-hidden w-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    <div
      class="flex flex-col gap-4 border-b-[1px] border_0000000d last:border-none py-4"
    >
      <div class="flex justify-between items-start">
        <div class="text-right text-sm uppercase font-medium">Task</div>
        <div
          class="flex items-center justify-end font-medium text-sm text_00000099"
        >
          Like this tweet
        </div>
      </div>

      <div class="flex justify-between items-start">
        <div class="text-right text-sm uppercase font-medium">GM Points</div>
        <div
          class="flex items-center justify-end gap-1 font-medium text-sm text_00000099"
        >
          <img src={goldImg} alt="" class="w-4 h-4" />
          300
        </div>
      </div>

      <div class="flex justify-between items-center">
        <div class="text-right text-sm uppercase font-medium">Status</div>
        <div
          class="flex items-center justify-end gap-2 font-medium text-sm text_00000099"
        >
          <div class="w-[50px]">
            <Button>
              <img src={playIcon} alt="" class="w-4 h-4" />
            </Button>
          </div>
          <div class="w-[90px]">
            <Button variant="tertiary">Check</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>

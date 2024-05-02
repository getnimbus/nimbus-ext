<script>
  import flowXFinance from "~/assets/campaign/FLX-logo-black-square.png";
  import gmPoint from "~/assets/Gold4.svg";
  import { isDarkMode } from "~/store";
</script>

<div
  class={`flex flex-col gap-4 rounded-[20px] px-5 py-3 ${$isDarkMode ? "bg-[#222222]" : "border bg-white"} `}
>
  <div class={`font-medium text-3xl ${$isDarkMode ? "text-white" : ""}`}>
    Quests
  </div>
  <hr />
  <!-- Desktop -->
  <div class="w-full xl:block hidden">
    <div
      class={`w-full flex flex-col rounded-[10px] ${
        $isDarkMode ? "bg-black text-white" : "border"
      }`}
    >
      <div
        class={`grid grid-cols-5 px-3 rounded-t-[10px] ${$isDarkMode ? "bg-gray-100" : "bg-[#fff] border border_0000000d"}`}
      >
        <div
          class={`col-span-2 text-left text-xs rounded-tl-[10px] uppercase font-medium py-2`}
        >
          Task
        </div>
        <div class="text-center text-xs uppercase font-medium py-2">
          GM Points
        </div>
        <div class="text-center text-xs uppercase font-medium py-2">
          Repetition
        </div>
        <div class="text-center text-xs uppercase font-medium py-2">Status</div>
      </div>
      <div class="flex flex-col">
        {#each [{}, {}, {}, {}] as item}
          <div class="grid grid-cols-5 py-2 px-3">
            <div class="col-span-2">
              <div>Like this tweet</div>
            </div>
            <div class="text-center">
              <div class="flex gap-1 items-center justify-center">
                200 <img src={gmPoint} alt="" class="w-4 h-4" />
              </div>
            </div>
            <div class="text-center">
              <div>One Time</div>
            </div>
            <div>
              <div class="flex gap-2 items-center justify-center">
                <button class="bg-[#2F3C85] py-2 px-4 rounded-lg text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 256 256"
                  >
                    <rect width="256" height="256" fill="none" />
                    <path
                      fill="currentColor"
                      d="M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128"
                    />
                  </svg>
                </button>
                <button class="bg-[#1E96FC] py-1 px-3 rounded-lg text-white">
                  Check
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Mobile  -->
  <div class="w-full xl:hidden block">
    <div
      class={`w-full flex flex-col rounded-[10px] ${
        $isDarkMode ? "bg-black text-white" : ""
      }`}
    >
      <div class="flex flex-col">
        {#each [{}, {}, {}, {}] as item}
          <div class="flex flex-col">
            <div class="flex justify-between items-center py-2">
              <div class="text-sm uppercase font-medium">Task</div>
              <div class="text-sm font-medium text_00000099">
                Like this tweet
              </div>
            </div>
            <div class="flex justify-between items-center py-2">
              <div class="text-sm uppercase font-medium">GM Points</div>
              <div
                class="flex gap-1 items-center justify-center font-medium text-sm text_00000099"
              >
                200 <img src={gmPoint} alt="" class="w-4 h-4" />
              </div>
            </div>
            <div class="flex justify-between items-center py-2">
              <div class="font-medium text-sm uppercase">Repetition</div>
              <div class="font-medium text-sm text_00000099">One Time</div>
            </div>
            <div class="flex gap-2 items-center justify-center py-2">
              <button class="bg-[#2F3C85] py-2 px-4 rounded-lg text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 256 256"
                >
                  <rect width="256" height="256" fill="none" />
                  <path
                    fill="currentColor"
                    d="M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128"
                  />
                </svg>
              </button>
              <button class="bg-[#1E96FC] py-1 px-3 rounded-lg text-white">
                Check
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style></style>

<script>
  import { isDarkMode } from "~/store";

  let fakeData = [
    {
      title: "What's Flip The GM?",
      desc: "Descrition some thing on it!!!",
      active: false,
    },
    {
      title: "How can I play?",
      desc: "Descrition some thing on it!!!",
      active: false,
    },
    {
      title: "Is my wallet safe?",
      desc: "Descrition some thing on it!!!",
      active: false,
    },
  ];
</script>

<div>
  <div
    class={`flex flex-col items-center gap-4 rounded-[20px] py-10 px-8 ${$isDarkMode ? "bg-[#222222] text-white" : "border text-[#666666]"}`}
  >
    <div
      class={`text-3xl font-semibold ${$isDarkMode ? "text-white" : "text-black"}`}
    >
      Q&A
    </div>

    <div class="flex flex-col items-center gap-5 w-full">
      {#each fakeData as item}
        <div class="flex flex-col w-full">
          <div
            class="flex justify-between items-center w-full py-4 border-b cursor-pointer"
            on:click={() => (item.active = !item.active)}
          >
            <div
              class={`font-medium ${$isDarkMode ? "text-white" : "text-black"}`}
            >
              {item.title}
            </div>
            <div>
              {#if item.active}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m5.757-1a1 1 0 1 0 0 2h8.486a1 1 0 1 0 0-2z"
                    clip-rule="evenodd"
                  />
                </svg>
              {:else}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13z"
                    clip-rule="evenodd"
                  />
                </svg>
              {/if}
            </div>
          </div>
          {#if item.active}
            <div class="flex py-4">
              {item.desc}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<style></style>

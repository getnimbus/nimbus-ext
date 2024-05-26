<script>
  import { isDarkMode } from "~/store";

  let contentQnA = [
    {
      title: "What's Flip The GM 👀?",
      desc: "Flip the GM is a new way for you to interact with SUI blockchain and get Reward in GMs 🤩 with just 2 clicks. It's a no risk high return game 👍",
      active: false,
    },
    {
      title: "How can I Flip 🤔?",
      desc: "Just simply connect your SUI wallet, pay the gas fee, and FLIP THE GMs 👏",
      active: false,
    },
    {
      title: "Is my wallet Safu 😨?",
      desc: "Yes, your wallet is Safu 😉",
      active: false,
    },
  ];
</script>

<div class="xl:h-[500px]">
  <div
    class={`flex flex-col items-center gap-4 rounded-[10px] py-10 px-8 ${$isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"}`}
  >
    <div class="text-3xl font-semibold">Q&A</div>

    <div class="flex flex-col items-center w-full">
      {#each contentQnA as item}
        <div
          class="w-full py-6 border-b border_0000001a last:border-none cursor-pointer"
          on:click={() => (item.active = !item.active)}
        >
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <div class="text-lg font-medium">
                {item.title}
              </div>

              <div class="text_00000099">
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
              <div class="text-base text_00000099">
                {item.desc}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

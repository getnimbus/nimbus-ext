<script lang="ts">
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { isDarkMode } from "~/store";
  import CopyToClipboard from "svelte-copy-to-clipboard";

  import Button from "~/components/Button.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import CodeIcon from "~/assets/code-icon.svg";

  const typeTab = [
    {
      label: "Invite codes",
      value: "codes",
    },
    {
      label: "History",
      value: "history",
    },
  ];

  let toastMsg = "";
  let isSuccessToast: boolean = false;
  let counter = 3;
  let showToast: boolean = false;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  let tabSelected = "codes";
</script>

<div
  class={`xl:flex-[0.81] flex-1 w-full flex flex-col gap-3 rounded-[10px] xl:p-4 py-3 px-2 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
  }`}
>
  <div class="text-xl font-medium">Referrals</div>
  <div class="flex flex-col gap-4">
    <div class="flex md:flex-row flex-col justify-between gap-3">
      <div
        class={`flex-1 rounded-[10px] py-2 px-3 flex flex-col items-center gap-2 ${$isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"}`}
      >
        <div class="text-base">Your Invites</div>
        <div class="text-3xl font-medium">3</div>
      </div>

      <div
        class={`flex-1 rounded-[10px] py-2 px-3 flex flex-col items-center gap-2 ${$isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"}`}
      >
        <div class="text-base">Rewards</div>
        <div class="text-3xl font-medium flex items-center gap-2">
          <img src={goldImg} alt="" class="w-7 h-7" />
          1230
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center xl:gap-2 gap-4">
        <AnimateSharedLayout>
          {#each typeTab as type}
            <div
              class="relative cursor-pointer xl:text-base text-xl font-medium py-1 px-3 rounded-[100px] transition-all"
              id={type.value}
              on:click={() => {
                if (tabSelected !== type.value) {
                  tabSelected = type.value;
                }
              }}
            >
              <div
                class={`relative z-1 ${tabSelected === type.value && "text-white"}`}
              >
                {type.label}
              </div>

              {#if type.value === tabSelected}
                <Motion
                  let:motion
                  layoutId="active-pill"
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <div
                    class="absolute inset-0 rounded-full bg-[#1E96FC] z-0"
                    use:motion
                  />
                </Motion>
              {/if}
            </div>
          {/each}
        </AnimateSharedLayout>
      </div>

      {#if tabSelected === "codes"}
        <div class="flex flex-col gap-2">
          <div
            class={`rounded-[10px] border border_0000000d overflow-hidden ${
              $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
            }`}
          >
            <table class="table-auto w-full h-full">
              <thead>
                <tr class="bg_f4f5f8">
                  <th class="pl-3 py-3 rounded-tl-[10px] bg_f4f5f8">
                    <div
                      class="text-left xl:text-xs text-sm uppercase font-medium"
                    >
                      Code
                    </div>
                  </th>

                  <th class="pr-3 py-3 rounded-tr-[10px]">
                    <div
                      class="text-left xl:text-xs text-sm uppercase font-medium"
                    >
                      Status
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                <CopyToClipboard
                  text={"HELLO WORLD"}
                  let:copy
                  on:copy={async () => {
                    toastMsg = "Copied code successfully!";
                    isSuccessToast = true;
                    trigger();
                  }}
                >
                  <tr
                    class={`cursor-pointer group transition-all ${
                      $isDarkMode ? "text-gray-400" : "text-[#666666]"
                    }`}
                    on:click={copy}
                  >
                    <td
                      class={`py-3 pl-3 ${
                        $isDarkMode
                          ? "group-hover:bg-[#000]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div
                        class="flex items-center gap-1 text-left xl:text-xs text-sm uppercase font-medium"
                      >
                        <img src={CodeIcon} alt="" class="w-3 h-3" />
                        CODE01CODE01
                      </div>
                    </td>
                    <td
                      class={`py-3 pr-3 ${
                        $isDarkMode
                          ? "group-hover:bg-[#000]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div
                        class="text-left xl:text-xs text-sm uppercase font-medium text-[#00A878]"
                      >
                        USED
                      </div>
                    </td>
                  </tr>
                </CopyToClipboard>

                <CopyToClipboard
                  text={"HI WORLD"}
                  let:copy
                  on:copy={async () => {
                    toastMsg = "Copied code successfully!";
                    isSuccessToast = true;
                    trigger();
                  }}
                >
                  <tr
                    class={`cursor-pointer group transition-all ${
                      $isDarkMode ? "text-gray-400" : "text-[#666666]"
                    }`}
                    on:click={copy}
                  >
                    <td
                      class={`py-3 pl-3 ${
                        $isDarkMode
                          ? "group-hover:bg-[#000]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div
                        class={`flex items-center gap-1 text-left xl:text-xs text-sm uppercase font-medium ${$isDarkMode ? "text-[#292929]" : "text-gray-300"}`}
                      >
                        <img src={CodeIcon} alt="" class="w-3 h-3" />
                        CODE01CODE01
                      </div>
                    </td>
                    <td
                      class={`py-3 pr-3 ${
                        $isDarkMode
                          ? "group-hover:bg-[#000]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div
                        class={`text-left xl:text-xs text-sm uppercase font-medium ${$isDarkMode ? "text-[#292929]" : "text-gray-300"}`}
                      >
                        UNUSED
                      </div>
                    </td>
                  </tr>
                </CopyToClipboard>
              </tbody>
            </table>
          </div>
          <div class="w-max mx-auto">
            <CopyToClipboard
              text={"HELLO WORLD, HI WORLD"}
              let:copy
              on:copy={async () => {
                toastMsg = "Copied all code successfully!";
                isSuccessToast = true;
                trigger();
              }}
            >
              <Button variant="tertiary" on:click={copy}>Copy All</Button>
            </CopyToClipboard>
          </div>
        </div>
      {/if}

      {#if tabSelected === "history"}
        <div
          class={`md:block hidden rounded-[10px] border border_0000000d overflow-hidden ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
          }`}
        >
          <table class="table-auto w-full h-full">
            <thead>
              <tr class="bg_f4f5f8">
                <th class="pl-3 py-3 rounded-tl-[10px] bg_f4f5f8">
                  <div
                    class="text-left xl:text-xs text-lg uppercase font-medium"
                  >
                    User
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="flex items-center justify-start xl:gap-2 gap-4 text-right xl:text-xs uppercase font-medium"
                  >
                    Time
                  </div>
                </th>
                <th class="pr-3 py-3 rounded-tr-[10px]">
                  <div
                    class="flex gap-1 justify-end items-center text-right xl:text-xs uppercase font-medium relative"
                  >
                    Reward
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
                  class={`py-3 pl-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div class="text-left xl:text-xs uppercase font-medium">
                    @thanhle27
                  </div>
                </td>

                <td
                  class={`py-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class="flex items-center gap-1 text-left xl:text-xs uppercase font-medium"
                  >
                    2024-04-30
                  </div>
                </td>

                <td
                  class={`py-3 pr-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class="text-right xl:text-xs uppercase font-medium flex justify-end items-center gap-1"
                  >
                    <img src={goldImg} alt="" class="w-4 h-4" />
                    300
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class={`xl:hidden block rounded-[10px] p-2 overflow-hidden w-full ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          <div
            class="flex flex-col gap-4 border-b-[1px] border_0000000d last:border-none py-4"
          >
            <div class="flex justify-between items-start">
              <div class="text-right text-sm uppercase font-medium">User</div>
              <div
                class="flex items-center justify-end font-medium text-sm text_00000099"
              >
                @thanhle27
              </div>
            </div>

            <div class="flex justify-between items-start">
              <div class="text-right text-sm uppercase font-medium">Time</div>
              <div
                class="flex items-center justify-end font-medium text-sm text_00000099"
              >
                2024-04-30
              </div>
            </div>

            <div class="flex justify-between items-start">
              <div class="text-right text-sm uppercase font-medium">Reward</div>
              <div
                class="flex items-center justify-end gap-1 font-medium text-sm text_00000099"
              >
                <img src={goldImg} alt="" class="w-4 h-4" />
                300
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showToast}
  <div class="fixed top-3 right-3 w-full" style="z-index: 2147483648;">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>

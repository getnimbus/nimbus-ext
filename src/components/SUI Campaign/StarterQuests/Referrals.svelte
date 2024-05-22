<script lang="ts">
  import { isDarkMode } from "~/store";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import dayjs from "dayjs";
  import { wait } from "~/entries/background/utils";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import { triggerToast } from "~/utils";

  import Button from "~/components/Button.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import CodeIcon from "~/assets/code-icon.svg";

  export let dataReferrals;

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

  const gmPointBonusEachReferral = 150;

  let isCopied = false;
  let code = "";

  let tabSelected = "codes";

  $: listReferralCode =
    dataReferrals?.referral_codes
      ?.filter((item) => !item.used)
      ?.map((item) => item.id)
      .join("\n") || [];
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
        <div class="text-3xl font-medium">{dataReferrals?.count || 0}</div>
      </div>

      <div
        class={`flex-1 rounded-[10px] py-2 px-3 flex flex-col items-center gap-2 ${$isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"}`}
      >
        <div class="text-base">Rewards</div>
        <div class="text-3xl font-medium flex items-center gap-2">
          <img src={goldImg} alt="" class="w-7 h-7" />
          {dataReferrals?.count * gmPointBonusEachReferral || 0}
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="w-full flex items-center gap-3">
        {#each typeTab as type}
          <div
            class="relative w-full text-center cursor-pointer xl:text-base text-xl font-medium rounded-[100px] transition-all"
            id={type.value}
            on:click={() => {
              if (tabSelected !== type.value) {
                tabSelected = type.value;
              }
            }}
          >
            <div
              class={`relative z-1 py-1 px-3 rounded-md w-full border border-[#1e96fc] text-[#1e96fc] ${tabSelected === type.value && "bg-[#1e96fc] text-white"}`}
            >
              {type.label}
            </div>
          </div>
        {/each}
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
                  <th class="pl-3 py-3 rounded-tl-[10px]">
                    <div
                      class="text-center xl:text-xs text-sm uppercase font-medium"
                    >
                      Code
                    </div>
                  </th>

                  <th class="pr-3 py-3 rounded-tr-[10px]">
                    <div
                      class="text-center xl:text-xs text-sm uppercase font-medium"
                    >
                      Status
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {#if dataReferrals && dataReferrals?.referral_codes && dataReferrals?.referral_codes?.length === 0}
                  <tr>
                    <td colspan="2">
                      <div
                        class="flex justify-center items-center h-full py-4 px-3 text-lg text-gray-400"
                      >
                        Empty
                      </div>
                    </td>
                  </tr>
                {:else}
                  {#each (dataReferrals && dataReferrals?.referral_codes) || [] as data}
                    {#if data?.used}
                      <tr
                        class={`cursor-pointer group transition-all ${
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
                          <div
                            class="flex items-center justify-center gap-1 text-sm font-medium uppercase"
                          >
                            <img src={CodeIcon} alt="" class="w-3 h-3" />
                            {data?.id}
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
                            class="text-center text-sm uppercase font-medium text-[#00A878]"
                          >
                            USED
                          </div>
                        </td>
                      </tr>
                    {:else}
                      <CopyToClipboard
                        text={data?.id}
                        let:copy
                        on:copy={async () => {
                          code = data?.id;
                          isCopied = true;
                          await wait(400);
                          triggerToast("Copied code successfully!", "success");
                          isCopied = false;
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
                              class="flex items-center justify-center gap-1 text-left text-sm font-medium uppercase text_00000099"
                            >
                              <img src={CodeIcon} alt="" class="w-3 h-3" />
                              {data?.id}
                              <div class="cursor-pointer" on:click={copy}>
                                {#if isCopied && code === data?.id}
                                  <svg
                                    width={14}
                                    height={14}
                                    id="Layer_1"
                                    data-name="Layer 1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 122.88 74.46"
                                    fill={$isDarkMode ? "#ccc" : "#00000099"}
                                    ><path
                                      fill-rule="evenodd"
                                      d="M1.87,47.2a6.33,6.33,0,1,1,8.92-9c8.88,8.85,17.53,17.66,26.53,26.45l-3.76,4.45-.35.37a6.33,6.33,0,0,1-8.95,0L1.87,47.2ZM30,43.55a6.33,6.33,0,1,1,8.82-9.07l25,24.38L111.64,2.29c5.37-6.35,15,1.84,9.66,8.18L69.07,72.22l-.3.33a6.33,6.33,0,0,1-8.95.12L30,43.55Zm28.76-4.21-.31.33-9.07-8.85L71.67,4.42c5.37-6.35,15,1.83,9.67,8.18L58.74,39.34Z"
                                    /></svg
                                  >
                                {:else}
                                  <div
                                    class="relative"
                                    use:tooltip={{
                                      content: `<tooltip-detail text="Copy Code" />`,
                                      allowHTML: true,
                                      placement: "top",
                                    }}
                                  >
                                    <svg
                                      width={14}
                                      height={14}
                                      viewBox="0 0 12 11"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M8.1875 3.3125H10.6875V10.1875H3.8125V7.6875"
                                        stroke={$isDarkMode
                                          ? "#ccc"
                                          : "#00000099"}
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                      <path
                                        d="M8.1875 0.8125H1.3125V7.6875H8.1875V0.8125Z"
                                        stroke={$isDarkMode
                                          ? "#ccc"
                                          : "#00000099"}
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                    </svg>
                                  </div>
                                {/if}
                              </div>
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
                              class="text-center text-sm uppercase font-medium text_00000099"
                            >
                              UNUSED
                            </div>
                          </td>
                        </tr>
                      </CopyToClipboard>
                    {/if}
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>

          <div class="w-max mx-auto">
            {#if listReferralCode && listReferralCode.length !== 0}
              <CopyToClipboard
                text={listReferralCode}
                let:copy
                on:copy={async () => {
                  triggerToast("Copied all code successfully!", "success");
                }}
              >
                <Button variant="tertiary" on:click={copy}>Copy All</Button>
              </CopyToClipboard>
            {:else}
              <Button variant="tertiary" disabled>Copy All</Button>
            {/if}
          </div>
        </div>
      {/if}

      {#if tabSelected === "history"}
        <div
          class={`md:block hidden rounded-[10px] border border_0000000d h-[305px] overflow-y-auto ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
          }`}
        >
          <table class="table-auto w-full">
            <thead>
              <tr class="bg_f4f5f8 sticky top-0">
                <th class="pl-3 py-3 w-1/3 rounded-tl-[10px]">
                  <div
                    class="text-left xl:text-xs text-sm uppercase font-medium"
                  >
                    Code
                  </div>
                </th>

                <th class="py-3 w-1/3">
                  <div
                    class="text-center xl:text-xs text-sm uppercase font-medium"
                  >
                    Time
                  </div>
                </th>

                <th class="pr-3 py-3 w-1/3 rounded-tr-[10px]">
                  <div
                    class="text-right xl:text-xs text-sm uppercase font-medium"
                  >
                    Reward
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {#if dataReferrals?.history && dataReferrals?.history?.length === 0}
                <tr>
                  <td colspan="3">
                    <div
                      class="flex justify-center items-center h-full py-4 px-3 text-lg text-gray-400"
                    >
                      Empty
                    </div>
                  </td>
                </tr>
              {:else}
                {#each dataReferrals?.history || [] as item}
                  <tr
                    class={`group transition-all ${
                      $isDarkMode ? "text-gray-400" : "text-[#666666]"
                    }`}
                  >
                    <td
                      class={`py-3 pl-3 w-1/3 ${
                        $isDarkMode
                          ? "group-hover:bg-[#000]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div
                        class="flex items-center gap-1 text-left text-sm font-medium uppercase"
                      >
                        <img src={CodeIcon} alt="" class="w-3 h-3" />
                        {item?.code}
                      </div>
                    </td>

                    <td
                      class={`py-3 w-1/3 ${
                        $isDarkMode
                          ? "group-hover:bg-[#000]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div
                        class="flex items-center justify-center gap-1 text-center text-sm uppercase font-medium"
                      >
                        {dayjs(item?.createdAt).format("YYYY-MM-DD")}
                      </div>
                    </td>

                    <td
                      class={`py-3 pr-3 w-1/3 ${
                        $isDarkMode
                          ? "group-hover:bg-[#000]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div
                        class="text-right text-sm uppercase font-medium flex justify-end items-center gap-1"
                      >
                        <img src={goldImg} alt="" class="w-4 h-4" />
                        150
                      </div>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        <div
          class={`xl:hidden block rounded-[10px] p-2 overflow-hidden w-full ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          {#if dataReferrals?.history && dataReferrals?.history?.length === 0}
            <div
              class="flex justify-center items-center h-full py-3 px-3 text-lg text-gray-400"
            >
              Empty
            </div>
          {:else}
            {#each dataReferrals?.history || [] as item}
              <div
                class="flex flex-col gap-4 border-b-[1px] border_0000000d last:border-none py-4"
              >
                <div class="flex justify-between items-start">
                  <div class="text-right text-sm uppercase font-medium">
                    Code
                  </div>
                  <div
                    class="flex items-center justify-end gap-1 text-left text-sm font-medium uppercase text_00000099"
                  >
                    <img src={CodeIcon} alt="" class="w-3 h-3" />
                    {item?.code}
                  </div>
                </div>

                <div class="flex justify-between items-start">
                  <div class="text-right text-sm uppercase font-medium">
                    Time
                  </div>
                  <div
                    class="flex items-center justify-end font-medium text-sm text_00000099"
                  >
                    {dayjs(item?.createdAt).format("YYYY-MM-DD")}
                  </div>
                </div>

                <div class="flex justify-between items-start">
                  <div class="text-right text-sm uppercase font-medium">
                    Reward
                  </div>
                  <div
                    class="flex items-center justify-end gap-1 font-medium text-sm text_00000099"
                  >
                    <img src={goldImg} alt="" class="w-4 h-4" />
                    150
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>

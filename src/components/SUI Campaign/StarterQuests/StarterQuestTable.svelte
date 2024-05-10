<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { isDarkMode } from "~/store";
  import { triggerFirework } from "~/utils";
  import { wait } from "~/entries/background/utils";
  import { useQueryClient } from "@tanstack/svelte-query";

  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import playIcon from "~/assets/play-icon.svg";

  export let listQuestVerified;
  export let listQuestCompleted;
  export let dataQuestsBoard;
  export let isLoading;

  const queryClient = useQueryClient();

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

  let openScreenBonusScore = false;
  let bonusScore = 0;

  let selectedQuestId = "";

  let startPlay = false;
  let countdown = 10;
  let countdownInterval;

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
  };

  const checkUserFinishedQuest = (campaign: any, completedQuests: any) => {
    return (
      completedQuests &&
      completedQuests.map((item: any) => item.questId).includes(campaign.id)
    );
  };

  const checkUserVerifyQuest = (campaign: any, verifyQuests: any) => {
    return (
      verifyQuests &&
      verifyQuests.map((item: any) => item.questId).includes(campaign.id)
    );
  };

  const startCountdown = () => {
    countdown = 10;
    countdownInterval = setInterval(() => {
      countdown--;
      if (countdown === 0) {
        clearInterval(countdownInterval);
        startPlay = false;
      }
    }, 1000);
  };

  const handleVerifyQuest = async (data) => {
    try {
      if (data?.id !== selectedQuestId) {
        toastMsg = "Please Play the quest before Check!";
        isSuccessToast = false;
        trigger();
        return;
      }

      const response: any = await nimbus.get(
        `/v2/quest/${selectedQuestId}/verify`
      );
      if (response && !response?.data?.success) {
        toastMsg = response?.data?.message;
        isSuccessToast = false;
        trigger();
        selectedQuestId = "";
        return;
      }

      toastMsg = "You can claim your GMs nows!";
      isSuccessToast = true;
      trigger();

      queryClient?.invalidateQueries(["partners-detail-campaign"]);
      queryClient?.invalidateQueries(["quests-campaign"]);
    } catch (e) {
      toastMsg = "Something wrong when verify quest. Please try again!";
      isSuccessToast = false;
      trigger();
      console.error(e);
    }
  };

  const handleClaimReward = async (data) => {
    try {
      const response: any = await nimbus.get(`/v2/quest/${data?.id}/claim`);
      if (response && !response?.data?.success) {
        toastMsg = response?.data?.message;
        isSuccessToast = false;
        trigger();
        return;
      }

      selectedQuestId = "";
      triggerBonusScore();
      bonusScore = data?.point;
      queryClient?.invalidateQueries(["users-me"]);
      queryClient?.invalidateQueries(["daily-checkin"]);
      queryClient?.invalidateQueries(["partners-detail-campaign"]);
      queryClient?.invalidateQueries(["quests-campaign"]);
    } catch (e) {
      toastMsg = "Something wrong when claim quest reward. Please try again!";
      isSuccessToast = false;
      trigger();
      console.error(e);
    }
  };
</script>

<div
  class={`flex-1 w-full flex flex-col gap-3 rounded-[10px] xl:p-4 py-3 px-2 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
  }`}
>
  <div class="text-xl font-medium">Quests</div>
  <!-- Desktop -->
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

      {#if isLoading && dataQuestsBoard && dataQuestsBoard?.length === 0}
        <tbody>
          <tr>
            <td colspan="3">
              <div class="flex justify-center items-center h-full py-3 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody>
          {#if dataQuestsBoard && dataQuestsBoard?.length === 0}
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
            {#each dataQuestsBoard as data}
              <tr
                class={`group transition-all ${
                  $isDarkMode ? "text-gray-400" : "text-[#666666]"
                }`}
              >
                <td
                  class={`xl:py-3 py-6 pl-3 flex flex-col gap-1 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class={`text-left text-base font-medium ${$isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {data?.title}
                  </div>
                  <div class="text-left text-sm w-[200px]">
                    {data?.description}
                  </div>
                </td>

                <td
                  class={`xl:py-3 py-6 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class="text-left text-sm uppercase font-medium flex justify-start items-center gap-1"
                  >
                    <img src={goldImg} alt="" class="w-4 h-4" />
                    {data?.point}
                  </div>
                </td>

                <td
                  class={`xl:py-3 py-6 pr-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class="text-right text-sm uppercase font-medium flex justify-end items-center gap-2"
                  >
                    {#if checkUserFinishedQuest(data, listQuestCompleted)}
                      <div class="w-[90px]">
                        <Button disabled>Done!</Button>
                      </div>
                    {:else}
                      <div class="w-[50px] xl:h-[34px] h-[43px]">
                        <Button
                          on:click={() => {
                            window.open(data?.url, "_blank");
                            selectedQuestId = data?.id;
                            startPlay = true;
                            clearInterval(countdownInterval);
                            startCountdown();
                          }}
                        >
                          <img src={playIcon} alt="" class="w-4 h-4" />
                        </Button>
                      </div>
                      <div class="w-[90px] xl:h-[34px] h-[43px]">
                        {#if countdown > 0 && countdown < 10 && selectedQuestId === data?.id}
                          <Button disabled>{countdown}s</Button>
                        {:else}
                          <Button
                            variant="tertiary"
                            on:click={() => {
                              if (
                                checkUserVerifyQuest(data, listQuestVerified)
                              ) {
                                handleClaimReward(data);
                              } else {
                                handleVerifyQuest(data);
                              }
                            }}
                          >
                            {#if checkUserVerifyQuest(data, listQuestVerified)}
                              Claim
                            {:else}
                              Check
                            {/if}
                          </Button>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      {/if}
    </table>
  </div>

  <!-- Tablet/Mobile -->
  <div
    class={`md:hidden block rounded-[10px] p-2 overflow-hidden w-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    {#if isLoading && dataQuestsBoard && dataQuestsBoard?.length === 0}
      <div class="flex justify-center items-center h-full py-3 px-3">
        <Loading />
      </div>
    {:else if dataQuestsBoard && dataQuestsBoard?.length === 0}
      <div
        class="flex justify-center items-center h-full py-3 px-3 text-lg text-gray-400"
      >
        Empty
      </div>
    {:else}
      {#each dataQuestsBoard as data}
        <div
          class="flex flex-col gap-4 border-b-[1px] border_0000000d last:border-none py-4"
        >
          <div class="flex flex-col gap-1 justify-between items-start">
            <div class="text-right text-sm uppercase font-medium">Task</div>
            <div
              class="flex flex-col gap-1 items-start justify-end font-medium"
            >
              <div class="text-base text_00000099">
                {data?.title}
              </div>
              <div class="text-left text-sm">
                {data?.description}
              </div>
            </div>
          </div>

          <div class="flex justify-between items-start">
            <div class="text-right text-sm uppercase font-medium">
              GM Points
            </div>
            <div
              class="flex items-center justify-end gap-1 font-medium text-sm text_00000099"
            >
              <img src={goldImg} alt="" class="w-4 h-4" />
              {data?.point}
            </div>
          </div>

          <div class="flex justify-between items-center">
            <div class="text-right text-sm uppercase font-medium">Status</div>
            <div
              class="flex items-center justify-end gap-2 font-medium text-sm text_00000099"
            >
              {#if checkUserFinishedQuest(data, listQuestCompleted)}
                <div class="w-[90px]">
                  <Button disabled>Done!</Button>
                </div>
              {:else}
                <div class="w-[50px] h-[44px]">
                  <Button
                    on:click={() => {
                      window.open(data?.url, "_blank");
                      selectedQuestId = data?.id;
                      startPlay = true;
                      clearInterval(countdownInterval);
                      startCountdown();
                    }}
                  >
                    <img src={playIcon} alt="" class="w-4 h-4" />
                  </Button>
                </div>
                <div class="w-[90px] h-[44px]">
                  {#if countdown > 0 && countdown < 10 && selectedQuestId === data?.id}
                    <Button disabled>{countdown}s</Button>
                  {:else}
                    <Button
                      variant="tertiary"
                      on:click={() => {
                        if (checkUserVerifyQuest(data, listQuestVerified)) {
                          handleClaimReward(data);
                        } else {
                          handleVerifyQuest(data);
                        }
                      }}
                    >
                      {#if checkUserVerifyQuest(data, listQuestVerified)}
                        Claim
                      {:else}
                        Check
                      {/if}
                    </Button>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

{#if openScreenBonusScore}
  <div
    class="fixed h-screen w-screen top-0 left-0 flex items-center justify-center bg-[#000000cc]"
    style="z-index: 2147483648;"
    on:click={() => {
      setTimeout(() => {
        openScreenBonusScore = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Congratulation!!!
      </div>
      <img src={goldImg} alt="" class="w-40 h-40" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have received {bonusScore} Bonus GM Points
      </div>
    </div>
  </div>
{/if}

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

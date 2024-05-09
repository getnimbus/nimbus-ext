<script lang="ts">
  import { isDarkMode } from "~/store";
  import { triggerFirework } from "~/utils";
  import { wait } from "~/entries/background/utils";
  import { getCampaignQuestsBoard } from "~/lib/queryAPI";
  import { createQuery } from "@tanstack/svelte-query";

  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import playIcon from "~/assets/play-icon.svg";

  export let dataQuestsBoard;
  export let isLoading;

  let openScreenBonusScore = false;
  let bonusScore = 0;

  let listQuestCompleted = [];

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
  };

  $: queryQuestsBoard = createQuery({
    queryKey: ["quests-campaign"],
    queryFn: () => getCampaignQuestsBoard(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$queryQuestsBoard.isError &&
      $queryQuestsBoard &&
      $queryQuestsBoard?.data !== undefined
    ) {
      listQuestCompleted = $queryQuestsBoard?.data?.completedQuests;
    }
  }

  const checkUserFinishedQuest = (campaign: any, completedQuests: any) => {
    return (
      completedQuests &&
      completedQuests.map((item: any) => item.questId).includes(campaign.id)
    );
  };
</script>

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

        <th class="py-3">
          <div
            class="flex items-center justify-start xl:gap-2 gap-4 text-right xl:text-xs uppercase font-medium"
          >
            Repetition
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

    {#if isLoading}
      <tbody>
        <tr>
          <td colspan="4">
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
            <td colspan="4">
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
                <div class="text-left text-sm w-[400px]">
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
                class={`xl:py-3 py-6 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div
                  class="text-left text-sm uppercase font-medium flex justify-start items-center"
                >
                  {data?.recurringType}
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
                    <div class="w-[50px] xl:h-[33px] h-[43px]">
                      <Button>
                        <img src={playIcon} alt="" class="w-4 h-4" />
                      </Button>
                    </div>
                    <div class="w-[90px] xl:h-[33px] h-[43px]">
                      <Button variant="tertiary">Check</Button>
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
  {#if isLoading}
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
          <div class="flex flex-col gap-1 items-start justify-end font-medium">
            <div class="text-base text_00000099">
              {data?.title}
            </div>
            <div class="text-left text-sm">
              {data?.description}
            </div>
          </div>
        </div>

        <div class="flex justify-between items-start">
          <div class="text-right text-sm uppercase font-medium">GM Points</div>
          <div
            class="flex items-center justify-end gap-1 font-medium text-sm text_00000099"
          >
            <img src={goldImg} alt="" class="w-4 h-4" />
            {data?.point}
          </div>
        </div>

        <div class="flex justify-between items-start">
          <div class="text-right text-sm uppercase font-medium">Repetition</div>
          <div
            class="flex items-center justify-end gap-1 font-medium text-sm text_00000099"
          >
            {data?.recurringType}
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
                <Button>
                  <img src={playIcon} alt="" class="w-4 h-4" />
                </Button>
              </div>
              <div class="w-[90px] h-[44px]">
                <Button variant="tertiary">Check</Button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  {/if}
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

<style windi:preflights:global windi:safelist:global>
</style>

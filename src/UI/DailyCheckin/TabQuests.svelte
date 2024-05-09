<script lang="ts">
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { isDarkMode, userPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { triggerFirework } from "~/utils";
  import { wait } from "~/entries/background/utils";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    handleGetDataDailyCheckin,
    getUserInfo,
    getCampaignPartnerList,
  } from "~/lib/queryAPI";

  import Loading from "~/components/Loading.svelte";
  import Button from "~/components/Button.svelte";
  import ConnectSui from "~/components/SUI Campaign/ConnectSUI.svelte";
  import PartnerQuestCard from "~/components/SUI Campaign/PartnerQuestCard.svelte";
  import StarterQuests from "~/components/SUI Campaign/StarterQuests.svelte";
  import PartnerQuestDetail from "~/components/SUI Campaign/PartnerQuestDetail.svelte";

  import User from "~/assets/user.png";
  import goldImg from "~/assets/Gold4.svg";
  import LeftArrow from "~/assets/left-arrow.svg";
  import LeftArrowBlack from "~/assets/left-arrow-black.svg";

  export let socialData;
  export let partnerQuestId;
  export let handleUpdatePartnerQuestsId = (id) => {};

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

  let code = "";
  let isLoadingSubmitInviteCode = false;

  let totalCompletedQuests = 0;
  let partnersDataList = [];

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
  };

  const onSubmitInviteCode = async (e) => {
    isLoadingSubmitInviteCode = true;
    const formData = new FormData(e.target);
    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    try {
      const response = await nimbus.post("/v2/campaign/sui-unlock/invitation", {
        code: data.code,
      });
      if (response?.error) {
        toastMsg = response?.error;
        isSuccessToast = false;
        trigger();
        return;
      }

      toastMsg = "Successfully submit your invitation code!";
      isSuccessToast = true;
      trigger();

      code = "";
    } catch (e) {
      console.error(e);
      toastMsg =
        "Something wrong when submit your invitation code. Please try again!";
      isSuccessToast = false;
      trigger();
    } finally {
      isLoadingSubmitInviteCode = false;
    }
  };

  $: queryDailyCheckin = createQuery({
    queryKey: [$userPublicAddress, "daily-checkin"],
    queryFn: () => handleGetDataDailyCheckin(),
    staleTime: Infinity,
    enabled: $userPublicAddress.length !== 0,
  });

  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
      localStorage.removeItem("ton_token");
      localStorage.removeItem("evm_token");
    },
  });

  $: {
    if (
      !$queryUserInfo.isError &&
      $queryUserInfo &&
      $queryUserInfo?.data !== undefined
    ) {
      totalCompletedQuests = $queryUserInfo?.data?.totalQuest;
    }
  }

  $: queryCampaignPartnerList = createQuery({
    queryKey: ["partners-campaign"],
    queryFn: () => getCampaignPartnerList(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$queryCampaignPartnerList.isError &&
      $queryCampaignPartnerList &&
      $queryCampaignPartnerList?.data !== undefined
    ) {
      partnersDataList = $queryCampaignPartnerList?.data;
    }
  }

  $: twitterUsername = socialData.find((item) => item.type === "twitter")?.name;
</script>

{#if partnerQuestId === ""}
  <div class="flex flex-col gap-10">
    <div class="flex xl:flex-row flex-col items-start justify-between gap-6">
      <div class="xl:w-max w-full flex flex-col gap-3">
        <div class="flex items-center gap-4">
          <div class="w-26 h-26 rounded-full overflow-hidden md:block hidden">
            <img src={User} alt="" class="object-cover w-full h-full" />
          </div>

          <div class="flex-1 flex flex-col gap-2">
            <div class="flex items-center gap-4">
              <div
                class="w-26 h-26 rounded-full overflow-hidden md:hidden block"
              >
                <img src={User} alt="" class="object-cover w-full h-full" />
              </div>
              <div class="flex-1 flex flex-col gap-1">
                <div class="text-xl font-medium">@{twitterUsername}</div>

                <ConnectSui />
              </div>
            </div>

            <form
              on:submit|preventDefault={onSubmitInviteCode}
              class="flex items-center gap-3"
            >
              <div
                class={`input-2 input-border xl:py-[4px] py-3 px-3 ${
                  code && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
                }`}
              >
                <input
                  type="text"
                  id="code"
                  name="code"
                  required
                  placeholder="Your Invite code"
                  bind:value={code}
                  class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal w-full ${
                    code && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
                  } ${
                    $isDarkMode
                      ? "text-white"
                      : "text-[#5E656B] placeholder-[#5E656B]"
                  }`}
                  on:change={(event) => {
                    code = event?.target?.value;
                  }}
                />
              </div>
              <div class="w-[120px]">
                <Button
                  type="submit"
                  isLoading={isLoadingSubmitInviteCode}
                  disabled={isLoadingSubmitInviteCode}
                >
                  <div class="uppercase">Verify</div>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="flex-1 flex xl:flex-row flex-col gap-4 w-full">
        <div
          class="flex-1 w-full flex flex-col gap-3 bg-[#1589EB] py-4 px-6 rounded-lg"
        >
          <div class="text-2xl font-medium text-white">My GM Points</div>
          <div class="text-4xl font-medium flex items-center gap-2 text-white">
            {#if $queryDailyCheckin.isFetching}
              <Loading />
            {:else}
              {$queryDailyCheckin?.data?.totalPoint || 0}
              <img src={goldImg} alt="" class="w-13" />
            {/if}
          </div>
        </div>

        <div
          class={`flex-1 w-full flex flex-col gap-3 py-4 px-6 rounded-lg border border_0000001a ${$isDarkMode ? "bg-[#000]" : "bg-[#fff]"}`}
        >
          <div
            class={`text-2xl font-medium ${$isDarkMode ? "text-[#ccc]" : "text-[#00000099]"}`}
          >
            Quests Completed
          </div>
          <div class="text-4xl font-medium flex items-center gap-2">
            {#if $queryUserInfo.isFetching}
              <Loading />
            {:else}
              {totalCompletedQuests}
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4">
        <div class="xl:title-3 title-2">Starter Quests</div>
        <div class="text-base text-gray-500">
          Complete all the tasks from Nimbus to collect more GM Points
        </div>
      </div>
      <StarterQuests />
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4">
        <div class="xl:title-3 title-2">Partners Quests</div>
        <div class="text-base text-gray-500">
          Explore all the tasks from our Partners for more GM Points
        </div>
      </div>
      <div class="flex flex-wrap gap-6">
        {#if $queryCampaignPartnerList.isFetching}
          <Loading />
        {:else}
          {#each partnersDataList as data}
            <PartnerQuestCard {data} {handleUpdatePartnerQuestsId} />
          {/each}
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div class="flex flex-col justify-end gap-6">
    <div class="flex justify-between gap-4">
      <div
        class="flex items-center gap-1 cursor-pointer w-max"
        on:click={() => {
          handleUpdatePartnerQuestsId("");
          window.history.replaceState(
            null,
            "",
            window.location.pathname + "?tab=quests"
          );
        }}
      >
        <img
          src={$isDarkMode ? LeftArrow : LeftArrowBlack}
          alt=""
          class="xl:w-5 xl:h-5 w-7 h-7"
        />
        <div class="xl:text-sm text-xl font-medium">Quests</div>
      </div>

      <a
        href="https://t.me/getnimbus"
        target="_blank"
        class="flex items-center gap-2 text-[#999999B2] cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path d="M0 0h24v24H0z" />
            <path
              fill="currentColor"
              d="M19 4c.852 0 1.297.986.783 1.623l-.076.084L15.915 9.5l3.792 3.793c.603.602.22 1.614-.593 1.701L19 15H6v6a1 1 0 0 1-.883.993L5 22a1 1 0 0 1-.993-.883L4 21V5a1 1 0 0 1 .883-.993L5 4h14z"
            />
          </g>
        </svg> Report issues
      </a>
    </div>

    <PartnerQuestDetail {partnersDataList} id={partnerQuestId} />
  </div>
{/if}

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

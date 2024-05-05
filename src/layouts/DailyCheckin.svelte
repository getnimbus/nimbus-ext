<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import Icon from "~/UI/Option/Icon.svelte";
  import TabQuests from "~/UI/DailyCheckin/TabQuests.svelte";
  import TabDailyCheckin from "~/UI/DailyCheckin/TabDailyCheckin.svelte";
  import TabLeaderBoard from "~/UI/DailyCheckin/TabLeaderBoard.svelte";
  import TabReward from "~/UI/DailyCheckin/TabReward.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import ConnectX from "~/components/SUI Campaign/ConnectX.svelte";
  import Button from "~/components/Button.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import wheelIcon from "~/assets/wheel-icon.svg";

  export let currentRoute;

  const listSideBar = [
    {
      label: i18n("checkinPage.tab-quests", "Quests"),
      value: "quests",
      type: "Quests",
    },
    {
      label: i18n("checkinPage.tab-daily-checkin", "Daily Check in"),
      value: "checkin",
      type: "Daily Checkin",
    },
    {
      label: i18n("checkinPage.tab-leaderboard", "Leaderboard"),
      value: "leaderboard",
      type: "Leaderboard",
    },
    {
      label: i18n("checkinPage.tab-rewards", "Rewards"),
      value: "rewards",
      type: "Rewards",
    },
  ];

  let activeTabValue = "checkin";
  let socialData = [];
  let isSkipToMainPage = false;
  let code = "";
  let isLoadingSubmitInviteCode = false;

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

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

  $: {
    browser.storage.onChanged.addListener((changes) => {
      if (changes?.options?.newValue?.lang) {
        window.location.reload();
      }
    });
  }

  onMount(() => {
    mixpanel.track("checkin_page");
    const urlParams = new URLSearchParams(window.location.search);
    const tabParams = urlParams.get("tab");
    if (tabParams) {
      activeTabValue = tabParams;
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?tab=${tabParams}`
      );
    } else {
      activeTabValue = "quests";
      window.history.replaceState(
        null,
        "",
        window.location.pathname + "?tab=quests"
      );
    }

    isSkipToMainPage = Boolean(
      localStorage.getItem("isSkipInviteCodeCampaign")
    );
  });

  const handleClick = (e, tabValue) => {
    e.preventDefault();
    activeTabValue = tabValue;
    window.history.replaceState(
      null,
      "",
      window.location.pathname + `?tab=${tabValue}`
    );
  };

  const getLinkData = async () => {
    const response: any = await nimbus.get("/accounts/link");
    return response;
  };

  $: queryLinkSocial = createQuery({
    queryKey: ["link-socials"],
    queryFn: () => getLinkData(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (!$queryLinkSocial.isError && $queryLinkSocial.data !== undefined) {
      socialData = $queryLinkSocial?.data?.data;
    }
  }

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
      localStorage.setItem("isSkipInviteCodeCampaign", "true");
      isSkipToMainPage = true;
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
</script>

<ErrorBoundary>
  <div class="relative z-9">
    {#if socialData && socialData.find((item) => item.type === "twitter")}
      {#if isSkipToMainPage}
        <div
          class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 grid xl:grid-cols-6 grid-cols-1 gap-6 relative z-2"
        >
          <div class="col-span-1">
            <div class="w-full flex flex-col gap-4">
              {#each listSideBar as item}
                <div
                  on:click={(e) => handleClick(e, item.value)}
                  class={`flex items-center gap-2 rounded-[10px] py-2 px-3 cursor-pointer transition-all ${
                    $isDarkMode
                      ? activeTabValue === item.value
                        ? "text-blue-500 bg-[#ffffff1c]"
                        : "text-white hover:bg-[#222222]"
                      : activeTabValue === item.value
                        ? "text-blue-500 bg-gray-200"
                        : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    type={item.type}
                    active={activeTabValue === item.value ? true : false}
                  />
                  <div class="xl:text-base text-lg">{item.label}</div>
                </div>
              {/each}
            </div>
          </div>
          <div class="xl:col-span-5 col-span-1">
            {#if activeTabValue === "quests"}
              <TabQuests {socialData} />
            {:else if activeTabValue === "checkin"}
              <TabDailyCheckin {currentRoute} />
            {:else if activeTabValue === "leaderboard"}
              <TabLeaderBoard />
            {:else if activeTabValue === "rewards"}
              <TabReward />
            {/if}
          </div>
        </div>
      {:else}
        <div class="h-screen flex items-center justify-center relative z-9">
          <div class="flex flex-col items-center justify-center">
            <div
              class="md:text-3xl text-lg font-medium flex items-center justify-center flex-wrap gap-2"
            >
              Use an invite code for <span class="flex items-center gap-1">
                <img src={goldImg} alt="" class="md:w-10 md:h-10 w-7 h-7" /> 1000
                GM Points</span
              >
            </div>
            <div
              class="flex flex-col gap-3 justify-center items-center mt-4 w-full"
            >
              <form
                on:submit|preventDefault={onSubmitInviteCode}
                class="flex items-center gap-3 w-full"
              >
                <div
                  class={`input-2 w-full input-border xl:py-[6px] py-3 px-3 ${
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
                    class={`p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal w-full ${
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
                    <div class="uppercase">Let's roll</div>
                  </Button>
                </div>
              </form>
              <div
                class="text-xs underline text-gray-500 uppercase cursor-pointer"
                on:click={() => {
                  localStorage.setItem("isSkipInviteCodeCampaign", "true");
                  isSkipToMainPage = true;
                }}
              >
                Or skip it
              </div>
            </div>
          </div>
        </div>
      {/if}
    {:else}
      <div class="h-screen flex items-center justify-center relative z-9">
        <ConnectX />
      </div>
    {/if}

    <div
      class="absolute xl:bottom-[-60px] bottom-[-40px] lg:left-[-120px] left-0 z-1"
    >
      <img src={wheelIcon} alt="" class="w-[70%] h-[70%] object-contain" />
    </div>
  </div>
</ErrorBoundary>

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

<style windi:preflights:global windi:safelist:global></style>

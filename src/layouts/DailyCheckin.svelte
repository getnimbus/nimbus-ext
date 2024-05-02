<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";

  import Icon from "~/UI/Option/Icon.svelte";
  import TabDailyCheckin from "~/UI/DailyCheckin/TabDailyCheckin.svelte";
  import TabLeaderBoard from "~/UI/DailyCheckin/TabLeaderBoard.svelte";
  import TabReward from "~/UI/DailyCheckin/TabReward.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import ConnectX from "~/components/SUI Campaign/ConnectX.svelte";

  export let currentRoute;

  const listSideBar = [
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
      activeTabValue = "checkin";
      window.history.replaceState(
        null,
        "",
        window.location.pathname + "?tab=checkin"
      );
    }
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
</script>

<ErrorBoundary>
  {#if socialData.find((item) => item.type === "twitter")}
    <div
      class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 grid xl:grid-cols-6 grid-cols-1 gap-6"
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
        {#if activeTabValue === "checkin"}
          <TabDailyCheckin {currentRoute} />
        {:else if activeTabValue === "leaderboard"}
          <TabLeaderBoard />
        {:else if activeTabValue === "rewards"}
          <TabReward />
        {/if}
      </div>
    </div>
  {:else}
    <div class="h-screen flex items-center justify-center">
      <ConnectX />
    </div>
  {/if}
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>

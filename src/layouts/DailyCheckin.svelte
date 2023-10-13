<script>
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import DailyCheckin from "~/UI/DailyCheckin/TabDailyCheckin.svelte";
  import LeaderBoard from "~/UI/DailyCheckin/TabLeaderBoard.svelte";
  import TabReward from "~/UI/DailyCheckin/TabReward.svelte";
  import SidebarTabs from "~/UI/Option/SidebarTabs.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode } from "~/store";

  const listSideBar = [
    {
      label: i18n("checkinPage.tab-daily-checkin", "Daily Checkin"),
      value: "daily-checkin",
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

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let activeTabValue = "daily-checkin";

  $: {
    browser.storage.onChanged.addListener((changes) => {
      if (changes?.options?.newValue?.lang) {
        window.location.reload();
      }
    });
  }

  onMount(() => {
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
      activeTabValue = "daily-checkin";
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?tab=daily-checkin`
      );
    }
  });
</script>

<ErrorBoundary>
  <Mixpanel>
    <div
      class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 grid xl:grid-cols-6 grid-cols-1 gap-6"
    >
      <div class="col-span-1">
        <SidebarTabs bind:activeTabValue {darkMode} {listSideBar} />
      </div>
      <div class="xl:col-span-5 col-span-1">
        {#if activeTabValue === "daily-checkin"}
          <div class="w-full flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <div class="xl:title-3 title-1 py-2">My Nimbus GM Points</div>
              <div class="xl:text-base text-xl text-gray-500">
                Collect GM Points and redeem them to exclusive rewards and
                special offers
              </div>
            </div>
            <DailyCheckin />
          </div>
        {:else if activeTabValue === "leaderboard"}
          <div class="w-full flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <div class="xl:title-3 title-1 py-2">Leaderboard</div>
              <div class="xl:text-base text-xl text-gray-500">
                Take a look at leaderboard to see how rank are you
              </div>
            </div>
            <LeaderBoard />
          </div>
        {:else if activeTabValue === "rewards"}
          <TabReward />
        {/if}
      </div>
    </div>
  </Mixpanel>
</ErrorBoundary>

<style></style>

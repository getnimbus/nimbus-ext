<script>
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode } from "~/store";

  import TabDailyCheckin from "~/UI/DailyCheckin/TabDailyCheckin.svelte";
  import TabLeaderBoard from "~/UI/DailyCheckin/TabLeaderBoard.svelte";
  import TabReward from "~/UI/DailyCheckin/TabReward.svelte";
  import SidebarTabs from "~/UI/Option/SidebarTabs.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";

  const listSideBar = [
    {
      label: i18n("checkinPage.tab-daily-checkin", "Daily Checkin"),
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
      activeTabValue = "checkin";
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?tab=checkin`
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
        <SidebarTabs bind:activeTabValue darkMode={$isDarkMode} {listSideBar} />
      </div>
      <div class="xl:col-span-5 col-span-1">
        {#if activeTabValue === "checkin"}
          <TabDailyCheckin />
        {:else if activeTabValue === "leaderboard"}
          <TabLeaderBoard />
        {:else if activeTabValue === "rewards"}
          <TabReward />
        {/if}
      </div>
    </div>
  </Mixpanel>
</ErrorBoundary>

<style></style>

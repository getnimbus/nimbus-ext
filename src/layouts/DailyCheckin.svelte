<script>
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import DailyCheckin from "~/UI/DailyCheckin/TabDailyCheckin.svelte";
  import LeaderBoard from "~/UI/DailyCheckin/TabLeaderBoard.svelte";
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
          <div class="w-full flex flex-col gap-10">
            <div class="flex flex-col gap-2 justify-center">
              <div class="xl:text-5xl text-7xl font-semibold">
                My Nimbus GM Points
              </div>
              <div class="xl:text-xl text-3xl">
                Collect Nimbus GM Points and redeem them for exclusive rewards
                and special offers
              </div>
            </div>
            <DailyCheckin />
          </div>
        {:else if activeTabValue === "leaderboard"}
          <div class="w-full flex flex-col gap-10">
            <div class="flex flex-col gap-2 justify-center">
              <div class="xl:text-5xl text-7xl font-semibold">Leaderboard</div>
            </div>
            <LeaderBoard />
          </div>
        {/if}
      </div>
    </div>
  </Mixpanel>
</ErrorBoundary>

<style></style>

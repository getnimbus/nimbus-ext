<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode, wallet, user, userPublicAddress } from "~/store";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";
  import { getListAddress, getUserInfo } from "~/lib/queryAPI";
  import { detectedGeneration } from "~/lib/chains";
  import { triggerToast } from "~/utils/functions";

  import Icon from "~/UI/Option/Icon.svelte";
  import TabLeaderBoard from "~/UI/DailyCheckin/TabLeaderBoard.svelte";
  import TabQuests from "~/UI/DailyCheckin/TabQuests.svelte";
  import TabDailyCheckin from "~/UI/DailyCheckin/TabDailyCheckin.svelte";
  import TabReward from "~/UI/DailyCheckin/TabReward.svelte";
  import TabFlipGmPoints from "~/UI/DailyCheckin/TabFlipGMPoints.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import ConnectX from "~/components/SUI Campaign/ConnectX.svelte";
  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";

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
      label: i18n("checkinPage.tab-leaderboard", "Flip GM Points"),
      value: "flip",
      type: "Flip GM Points",
    },
    // {
    //   label: i18n("checkinPage.tab-leaderboard", "Leaderboard"),
    //   value: "leaderboard",
    //   type: "Leaderboard",
    // },
    {
      label: i18n("checkinPage.tab-rewards", "Rewards"),
      value: "rewards",
      type: "Rewards",
    },
  ];

  const queryClient = useQueryClient();

  let activeTabValue = "checkin";
  let socialData = [];
  let isSkipToMainPage = false;
  let code = "";
  let isLoadingSubmitInviteCode = false;

  let partnerQuestId = "";

  $: {
    browser.storage.onChanged.addListener((changes) => {
      if (changes?.options?.newValue?.lang) {
        window.location.reload();
      }
    });
  }

  let listAddress = [];

  $: query = createQuery({
    queryKey: ["list-address"],
    queryFn: () => getListAddress(),
    staleTime: Infinity,
    retry: false,
    enabled: $user && Object.keys($user)?.length !== 0,
  });

  $: {
    if (
      !$query.isError &&
      $query.data !== undefined &&
      $query.data?.length !== 0
    ) {
      formatDataListAddress($query.data);
    }
  }

  const formatDataListAddress = async (data) => {
    listAddress = data?.map((item) => {
      return {
        id: item.id,
        type: item?.type,
        label: item.label,
        value: item?.type === "CEX" ? item.id : item.accountId,
        logo: item?.type === "CEX" ? item.logo : detectedGeneration(item?.type),
        accounts:
          item?.accounts?.map((account) => {
            return {
              id: account?.id,
              type: account?.type,
              label: account?.label,
              value: account?.type === "CEX" ? account?.id : account?.accountId,
              logo:
                account?.type === "CEX"
                  ? account?.logo
                  : detectedGeneration(account?.type),
            };
          }) || [],
      };
    });
  };

  const handleSetWallet = async () => {
    const selectedWalletRes = await browser.storage.sync.get("selectedWallet");
    if (
      selectedWalletRes?.selectedWallet !== null &&
      $user &&
      Object.keys($user).length !== 0
    ) {
      wallet.update((n) => (n = selectedWalletRes.selectedWallet));
    } else {
      if (listAddress && listAddress?.length !== 0) {
        wallet.update(
          (n) =>
            (n =
              listAddress?.find((item) => item.label === "Your wallets")
                ?.value || listAddress[0]?.value)
        );
      }
    }
  };

  onMount(() => {
    mixpanel.track("checkin_page");
    const urlParams = new URLSearchParams(window.location.search);
    const tabParams = urlParams.get("tab");
    const partnerId = urlParams.get("id");
    if (tabParams) {
      activeTabValue = tabParams;
      handleUpdateParamsPartnerSelected(tabParams, partnerId);
    } else {
      activeTabValue = "quests";
      handleUpdateParamsPartnerSelected("quests", partnerId);
    }

    isSkipToMainPage = Boolean(
      localStorage.getItem("isSkipInviteCodeCampaign")
    );

    handleSetWallet();
  });

  const handleUpdateParamsPartnerSelected = (tab, partnerId) => {
    if (partnerId) {
      partnerQuestId = partnerId;
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?tab=${tab}&id=${partnerId}`
      );
    } else {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?tab=${tab}`
      );
    }
  };

  const handleUpdatePartnerQuestsId = (id) => {
    partnerQuestId = id;
  };

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

  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
  });

  $: allowSuiCamp = $queryUserInfo.data?.suiCampAllowed || false;

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
    const formData = new FormData(e?.target);
    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    try {
      const response: any = await nimbus.post(
        "/v2/campaign/sui-unlock/invitation",
        {
          code: data.code,
        }
      );
      if (response?.error) {
        triggerToast(
          response?.error ||
            "Something wrong when submit your invitation code. Please try again!",
          "fail"
        );
        return;
      }

      queryClient?.invalidateQueries([$userPublicAddress, "daily-checkin"]);

      triggerToast("Successfully submit your invitation code!", "success");

      code = "";
      localStorage.setItem("isSkipInviteCodeCampaign", "true");
      isSkipToMainPage = true;
    } catch (e) {
      console.error(e);
      triggerToast(
        "Something wrong when submit your invitation code. Please try again!",
        "fail"
      );
    } finally {
      isLoadingSubmitInviteCode = false;
    }
  };

  const handleSelectTabFlip = () => {
    activeTabValue = "flip";
    window.history.replaceState(
      null,
      "",
      window.location.pathname + "?tab=flip"
    );
  };
</script>

<ErrorBoundary>
  <div class="xl:min-h-screen relative z-9">
    {#if socialData && socialData.find((item) => item?.type === "twitter")}
      {#if isSkipToMainPage || allowSuiCamp}
        <div
          class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 grid xl:grid-cols-6 grid-cols-1 gap-6 relative z-2"
        >
          <div class="col-span-1">
            <div class="w-full flex flex-col gap-4">
              {#each listSideBar || [] as item}
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
                    type={item?.type}
                    active={activeTabValue === item.value ? true : false}
                  />
                  <div class="xl:text-base text-lg">{item.label}</div>
                </div>
              {/each}
            </div>
          </div>
          <div class="xl:col-span-5 col-span-1">
            {#if activeTabValue === "quests"}
              <TabQuests
                {socialData}
                {partnerQuestId}
                {handleUpdatePartnerQuestsId}
              />
            {:else if activeTabValue === "checkin"}
              <TabDailyCheckin {currentRoute} {activeTabValue} />
              <!-- {:else if activeTabValue === "leaderboard"}
              <TabLeaderBoard /> -->
            {:else if activeTabValue === "rewards"}
              <TabReward {handleSelectTabFlip} />
            {:else if activeTabValue === "flip"}
              <TabFlipGmPoints />
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
                <div class="w-[120px] h-[40px]">
                  <Button
                    type="submit"
                    isLoading={isLoadingSubmitInviteCode}
                    disabled={isLoadingSubmitInviteCode}
                  >
                    <div class="uppercase">Let's roll</div>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      {/if}
    {:else}
      <div class="h-screen flex items-center justify-center relative z-9">
        {#if $queryLinkSocial.isFetching}
          <Loading />
        {:else}
          <ConnectX />
        {/if}
      </div>
    {/if}

    <div
      class="absolute xl:bottom-[-60px] bottom-[-40px] lg:left-[-120px] left-0 z-1"
    >
      <img src={wheelIcon} alt="" class="w-[70%] h-[70%] object-contain" />
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>

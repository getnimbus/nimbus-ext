<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import dayjs from "dayjs";
  import { wait } from "~/entries/background/utils";
  import { isDarkMode, user } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";
  import { i18n } from "~/lib/i18n";
  import { detectedGeneration } from "~/lib/chains";
  import mixpanel from "mixpanel-browser";

  import Tooltip from "~/components/Tooltip.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";
  import Copy from "~/components/Copy.svelte";

  import FollowWhale from "~/assets/whale-tracking.gif";
  import { onMount } from "svelte";

  const MultipleLang = {
    content: {
      address_header_table: i18n(
        "optionsPage.accounts-page-content.address-header-table",
        "Account"
      ),
      label_header_table: i18n(
        "optionsPage.accounts-page-content.label-header-table",
        "Label"
      ),
    },
  };

  const tokenIgnoreList = [
    {
      id: "$1",
      value: 5,
      content: "$1",
    },
    {
      id: "$5",
      value: 7,
      content: "$5",
    },
    {
      id: "$10",
      value: 10,
      content: "$10",
    },
  ];

  const percentList = [
    {
      id: "5%",
      value: 5,
      content: "5% Ratio",
    },
    {
      id: "7%",
      value: 7,
      content: "7% Ratio",
    },
    {
      id: "10%",
      value: 10,
      content: "10% Ratio",
    },
  ];

  const summaryList = [
    {
      id: "DAILY",
      value: "DAILY",
      content: "Daily",
    },
    {
      id: "WEEKLY",
      value: "WEEKLY",
      content: "Weekly",
    },
    {
      id: "MONTHLY",
      value: "MONTHLY",
      content: "Monthly",
    },
  ];

  let show = false;
  let counter = 3;
  let toastMsg = "";
  let isSuccess = false;

  let userConfigs;

  let percent = false;
  let summary = false;
  let transaction = false;
  let ignoreTokenValue = false;

  let filterSpamTrx = false;
  let selectedPercent = 0;
  let selectedSummary = "";
  let selectedTokenValueIgnore = 0;

  let isLoadingSave = false;

  let isOpenFollowWhaleModal = false;

  let isCopied = false;
  let timer = null;
  let syncMobileCode = "";

  let timeCountdown = 59;
  let timerCountdown;
  let loading = false;
  let isShowTooltipCopy = false;

  let checkAll = false;
  let listAddress = [];
  let blacklistAddress = [];

  const trigger = () => {
    show = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    show = false;
    toastMsg = "";
    isSuccess = false;
  };

  const getListAddress = async () => {
    const response: any = await nimbus.get("/accounts/list");
    return response?.data;
  };

  $: query = createQuery({
    queryKey: ["list-address"],
    queryFn: () => getListAddress(),
    staleTime: Infinity,
    retry: false,
    enabled: $user && Object.keys($user).length !== 0,
    onError(err) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (!$query.isError && $query.data !== undefined && blacklistAddress) {
      formatDataListAddress($query.data);
    }
  }

  onMount(() => {
    mixpanel.track("accounts_page");
  });

  const formatDataListAddress = (data) => {
    const structWalletData = data.map((item) => {
      return {
        position: item.position,
        id: item.id,
        type: item.type,
        label: item.label,
        logo: item.type === "CEX" ? item.logo : detectedGeneration(item.type),
        address: item.type === "CEX" ? item.id : item.accountId,
        accounts:
          item?.accounts?.map((account) => {
            return {
              id: account?.id,
              type: account?.type,
              label: account?.label,
              value: account?.type === "CEX" ? account?.id : account?.accountId,
              logo:
                account.type === "CEX"
                  ? account?.logo
                  : detectedGeneration(account?.type),
            };
          }) || [],
      };
    });

    listAddress = structWalletData;
    if (listAddress.length === blacklistAddress.length) {
      checkAll = true;
    }
  };

  const handleToggleCheckAll = (e) => {
    if (e.target.checked) {
      checkAll = true;
      blacklistAddress = listAddress.map((item) => item.address);
    } else {
      blacklistAddress = [];
      checkAll = false;
    }
  };

  $: {
    if (!transaction) {
      filterSpamTrx = false;
    }
    if (!percent) {
      selectedPercent = 0;
    }
    if (!summary) {
      selectedSummary = "";
    }
    if (!ignoreTokenValue) {
      selectedTokenValueIgnore = 0;
    }
  }

  const onSubmitSettingAlert = async () => {
    if (percent && selectedPercent === 0) {
      toastMsg =
        "Please select at least one price percent to receive notification";
      isSuccess = false;
      trigger();
      return;
    }

    if (summary && selectedSummary.length === 0) {
      toastMsg =
        "Please select at least one frequency of portfolio summary to receive notification";
      isSuccess = false;
      trigger();
      return;
    }

    if (ignoreTokenValue && selectedTokenValueIgnore === 0) {
      toastMsg =
        "Please select at least one value of portfolio summary to ignore";
      isSuccess = false;
      trigger();
      return;
    }

    const payload = {
      price: {
        enabled: percent,
        value: selectedPercent !== 0 ? selectedPercent : null,
        ignore: {
          enabled: ignoreTokenValue,
          value:
            selectedTokenValueIgnore !== 0 ? selectedTokenValueIgnore : null,
        },
      },
      portfolioSummary: {
        enabled: summary,
        value: selectedSummary.length !== 0 ? selectedSummary : null,
        blacklist: listAddress
          .map((item) => item.address)
          .filter((element) => !blacklistAddress.includes(element)),
      },
      transaction: {
        enabled: transaction,
        filterSpam: filterSpamTrx,
      },
    };

    isLoadingSave = true;
    try {
      const res = await nimbus.put("/users/configs/alert-settings", payload);
      if (res && res?.data) {
        handleSetState(res?.data);
        toastMsg = "Your settings have been successfully saved!";
        isSuccess = true;
      }
    } catch (e) {
      console.error(e);
      toastMsg =
        "There are some problem when save you settings. Please try again!";
      isSuccess = false;
    } finally {
      isLoadingSave = false;
      trigger();
    }
  };

  const cancelSaveSetting = () => {
    selectedPercent = Number(userConfigs.price_alert);
    selectedSummary = userConfigs.summary_setting_alert;
    transaction = userConfigs.transaction_alert;
    filterSpamTrx = userConfigs.filter_spam_tx_alert;
    selectedTokenValueIgnore = Number(userConfigs.token_value_ignore);
    blacklistAddress = userConfigs.backlist;
    if (userConfigs.token_value_ignore !== 0) {
      ignoreTokenValue = true;
    }
    if (userConfigs.price_alert !== 0) {
      percent = true;
    }
    if (userConfigs.summary_setting_alert !== null) {
      summary = true;
    }
  };

  const getUserConfigs = async () => {
    try {
      const res: any = await nimbus.get("/users/configs");
      if (res && res?.data) {
        handleSetState(res?.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetState = (data: any) => {
    const formatDataBlackList = listAddress
      .map((item) => item.address)
      .filter(
        (element) =>
          !data?.alertSettings?.portfolioSummary?.blacklist?.includes(element)
      );

    userConfigs = {
      filter_spam_tx_alert: data?.alertSettings?.transaction?.filterSpam,
      price_alert: Number(data?.alertSettings?.price?.value),
      token_value_ignore: Number(data?.alertSettings?.price?.ignore?.value),
      summary_setting_alert: data?.alertSettings?.portfolioSummary?.value,
      transaction_alert: data?.alertSettings?.transaction?.enabled,
      backlist: formatDataBlackList,
    };

    selectedPercent = Number(data?.alertSettings?.price?.value);
    selectedSummary = data?.alertSettings?.portfolioSummary?.value;
    transaction = data?.alertSettings?.transaction?.enabled;
    filterSpamTrx = data?.alertSettings?.transaction?.filterSpam;
    selectedTokenValueIgnore = data?.alertSettings?.price?.ignore?.value;
    blacklistAddress = formatDataBlackList;
    if (Number(data?.alertSettings?.price?.ignore?.value) !== 0) {
      ignoreTokenValue = true;
    }
    if (Number(data?.alertSettings?.price?.value) !== 0) {
      percent = true;
    }
    if (data?.alertSettings?.portfolioSummary?.value !== null) {
      summary = true;
    }
  };

  $: {
    if (!$query.isError && $query.data !== undefined) {
      getUserConfigs();
    }
  }

  const handleGetCodeSyncMobile = async () => {
    loading = true;
    try {
      const res = await nimbus.get("/users/cross-login");
      if (res?.data) {
        syncMobileCode = res?.data?.code;
        const expiredAt = dayjs.unix(res?.data?.expiredAt);
        const currentTime = dayjs();

        // Check if the time difference is more than 1 minute
        if (currentTime.diff(expiredAt, "second") > 60) {
          // Make another API call to get a new sync code
          const newResponse = await nimbus.get("/users/cross-login");
          if (newResponse) {
            syncMobileCode = res?.data?.code;
          }
        } else {
          // Schedule the next check after 1 minute
          timer = setTimeout(handleGetCodeSyncMobile, 60000);

          timerCountdown = setInterval(() => {
            timeCountdown -= 1;
            if (timeCountdown < 0) {
              timeCountdown = 59;
              clearInterval(timerCountdown);
            }
          }, 1000);
        }
      }
    } catch (e) {
      syncMobileCode = undefined;
      timeCountdown = 59;
      clearTimeout(timer);
      clearInterval(timerCountdown);
      console.error("error: ", e);
    } finally {
      loading = false;
    }
  };
</script>

<div class="flex flex-col gap-4">
  <div
    class="flex justify-between items-end border-b-[1.5px] border_0000000d pb-4"
  >
    <div class="flex flex-col gap-1">
      <div class="xl:title-3 title-1">Alert Settings</div>
      <div class="xl:text-base text-xl text-gray-500">
        Management your setup alerts
      </div>
    </div>
    <div
      class="xl:text-base text-xl text-blue-500 cursor-pointer hover:underline"
      on:click={() => {
        isOpenFollowWhaleModal = true;
        handleGetCodeSyncMobile();
        window.open(
          `https://t.me/GetNimbusBot?start=${syncMobileCode}`,
          "_blank"
        );
      }}
    >
      How to start alerts on Telegram?
    </div>
  </div>
  <form
    on:submit|preventDefault={onSubmitSettingAlert}
    class="flex flex-col gap-8"
  >
    <!-- <div class="border-b-[1px] border_0000000d pb-8 flex flex-col gap-4">
      <div class="xl:title-4 title-2">Token holding alerts</div>
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-3">
          <div class="flex justify-between items-center gap-6">
            <div class="flex flex-col">
              <div class="xl:text-base text-2xl">Price change notification</div>
              <div class="xl:text-sm text-xl text-gray-400">
                Receive notification whenever your price percent change
              </div>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                checked={percent}
                on:click={() => {
                  percent = !percent;
                }}
              />
              <span class="slider" />
            </label>
          </div>
          <div class="flex flex-col gap-3">
            {#each percentList as item}
              <label
                class="flex items-center xl:gap-2 gap-6 cursor-pointer w-max"
              >
                <input
                  type="radio"
                  disabled={!percent}
                  name={item.id}
                  id={item.id}
                  value={item.value}
                  bind:group={selectedPercent}
                  class={`cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-full border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] ${
                    percent ? "" : "bg-gray-200 border-gray-200"
                  }`}
                />
                <div class="xl:text-sm text-2xl font-normal cursor-pointer">
                  {item.content}
                </div>
              </label>
            {/each}
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex justify-between items-center gap-6">
            <div class="flex flex-col">
              <div class="xl:text-base text-2xl">Token holding ignore</div>
              <div class="xl:text-sm text-xl text-gray-400">
                Ignore token holding is less than some value
              </div>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                checked={ignoreTokenValue}
                on:click={() => {
                  ignoreTokenValue = !ignoreTokenValue;
                }}
              />
              <span class="slider" />
            </label>
          </div>
          <div class="flex flex-col gap-3">
            {#each tokenIgnoreList as item}
              <label
                class="flex items-center xl:gap-2 gap-6 cursor-pointer w-max"
              >
                <input
                  type="radio"
                  disabled={!ignoreTokenValue}
                  name={item.id}
                  id={item.id}
                  value={item.value}
                  bind:group={selectedTokenValueIgnore}
                  class={`cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-full border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] ${
                    ignoreTokenValue ? "" : "bg-gray-200 border-gray-200"
                  }`}
                />
                <div class="xl:text-sm text-2xl font-normal cursor-pointer">
                  {item.content}
                </div>
              </label>
            {/each}
          </div>
        </div>
      </div>
    </div> -->

    <div class="flex flex-col gap-4">
      <div class="xl:title-4 title-2">Portfolio summary alerts</div>
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-center gap-6">
            <div class="flex flex-col">
              <div class="xl:text-base text-2xl">
                Frequency of portfolio summary notification
              </div>
              <div class="xl:text-sm text-xl text-gray-400">
                Receive portfolio summary every daily, weekly or monthly
              </div>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                checked={summary}
                on:click={() => {
                  summary = !summary;
                }}
              />
              <span class="slider" />
            </label>
          </div>
          <div class="flex flex-col gap-3">
            {#each summaryList as item}
              <div
                class="flex items-center xl:gap-2 gap-6 cursor-pointer w-max"
              >
                <input
                  type="radio"
                  disabled={!summary}
                  name={item.id}
                  id={item.id}
                  value={item.value}
                  class={`cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-full border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] ${
                    summary ? "" : "bg-gray-200 border-gray-200"
                  }`}
                  bind:group={selectedSummary}
                />
                <label
                  for={item.id}
                  class="xl:text-sm text-2xl font-normal cursor-pointer"
                >
                  {item.content}
                </label>
              </div>
            {/each}
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col">
            <div class="xl:text-base text-2xl">
              Custom portfolio summary notification
            </div>
            <div class="xl:text-sm text-xl text-gray-400">
              Select portfolio you want to receive notification
            </div>
          </div>
          <div class={`${$query.isLoading ? "h-[400px]" : ""}`}>
            <div
              class={`border border_0000000d rounded-[10px] xl:overflow-hidden overflow-x-auto h-full ${
                $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
              }`}
            >
              <table class="table-auto xl:w-full w-[1800px] h-full">
                <thead>
                  <tr class="bg_f4f5f8">
                    <th class="flex items-center justify-start gap-6 py-3 pl-3">
                      <input
                        type="checkbox"
                        on:change={handleToggleCheckAll}
                        bind:checked={checkAll}
                        class="cursor-pointer relative w-5 h-5 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                      />
                      <div class="text-xl font-semibold uppercase xl:text-xs">
                        {MultipleLang.content.label_header_table}
                      </div>
                    </th>
                    <th class="py-3 pr-3">
                      <div
                        class="text-xl font-semibold text-left uppercase xl:text-xs"
                      >
                        {MultipleLang.content.address_header_table}
                      </div>
                    </th>
                  </tr>
                </thead>
                {#if $query.isLoading}
                  <tbody>
                    <tr>
                      <td colspan="2">
                        <div
                          class="flex items-center justify-center h-full px-3 py-4"
                        >
                          <Loading />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                {:else}
                  <tbody>
                    {#if listAddress && listAddress.length === 0}
                      <tr>
                        <td colspan="2">
                          <div
                            class="flex items-center justify-center h-full px-3 py-4"
                          >
                            No address
                          </div>
                        </td>
                      </tr>
                    {:else}
                      {#each listAddress as item (item.id)}
                        <tr class="transition-all group">
                          <td
                            class={`pl-3 py-3 ${
                              $isDarkMode
                                ? "group-hover:bg-[#000]"
                                : "group-hover:bg-gray-100"
                            }`}
                          >
                            <div
                              class="flex items-center gap-6 text-2xl text-left xl:text-base"
                            >
                              <div class="flex justify-center">
                                <input
                                  type="checkbox"
                                  value={item.address}
                                  bind:group={blacklistAddress}
                                  class="cursor-pointer relative w-5 h-5 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                                />
                              </div>
                              <div class="flex items-center gap-2">
                                <img
                                  src={item.logo}
                                  alt=""
                                  class="w-5 h-5 xl:w-4 xl:h-4 rounded-full"
                                />
                                {item.label}
                              </div>
                            </div>
                          </td>

                          <td
                            class={`py-3  ${
                              $isDarkMode
                                ? "group-hover:bg-[#000]"
                                : "group-hover:bg-gray-100"
                            }`}
                          >
                            <div
                              class="bg-[#6AC7F533] text_27326F w-max px-3 py-1 rounded-[5px] xl:text-base text-2xl"
                            >
                              <Copy
                                address={item.address}
                                iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                                color={`${$isDarkMode ? "#fff" : "#000"}`}
                              />
                            </div>
                          </td>
                        </tr>
                      {/each}
                    {/if}
                  </tbody>
                {/if}
              </table>
            </div>
          </div>
        </div>

        <!-- <div class="flex flex-col gap-4">
          <div class="flex justify-between items-center gap-6">
            <div class="flex flex-col">
              <div class="xl:text-base text-2xl">Transaction notification</div>
              <div class="xl:text-sm text-xl text-gray-400">
                Receive notification whenever you have transaction
              </div>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                checked={transaction}
                on:click={() => {
                  transaction = !transaction;
                }}
              />
              <span class="slider" />
            </label>
          </div>
          <div class="flex items-center gap-2">
            <div class="xl:text-sm text-2xl font-normal">
              Filter spam transaction
            </div>
            <label class="switch">
              <input
                type="checkbox"
                disabled={!transaction}
                checked={filterSpamTrx}
                on:click={() => {
                  filterSpamTrx = !filterSpamTrx;
                }}
              />
              <span class="slider" />
            </label>
          </div>
        </div> -->
      </div>
    </div>

    <div class="flex justify-start gap-6 lg:gap-2 mt-6">
      <div class="w-[120px]">
        <Button variant="secondary" on:click={cancelSaveSetting}>Cancel</Button>
      </div>
      <div class="w-[120px]">
        <Button type="submit" variant="tertiary" isLoading={isLoadingSave}>
          Save
        </Button>
      </div>
    </div>
  </form>
</div>

{#if show}
  <div class="fixed z-50 w-full top-3 right-3" style="z-index: 2147483648;">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccess ? "green" : "red"}
      bind:open={show}
    >
      <svelte:fragment slot="icon">
        {#if isSuccess}
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

<AppOverlay
  clickOutSideToClose
  isOpen={isOpenFollowWhaleModal}
  on:close={() => {
    isOpenFollowWhaleModal = false;
    timeCountdown = 59;
    clearTimeout(timer);
    clearInterval(timerCountdown);
  }}
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <div class="xl:text-base text-2xl">
        Go to <a
          href="https://t.me/GetNimbusBot"
          target="_blank"
          class="text-blue-500 cursor-pointer hover:underline"
          >https://t.me/GetNimbusBot</a
        >
      </div>
      <div class="xl:text-base text-2xl">Use the command as follow video</div>
    </div>
    <div class="xl:h-[350px] h-[650px]">
      <img src={FollowWhale} alt="" class="w-full h-full object-contain" />
    </div>
    <div class="flex flex-col items-center gap-2">
      <div class="w-[57%]">
        <CopyToClipboard
          text={`/start ${syncMobileCode}`}
          let:copy
          on:copy={async () => {
            isCopied = true;
            await wait(1000);
            isCopied = false;
          }}
        >
          <div class="flex items-center gap-2">
            <div class="flex-1 border rounded-lg py-2 px-3 text-base">
              {#if loading}
                -
              {:else}
                /start {syncMobileCode}
              {/if}
            </div>
            <div
              class="cursor-pointer border w-max p-2 rounded-lg relative"
              on:mouseover={() => {
                isShowTooltipCopy = true;
              }}
              on:mouseleave={() => (isShowTooltipCopy = false)}
              on:click={copy}
            >
              {#if isCopied}
                <svg
                  width={21}
                  height={21}
                  id="Layer_1"
                  data-name="Layer 1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 122.88 74.46"
                  fill={$isDarkMode ? "#fff" : "#000"}
                  ><path
                    fill-rule="evenodd"
                    d="M1.87,47.2a6.33,6.33,0,1,1,8.92-9c8.88,8.85,17.53,17.66,26.53,26.45l-3.76,4.45-.35.37a6.33,6.33,0,0,1-8.95,0L1.87,47.2ZM30,43.55a6.33,6.33,0,1,1,8.82-9.07l25,24.38L111.64,2.29c5.37-6.35,15,1.84,9.66,8.18L69.07,72.22l-.3.33a6.33,6.33,0,0,1-8.95.12L30,43.55Zm28.76-4.21-.31.33-9.07-8.85L71.67,4.42c5.37-6.35,15,1.83,9.67,8.18L58.74,39.34Z"
                  /></svg
                >
              {:else}
                <svg
                  width={21}
                  height={21}
                  viewBox="0 0 12 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.1875 3.3125H10.6875V10.1875H3.8125V7.6875"
                    stroke={$isDarkMode ? "#fff" : "#000"}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8.1875 0.8125H1.3125V7.6875H8.1875V0.8125Z"
                    stroke={$isDarkMode ? "#fff" : "#000"}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {/if}
              {#if isShowTooltipCopy}
                <div
                  class="absolute left-1/2 transform -translate-x-1/2 -top-8"
                  style="z-index: 2147483648;"
                >
                  <Tooltip text="Copy command" />
                </div>
              {/if}
            </div>
          </div>
        </CopyToClipboard>
      </div>
      <div class="xl:text-sm text-base">
        The code is expired in {timeCountdown}s
      </div>
    </div>
  </div>
</AppOverlay>

<style windi:preflights:global windi:safelist:global>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }

  :global(body) .bg_f4f5f8 {
    background: #f4f5f8;
  }
  :global(body.dark) .bg_f4f5f8 {
    background: #131313;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 34px;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }
  input:checked + .slider {
    background-color: #2196f3;
  }
  input:checked + .slider {
    box-shadow: 0 0 1px #2196f3;
  }
  input:checked + .slider:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
  }

  @media screen and (max-width: 1280px) {
    .switch {
      width: 60px;
      height: 30px;
    }

    .slider {
      border-radius: 44px;
    }

    .slider:before {
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 2px;
    }

    input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
  }
</style>

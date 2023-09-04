<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import {
    wallet,
    chain,
    typeWallet,
    user,
    isFirstTimeLogin,
    selectedPackage,
    isDarkMode,
  } from "~/store";
  import { i18n } from "~/lib/i18n";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import {
    chainList,
    getAddressContext,
    listLogoCEX,
    listProviderCEX,
    clickOutside,
  } from "~/utils";
  import mixpanel from "mixpanel-browser";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { nimbus } from "~/lib/network";
  import { Toast, Avatar } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import Vezgo from "vezgo-sdk-js/dist/vezgo.es5.js";
  import { useNavigate } from "svelte-navigator";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import { wait } from "~/entries/background/utils";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  export let type: "portfolio" | "order" = "portfolio";
  export let title;

  import "~/components/Loading.custom.svelte";
  import Button from "~/components/Button.svelte";
  import Select from "~/components/Select.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Copy from "~/components/Copy.svelte";

  import Plus from "~/assets/plus.svg";
  import PlusBlack from "~/assets/plus-black.svg";
  import All from "~/assets/all.svg";
  import BitcoinLogo from "~/assets/bitcoin.png";
  import SolanaLogo from "~/assets/solana.png";
  import FollowWhale from "~/assets/whale-tracking.gif";
  import Success from "~/assets/shield-done.svg";
  import Bundles from "~/assets/bundles.png";

  const MultipleLang = {
    empty_wallet: i18n("newtabPage.empty-wallet", "No account added yet."),
    addwallet: i18n(
      "newtabPage.addwallet",
      "Add your account to keep track of your investments."
    ),
    content: {
      btn_text: i18n(
        "optionsPage.accounts-page-content.address-btn-text",
        "Add Wallet"
      ),
      modal_cancel: i18n(
        "optionsPage.accounts-page-content.modal-cancel",
        "Cancel"
      ),
      modal_add: i18n(
        "optionsPage.accounts-page-content.modal-add-wallet",
        "Add"
      ),
      modal_address_label: i18n(
        "optionsPage.accounts-page-content.modal-address-label",
        "Wallet"
      ),
      modal_label_label: i18n(
        "optionsPage.accounts-page-content.modal-label-label",
        "Label"
      ),
      modal_add_title: i18n(
        "optionsPage.accounts-page-content.modal-add-title",
        "Add your account"
      ),
      modal_add_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-add-sub-title",
        "Add your account will give you more option to see the information at page new tab"
      ),
      address_required: i18n(
        "optionsPage.accounts-page-content.address-required",
        "Account is required"
      ),
      label_required: i18n(
        "optionsPage.accounts-page-content.label-required",
        "Label is required"
      ),
      re_input_address: i18n(
        "optionsPage.accounts-page-content.re-input-address",
        "Please enter your account again!"
      ),
      duplicate_address: i18n(
        "optionsPage.accounts-page-content.duplicate-address",
        "This account is duplicated!"
      ),
    },
  };

  const navigate = useNavigate();

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let checkFirstTimeLogin = false;
  isFirstTimeLogin.subscribe((value) => {
    checkFirstTimeLogin = value;
  });

  let packageSelected = "";
  selectedPackage.subscribe((value) => {
    packageSelected = value;
  });

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

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  let showFollowTooltip = false;
  let showCommandTooltip = false;
  let showDisableAddWallet = false;
  let listAddress = [];
  let address = "";
  let label = "";
  let errors: any = {};
  let isOpenAddModal = false;
  let isOpenFollowWhaleModal = false;
  let isOpenModal = false;
  let isLoadingSendMail = false;
  let email = "";
  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;
  let container;
  let isLoadingConnectCEX = false;

  let isDisabled = false;
  let tooltipDisableAddBtn = "";
  let selectBundle;
  let showPopover = false;

  const isRequiredFieldValid = (value) => {
    return value != null && value !== "";
  };

  const validateForm = (data) => {
    const isDuplicatedAddress = listAddress.some((item) => {
      return item.value.toLowerCase() === data.address.toLowerCase();
    });

    if (!isRequiredFieldValid(data.address)) {
      errors["address"] = {
        ...errors["address"],
        required: true,
        msg: MultipleLang.content.address_required,
      };
    } else {
      if (data.address && !getAddressContext(data.address)) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: MultipleLang.content.re_input_address,
        };
        return;
      } else if (isDuplicatedAddress) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: MultipleLang.content.duplicate_address,
        };
        return;
      } else {
        errors["address"] = { ...errors["address"], required: false };
      }
    }

    if (!isRequiredFieldValid(data.label)) {
      errors["label"] = {
        ...errors["label"],
        required: true,
        msg: MultipleLang.content.label_required,
      };
    } else {
      errors["label"] = { ...errors["label"], required: false };
    }
  };

  const getListAddress = async () => {
    const response: any = await nimbus.get("/accounts/list");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  const queryClient = useQueryClient();
  const query = createQuery({
    queryKey: ["list-address"],
    queryFn: () => getListAddress(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
      formatListAddress = [];
      selectedWallet = "";
    },
    enabled: selectedWallet !== "0xc02ad7b9a9121fc849196e844dc869d2250df3a6",
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      formatDataListAddress($query.data);
    }
  }

  const formatDataListAddress = async (data) => {
    const structWalletData = data.map((item) => {
      return {
        id: item.id,
        type: item.type,
        label: item.label,
        value: item.type === "CEX" ? item.id : item.accountId,
        logo: item.logo,
        accounts:
          item?.accounts?.map((item) => {
            let logo = All;
            if (
              getAddressContext(
                item?.type === "CEX" ? item.id : item?.accountId
              )?.type === "BTC"
            ) {
              logo = BitcoinLogo;
            }
            if (
              getAddressContext(
                item?.type === "CEX" ? item.id : item?.accountId
              )?.type === "SOL"
            ) {
              logo = SolanaLogo;
            }
            if (item?.type === "BUNDLE") {
              logo = Bundles;
            }
            return {
              id: item?.id,
              type: item?.type,
              label: item?.label,
              value: item?.type === "CEX" ? item?.id : item?.accountId,
              logo:
                item?.type === "BUNDLE" || item?.type === "DEX"
                  ? logo
                  : item?.logo,
            };
          }) || [],
      };
    });

    listAddress = structWalletData;

    const selectedTypeWalletRes = await browser.storage.sync.get(
      "typeWalletAddress"
    );
    if (selectedTypeWalletRes?.typeWalletAddress !== null) {
      typeWallet.update((n) => (n = selectedTypeWalletRes.typeWalletAddress));
    } else {
      typeWallet.update((n) => (n = listAddress[0]?.type));
    }

    const selectedChainRes = await browser.storage.sync.get("selectedChain");
    if (selectedChainRes?.selectedChain !== null) {
      chain.update((n) => (n = selectedChainRes.selectedChain));
    } else {
      chain.update((n) => (n = "ALL"));
    }

    const selectedWalletRes = await browser.storage.sync.get("selectedWallet");
    if (selectedWalletRes?.selectedWallet !== null) {
      if (selectedWalletRes?.selectedWallet?.length !== 0) {
        wallet.update((n) => (n = selectedWalletRes.selectedWallet));
      }
      if (
        selectedWalletRes?.selectedWallet?.length === 0 &&
        listAddress.length !== 0 &&
        listAddress.length === 1
      ) {
        wallet.update((n) => (n = listAddress[0].value));
      }
    } else {
      wallet.update((n) => (n = listAddress[0].value));
    }

    updateStateFromParams();
  };

  const updateStateFromParams = async () => {
    await wait(1000);

    const urlParams = new URLSearchParams(window.location.search);
    const addressParams = urlParams.get("address");
    const chainParams = urlParams.get("chain");
    const typeParams = urlParams.get("type");

    // reset all global state if list address is empty
    if (!chainParams && listAddress.length === 0) {
      chain.update((n) => (n = ""));
    }
    if (!addressParams && listAddress.length === 0) {
      wallet.update((n) => (n = ""));
    }
    if (!typeParams && listAddress.length === 0) {
      typeWallet.update((n) => (n = ""));
    }

    // update global chain state
    if (chainParams) {
      chain.update((n) => (n = chainParams));
    }

    // update global address state
    if (addressParams) {
      wallet.update((n) => (n = addressParams));
    }

    // update global type wallet state
    if (typeParams) {
      typeWallet.update((n) => (n = typeParams));
    }

    // check type address and handle logic update global state
    if (typeParams === "CEX") {
      if (window.location.pathname === "/transactions") {
        chain.update((n) => (n = "ETH"));
      } else {
        chain.update((n) => (n = "ALL"));
      }
      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          `?type=${typeWalletAddress}&address=${selectedWallet}`
      );
    }

    if (typeParams === "DEX") {
      // if list address is empty and no chain params and have address param (btc address when search)
      if (!chainParams && listAddress.length === 0 && addressParams) {
        if (window.location.pathname === "/transactions") {
          chain.update((n) => (n = "ETH"));
        } else {
          chain.update((n) => (n = "ALL"));
        }

        if (
          getAddressContext(selectedWallet)?.type === "BTC" ||
          getAddressContext(selectedWallet)?.type === "SOL"
        ) {
          window.history.replaceState(
            null,
            "",
            window.location.pathname +
              `?type=${typeWalletAddress}&address=${selectedWallet}`
          );
        }
      }

      // if no chain params and list address is not empty
      if (!chainParams && listAddress.length !== 0) {
        if (getAddressContext(selectedWallet)?.type === "EVM") {
          if (window.location.pathname === "/transactions") {
            chain.update((n) => (n = "ETH"));
          } else {
            chain.update((n) => (n = "ALL"));
          }
        }
        if (
          getAddressContext(selectedWallet)?.type === "BTC" ||
          getAddressContext(selectedWallet)?.type === "SOL"
        ) {
          window.history.replaceState(
            null,
            "",
            window.location.pathname +
              `?type=${typeWalletAddress}&address=${selectedWallet}`
          );
        }
      }
    }
  };

  // Add DEX address account
  const onSubmit = async (e) => {
    try {
      const formData = new FormData(e.target);

      const data: any = {};
      for (let field of formData) {
        const [key, value] = field;
        data[key] = value;
      }

      validateForm(data);

      if (
        !Object.keys(errors).some((inputName) => errors[inputName]["required"])
      ) {
        const dataFormat = {
          id: data.address,
          label: data.label,
          value: data.address,
        };

        await nimbus.post("/accounts", {
          type: "DEX",
          publicAddress: dataFormat.value,
          accountId: dataFormat.value,
          label: dataFormat.label,
        });

        queryClient.invalidateQueries(["list-address"]);
        chain.update((n) => (n = "ALL"));
        wallet.update((n) => (n = dataFormat.value));
        typeWallet.update((n) => (n = "DEX"));

        e.target.reset();
        errors = {};
        isOpenAddModal = false;

        toastMsg = "Successfully add On-Chain account!";
        isSuccessToast = true;
        trigger();
        mixpanel.track("user_add_address");

        errors["address"] = { ...errors["address"], required: false, msg: "" };
        errors["label"] = { ...errors["label"], required: false, msg: "" };
      } else {
        console.error("Invalid Form");
      }
    } catch (e) {
      console.error(e);
      toastMsg = "Something wrong when add DEX account. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };

  // Add CEX address account
  const onSubmitCEX = () => {
    const evmToken = localStorage.getItem("evm_token");
    if (evmToken) {
      isLoadingConnectCEX = true;
      const vezgo: any = Vezgo.init({
        clientId: "6st9c6s816su37qe8ld1d5iiq2",
        authEndpoint: "https://api.getnimbus.io/auth/vezgo",
        auth: {
          headers: { Authorization: `${evmToken}` },
        },
      });
      const userVezgo = vezgo.login();
      if (userVezgo) {
        userVezgo
          .connect({
            providers: listProviderCEX,
          })
          .onConnection(async function (account) {
            await nimbus.get("/accounts/sync");

            queryClient.invalidateQueries(["list-address"]);

            await wait(1000);

            if (
              formatListAddress[formatListAddress.length - 1]?.type === "CEX"
            ) {
              chain.update((n) => (n = "ALL"));
              wallet.update(
                (n) => (n = formatListAddress[formatListAddress.length - 1]?.id)
              );
              typeWallet.update((n) => (n = "CEX"));
            }

            await wait(300);

            queryClient.invalidateQueries(["list-address"]);

            isLoadingConnectCEX = false;
            isOpenAddModal = false;

            toastMsg = "Successfully add CEX account!";
            isSuccessToast = true;
            trigger();
            mixpanel.track("user_add_address");
          })
          .onError(function (error) {
            console.error("connection vezgo error", error);
            queryClient.invalidateQueries(["list-address"]);
            isLoadingConnectCEX = false;
            isOpenAddModal = false;
            toastMsg =
              "Something wrong when add CEX account. Please try again!";
            isSuccessToast = false;
            trigger();
          });
      }
    }
  };

  // Handle get user email
  const onSubmitGetEmail = async (e) => {
    isLoadingSendMail = true;
    const formData = new FormData(e.target);
    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    try {
      await nimbus.post("/subscription/analysis", {
        email: data.email,
        address: selectedWallet,
      });
      isLoadingSendMail = false;
      localStorage.setItem("isGetUserEmailYet", "true");
      toastMsg = "Ready to receive exclusive benefits soon!";
      isSuccessToast = true;
      trigger();
    } catch (e) {
      isLoadingSendMail = false;
      toastMsg = "Something wrong when sending email. Please try again!";
      isSuccessToast = false;
      trigger();
    } finally {
      isOpenModal = false;
    }
  };

  onMount(() => {
    if (
      localStorage.getItem("isGetUserEmailYet") !== null &&
      localStorage.getItem("isGetUserEmailYet") === "true"
    ) {
      return;
    }
    localStorage.setItem("isGetUserEmailYet", "false");
  });

  $: formatListAddress = listAddress.map((item) => {
    let logo = All;
    if (getAddressContext(item.value)?.type === "BTC") {
      logo = BitcoinLogo;
    }
    if (getAddressContext(item.value)?.type === "SOL") {
      logo = SolanaLogo;
    }
    if (item.type === "BUNDLE") {
      logo = Bundles;
    }
    return {
      ...item,
      logo: item.type === "BUNDLE" || item.type === "DEX" ? logo : item.logo,
    };
  });

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        browser.storage.sync
          .set({ selectedWallet: selectedWallet })
          .then(() => {
            console.log("save selected address to sync storage");
          });

        browser.storage.sync.set({ selectedChain: selectedChain }).then(() => {
          console.log("save selected chain to sync storage");
        });

        if (selectedWallet === "0xc02ad7b9a9121fc849196e844dc869d2250df3a6") {
          window.history.replaceState(
            null,
            "",
            window.location.pathname +
              `?type=CEX&chain=${selectedChain}&address=${selectedWallet}`
          );
        } else {
          const selected = formatListAddress.find((item) => {
            return item.value === selectedWallet;
          });

          if (
            selected &&
            Object.keys(selected).length !== 0 &&
            selected.type === "CEX"
          ) {
            typeWallet.update((n) => (n = "CEX"));
            browser.storage.sync.set({ typeWalletAddress: "CEX" }).then(() => {
              console.log("save selected type wallet to sync storage");
            });
            window.history.replaceState(
              null,
              "",
              window.location.pathname +
                `?type=${typeWalletAddress}&address=${selectedWallet}`
            );
            if (selectedChain) {
              chain.update((n) => (n = selectedChain));
            } else {
              chain.update((n) => (n = "ALL"));
            }
          }

          if (
            selected &&
            Object.keys(selected).length !== 0 &&
            selected.type === "BUNDLE"
          ) {
            window.history.replaceState(
              null,
              "",
              window.location.pathname +
                `?type=${typeWalletAddress}&address=${selectedWallet}`
            );
            if (selectedChain) {
              chain.update((n) => (n = selectedChain));
            } else {
              chain.update((n) => (n = "ALL"));
            }
          }

          if (
            selected &&
            Object.keys(selected).length !== 0 &&
            selected.type === "DEX"
          ) {
            typeWallet.update((n) => (n = "DEX"));
            browser.storage.sync.set({ typeWalletAddress: "DEX" }).then(() => {
              console.log("save selected type wallet to sync storage");
            });
            if (getAddressContext(selectedWallet)?.type === "EVM") {
              window.history.replaceState(
                null,
                "",
                window.location.pathname +
                  `?type=${typeWalletAddress}&chain=${selectedChain}&address=${selectedWallet}`
              );
            }

            if (
              getAddressContext(selectedWallet)?.type === "BTC" ||
              getAddressContext(selectedWallet)?.type === "SOL"
            ) {
              window.history.replaceState(
                null,
                "",
                window.location.pathname +
                  `?type=${typeWalletAddress}&address=${selectedWallet}`
              );
              if (selectedChain) {
                chain.update((n) => (n = selectedChain));
              } else {
                chain.update((n) => (n = "ALL"));
              }
            }
          }
        }
      }
    }
  }

  $: {
    if (checkFirstTimeLogin) {
      queryClient.invalidateQueries(["list-address"]);
    }
  }

  $: {
    if (
      address &&
      errors.address &&
      errors.address.msg === MultipleLang.content.address_required
    ) {
      errors["address"] = { ...errors["address"], required: false, msg: "" };
    }
    if (
      label &&
      errors.label &&
      errors.label.msg === MultipleLang.content.label_required
    ) {
      errors["label"] = { ...errors["label"], required: false, msg: "" };
    }
  }

  $: {
    if (listAddress?.length === 3 && packageSelected === "FREE") {
      isDisabled = true;
    }
    if (listAddress?.length === 7 && packageSelected === "EXPLORER") {
      if (
        localStorage.getItem("isGetUserEmailYet") !== null &&
        localStorage.getItem("isGetUserEmailYet") === "false"
      ) {
        localStorage.setItem("isGetUserEmailYet", "true");
      }
      isDisabled = true;
    }
    if (packageSelected === "PROFESSIONAL") {
      if (
        localStorage.getItem("isGetUserEmailYet") !== null &&
        localStorage.getItem("isGetUserEmailYet") === "false"
      ) {
        localStorage.setItem("isGetUserEmailYet", "true");
      }
    }
  }

  $: {
    if (Object.keys(userInfo).length === 0) {
      tooltipDisableAddBtn = "Connect wallet to add account";
    }
    if (isDisabled) {
      if (packageSelected === "FREE") {
        tooltipDisableAddBtn =
          "Get the EXPLORER Plan to be able to add more accounts and experience our in-depth investment analysis";
      }
      if (packageSelected === "EXPLORER") {
        tooltipDisableAddBtn =
          "Get the PROFESSIONAL Plan so you can add unlimited accounts and experience all our functions";
      }
    }
  }

  $: {
    const evmToken = localStorage.getItem("evm_token");
    if (Object.keys(userInfo).length !== 0 && evmToken) {
      queryClient.invalidateQueries(["list-address"]);
    } else {
      formatListAddress = [];
      listAddress = [];
    }
  }

  $: {
    if (selectedWallet) {
      selectBundle = formatListAddress.find(
        (item) => item.value === selectedWallet
      );
    }
  }
</script>

{#if $query.isFetching}
  <div class="flex items-center justify-center h-screen">
    <loading-icon />
  </div>
{:else}
  <div>
    {#if formatListAddress.length === 0 && selectedWallet?.length === 0}
      <div class="flex items-center justify-center h-screen">
        <div class="flex flex-col items-center justify-center w-2/3 gap-4 p-6">
          {#if $query.isError && Object.keys(userInfo).length !== 0}
            <div class="text-lg">
              {$query.error}
            </div>
          {:else}
            <div class="text-lg">
              {MultipleLang.addwallet}
            </div>
            {#if Object.keys(userInfo).length !== 0}
              <div class="w-max">
                <Button
                  variant="tertiary"
                  on:click={() => (isOpenAddModal = true)}
                >
                  <img src={Plus} alt="" width="12" height="12" />
                  <div class="text-2xl font-medium text-white xl:text-base">
                    {MultipleLang.content.btn_text}
                  </div>
                </Button>
              </div>
            {:else}
              <div class="flex flex-col gap-4">
                <div
                  class="relative"
                  on:mouseenter={() => {
                    if (Object.keys(userInfo).length === 0) {
                      showDisableAddWallet = true;
                    }
                  }}
                  on:mouseleave={() => {
                    if (Object.keys(userInfo).length === 0) {
                      showDisableAddWallet = false;
                    }
                  }}
                >
                  <Button variant="disabled">
                    <img
                      src={darkMode ? PlusBlack : Plus}
                      alt=""
                      width="12"
                      height="12"
                    />
                    <div
                      class={`text-2xl font-medium xl:text-base ${
                        darkMode ? "text-gray-400" : "text-white"
                      }`}
                    >
                      {MultipleLang.content.btn_text}
                    </div>
                  </Button>

                  {#if showDisableAddWallet}
                    <div
                      class="absolute transform -translate-x-1/2 -top-8 left-1/2 w-max"
                      style="z-index: 2147483648;"
                    >
                      <tooltip-detail text={"Connect wallet to add account"} />
                    </div>
                  {/if}
                </div>
                <div
                  class="text-2xl font-medium xl:text-base mt-2 hover:underline text-[#1E96FC] cursor-pointer"
                  on:click={() => {
                    mixpanel.track("user_search");
                    chain.update((n) => (n = "ALL"));
                    wallet.update(
                      (n) => (n = "0xc02ad7b9a9121fc849196e844dc869d2250df3a6")
                    );
                    typeWallet.update((n) => (n = "DEX"));
                    navigate(
                      `/?type=DEX&chain=ALL&address=0xc02ad7b9a9121fc849196e844dc869d2250df3a6`
                    );
                  }}
                >
                  Try Demo account
                </div>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {:else}
      <div class="header header-container">
        <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[96%]">
          <div class="flex flex-col mb-5 gap-14">
            <div class="flex items-center justify-between gap-6">
              <!-- desktop list address wallet -->
              <div class="hidden xl:block">
                {#if formatListAddress && formatListAddress?.length !== 0}
                  <div class="flex items-center gap-5">
                    {#if formatListAddress.length > 5}
                      <AnimateSharedLayout>
                        {#each formatListAddress.slice(0, 5) as item}
                          <div
                            id={item.value}
                            class="relative xl:text-base text-2xl text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                            class:hover:no-underline={item.value ===
                              selectedWallet}
                            on:click={() => {
                              wallet.update((n) => (n = item.value));
                            }}
                          >
                            <img
                              src={item.logo}
                              alt=""
                              class="w-5 h-5 xl:w-4 xl:h-4"
                            />
                            {item.label}
                            {#if item.value === selectedWallet}
                              <Motion
                                let:motion
                                layoutId="active-pill"
                                transition={{
                                  type: "spring",
                                  duration: 0.6,
                                }}
                              >
                                <div
                                  class="absolute inset-0 rounded-full bg-[#ffffff1c]"
                                  use:motion
                                />
                              </Motion>
                            {/if}
                          </div>
                        {/each}
                      </AnimateSharedLayout>
                      <div class="relative">
                        <div class="relative z-10">
                          <Select
                            type="wallet"
                            positionSelectList="right-0"
                            listSelect={formatListAddress.slice(
                              5,
                              formatListAddress.length
                            )}
                            bind:selected={selectedWallet}
                          />
                        </div>
                        {#if formatListAddress
                          .slice(5, formatListAddress.length)
                          .find((item) => item.value === selectedWallet) !== undefined}
                          <div
                            class="absolute inset-0 rounded-full bg-[#ffffff1c] z-1"
                          />
                        {/if}
                      </div>
                    {:else}
                      <AnimateSharedLayout>
                        {#each formatListAddress as item}
                          <div
                            id={item.value}
                            class="relative xl:text-base text-2xl text-white py-1 xl:pl-2 xl:pr-3 px-3 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                            class:hover:no-underline={item.value ===
                              selectedWallet}
                            on:click={() => {
                              wallet.update((n) => (n = item.value));
                            }}
                          >
                            <img
                              src={item.logo}
                              alt=""
                              class="w-5 h-5 xl:w-4 xl:h-4"
                            />
                            {item.label}
                            {#if item.value === selectedWallet}
                              <Motion
                                let:motion
                                layoutId="active-pill"
                                transition={{
                                  type: "spring",
                                  duration: 0.6,
                                }}
                              >
                                <div
                                  class="absolute inset-0 rounded-full bg-[#ffffff1c]"
                                  use:motion
                                />
                              </Motion>
                            {/if}
                          </div>
                        {/each}
                      </AnimateSharedLayout>
                    {/if}
                  </div>
                {:else}
                  <div class="text-2xl font-medium text-white xl:text-base">
                    {MultipleLang.empty_wallet}
                  </div>
                {/if}
              </div>

              <!-- mobile list address wallet -->
              {#if formatListAddress && formatListAddress?.length !== 0}
                <div
                  class="relative flex flex-row items-center justify-between w-full gap-3 overflow-hidden xl:hidden"
                  bind:this={container}
                >
                  <div
                    class={`text-white absolute left-0 py-2 rounded-tl-lg rounded-bl-lg ${
                      isScrollStart ? "hidden" : "block"
                    }`}
                    style="background-image: linear-gradient(to right, rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100% );"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      height="24px"
                      width="24px"
                      viewBox="0 0 24 24"
                      class="sc-aef7b723-0 fKbUaI"
                      ><path
                        d="M15 6L9 12L15 18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      /></svg
                    >
                  </div>
                  <div
                    class="container flex gap-3 overflow-x-auto w-max whitespace-nowrap"
                    bind:this={scrollContainer}
                    on:scroll={handleScroll}
                  >
                    {#each formatListAddress as item}
                      <div
                        id={item.value}
                        class="w-max flex-shrink-0 relative text-2xl text-white py-1 px-3 flex items-center gap-2 rounded-[100px]"
                        class:hover:no-underline={item.value === selectedWallet}
                        on:click={() => {
                          wallet.update((n) => (n = item.value));
                        }}
                      >
                        <img
                          src={item.logo}
                          alt=""
                          class="w-5 h-5 rounded-full"
                        />
                        {item.label}
                        {#if item.value === selectedWallet}
                          <Motion
                            let:motion
                            layoutId="active-pill"
                            transition={{ type: "spring", duration: 0.6 }}
                          >
                            <div
                              class="absolute inset-0 rounded-full bg-[#ffffff1c]"
                              use:motion
                            />
                          </Motion>
                        {/if}
                      </div>
                    {/each}
                  </div>
                  {#if scrollContainer?.scrollWidth >= container?.offsetWidth}
                    <div
                      class={`text-white absolute right-0 py-2 rounded-tr-lg rounded-br-lg ${
                        isScrollEnd ? "hidden" : "block"
                      }`}
                      style="background-image: linear-gradient(to left,rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100%);"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        height="24px"
                        width="24px"
                        viewBox="0 0 24 24"
                        class="sc-aef7b723-0 fKbUaI"
                        ><path
                          d="M9 6L15 12L9 18"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-miterlimit="10"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        /></svg
                      >
                    </div>
                  {/if}
                </div>
              {:else}
                <div
                  class="block text-2xl font-medium text-white xl:hidden xl:text-base"
                >
                  {MultipleLang.empty_wallet}
                </div>
              {/if}

              <!-- btn add address wallet -->
              <div
                class="relative xl:w-max w-[260px] flex justify-end"
                on:mouseenter={() => {
                  if (isDisabled || Object.keys(userInfo).length === 0) {
                    showDisableAddWallet = true;
                  }
                }}
                on:mouseleave={() => {
                  if (isDisabled || Object.keys(userInfo).length === 0) {
                    showDisableAddWallet = false;
                  }
                }}
              >
                {#if isDisabled || Object.keys(userInfo).length === 0}
                  <div>
                    {#if localStorage.getItem("isGetUserEmailYet") !== null && localStorage.getItem("isGetUserEmailYet") === "false"}
                      <Button
                        variant="tertiary"
                        on:click={() => {
                          if (
                            localStorage.getItem("isGetUserEmailYet") !==
                              null &&
                            localStorage.getItem("isGetUserEmailYet") ===
                              "false"
                          ) {
                            isOpenModal = true;
                          }
                        }}
                      >
                        <img src={Plus} alt="" class="w-4 h-4 xl:w-3 xl:h-3" />
                        <div
                          class="text-2xl font-medium text-white xl:text-base"
                        >
                          Add account
                        </div>
                      </Button>
                    {:else}
                      <Button variant="disabled" disabled>
                        <img
                          src={darkMode ? PlusBlack : Plus}
                          alt=""
                          class="w-4 h-4 xl:w-3 xl:h-3"
                        />
                        <div
                          class={`text-2xl font-medium xl:text-base ${
                            darkMode ? "text-gray-400" : "text-white"
                          }`}
                        >
                          Add account
                        </div>
                      </Button>
                    {/if}
                  </div>
                {:else}
                  <Button
                    variant="tertiary"
                    on:click={() => {
                      isOpenAddModal = true;
                    }}
                  >
                    <img src={Plus} alt="" class="w-4 h-4 xl:w-3 xl:h-3" />
                    <div class="text-2xl font-medium text-white xl:text-base">
                      Add account
                    </div>
                  </Button>
                {/if}
                {#if showDisableAddWallet}
                  <div
                    class={`absolute transform ${
                      Object.keys(userInfo).length === 0 ? "-top-8" : "-top-12"
                    } right-0`}
                    style="z-index: 2147483648;"
                  >
                    <div
                      class="max-w-[360px] text-white bg-black py-1 px-2 text-xs rounded relative w-max normal-case"
                    >
                      {tooltipDisableAddBtn}
                    </div>
                  </div>
                {/if}
              </div>
            </div>

            <div class="flex items-end justify-between">
              <div class="flex flex-col gap-3">
                <div class="flex items-end gap-6">
                  <div class="font-medium text-white xl:text-5xl text-7xl">
                    {title}
                  </div>
                  {#if type === "portfolio"}
                    <slot name="reload" />
                  {/if}
                </div>
                <div class="flex items-center gap-4">
                  {#if selectBundle && Object.keys(selectBundle).length !== 0 && selectBundle.type === "BUNDLE"}
                    <div
                      class="relative"
                      on:click={() => (showPopover = !showPopover)}
                    >
                      <div class="flex cursor-pointer">
                        {#if selectBundle && selectBundle?.accounts && selectBundle?.accounts?.length > 8}
                          {#each selectBundle?.accounts.slice(0, 7) as item, index}
                            <div class={`${index > 0 && "-ml-2"}`}>
                              <div class="hidden xl:block">
                                <Avatar src={item?.logo} stacked size="sm" />
                              </div>
                              <div class="block xl:hidden">
                                <Avatar src={item?.logo} stacked size="md" />
                              </div>
                            </div>
                          {/each}
                          <div class="-ml-2">
                            <div class="hidden xl:block">
                              <Avatar stacked size="sm">...</Avatar>
                            </div>
                            <div class="block xl:hidden">
                              <Avatar stacked size="md">...</Avatar>
                            </div>
                          </div>
                        {:else}
                          {#each selectBundle?.accounts as item, index}
                            <div class={`${index > 0 && "-ml-2"}`}>
                              <div class="hidden xl:block">
                                <Avatar src={item?.logo} stacked size="sm" />
                              </div>
                              <div class="block xl:hidden">
                                <Avatar src={item?.logo} stacked size="md" />
                              </div>
                            </div>
                          {/each}
                        {/if}
                      </div>
                      {#if showPopover}
                        <div
                          class="select_content absolute left-0 z-50 flex flex-col gap-1 px-3 xl:py-2 py-3 text-sm transform rounded-lg top-12 xl:w-[200px] w-[300px] xl:max-h-[300px] xl:max-h-[310px] max-h-[380px]"
                          style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15); overflow-y: overlay;"
                          use:clickOutside
                          on:click_outside={() => (showPopover = false)}
                        >
                          {#each selectBundle?.accounts as item}
                            <div class="hidden text-3xl xl:text-base xl:block">
                              <Copy
                                address={item?.value}
                                iconColor={darkMode ? "#fff" : "#000"}
                                color={darkMode ? "#fff" : "#000"}
                                isShorten
                              />
                            </div>
                            <div class="block text-3xl xl:text-base xl:hidden">
                              <Copy
                                address={item?.value}
                                iconColor={darkMode ? "#fff" : "#000"}
                                color={darkMode ? "#fff" : "#000"}
                                isShorten
                                iconSize={24}
                              />
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <div class="hidden text-3xl xl:text-base xl:block">
                      <Copy
                        address={selectedWallet}
                        iconColor="#fff"
                        color="#fff"
                      />
                    </div>
                    <div class="block text-3xl xl:text-base xl:hidden">
                      <Copy
                        address={selectedWallet}
                        iconColor="#fff"
                        color="#fff"
                        isShorten
                        iconSize={24}
                      />
                    </div>
                  {/if}
                  <!-- <div
                    class="relative"
                    on:mouseenter={() => {
                      showFollowTooltip = true;
                    }}
                    on:mouseleave={() => {
                      showFollowTooltip = false;
                    }}
                  >
                    <Button
                      variant="secondary"
                      on:click={() => (isOpenFollowWhaleModal = true)}
                    >
                      Follow this whale 🐳
                    </Button>
                    {#if showFollowTooltip}
                      <div
                        class="absolute transform -translate-x-1/2 -top-8 left-1/2 w-max"
                        style="z-index: 2147483648;"
                      >
                        <tooltip-detail
                          text={"Alert me when it makes a move"}
                        />
                      </div>
                    {/if}
                  </div> -->

                  <div class="hidden xl:block">
                    {#if getAddressContext(selectedWallet)?.type === "BTC" || getAddressContext(selectedWallet)?.type === "SOL"}
                      <div
                        use:tooltip={{
                          content: `<tooltip-detail text="Coming soon!" />`,
                          allowHTML: true,
                          placement: "top",
                          interactive: true,
                        }}
                      >
                        <Button variant="premium" disabled>
                          <div
                            class={`${
                              darkMode ? "text-gray-400" : "text-white"
                            }`}
                          >
                            Optimize return
                          </div>
                        </Button>
                      </div>
                    {:else}
                      <div>
                        {#if Object.keys(userInfo).length !== 0}
                          <div
                            use:tooltip={{
                              content: `<tooltip-detail text="Optimize this portfolio by Minimizing risk & Maximizing return" />`,
                              allowHTML: true,
                              placement: "top",
                              interactive: true,
                            }}
                          >
                            <Button
                              variant="premium"
                              on:click={() => {
                                navigate(
                                  `/compare?address=${encodeURIComponent(
                                    selectedWallet
                                  )}`
                                );
                              }}>Optimize return</Button
                            >
                          </div>
                        {:else}
                          <Button variant="premium" disabled
                            >Optimize return</Button
                          >
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-6">
                <div class="block xl:hidden">
                  {#if getAddressContext(selectedWallet)?.type === "BTC" || getAddressContext(selectedWallet)?.type === "SOL"}
                    <div
                      use:tooltip={{
                        content: `<tooltip-detail text="Coming soon!" />`,
                        allowHTML: true,
                        placement: "top",
                        interactive: true,
                      }}
                    >
                      <Button variant="premium" disabled>
                        <div
                          class={`${darkMode ? "text-gray-400" : "text-white"}`}
                        >
                          Optimize return
                        </div>
                      </Button>
                    </div>
                  {:else}
                    <div>
                      {#if Object.keys(userInfo).length !== 0}
                        <div
                          use:tooltip={{
                            content: `<tooltip-detail text="Optimize this portfolio by Minimizing risk & Maximizing return" />`,
                            allowHTML: true,
                            placement: "top",
                            interactive: true,
                          }}
                        >
                          <Button
                            variant="premium"
                            on:click={() => {
                              navigate(
                                `/compare?address=${encodeURIComponent(
                                  selectedWallet
                                )}`
                              );
                            }}>Optimize return</Button
                          >
                        </div>
                      {:else}
                        <Button variant="premium" disabled
                          >Optimize return</Button
                        >
                      {/if}
                    </div>
                  {/if}
                </div>
                {#if (getAddressContext(selectedWallet)?.type === "EVM" && typeWalletAddress === "DEX") || typeWalletAddress === "CEX"}
                  <Select
                    type="chain"
                    positionSelectList="right-0"
                    listSelect={window.location.pathname === "/transactions"
                      ? chainList.slice(1, -1)
                      : chainList}
                    bind:selected={selectedChain}
                  />
                {/if}
              </div>
            </div>

            {#key selectedWallet || selectedChain}
              {#if type === "portfolio"}
                <slot name="overview" />
              {/if}
            {/key}
          </div>
        </div>
      </div>

      {#key selectedWallet || selectedChain}
        <slot name="body" />
      {/key}
    {/if}
  </div>
{/if}

<!-- Modal add DEX account -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenAddModal}
  on:close={() => (isOpenAddModal = false)}
>
  <div class="font-medium xl:title-3 title-1">
    {MultipleLang.content.modal_add_title}
  </div>
  <div class="flex flex-col mt-4 gap-7">
    <div class="flex flex-col gap-3">
      <div class="flex justify-center">
        <div class="w-max">
          <Button
            variant="tertiary"
            isLoading={isLoadingConnectCEX}
            on:click={onSubmitCEX}
          >
            <div class="text-2xl font-medium text-white xl:text-base">
              Connect Exchange
            </div>
          </Button>
        </div>
      </div>
      <div class="flex items-center justify-center gap-1 text-xl xl:text-base">
        <img src={Success} alt="" />
        Bank-level security/encryption.
        <a
          href="https://vezgo.com/security"
          class="text-blue-500 cursor-pointer"
          target="_blank">Learn more</a
        >
      </div>
      <div class="flex items-center justify-center gap-6 my-3">
        {#each listLogoCEX as logo}
          <div
            class="flex items-center justify-center w-8 h-8 overflow-hidden rounded-full"
          >
            <img src={logo} alt="" class="object-contain w-full h-full" />
          </div>
        {/each}
        <div class="text-gray-400">+22 More</div>
      </div>
    </div>
    <div class="border-t-[1px] relative">
      <div
        class={`absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-gray-400 ${
          darkMode ? "bg-[#0f0f0f]" : "bg-white"
        } text-sm px-2`}
      >
        Or
      </div>
    </div>
    <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3 mt-2">
      <div class="flex flex-col gap-1">
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            address && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
          class:input-border-error={errors.address && errors.address.required}
        >
          <div class="xl:text-base text-xl text-[#666666] font-medium">
            Address
          </div>
          <input
            type="text"
            id="address"
            name="address"
            placeholder={"Your wallet address"}
            value=""
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
              address && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            }
              `}
            on:keyup={({ target: { value } }) => (address = value)}
          />
        </div>
        {#if errors.address && errors.address.required}
          <div class="text-red-500">
            {errors.address.msg}
          </div>
        {/if}
      </div>
      <div class="flex flex-col gap-1">
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            label && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
          class:input-border-error={errors.label && errors.label.required}
        >
          <div class="xl:text-base text-xl text-[#666666] font-medium">
            {MultipleLang.content.modal_label_label}
          </div>
          <input
            type="text"
            id="label"
            name="label"
            placeholder={MultipleLang.content.modal_label_label}
            value=""
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
              label && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            }
              `}
            on:keyup={({ target: { value } }) => (label = value)}
          />
        </div>
        {#if errors.label && errors.label.required}
          <div class="text-red-500">
            {errors.label.msg}
          </div>
        {/if}
      </div>
      <div class="flex items-center justify-center gap-6 my-3">
        {#each [{ logo: SolanaLogo, label: "Solana", value: "SOL" }].concat(chainList) as item}
          <div
            class="flex items-center justify-center w-8 h-8 overflow-hidden rounded-full"
          >
            <img src={item.logo} alt="" class="object-contain w-full h-full" />
          </div>
        {/each}
        <div class="text-gray-400">More soon</div>
      </div>
      <div class="flex justify-end gap-6 lg:gap-2">
        <div class="lg:w-[120px] w-full">
          <Button
            variant="secondary"
            on:click={() => {
              errors = {};
              isOpenAddModal = false;
            }}
          >
            {MultipleLang.content.modal_cancel}</Button
          >
        </div>
        <div class="lg:w-[120px] w-full">
          <Button type="submit" variant="tertiary">
            {MultipleLang.content.modal_add}</Button
          >
        </div>
      </div>
    </form>
  </div>
</AppOverlay>

<!-- Modal follow Whales -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenFollowWhaleModal}
  on:close={() => (isOpenFollowWhaleModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <div class="text-2xl xl:text-base">
        Go to <a
          href="https://t.me/GetNimbusBot"
          target="_blank"
          class="text-blue-500">https://t.me/GetNimbusBot</a
        >
      </div>
      <div class="text-2xl xl:text-base">Use the command as follow video</div>
    </div>
    <div class="xl:h-[350px] h-[650px]">
      <img src={FollowWhale} alt="" class="object-contain w-full h-full" />
    </div>
    <div class="flex justify-end w-full">
      <CopyToClipboard
        text={`/start ${selectedWallet} ${
          formatListAddress.filter((item) => item.value === selectedWallet)?.[0]
            ?.label || ""
        }`}
        let:copy
      >
        <div
          class="relative w-max"
          on:mouseenter={() => {
            showCommandTooltip = true;
          }}
          on:mouseleave={() => {
            showCommandTooltip = false;
          }}
        >
          <Button
            on:click={() => {
              copy();
              isOpenFollowWhaleModal = false;
              showCommandTooltip = false;
            }}>Copy command</Button
          >
          {#if showCommandTooltip}
            <div
              class="absolute transform -translate-x-1/2 -top-8 left-1/2 w-max"
              style="z-index: 2147483648;"
            >
              <tooltip-detail
                text={`/start ${selectedWallet} ${
                  formatListAddress.filter(
                    (item) => item.value === selectedWallet
                  )?.[0]?.label || ""
                }`}
              />
            </div>
          {/if}
        </div>
      </CopyToClipboard>
    </div>
  </div>
</AppOverlay>

<!-- Modal get user email -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModal}
  on:close={() => {
    isOpenModal = false;
  }}
>
  <div class="font-medium text-center xl:title-3 title-1">
    Let's us know your email
  </div>
  <div class="mt-2">
    <div class="text-lg text-center text-gray-500 xl:text-base">
      Add your email to get updates from us and receive exclusive benefits soon.
    </div>
    <form
      on:submit|preventDefault={onSubmitGetEmail}
      class="flex flex-col gap-3 mt-4"
    >
      <div class="flex flex-col gap-1">
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            email && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
        >
          <div class="xl:text-base text-xl text-[#666666] font-medium">
            Email
          </div>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Your email"
            value=""
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
              email && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            }
              `}
            on:keyup={({ target: { value } }) => (email = value)}
          />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <div class="xl:w-[120px] w-full">
          <Button
            variant="secondary"
            on:click={() => {
              isOpenModal = false;
            }}
          >
            {MultipleLang.content.modal_cancel}</Button
          >
        </div>
        <div class="xl:w-[120px] w-full">
          <Button
            type="submit"
            isLoading={isLoadingSendMail}
            disabled={isLoadingSendMail}>Submit</Button
          >
        </div>
      </div>
    </form>
  </div>
</AppOverlay>

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

<style windi:preflights:global windi:safelist:global>
  .header {
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }

  .input-border {
    border: 1px solid rgb(229, 231, 235);
  }

  .input-border-error {
    border: 1px solid red;
  }

  .container::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .container {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  :global(body) .header-container {
    background-color: #27326f;
    background-image: url("~/assets/capa.svg");
  }
  :global(body.dark) .header-container {
    background-color: #080808;
    background-image: url("~/assets/capa-dark.svg");
  }

  :global(body) .select_content {
    background: #ffffff;
    border: 0.5px solid transparent;
  }
  :global(body.dark) .select_content {
    background: #131313;
    border: 0.5px solid #cdcdcd59;
  }
</style>

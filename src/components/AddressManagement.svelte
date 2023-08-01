<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import * as browser from "webextension-polyfill";
  import { wallet, chain, typeWallet, user } from "~/store";
  import { i18n } from "~/lib/i18n";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { chainList, getAddressContext } from "~/utils";
  import mixpanel from "mixpanel-browser";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { nimbus } from "~/lib/network";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import Vezgo from "vezgo-sdk-js/dist/vezgo.es5.js";
  import { useNavigate } from "svelte-navigator";
  import tooltip from "~/entries/contentScript/views/tooltip";

  export let type: "portfolio" | "order" = "portfolio";
  export let title;

  import "~/components/Loading.custom.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";
  import Select from "~/components/Select.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Copy from "~/components/Copy.svelte";

  import Plus from "~/assets/plus.svg";
  import EthereumLogo from "~/assets/ethereum.png";
  import BitcoinLogo from "~/assets/bitcoin.png";
  import FollowWhale from "~/assets/whale-tracking.gif";

  const MultipleLang = {
    empty_wallet: i18n("newtabPage.empty-wallet", "No wallet added yet."),
    addwallet: i18n(
      "newtabPage.addwallet",
      "Add your wallet to keep track of your investments."
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
        "Add Your Wallet"
      ),
      modal_add_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-add-sub-title",
        "Add your wallet will give you more option to see the information at page new tab"
      ),
      address_required: i18n(
        "optionsPage.accounts-page-content.address-required",
        "Address is required"
      ),
      label_required: i18n(
        "optionsPage.accounts-page-content.label-required",
        "Label is required"
      ),
      re_input_address: i18n(
        "optionsPage.accounts-page-content.re-input-address",
        "Please enter your wallet address again!"
      ),
      duplicate_address: i18n(
        "optionsPage.accounts-page-content.duplicate-address",
        "This wallet address is duplicated!"
      ),
    },
  };

  const navigate = useNavigate();

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
  let isLoadingFullPage = false;
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

  const isRequiredFieldValid = (value) => {
    return value != null && value !== "";
  };

  const validateForm = (data) => {
    const isDuplicatedAddress = listAddress.some((item) => {
      return item.value === data.address;
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

  const updateStateFromParams = () => {
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
      chain.update((n) => (n = "ALL"));
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
        chain.update((n) => (n = "ALL"));
        if (getAddressContext(selectedWallet)?.type === "BTC") {
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
          chain.update((n) => (n = "ALL"));
        }
        if (getAddressContext(selectedWallet)?.type === "BTC") {
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

  const getListAddress = async () => {
    if (formatListAddress && formatListAddress?.length !== 0) {
      isLoadingFullPage = false;
    } else {
      isLoadingFullPage = true;
    }
    try {
      const response: any = await nimbus.get("/accounts/list");
      if (response && response?.data) {
        const structWalletData = response?.data.map((item) => {
          return {
            id: item.id,
            type: item.type,
            label: item.label,
            value: item.accountId,
            logo: item.logo,
          };
        });

        listAddress = structWalletData;

        const selectedTypeWalletRes = await browser.storage.sync.get(
          "typeWalletAddress"
        );
        if (
          selectedTypeWalletRes &&
          selectedTypeWalletRes?.typeWalletAddress?.length !== 0
        ) {
          typeWallet.update(
            (n) => (n = selectedTypeWalletRes.typeWalletAddress)
          );
        }

        const selectedChainRes = await browser.storage.sync.get(
          "selectedChain"
        );
        if (selectedChainRes && selectedChainRes?.selectedChain?.length !== 0) {
          chain.update((n) => (n = selectedChainRes.selectedChain));
        }

        const selectedWalletRes = await browser.storage.sync.get(
          "selectedWallet"
        );
        if (selectedWalletRes) {
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
        }

        updateStateFromParams();

        isLoadingFullPage = false;
      } else {
        isLoadingFullPage = false;
      }
    } catch (e) {
      console.log("e: ", e);
      isLoadingFullPage = false;
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

        chain.update((n) => (n = "ALL"));
        wallet.update((n) => (n = dataFormat.value));
        typeWallet.update((n) => (n = "DEX"));

        e.target.reset();
        errors = {};
        isOpenAddModal = false;
        getListAddress();
        toastMsg = "Successfully add DEX account!";
        isSuccessToast = true;
        trigger();
        mixpanel.track("user_add_address");

        errors["address"] = { ...errors["address"], required: false, msg: "" };
        errors["label"] = { ...errors["label"], required: false, msg: "" };
      } else {
        console.log("Invalid Form");
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
          .connect()
          .onConnection(async function (account) {
            await nimbus.get("/accounts/sync");

            chain.update((n) => (n = "ALL"));
            wallet.update((n) => (n = account));
            typeWallet.update((n) => (n = "CEX"));

            getListAddress();
            isLoadingConnectCEX = false;
            isOpenAddModal = false;

            toastMsg = "Successfully add CEX account!";
            isSuccessToast = true;
            trigger();
            mixpanel.track("user_add_address");
          })
          .onError(function (error) {
            console.error("connection vezgo error", error);
            getListAddress();
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
    } finally {
      isOpenModal = false;
    }
  };

  onMount(() => {
    getListAddress();
    updateStateFromParams();
  });

  $: formatListAddress = listAddress.map((item) => {
    return {
      ...item,
      logo:
        item.type === "DEX"
          ? getAddressContext(item.value)?.type === "EVM"
            ? EthereumLogo
            : BitcoinLogo
          : item.logo,
    };
  });

  $: {
    if (selectedWallet) {
      browser.storage.sync.set({ selectedWallet: selectedWallet }).then(() => {
        console.log("save selected address to sync storage");
      });

      browser.storage.sync.set({ selectedChain: selectedChain }).then(() => {
        console.log("save selected chain to sync storage");
      });

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

        if (getAddressContext(selectedWallet)?.type === "BTC") {
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

  $: conditionAdd =
    localStorage.getItem("isGetUserEmailYet") !== null &&
    localStorage.getItem("isGetUserEmailYet") === "true"
      ? 10
      : 5;

  $: isDisabled =
    APP_TYPE.TYPE !== "EXT" && listAddress.length === conditionAdd;

  $: isDisabled && localStorage.setItem("isGetUserEmailYet", "false");

  $: {
    const evmToken = localStorage.getItem("evm_token");
    if (Object.keys(userInfo).length !== 0 && evmToken) {
      getListAddress();
    } else {
      formatListAddress = [];
      listAddress = [];
    }
  }
</script>

<ErrorBoundary>
  {#if isLoadingFullPage}
    <div class="flex items-center justify-center h-screen">
      <loading-icon />
    </div>
  {:else}
    <div>
      {#if formatListAddress.length === 0 && selectedWallet?.length === 0}
        <div class="flex items-center justify-center h-screen">
          <div
            class="flex flex-col items-center justify-center w-2/3 gap-4 p-6"
          >
            <div class="text-lg">
              {MultipleLang.addwallet}
            </div>
            {#if Object.keys(userInfo).length !== 0}
              <Button
                variant="tertiary"
                on:click={() => (isOpenAddModal = true)}
              >
                <img src={Plus} alt="" width="12" height="12" />
                <div class="xl:text-base text-2xl font-medium text-white">
                  {MultipleLang.content.btn_text}
                </div>
              </Button>
            {:else}
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
                  <img src={Plus} alt="" width="12" height="12" />
                  <div class="xl:text-base text-2xl font-medium text-white">
                    {MultipleLang.content.btn_text}
                  </div>
                </Button>
                {#if showDisableAddWallet}
                  <div
                    class="absolute transform -translate-x-1/2 -top-8 left-1/2"
                    style="z-index: 2147483648;"
                  >
                    <tooltip-detail text={"Connect wallet to add account"} />
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="header-container">
          <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[96%]">
            <div class="flex flex-col mb-5 gap-14">
              <div class="flex items-center justify-between gap-6">
                <!-- desktop list address wallet -->
                <div class="xl:block hidden">
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
                                class="xl:w-4 xl:h-4 w-5 h-5 rounded-full"
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
                        <Select
                          type="wallet"
                          listSelect={formatListAddress.slice(
                            5,
                            formatListAddress.length
                          )}
                          bind:selected={selectedWallet}
                        />
                      {:else}
                        <AnimateSharedLayout>
                          {#each formatListAddress as item}
                            <div
                              id={item.value}
                              class="relative xl:text-base text-2xl text-white py-1 xl:px-2 px-3 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                              class:hover:no-underline={item.value ===
                                selectedWallet}
                              on:click={() => {
                                wallet.update((n) => (n = item.value));
                              }}
                            >
                              <img
                                src={item.logo}
                                alt=""
                                class="xl:w-4 xl:h-4 w-5 h-5 rounded-full"
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
                    <div class="xl:text-base text-2xl font-semibold text-white">
                      {MultipleLang.empty_wallet}
                    </div>
                  {/if}
                </div>

                <!-- mobile list address wallet -->
                {#if formatListAddress && formatListAddress?.length !== 0}
                  <div
                    class="xl:hidden relative overflow-x-hidden w-full flex flex-row gap-3 justify-between items-center"
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
                      class="w-max flex gap-3 overflow-x-auto whitespace-nowrap container"
                      bind:this={scrollContainer}
                      on:scroll={handleScroll}
                    >
                      {#each formatListAddress as item}
                        <div
                          id={item.value}
                          class="w-max flex-shrink-0 relative text-2xl text-white py-1 px-3 flex items-center gap-2 rounded-[100px]"
                          class:hover:no-underline={item.value ===
                            selectedWallet}
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
                    class="xl:hidden block xl:text-base text-2xl font-semibold text-white"
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
                          <img
                            src={Plus}
                            alt=""
                            class="xl:w-3 xl:h-3 w-4 h-4"
                          />
                          <div
                            class="xl:text-base text-2xl font-medium text-white"
                          >
                            Add account
                          </div>
                        </Button>
                      {:else}
                        <Button variant="disabled" disabled>
                          <img
                            src={Plus}
                            alt=""
                            class="xl:w-3 xl:h-3 w-4 h-4"
                          />
                          <div
                            class="xl:text-base text-2xl font-medium text-white"
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
                      <img src={Plus} alt="" class="xl:w-3 xl:h-3 w-4 h-4" />
                      <div class="xl:text-base text-2xl font-medium text-white">
                        Add account
                      </div>
                    </Button>
                  {/if}
                  {#if showDisableAddWallet}
                    <div
                      class="absolute transform -translate-x-1/2 -top-8 left-1/2"
                      style="z-index: 2147483648;"
                    >
                      <tooltip-detail
                        text={`${
                          isDisabled || Object.keys(userInfo).length !== 0
                            ? "Install our extension to add more wallet"
                            : "Connect wallet to add account"
                        }`}
                      />
                    </div>
                  {/if}
                </div>
              </div>

              <div class="flex items-end justify-between">
                <div class="flex flex-col gap-3">
                  <div class="flex items-end gap-6">
                    <div class="xl:text-5xl text-7xl font-semibold text-white">
                      {title}
                    </div>
                    {#if type === "portfolio"}
                      <slot name="reload" />
                    {/if}
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="xl:text-base text-xl">
                      <Copy
                        address={selectedWallet}
                        iconColor="#fff"
                        color="#fff"
                      />
                    </div>
                    <div
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
                          class="absolute transform -translate-x-1/2 -top-8 left-1/2"
                          style="z-index: 2147483648;"
                        >
                          <tooltip-detail
                            text={"Alert me when it makes a move"}
                          />
                        </div>
                      {/if}
                    </div>

                    <div class="xl:block hidden">
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
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-6">
                  <div class="xl:hidden block">
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
                  </div>
                  {#if getAddressContext(selectedWallet)?.type !== "BTC"}
                    <Select
                      type="chain"
                      listSelect={chainList}
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
</ErrorBoundary>

<!-- Modal add DEX account -->
<AppOverlay isOpen={isOpenAddModal} on:close={() => (isOpenAddModal = false)}>
  <div class="xl:title-3 title-1 text-gray-600 font-semibold">
    {MultipleLang.content.modal_add_title}
  </div>
  <div class="flex flex-col mt-4 gap-7">
    <div class="flex justify-center">
      <Button
        variant="tertiary"
        isLoading={isLoadingConnectCEX}
        on:click={onSubmitCEX}
      >
        <div class="xl:text-base text-2xl font-medium text-white">
          Connect CEX
        </div>
      </Button>
    </div>
    <div class="border-t-[1px] relative">
      <div
        class="absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-gray-400 bg-white text-sm px-2"
      >
        Or
      </div>
    </div>
    <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            address ? "bg-[#F0F2F7]" : ""
          }`}
          class:input-border-error={errors.address && errors.address.required}
        >
          <div class="xl:text-base text-xl text-[#666666] font-medium">
            {MultipleLang.content.modal_address_label}
          </div>
          <input
            type="text"
            id="address"
            name="address"
            placeholder={MultipleLang.content.modal_address_label}
            value=""
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
              address ? "bg-[#F0F2F7]" : ""
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
            label ? "bg-[#F0F2F7]" : ""
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
              label ? "bg-[#F0F2F7]" : ""
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
      <div class="flex justify-end gap-2">
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
          <Button type="submit">
            {MultipleLang.content.modal_add}</Button
          >
        </div>
      </div>
    </form>
  </div>
</AppOverlay>

<!-- Modal follow Whales -->
<AppOverlay
  isOpen={isOpenFollowWhaleModal}
  on:close={() => (isOpenFollowWhaleModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <div class="xl:text-base text-2xl">
        Go to <a
          href="https://t.me/GetNimbusBot"
          target="_blank"
          class="text-blue-500">https://t.me/GetNimbusBot</a
        >
      </div>
      <div class="xl:text-base text-2xl">Use the command as follow video</div>
    </div>
    <div class="xl:h-[350px] h-[650px]">
      <img src={FollowWhale} alt="" class="w-full h-full" />
    </div>
    <div
      class="relative w-full flex justify-end"
      on:mouseenter={() => {
        showCommandTooltip = true;
      }}
      on:mouseleave={() => {
        showCommandTooltip = false;
      }}
    >
      <CopyToClipboard
        text={`/start ${selectedWallet} ${
          formatListAddress.filter((item) => item.value === selectedWallet)?.[0]
            ?.label || ""
        }`}
        let:copy
      >
        <div class="w-max">
          <Button
            on:click={() => {
              copy();
              isOpenFollowWhaleModal = false;
              showCommandTooltip = false;
            }}>Copy command</Button
          >
        </div>
      </CopyToClipboard>
      {#if showCommandTooltip}
        <div
          class="absolute transform -translate-x-1/2 -top-8 left-1/2"
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
  </div>
</AppOverlay>

<!-- Modal get user email -->
<AppOverlay
  isOpen={isOpenModal}
  on:close={() => {
    isOpenModal = false;
  }}
>
  <div class="xl:title-3 title-1 text-center text-gray-600 font-semibold">
    Let's us know your email
  </div>
  <div class="mt-2">
    <div class="xl:text-base text-lg text-gray-500 text-center">
      Add your email to get updates from us and receive exclusive benefits soon.
    </div>
    <form
      on:submit|preventDefault={onSubmitGetEmail}
      class="flex flex-col gap-3 mt-4"
    >
      <div class="flex flex-col gap-1">
        <div class="flex flex-col gap-1">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              email ? "bg-[#F0F2F7]" : ""
            }`}
          >
            <div class="xl:text-base text-xl text-[#666666] font-medium">
              Email
            </div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your email"
              value=""
              class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
                email ? "bg-[#F0F2F7]" : ""
              }
              `}
              on:keyup={({ target: { value } }) => (email = value)}
            />
          </div>
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

<style>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
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
</style>

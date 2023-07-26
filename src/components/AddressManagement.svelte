<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import * as browser from "webextension-polyfill";
  import { wallet, chain } from "~/store";
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

  export let type: "portfolio" | "order" = "portfolio";
  export let title;

  import type { AddressData } from "~/types/AddressData";

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

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
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

  const getListAddress = async (type) => {
    isLoadingFullPage = true;
    try {
      const response: AddressData = await sendMessage(
        "getListAddress",
        undefined
      );

      const structWalletData = (response || []).map((item) => {
        return {
          id: item.id,
          label: item.label,
          value: item.address,
        };
      });

      if (type === "reload") {
        isLoadingFullPage = false;
        listAddress = structWalletData;
        return;
      }

      listAddress = listAddress.concat(structWalletData);

      const selectedChainRes = await browser.storage.sync.get("selectedChain");
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
    } catch (error) {
      console.log(error);
      isLoadingFullPage = false;
    }
  };

  const updateStateFromParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressParams = urlParams.get("address");
    const chainParams = urlParams.get("chain");
    if (chainParams) {
      chain.update((n) => (n = chainParams));
    }
    if (!chainParams && listAddress.length === 0) {
      chain.update((n) => (n = ""));
    }
    if (!chainParams && listAddress.length === 0 && addressParams) {
      chain.update((n) => (n = "ALL"));
      if (getAddressContext(selectedWallet)?.type === "BTC") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + `?address=${selectedWallet}`
        );
      }
    }
    if (!chainParams && listAddress.length !== 0) {
      if (getAddressContext(selectedWallet)?.type === "EVM") {
        chain.update((n) => (n = "ALL"));
      }
      if (getAddressContext(selectedWallet)?.type === "BTC") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + `?address=${selectedWallet}`
        );
      }
    }
    if (addressParams) {
      wallet.update((n) => (n = addressParams));
    }
    if (!addressParams && listAddress.length === 0) {
      wallet.update((n) => (n = ""));
    }
  };

  onMount(() => {
    getListAddress("fetch");
    updateStateFromParams();
  });

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

  const onSubmit = (e) => {
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

      const addWallet = [...listAddress, dataFormat];
      listAddress = addWallet;

      if (addWallet.length === 1) {
        wallet.update((n) => (n = listAddress[0].value));
        if (getAddressContext(dataFormat.value)?.type === "EVM") {
          chain.update((n) => (n = "ALL"));
        }
      }

      wallet.update((n) => (n = dataFormat.value));

      const filterWalletList = addWallet.filter((item) => item.value !== "all");
      const structWalletList = filterWalletList.map((item) => {
        return {
          id: item.value,
          label: item.label,
          address: item.value,
        };
      });

      browser.storage.sync
        .set({ listAddress: JSON.stringify(structWalletList) })
        .then(() => {
          console.log("save address to sync storage");
        });

      // sendMessage("getSync", { address: dataFormat.value }); // Auto call sync when we add wallet?

      e.target.reset();
      errors = {};
      isOpenAddModal = false;
      getListAddress("reload");
      toastMsg = "Successfully add new wallet!";
      isSuccessToast = true;
      trigger();
      mixpanel.track("user_add_address");
    } else {
      console.log("Invalid Form");
      toastMsg = "Something wrong when add new wallet. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };

  const onSubmitGetEmail = async (e) => {
    isLoadingSendMail = true;
    const formData = new FormData(e.target);

    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    try {
      const res = await nimbus.post(
        "/subscription/analysis",
        {
          email: data.email,
          address: selectedWallet,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      isLoadingSendMail = false;
      localStorage.setItem("showDisableAddWallet", "false");
      toastMsg = "Ready to receive exclusive benefits soon!";
      isSuccessToast = true;
      trigger();
    } catch (e) {
      isLoadingSendMail = false;
    } finally {
      isOpenModal = false;
    }
  };

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

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

  $: formatListAddress = listAddress.map((item) => {
    return {
      ...item,
      logo:
        getAddressContext(item.value).type === "EVM"
          ? EthereumLogo
          : BitcoinLogo,
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
      if (getAddressContext(selectedWallet)?.type === "EVM") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?chain=${selectedChain}&address=${selectedWallet}`
        );
      }
      if (getAddressContext(selectedWallet)?.type === "BTC") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + `?address=${selectedWallet}`
        );
        if (selectedChain) {
          chain.update((n) => (n = selectedChain));
        } else {
          chain.update((n) => (n = "ALL"));
        }
      }
    }
  }

  $: isDisabled = APP_TYPE.TYPE !== "EXT" && formatListAddress.length === 5;
  $: isDisabledBtn =
    isDisabled &&
    (localStorage.getItem("showDisableAddWallet") === null ||
      localStorage.getItem("showDisableAddWallet") === "true");
</script>

<ErrorBoundary>
  {#if isLoadingFullPage}
    <div class="flex items-center justify-center h-screen">
      <loading-icon />
    </div>
  {:else}
    <div>
      {#if formatListAddress.length === 0 && selectedWallet.length === 0}
        <div class="flex items-center justify-center h-screen">
          <div
            class="flex flex-col items-center justify-center w-2/3 gap-4 p-6"
          >
            <div class="text-lg">
              {MultipleLang.addwallet}
            </div>
            <Button variant="tertiary" on:click={() => (isOpenAddModal = true)}>
              <img src={Plus} alt="" width="12" height="12" />
              <div class="xl:text-base text-2xl font-medium text-white">
                {MultipleLang.content.btn_text}
              </div>
            </Button>
          </div>
        </div>
      {:else}
        <div class="header-container">
          <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[96%]">
            <div class="flex flex-col mb-5 gap-14">
              <div class="flex items-center justify-between gap-6">
                <div class="xl:block hidden">
                  {#if formatListAddress.length !== 0}
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
                                class="xl:w-4 xl:h-4 w-5 h-5"
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
                                class="xl:w-4 xl:h-4 w-5 h-5"
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
                        </AnimateSharedLayout>
                      {/if}
                    </div>
                  {:else}
                    <div class="xl:text-base text-2xl font-semibold text-white">
                      {MultipleLang.empty_wallet}
                    </div>
                  {/if}
                </div>

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
                        class:hover:no-underline={item.value === selectedWallet}
                        on:click={() => {
                          wallet.update((n) => (n = item.value));
                        }}
                      >
                        <img src={item.logo} alt="" class="w-5 h-5" />
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

                <div
                  class="relative"
                  on:mouseenter={() => {
                    if (isDisabled) {
                      showDisableAddWallet = true;
                    }
                  }}
                  on:mouseleave={() => {
                    if (isDisabled) {
                      showDisableAddWallet = false;
                    }
                  }}
                >
                  {#if isDisabledBtn}
                    <Button variant="disabled" disabled>
                      <img src={Plus} alt="" class="xl:w-3 xl:h-3 w-4 h-4" />
                      <div class="xl:text-base text-2xl font-medium text-white">
                        {MultipleLang.content.btn_text}
                      </div>
                    </Button>
                  {:else}
                    <Button
                      variant="tertiary"
                      on:click={() => {
                        const showDisableAddWalletStorage =
                          localStorage.getItem("showDisableAddWallet");
                        if (isDisabled) {
                          if (
                            showDisableAddWalletStorage !== null &&
                            showDisableAddWalletStorage === "false"
                          ) {
                            isOpenAddModal = true;
                            return;
                          }
                          localStorage.setItem("showDisableAddWallet", "true");
                          isOpenModal = true;
                        } else {
                          isOpenAddModal = true;
                        }
                      }}
                    >
                      <img src={Plus} alt="" class="xl:w-3 xl:h-3 w-4 h-4" />
                      <div class="xl:text-base text-2xl font-medium text-white">
                        {MultipleLang.content.btn_text}
                      </div>
                    </Button>
                  {/if}
                  {#if showDisableAddWallet}
                    <div
                      class="xl:absolute hidden transform -translate-x-1/2 -top-8 left-1/2"
                      style="z-index: 2147483648;"
                    >
                      <tooltip-detail
                        text={"Install our extension to add more wallet"}
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
                        size="supper-small"
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

<AppOverlay isOpen={isOpenAddModal} on:close={() => (isOpenAddModal = false)}>
  <div class="xl:title-3 title-1 text-gray-600 font-semibold">
    {MultipleLang.content.modal_add_title}
  </div>
  <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3 mt-4">
    <div class="flex flex-col gap-1">
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
    </div>
    <div class="flex flex-col gap-1">
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
</AppOverlay>

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
        <div class="lg:w-[120px] flex-1">
          <Button
            variant="secondary"
            on:click={() => {
              isOpenModal = false;
            }}
          >
            {MultipleLang.content.modal_cancel}</Button
          >
        </div>
        <div class="lg:w-[120px] flex-1">
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

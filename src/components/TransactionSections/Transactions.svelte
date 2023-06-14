<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import * as browser from "webextension-polyfill";
  import { isEmpty } from "lodash";
  import { wallet } from "~/store";
  import { i18n } from "~/lib/i18n";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { chainList, getAddressContext } from "~/utils";

  import type { AddressData } from "~/types/AddressData";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";
  import Select from "~/components/Select.svelte";
  import CopyToClipboard from "~/components/CopyToClipboard.svelte";
  import AppOverlay from "~/components/Overlay.svelte";

  import Plus from "~/assets/plus.svg";
  import Reload from "~/assets/reload.svg";
  import EthereumLogo from "~/assets/ethereum.png";
  import BitcoinLogo from "~/assets/bitcoin.png";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytic: i18n("newtabPage.analytic", "Analytic"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
    news: i18n("newtabPage.news", "News"),
    market: i18n("newtabPage.market", "Market"),
    settings: i18n("newtabPage.settings", "Settings"),
    overview: i18n("newtabPage.overview", "Overview"),
    empty_wallet: i18n("newtabPage.empty-wallet", "No wallet added yet."),
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
    data_updated: i18n("newtabPage.data-updated", "Data updated"),
    updating_data: i18n("newtabPage.updating-data", "Updating data"),
    search_placeholder: i18n("newtabPage.search-placeholder", "Search"),
    missed_protocol: i18n(
      "newtabPage.missed-protocol",
      "Missing your protocol?"
    ),
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

  let selectedWallet: any = {};
  wallet.subscribe((value) => {
    selectedWallet = value;
  });
  let showFollowTooltip = false;
  let showDisableAddWallet = false;
  let isLoadingFullPage = false;
  let listAddress = [];
  let address = "";
  let label = "";
  let errors: any = {};
  let isOpenAddModal = false;
  let isLoading;
  let selectedChain = chainList[0];
  let data = [];

  const getListAddress = async () => {
    isLoadingFullPage = true;
    console.log("Start get list address");
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

      listAddress = listAddress.concat(structWalletData);

      const selectedWalletRes = await browser.storage.sync.get(
        "selectedWallet"
      );

      if (
        selectedWalletRes &&
        !isEmpty(JSON.parse(selectedWalletRes.selectedWallet))
      ) {
        wallet.update(
          (n) => (n = JSON.parse(selectedWalletRes.selectedWallet))
        );
      }

      if (
        selectedWalletRes &&
        isEmpty(JSON.parse(selectedWalletRes.selectedWallet)) &&
        listAddress.length
      ) {
        wallet.update((n) => (n = listAddress[0]));
      }

      const urlParams = new URLSearchParams(window.location.search);
      const addressParams = urlParams.get("address");
      if (addressParams) {
        wallet.update(
          (n) =>
            (n = {
              id: addressParams,
              logo: "",
              label: "",
              value: addressParams,
            })
        );
      }
      if (!addressParams && selectedWallet && listAddress.length === 0) {
        wallet.update((n) => (n = {}));
      }

      isLoadingFullPage = false;
    } catch (error) {
      console.log(error);
      isLoadingFullPage = false;
    }
  };

  const getListTransactions = async () => {
    console.log("HELLO WORLD");
  };

  onMount(() => {
    getListAddress();
  });

  // handle add wallet
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
        wallet.update((n) => (n = listAddress[0]));
      }

      const filterWalletList = addWallet.filter((item) => item.value !== "all");
      const structWalletList = filterWalletList.map((item) => {
        return {
          id: item.value,
          logo: item.logo,
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
      isOpenAddModal = false;
    } else {
      console.log("Invalid Form");
    }
  };

  let formatChainList = [];

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
    if (
      selectedWallet !== undefined &&
      Object.keys(selectedWallet).length !== 0
    ) {
      browser.storage.sync
        .set({ selectedWallet: JSON.stringify(selectedWallet) })
        .then(() => {
          console.log("save selected address to sync storage");
        });
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?address=${selectedWallet.value}`
      );
      getListTransactions();
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
      switch (getAddressContext(selectedWallet.value)?.type) {
        case "EVM":
          formatChainList = chainList.filter(
            (item) =>
              item.value === "ALL" ||
              item.value === "ETH" ||
              item.value === "GNOSIS" ||
              item.value === "BNB" ||
              item.value === "POLYGON" ||
              item.value === "SOLANA" ||
              item.value === "ARBITRUM"
          );
          break;
        case "BTC":
          formatChainList = chainList.filter((item) => item.value === "BTC");
          break;
        default:
          formatChainList = chainList;
      }
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
      {#if formatListAddress.length === 0 && Object.keys(selectedWallet).length === 0}
        <div class="flex justify-center items-center h-screen">
          <div
            class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center"
          >
            <div class="text-lg">
              {MultipleLang.addwallet}
            </div>
            <Button
              variant="tertiary"
              width={136}
              on:click={() => (isOpenAddModal = true)}
            >
              <img src={Plus} alt="" width="12" height="12" />
              <div class="text-base font-medium text-white">
                {MultipleLang.content.btn_text}
              </div>
            </Button>
          </div>
        </div>
      {:else}
        <div class="header-container">
          <div class="flex flex-col max-w-[2000px] m-auto w-[82%]">
            <div class="flex flex-col gap-14 mb-5">
              <div class="flex justify-between items-center">
                {#if formatListAddress.length !== 0}
                  <div class="flex items-center gap-5">
                    {#if formatListAddress.length > 4}
                      {#each formatListAddress.slice(0, 4) as item}
                        <div
                          id={item.value}
                          class={`text-base text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${
                            item.value === selectedWallet?.value &&
                            "bg-[#ffffff1c]"
                          }`}
                          class:hover:no-underline={item.value ===
                            selectedWallet?.value}
                          on:click={() => {
                            wallet.update((n) => (n = item));
                          }}
                        >
                          <img
                            src={item.logo}
                            alt="logo"
                            width="16"
                            height="16"
                          />
                          {item.label}
                        </div>
                      {/each}
                      <Select
                        isOptionsPage={true}
                        isSelectWallet={true}
                        listSelect={formatListAddress.slice(
                          4,
                          formatListAddress.length
                        )}
                        bind:selected={selectedWallet}
                      />
                    {:else}
                      {#each formatListAddress as item}
                        <div
                          id={item.value}
                          class={`text-base text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${
                            item.value === selectedWallet?.value &&
                            "bg-[#ffffff1c]"
                          }`}
                          class:hover:no-underline={item.value ===
                            selectedWallet?.value}
                          on:click={() => {
                            wallet.update((n) => (n = item));
                          }}
                        >
                          <img
                            src={item.logo}
                            alt="logo"
                            width="16"
                            height="16"
                          />
                          {item.label}
                        </div>
                      {/each}
                    {/if}
                  </div>
                {:else}
                  <div class="text-white text-base font-semibold">
                    {MultipleLang.empty_wallet}
                  </div>
                {/if}
                <div
                  class="relative"
                  on:mouseenter={() => {
                    if (
                      APP_TYPE.TYPE !== "EXT" &&
                      formatListAddress.length === 3
                    ) {
                      showDisableAddWallet = true;
                    }
                  }}
                  on:mouseleave={() => {
                    if (
                      APP_TYPE.TYPE !== "EXT" &&
                      formatListAddress.length === 3
                    ) {
                      showDisableAddWallet = false;
                    }
                  }}
                >
                  <Button
                    variant={APP_TYPE.TYPE !== "EXT" &&
                    formatListAddress.length === 3
                      ? "disabled"
                      : "tertiary"}
                    width={136}
                    on:click={() => {
                      if (
                        APP_TYPE.TYPE !== "EXT" &&
                        formatListAddress.length === 3
                      ) {
                        window.open("https://getnimbus.io", "_blank");
                      } else {
                        isOpenAddModal = true;
                      }
                    }}
                  >
                    <img src={Plus} alt="" width="12" height="12" />
                    <div class="text-base font-medium text-white">
                      {MultipleLang.content.btn_text}
                    </div>
                  </Button>
                  {#if showDisableAddWallet}
                    <div
                      class="absolute -top-8 left-1/2 transform -translate-x-1/2"
                      style="z-index: 2147483648;"
                    >
                      <tooltip-detail
                        text={"Install our extension to add more wallet"}
                      />
                    </div>
                  {/if}
                </div>
              </div>

              <div class="flex justify-between items-end">
                <div class="flex flex-col gap-3">
                  <div class="flex items-end gap-6">
                    <div class="text-5xl text-white font-semibold">
                      Transactions
                    </div>
                    <div class="flex items-center gap-2 mb-1">
                      <div
                        class="cursor-pointer"
                        class:loading={isLoading}
                        on:click={getListTransactions}
                      >
                        <img src={Reload} alt="" />
                      </div>
                      <div class="text-xs text-white font-medium">
                        {#if isLoading}
                          Updating data
                        {:else}
                          Reload
                        {/if}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-base">
                      <CopyToClipboard
                        address={selectedWallet.value}
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
                      <a
                        href="https://forms.gle/UdUbaEevMYLp4SFK8"
                        target="_blank"
                      >
                        <Button
                          variant="secondary"
                          width={140}
                          size="supper-small">Follow this whale 🐳</Button
                        >
                      </a>
                      {#if showFollowTooltip}
                        <div
                          class="absolute -top-8 left-1/2 transform -translate-x-1/2"
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
                <Select
                  isOptionsPage={false}
                  isSelectWallet={false}
                  listSelect={formatChainList}
                  bind:selected={selectedChain}
                />
              </div>
            </div>
          </div>
        </div>
        <div class="max-w-[2000px] m-auto w-[90%] -mt-26">
          <div
            class="flex flex-col gap-7 bg-white rounded-[20px] p-8"
            style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
          >
            <div
              class="flex flex-col gap-6 border border-[#0000001a] rounded-[20px] p-6"
            >
              <div class="text-2xl font-medium text-black">Transactions</div>
              <div class="border border-[#0000000d] rounded-[10px]">
                <table class="table-auto w-full">
                  <thead>
                    <tr class="bg-[#f4f5f880]">
                      <th class="pl-3 py-3">
                        <div
                          class="text-left text-xs uppercase font-semibold text-black"
                        >
                          Transaction
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-left text-xs uppercase font-semibold text-black"
                        >
                          From
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right text-xs uppercase font-semibold text-black"
                        >
                          To
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right text-xs uppercase font-semibold text-black"
                        >
                          Type
                        </div>
                      </th>
                      <th class="pr-3 py-3">
                        <div class="text-xs uppercase font-semibold text-black">
                          Token change
                        </div>
                      </th>
                    </tr>
                  </thead>
                  {#if isLoading}
                    <tbody>
                      <tr>
                        <td colspan={6}>
                          <div
                            class="flex justify-center items-center py-4 px-3"
                          >
                            <loading-icon />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  {:else}
                    <tbody>
                      {#if data && data.length === 0}
                        <tr>
                          <td colspan={6}>
                            <div
                              class="flex justify-center items-center py-4 px-3 text-lg text-gray-400"
                            >
                              Empty
                            </div>
                          </td>
                        </tr>
                      {:else}
                        hello
                      {/if}
                    </tbody>
                  {/if}
                </table>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
  <AppOverlay isOpen={isOpenAddModal} on:close={() => (isOpenAddModal = false)}>
    <div class="title-3 text-gray-600 font-semibold max-w-[530px]">
      {MultipleLang.content.modal_add_title}
    </div>
    <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3 mt-4">
      <div class="flex flex-col gap-1 w-[530px]">
        <div class="flex flex-col gap-1">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              address ? "bg-[#F0F2F7]" : ""
            }`}
            class:input-border-error={errors.address && errors.address.required}
          >
            <div class="text-xs text-[#666666] font-medium">
              {MultipleLang.content.modal_address_label}
            </div>
            <input
              type="text"
              id="address"
              name="address"
              placeholder={MultipleLang.content.modal_address_label}
              value=""
              class={`p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B] ${
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
      <div class="flex flex-col gap-1 w-[530px]">
        <div class="flex flex-col gap-1">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              label ? "bg-[#F0F2F7]" : ""
            }`}
            class:input-border-error={errors.label && errors.label.required}
          >
            <div class="text-xs text-[#666666] font-medium">
              {MultipleLang.content.modal_label_label}
            </div>
            <input
              type="text"
              id="label"
              name="label"
              placeholder={MultipleLang.content.modal_label_label}
              value=""
              class={`p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B] ${
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
        <Button
          variant="secondary"
          width={90}
          on:click={() => {
            errors = {};
            isOpenAddModal = false;
          }}
        >
          {MultipleLang.content.modal_cancel}</Button
        >
        <Button width={90} type="submit">
          {MultipleLang.content.modal_add}</Button
        >
      </div>
    </form>
  </AppOverlay>
</ErrorBoundary>

<style>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 164px;
    padding-top: 24px;
  }

  .input-border {
    border: 1px solid rgb(229, 231, 235);
  }

  .input-border-error {
    border: 1px solid red;
  }

  .loading {
    animation-name: loading;
    animation-duration: 1.4s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  @keyframes loading {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

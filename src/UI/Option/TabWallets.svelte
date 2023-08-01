<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { i18n } from "~/lib/i18n";
  import { dndzone } from "svelte-dnd-action";
  import { getAddressContext } from "~/utils";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { wallet, chain, typeWallet } from "~/store";
  import mixpanel from "mixpanel-browser";
  import { nimbus } from "~/lib/network";
  import Vezgo from "vezgo-sdk-js/dist/vezgo.es5.js";

  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";
  import "~/components/Loading.custom.svelte";

  import Plus from "~/assets/plus.svg";
  import User from "~/assets/user.png";

  const MultipleLang = {
    title: i18n("optionsPage.accounts-page-title", "My wallets"),
    content: {
      btn_text: i18n(
        "optionsPage.accounts-page-content.address-btn-text",
        "Add Wallet"
      ),
      address_header_table: i18n(
        "optionsPage.accounts-page-content.address-header-table",
        "Wallet"
      ),
      label_header_table: i18n(
        "optionsPage.accounts-page-content.label-header-table",
        "Label"
      ),
      action_header_table: i18n(
        "optionsPage.accounts-page-content.action-header-table",
        "Action"
      ),
      modal_cancel: i18n(
        "optionsPage.accounts-page-content.modal-cancel",
        "Cancel"
      ),
      modal_add: i18n(
        "optionsPage.accounts-page-content.modal-add-wallet",
        "Add"
      ),
      modal_edit: i18n("optionsPage.accounts-page-content.modal-edit", "Edit"),
      modal_delete: i18n(
        "optionsPage.accounts-page-content.modal-delete",
        "Delete"
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
        "Add your wallet"
      ),
      modal_add_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-add-sub-title",
        "Add your wallet will give you more option to see the information at page new tab"
      ),
      modal_delete_title: i18n(
        "optionsPage.accounts-page-content.modal-delete-title",
        "Are you sure?"
      ),
      modal_delete_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-delete-sub-title",
        "Do you really want to delete this wallet? This process cannot revert"
      ),
      modal_edit_title: i18n(
        "optionsPage.accounts-page-content.modal-edit-title",
        "Edit your wallet"
      ),
      modal_edit_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-edit-sub-title",
        "Edit your wallet will make change the information at page new tab"
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

  let userInfo = {};

  let isLoading = false;
  let errors: any = {};
  let errorsEdit: any = {};
  let listAddress = [];
  let selectedItemEdit: any = {};
  let isOpenEditModal = false;
  let isOpenAddModal = false;
  let isOpenConfirmDelete = false;
  let selectedWallet = {};
  let address = "";
  let label = "";

  let isLoadingDelete = false;
  let showDisableAddWallet = false;

  let show = false;
  let counter = 3;
  let toastMsg = "";
  let isSuccess = false;

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

  const isRequiredFieldValid = (value) => {
    return value != null && value !== "";
  };

  const validateForm = (data) => {
    const isDuplicatedAddress = listAddress.some((item) => {
      return item.address === data.address;
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

  const validateFormEdit = (data) => {
    if (!isRequiredFieldValid(data.address)) {
      errorsEdit["address"] = {
        ...errorsEdit["address"],
        required: true,
        msg: MultipleLang.content.address_required,
      };
    } else {
      if (!getAddressContext(data.address)) {
        errorsEdit["address"] = {
          ...errorsEdit["address"],
          required: true,
          msg: MultipleLang.content.re_input_address,
        };
      } else {
        errorsEdit["address"] = { ...errorsEdit["address"], required: false };
      }
    }

    if (!isRequiredFieldValid(data.label)) {
      errorsEdit["label"] = {
        ...errorsEdit["label"],
        required: true,
        msg: MultipleLang.content.label_required,
      };
    } else {
      errorsEdit["label"] = { ...errorsEdit["label"], required: false };
    }
  };

  const getListAddress = async () => {
    isLoading = true;
    try {
      const response: any = await nimbus.get("/accounts/list");
      if (response && response?.data) {
        const structWalletData = response?.data.map((item) => {
          return {
            position: item.position,
            id: item.id,
            type: item.type,
            label: item.label,
            address: item.accountId,
          };
        });
        listAddress = structWalletData;
        isLoading = false;
      } else {
        isLoading = false;
      }
    } catch (e) {
      console.log("e: ", e);
      isLoading = false;
    }
  };

  $: {
    if (listAddress && listAddress?.length === 1) {
      wallet.update((n) => (n = `${listAddress[0].address}`));
      if (listAddress[0].type === "DEX") {
        typeWallet.update((n) => (n = "DEX"));
        if (getAddressContext(listAddress[0].address)?.type === "EVM") {
          chain.update((n) => (n = "ALL"));
        }
      }
      if (listAddress[0].type === "CEX") {
        typeWallet.update((n) => (n = "CEX"));
        chain.update((n) => (n = "ALL"));
      }
    }
  }

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
        Object.assign(data, { id: data.address });

        await nimbus.post("/accounts", {
          type: "DEX",
          publicAddress: data.address,
          accountId: data.address,
          label: data.label,
        });

        e.target.reset();
        isOpenAddModal = false;
        getListAddress();
        toastMsg = "Successfully add DEX account!";
        isSuccess = true;
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
      isSuccess = false;
      trigger();
    }
  };

  // Add CEX address account
  const onSubmitCEX = () => {
    const evmToken = localStorage.getItem("evm_token");
    if (evmToken) {
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
            getListAddress();
            toastMsg = "Successfully add CEX account!";
            isSuccess = true;
            trigger();
            mixpanel.track("user_add_address");
          })
          .onError(function (error) {
            console.error("connection vezgo error", error);
            getListAddress();
            toastMsg =
              "Something wrong when add CEX account. Please try again!";
            isSuccess = false;
            trigger();
          });
      }
    }
  };

  // Edit account
  const onSubmitEdit = async (e) => {
    try {
      const formData = new FormData(e.target);

      const data: any = {};
      for (let field of formData) {
        const [key, value] = field;
        data[key] = value;
      }

      if (selectedItemEdit.type === "CEX") {
        await nimbus.put(`/accounts/${selectedItemEdit.id}`, {
          accountId: selectedItemEdit.address,
          label: data.label,
        });

        getListAddress();
        e.target.reset();
        isOpenEditModal = false;
        toastMsg = "Successfully edit your wallet!";
        isSuccess = true;
        trigger();
        mixpanel.track("user_edit_address");
      }

      if (selectedItemEdit.type === "DEX") {
        validateFormEdit(data);
        if (
          !Object.keys(errorsEdit).some(
            (inputName) => errorsEdit[inputName]["required"]
          )
        ) {
          Object.assign(data, { id: data.address });

          await nimbus.put(`/accounts/${selectedItemEdit.id}`, {
            accountId: data.address,
            label: data.label,
          });

          getListAddress();
          e.target.reset();
          isOpenEditModal = false;
          toastMsg = "Successfully edit your wallet!";
          isSuccess = true;
          trigger();
          mixpanel.track("user_edit_address");
        } else {
          console.log("Invalid Form");
        }
      }
    } catch (e) {
      console.error(e);
      toastMsg = "Something wrong when edit your wallet. Please try again!";
      isSuccess = false;
      trigger();
    }
  };

  // Delete account
  const handleDelete = async (item) => {
    isLoadingDelete = true;
    try {
      await nimbus.delete(`/accounts/${item.id}`, {});
      getListAddress();
      isLoadingDelete = false;
      isOpenConfirmDelete = false;
      toastMsg = "Successfully delete your account!";
      isSuccess = true;
      trigger();
    } catch (e) {
      console.error("e: ", e);
      isLoadingDelete = false;
      isOpenConfirmDelete = false;
      toastMsg = "Something wrong when delete your account. Please try again!";
      isSuccess = false;
      trigger();
    }
  };

  // Sort list address
  const handleSortListAddress = async (listAddress) => {
    try {
      const formatListAddress = listAddress.map((item, index) => {
        return {
          id: item.id,
          position: index,
        };
      });
      await nimbus.post(`/accounts/sorting`, formatListAddress);
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const handleSelectedEdit = (item) => {
    selectedItemEdit = item;
    address = item.address;
    label = item.label;
    isOpenEditModal = true;
  };

  onMount(() => {
    const evmToken = localStorage.getItem("evm_token");
    if (evmToken) {
      userInfo = {
        picture: User,
      };
    }
    getListAddress();
  });

  $: {
    if (
      address &&
      errors.address &&
      errors.address.msg === MultipleLang.content.address_required
    ) {
      errors["address"] = { ...errors["address"], required: false, msg: "" };
    }
    if (
      address &&
      errorsEdit.address &&
      errorsEdit.address.msg === MultipleLang.content.address_required
    ) {
      errorsEdit["address"] = {
        ...errors["address"],
        required: false,
        msg: "",
      };
    }
    if (
      label &&
      errors.label &&
      errors.label.msg === MultipleLang.content.label_required
    ) {
      errors["label"] = { ...errors["label"], required: false, msg: "" };
    }
    if (
      label &&
      errorsEdit.label &&
      errorsEdit.label.msg === MultipleLang.content.label_required
    ) {
      errorsEdit["label"] = { ...errors["label"], required: false, msg: "" };
    }
  }

  $: {
    if (listAddress.length === 0) {
      wallet.update((n) => (n = ""));
      chain.update((n) => (n = ""));
      typeWallet.update((n) => (n = ""));
    }
  }

  $: isDisabled = APP_TYPE.TYPE !== "EXT" && listAddress.length === 5;
</script>

<div class="flex flex-col gap-4">
  <div class="flex justify-between items-center">
    <div class="xl:title-3 title-1 text-gray-500">{MultipleLang.title}</div>

    {#if listAddress && listAddress.length === 0}
      <div class="relative xl:w-max w-[260px]">
        {#if Object.keys(userInfo).length !== 0}
          <Button variant="tertiary" on:click={() => (isOpenAddModal = true)}>
            <img src={Plus} alt="" width="12" height="12" />
            <div class="xl:text-base text-2xl font-medium text-white">
              {MultipleLang.content.btn_text}
            </div>
          </Button>
        {:else}
          <div
            class="relative"
            on:mouseenter={() => {
              showDisableAddWallet = true;
            }}
            on:mouseleave={() => {
              showDisableAddWallet = false;
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
    {:else}
      <div
        class="relative xl:w-max w-[260px]"
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
          <Button variant="disabled" disabled>
            <img src={Plus} alt="" class="xl:w-3 xl:h-3 w-4 h-4" />
            <div class="xl:text-base text-2xl font-medium text-white">
              Add account
            </div>
          </Button>
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
    {/if}
  </div>

  <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
    <table class="table-auto xl:w-full w-[1200px]">
      <thead>
        <tr class="bg-[#f4f5f8]">
          <th class="pl-3 py-3">
            <div
              class="text-left xl:text-sm text-base uppercase font-semibold text-black"
            >
              {MultipleLang.content.address_header_table}
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-left xl:text-sm text-base uppercase font-semibold text-black"
            >
              {MultipleLang.content.label_header_table}
            </div>
          </th>
          <th class="pr-3 py-3">
            <div
              class="text-right xl:text-sm text-base uppercase font-semibold text-black"
            >
              {MultipleLang.content.action_header_table}
            </div>
          </th>
        </tr>
      </thead>
      {#if isLoading}
        <tbody>
          <tr>
            <td colspan="3">
              <div class="flex justify-center items-center py-4 px-3">
                <loading-icon />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody
          use:dndzone={{
            items: listAddress,
            flipDurationMs: 300,
            dropTargetStyle: { outline: "none" },
            transformDraggedElement: (draggedEl, data, index) => {
              draggedEl.classList.add("myStyle");
            },
          }}
          on:consider={(e) => {
            listAddress = e.detail.items;
          }}
          on:finalize={(e) => {
            listAddress = e.detail.items;
            handleSortListAddress(e.detail.items);
          }}
        >
          {#if listAddress && listAddress.length === 0}
            <tr>
              <td colspan="3">
                <div class="flex justify-center items-center py-4 px-3">
                  No address
                </div>
              </td>
            </tr>
          {:else}
            {#each listAddress as item (item.id)}
              <tr class="hover:bg-gray-100 transition-all">
                <td class="pl-3 py-4">
                  <div
                    class="text-left flex items-center gap-3 xl:text-base text-xl"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 7.75H3C2.59 7.75 2.25 7.41 2.25 7C2.25 6.59 2.59 6.25 3 6.25H21C21.41 6.25 21.75 6.59 21.75 7C21.75 7.41 21.41 7.75 21 7.75ZM21 12.75H3C2.59 12.75 2.25 12.41 2.25 12C2.25 11.59 2.59 11.25 3 11.25H21C21.41 11.25 21.75 11.59 21.75 12C21.75 12.41 21.41 12.75 21 12.75ZM21 17.75H3C2.59 17.75 2.25 17.41 2.25 17C2.25 16.59 2.59 16.25 3 16.25H21C21.41 16.25 21.75 16.59 21.75 17C21.75 17.41 21.41 17.75 21 17.75Z"
                        fill="#9ca3af"
                      />
                    </svg>
                    <Copy address={item.address} iconColor="#000" />
                  </div>
                </td>
                <td class="py-4">
                  <div
                    class="bg-[#6AC7F533] text-[#27326F] w-max px-3 py-1 rounded-[5px] xl:text-base text-xl"
                  >
                    {item.label}
                  </div>
                </td>
                <td class="pr-3 py-4">
                  <div class="flex justify-end gap-6">
                    <div
                      class="text-red-600 hover:underline dark:text-red-500 xl:text-base text-2xl transition-all cursor-pointer font-semibold"
                      on:click={() => {
                        isOpenConfirmDelete = true;
                        selectedWallet = item;
                      }}
                    >
                      {MultipleLang.content.modal_delete}
                    </div>
                    <div
                      class="text-blue-600 hover:underline dark:text-blue-500 xl:text-base text-2xl transition-all cursor-pointer font-semibold"
                      on:click={() => handleSelectedEdit(item)}
                    >
                      {MultipleLang.content.modal_edit}
                    </div>
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

<!-- Modal edit account -->
<AppOverlay isOpen={isOpenEditModal} on:close={() => (isOpenEditModal = false)}>
  <div class="xl:title-3 title-1 text-gray-600 font-semibold">
    {MultipleLang.content.modal_edit_title}
  </div>
  <form
    on:submit|preventDefault={onSubmitEdit}
    class="flex flex-col gap-3 mt-4"
  >
    <div class="flex flex-col gap-1">
      <div
        class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
          address ? "bg-[#F0F2F7]" : ""
        }`}
        class:input-border-error={errorsEdit.address &&
          errorsEdit.address.required}
      >
        <div class="xl:text-base text-xl font-semibold text-gray-700">
          {MultipleLang.content.modal_address_label}
        </div>
        <input
          disabled={selectedItemEdit.type === "CEX"}
          type="text"
          id="address"
          name="address"
          placeholder={MultipleLang.content.modal_address_label}
          bind:value={selectedItemEdit.address}
          class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
            address ? "bg-[#F0F2F7]" : ""
          }`}
          on:keyup={({ target: { value } }) => (address = value)}
        />
      </div>
      {#if errorsEdit.address && errorsEdit.address.required}
        <div class="text-red-500 font-medium">
          {errorsEdit.address.msg}
        </div>
      {/if}
    </div>
    <div class="flex flex-col gap-1">
      <div
        class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
          label ? "bg-[#F0F2F7]" : ""
        }`}
        class:input-border-error={errorsEdit.label && errorsEdit.label.required}
      >
        <div class="xl:text-base text-xl font-semibold text-gray-700">
          {MultipleLang.content.modal_label_label}
        </div>
        <input
          type="text"
          id="label"
          name="label"
          placeholder={MultipleLang.content.modal_label_label}
          bind:value={selectedItemEdit.label}
          class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
            label ? "bg-[#F0F2F7]" : ""
          }`}
          on:keyup={({ target: { value } }) => (label = value)}
        />
      </div>
      {#if errorsEdit.label && errorsEdit.label.required}
        <div class="text-red-500 font-medium">
          {errorsEdit.label.msg}
        </div>
      {/if}
    </div>
    <div class="flex justify-end gap-2">
      <div class="lg:w-[100px] w-full">
        <Button
          variant="secondary"
          on:click={() => {
            errorsEdit = {};
            isOpenEditModal = false;
          }}
        >
          {MultipleLang.content.modal_cancel}</Button
        >
      </div>
      <div class="lg:w-[100px] w-full">
        <Button type="submit">
          {MultipleLang.content.modal_edit}</Button
        >
      </div>
    </div>
  </form>
</AppOverlay>

<!-- Modal add DEX account -->
<AppOverlay isOpen={isOpenAddModal} on:close={() => (isOpenAddModal = false)}>
  <div class="xl:title-3 title-1 text-gray-600 font-semibold">
    {MultipleLang.content.modal_add_title}
  </div>
  <div class="flex flex-col mt-4 gap-7">
    <div class="flex justify-center">
      <Button
        variant="tertiary"
        on:click={() => {
          onSubmitCEX();
          isOpenAddModal = false;
        }}
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

<!-- Modal confirm delete account -->
<AppOverlay
  isOpen={isOpenConfirmDelete}
  on:close={() => (isOpenConfirmDelete = false)}
>
  <div class="flex flex-col gap-1 items-start">
    <div class="xl:title-3 title-1 text-gray-600 font-semibold">
      {MultipleLang.content.modal_delete_title}
    </div>
    <div class="xl:text-sm text-lg text-gray-500">
      {MultipleLang.content.modal_delete_sub_title}
    </div>
  </div>
  <div class="flex justify-end gap-2 mt-4">
    <div class="lg:w-[100px] w-full h-[36px]">
      <Button
        variant="secondary"
        on:click={() => {
          isOpenConfirmDelete = false;
          selectedWallet = {};
        }}
      >
        {MultipleLang.content.modal_cancel}
      </Button>
    </div>
    <div class="lg:w-[100px] w-full h-[36px]">
      <Button
        variant="delete"
        isLoading={isLoadingDelete}
        on:click={() => {
          handleDelete(selectedWallet);
        }}
      >
        {MultipleLang.content.modal_delete}
      </Button>
    </div>
  </div>
</AppOverlay>

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

<style>
  .input-border {
    border: 0.5px solid rgb(229, 231, 235);
  }
  .input-border-error {
    border: 0.5px solid red;
  }
  .form-item-translate {
    margin-top: 10px;
  }
  .table-border {
    border: 0.5px solid rgb(229, 231, 235);
  }

  .myStyle {
    display: flex !important;
    justify-content: space-between !important;
  }
</style>

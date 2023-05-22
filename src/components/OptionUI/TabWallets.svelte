<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import { i18n } from "~/lib/i18n";
  import { dndzone } from "svelte-dnd-action";
  import { getAddressContext } from "~/utils";

  import type { AddressData } from "~/types/AddressData";

  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";
  import CopyToClipboard from "~/components/CopyToClipboard.svelte";
  import "~/components/Loading.custom.svelte";

  import Plus from "~/assets/plus.svg";

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
      Object.assign(data, { id: data.address });

      listAddress = [...listAddress, data];

      browser.storage.sync.set({ listAddress: JSON.stringify(listAddress) });

      e.target.reset();
      isOpenAddModal = false;
    } else {
      console.log("Invalid Form");
    }
  };

  const onSubmitEdit = (e) => {
    const formData = new FormData(e.target);

    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    validateFormEdit(data);

    if (
      !Object.keys(errorsEdit).some(
        (inputName) => errorsEdit[inputName]["required"]
      )
    ) {
      Object.assign(data, { id: data.address });

      const foundItemEdit = listAddress.find(
        (element) => element.id === selectedItemEdit.id
      );

      const index = listAddress.indexOf(foundItemEdit);
      if (index > -1) {
        listAddress[index] = data;

        browser.storage.sync.set({ listAddress: JSON.stringify(listAddress) });

        e.target.reset();
        isOpenEditModal = false;
      }
    } else {
      console.log("Invalid Form");
    }
  };

  const getListAddress = async () => {
    isLoading = true;
    try {
      const response: AddressData = await sendMessage(
        "getListAddress",
        undefined
      );
      if (response) {
        listAddress = response;
      }
    } catch (e) {
      console.log("e: ", e);
    } finally {
      isLoading = false;
    }
  };

  const handleDelete = (item) => {
    const index = listAddress.indexOf(item);
    if (index > -1) {
      listAddress.splice(index, 1);
      browser.storage.sync.set({ listAddress: JSON.stringify(listAddress) });

      getListAddress();
      isOpenConfirmDelete = false;
    }
  };

  const handleEdit = (item) => {
    selectedItemEdit = item;
    address = item.address;
    label = item.label;
    isOpenEditModal = true;
  };

  onMount(() => {
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
      browser.storage.sync.set({ selectedWallet: {} });
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex justify-between items-center">
    <div class="title-3 text-gray-500">{MultipleLang.title}</div>
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
  <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto mt-2">
    <table class="table-auto w-full">
      <thead>
        <tr class="bg-[#f4f5f880]">
          <th class="pl-3 py-3">
            <div class="text-left text-sm uppercase font-semibold text-black">
              {MultipleLang.content.address_header_table}
            </div>
          </th>
          <th class="py-3">
            <div class="text-left text-sm uppercase font-semibold text-black">
              {MultipleLang.content.label_header_table}
            </div>
          </th>
          <th class="pr-3 py-3">
            <div class="text-right text-sm uppercase font-semibold text-black">
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
            browser.storage.sync.set({
              listAddress: JSON.stringify(listAddress),
            });
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
                  <div class="text-left flex items-center gap-3">
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
                    <CopyToClipboard
                      iconSize={16}
                      address={item.address}
                      iconColor="#000"
                      className="text-sm text-black"
                    />
                  </div>
                </td>
                <td class="py-4">
                  <div
                    class="bg-[#6AC7F533] text-[#27326F] w-max px-3 py-1 rounded-[5px]"
                  >
                    {item.label}
                  </div>
                </td>
                <td class="pr-3 py-4">
                  <div class="flex justify-end gap-6">
                    <div
                      class="text-red-600 hover:underline dark:text-red-500 transition-all cursor-pointer font-semibold"
                      on:click={() => {
                        isOpenConfirmDelete = true;
                        selectedWallet = item;
                      }}
                    >
                      {MultipleLang.content.modal_delete}
                    </div>
                    <div
                      class="text-blue-600 hover:underline dark:text-blue-500 transition-all cursor-pointer font-semibold"
                      on:click={() => handleEdit(item)}
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

<AppOverlay isOpen={isOpenEditModal} on:close={() => (isOpenEditModal = false)}>
  <div class="title-3 text-gray-600 font-semibold max-w-[530px]">
    {MultipleLang.content.modal_edit_title}
  </div>
  <form
    on:submit|preventDefault={onSubmitEdit}
    class="flex flex-col gap-3 mt-4"
  >
    <div class="flex flex-col gap-1 w-[530px]">
      <div
        class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
          address ? "bg-[#F0F2F7]" : ""
        }`}
        class:input-border-error={errorsEdit.address &&
          errorsEdit.address.required}
      >
        <div class="text-base font-semibold text-gray-700">
          {MultipleLang.content.modal_address_label}
        </div>
        <input
          type="text"
          id="address"
          name="address"
          placeholder={MultipleLang.content.modal_address_label}
          bind:value={selectedItemEdit.address}
          class={`p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B] ${
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
    <div class="flex flex-col gap-1 w-[530px]">
      <div
        class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
          label ? "bg-[#F0F2F7]" : ""
        }`}
        class:input-border-error={errorsEdit.label && errorsEdit.label.required}
      >
        <div class="text-base font-semibold text-gray-700">
          {MultipleLang.content.modal_label_label}
        </div>
        <input
          type="text"
          id="label"
          name="label"
          placeholder={MultipleLang.content.modal_label_label}
          bind:value={selectedItemEdit.label}
          class={`p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B] ${
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
      <Button
        variant="secondary"
        width={90}
        on:click={() => {
          errorsEdit = {};
          isOpenEditModal = false;
        }}
      >
        {MultipleLang.content.modal_cancel}</Button
      >
      <Button width={90} type="submit">
        {MultipleLang.content.modal_edit}</Button
      >
    </div>
  </form>
</AppOverlay>

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
          <div class="text-red-500 font-medium">
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
          <div class="text-red-500 font-medium">
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

<AppOverlay
  isOpen={isOpenConfirmDelete}
  on:close={() => (isOpenConfirmDelete = false)}
>
  <div class="flex flex-col gap-1 items-start max-w-[530px]">
    <div class="title-3 text-gray-600 font-semibold">
      {MultipleLang.content.modal_delete_title}
    </div>
    <div class="text-sm text-gray-500">
      {MultipleLang.content.modal_delete_sub_title}
    </div>
  </div>
  <div class="flex justify-end gap-2 mt-4">
    <Button
      variant="secondary"
      width={90}
      on:click={() => {
        isOpenConfirmDelete = false;
        selectedWallet = {};
      }}
    >
      {MultipleLang.content.modal_cancel}
    </Button>
    <Button
      variant="delete"
      width={90}
      on:click={() => {
        handleDelete(selectedWallet);
      }}
    >
      {MultipleLang.content.modal_delete}
    </Button>
  </div>
</AppOverlay>

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

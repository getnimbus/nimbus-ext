<svelte:options tag="tab-accounts" />

<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import { v4 as uuidv4 } from "uuid";
  import { i18n } from "~/lib/i18n";

  import type { AddressData } from "~/types/AddressData";

  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";

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
        "Do you really want to delete this wallet? This process cannot be undone"
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
    if (!isRequiredFieldValid(data.address)) {
      errors["address"] = {
        ...errors["address"],
        required: true,
        msg: MultipleLang.content.address_required,
      };
    } else {
      errors["address"] = { ...errors["address"], required: false };
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
      errorsEdit["address"] = { ...errorsEdit["address"], required: false };
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
    const regexETHAddress = /0x[a-fA-F0-9]{40}$/i;

    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    validateForm(data);

    if (
      !Object.keys(errors).some((inputName) => errors[inputName]["required"])
    ) {
      if (data.address && !regexETHAddress.test(data.address)) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: MultipleLang.content.re_input_address,
        };
        return;
      }

      const isDuplicatedAddress = listAddress.some((item) => {
        return item.address === data.address;
      });

      if (isDuplicatedAddress) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: MultipleLang.content.duplicate_address,
        };
        return;
      }

      Object.assign(data, { id: uuidv4() });

      listAddress = [...listAddress, data];

      browser.storage.sync
        .set({ listAddress: JSON.stringify(listAddress) })
        .then(() => {
          console.log("save address to sync storage");
        });

      e.target.reset();
      isOpenAddModal = false;

      getListAddress();
    } else {
      console.log("Invalid Form");
    }
  };

  const onSubmitEdit = (e) => {
    const formData = new FormData(e.target);
    const regexETHAddress = /0x[a-fA-F0-9]{40}$/i;

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
      if (data.address && !regexETHAddress.test(data.address)) {
        errorsEdit["address"] = {
          ...errorsEdit["address"],
          required: true,
          msg: MultipleLang.content.re_input_address,
        };
        return;
      }

      Object.assign(data, { id: selectedItemEdit.id });

      const foundItemEdit = listAddress.find(
        (element) => element.id === selectedItemEdit.id
      );

      const index = listAddress.indexOf(foundItemEdit);
      if (index > -1) {
        listAddress[index] = data;

        browser.storage.sync
          .set({ listAddress: JSON.stringify(listAddress) })
          .then(() => {
            console.log("save address to sync storage");
          });

        e.target.reset();
        isOpenEditModal = false;

        getListAddress();
      }
    } else {
      console.log("Invalid Form");
    }
  };

  const getListAddress = async () => {
    const response: AddressData = await sendMessage(
      "getListAddress",
      undefined
    );
    listAddress = response;
  };

  const handleDelete = (item) => {
    const index = listAddress.indexOf(item);
    if (index > -1) {
      listAddress.splice(index, 1);
      browser.storage.sync
        .set({ listAddress: JSON.stringify(listAddress) })
        .then(() => {
          console.log("save address to sync storage");
        });

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
      errors.address.msg === "Address is required"
    ) {
      errors["address"] = { ...errors["address"], required: false, msg: "" };
    }
    if (label && errors.label && errors.label.msg === "Label is required") {
      errors["label"] = { ...errors["label"], required: false, msg: "" };
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex justify-between items-center">
    <div class="title-3 text-gray-500">{MultipleLang.title}</div>
    <button
      class="flex items-center gap-3 px-4 py-2 bg-[#1E96FC] rounded-xl"
      on:click={() => (isOpenAddModal = true)}
    >
      <img src={Plus} alt="" width="12" height="12" />
      <div class="text-base font-medium text-white">
        {MultipleLang.content.btn_text}
      </div>
    </button>
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
      <tbody>
        {#each listAddress as item}
          <tr>
            <td class="pl-3 py-4">
              <div class="text-left flex items-start gap-2">
                {item.address}
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
      </tbody>
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
        width={70}
        on:click={() => {
          errorsEdit = {};
          isOpenEditModal = false;
        }}
      >
        {MultipleLang.content.modal_cancel}</Button
      >
      <Button width={70} type="submit">
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
        width={70}
        on:click={() => {
          errors = {};
          isOpenAddModal = false;
        }}
      >
        {MultipleLang.content.modal_cancel}</Button
      >
      <Button width={70} type="submit">
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
    <button
      class="flex items-center gap-3 px-4 py-2 border border-[#1E96FC] rounded-xl"
      on:click={() => {
        isOpenConfirmDelete = false;
        selectedWallet = {};
      }}
    >
      <div class="text-base font-medium text-[#1E96FC]">
        {MultipleLang.content.modal_cancel}
      </div>
    </button>
    <button
      class="flex items-center gap-3 px-4 py-2 bg-red-500 rounded-xl"
      on:click={() => {
        handleDelete(selectedWallet);
      }}
    >
      <div class="text-base font-medium text-white">
        {MultipleLang.content.modal_delete}
      </div>
    </button>
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
</style>

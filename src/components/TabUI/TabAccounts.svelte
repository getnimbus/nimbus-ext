<svelte:options tag="tab-accounts" />

<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import { v4 as uuidv4 } from "uuid";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { i18n } from "~/lib/i18n";

  import AppOverlay from "~/components/Overlay.svelte";

  import Plus from "~/assets/plus.svg";

  let errors: any = {};
  let errorsEdit: any = {};
  let listAddress = [];
  let selectedItemEdit: any = {};
  let isOpenEditModal = false;
  let isOpenAddModal = false;
  let MultipleLang = {
    title: i18n("optionsPage.accounts-page-title", "My address"),
    content: {
      btn_text: i18n(
        "optionsPage.accounts-page-content.address-btn-text",
        "Add Address"
      ),
      address_header_table: i18n(
        "optionsPage.accounts-page-content.address-header-table",
        "Address"
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
      modal_add: i18n("optionsPage.accounts-page-content.modal-add", "Add"),
      modal_edit: i18n("optionsPage.accounts-page-content.modal-edit", "Edit"),
      modal_delete: i18n(
        "optionsPage.accounts-page-content.modal-delete",
        "Delete"
      ),

      modal_address_label: i18n(
        "optionsPage.accounts-page-content.modal-address-label",
        "Address"
      ),
      modal_label_label: i18n(
        "optionsPage.accounts-page-content.modal-label-label",
        "Label"
      ),
      modal_add_title: i18n(
        "optionsPage.accounts-page-content.modal-add-title",
        "Add Your Address"
      ),
      modal_add_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-add-sub-title",
        "Add your address will give you more option to see the information at page new tab"
      ),

      modal_edit_title: i18n(
        "optionsPage.accounts-page-content.modal-edit-title",
        "Edit Your Address"
      ),
      modal_edit_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-edit-sub-title",
        "Edit your address will make change the information at page new tab"
      ),
    },
  };

  const isRequiredFieldValid = (value) => {
    return value != null && value !== "";
  };

  const validateForm = (data) => {
    if (!isRequiredFieldValid(data.address)) {
      errors["address"] = {
        ...errors["address"],
        required: true,
        msg: "Address is required",
      };
    } else {
      errors["address"] = { ...errors["address"], required: false };
    }

    if (!isRequiredFieldValid(data.label)) {
      errors["label"] = {
        ...errors["label"],
        required: true,
        msg: "Label is required",
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
        msg: "Address is required",
      };
    } else {
      errorsEdit["address"] = { ...errorsEdit["address"], required: false };
    }

    if (!isRequiredFieldValid(data.label)) {
      errorsEdit["label"] = {
        ...errorsEdit["label"],
        required: true,
        msg: "Label is required",
      };
    } else {
      errorsEdit["label"] = { ...errorsEdit["label"], required: false };
    }
  };

  const onBlur = (e) => {
    if (e.target.name === "address" && e.target.value) {
      errors["address"] = { ...errors["address"], required: false };
    }
    if (e.target.name === "label" && e.target.value) {
      errors["label"] = { ...errors["label"], required: false };
    }
  };

  const onBlurEdit = (e) => {
    if (e.target.name === "address" && e.target.value) {
      errorsEdit["address"] = { ...errorsEdit["address"], required: false };
    }
    if (e.target.name === "label" && e.target.value) {
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
          msg: "Please enter your address again",
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
          msg: "This address is duplicated",
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
          msg: "Invalid address, please try input again",
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
    listAddress = (await sendMessage("getListAddress", undefined)) as any[];
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
    }
  };

  const handleEdit = (item) => {
    isOpenEditModal = true;
    selectedItemEdit = item;
  };

  onMount(() => {
    getListAddress();
  });
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

  <div class="table-border mt-2 rounded">
    <Table hoverable={true}>
      <TableHead>
        <TableHeadCell
          >{MultipleLang.content.address_header_table}</TableHeadCell
        >
        <TableHeadCell>{MultipleLang.content.label_header_table}</TableHeadCell>
        <TableHeadCell>{MultipleLang.content.action_header_table}</TableHeadCell
        >
      </TableHead>
      <TableBody class="divide-y">
        {#each listAddress as item}
          <TableBodyRow>
            <TableBodyCell>
              <div class="font-medium">
                {item.address}
              </div>
            </TableBodyCell>
            <TableBodyCell>
              <div class="bg-gray-100 text-gray-500 w-max px-3 py-1 rounded-xl">
                {item.label}
              </div>
            </TableBodyCell>
            <TableBodyCell class="flex gap-6">
              <div
                class="text-red-600 hover:underline dark:text-red-500 transition-all cursor-pointer font-semibold"
                on:click={() => handleDelete(item)}
              >
                {MultipleLang.content.modal_delete}
              </div>
              <div
                class="text-blue-600 hover:underline dark:text-blue-500 transition-all cursor-pointer font-semibold"
                on:click={() => handleEdit(item)}
              >
                {MultipleLang.content.modal_edit}
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <AppOverlay
    isOpen={isOpenEditModal}
    on:close={() => (isOpenEditModal = false)}
  >
    <div class="flex flex-col gap-1 items-start max-w-[530px]">
      <div class="title-4 text-gray-600 font-semibold">
        {MultipleLang.content.modal_edit_title}
      </div>
      <div class="text-sm text-gray-500">
        {MultipleLang.content.modal_edit_sub_title}
      </div>
    </div>
    <form
      on:submit|preventDefault={onSubmitEdit}
      class="flex flex-col gap-2 mt-4"
    >
      <div class="flex flex-col gap-1 w-[530px]">
        <div class="text-sm font-medium text-gray-700">
          {MultipleLang.content.modal_address_label}
        </div>
        <div class="relative w-[530px]">
          <input
            type="text"
            id="address"
            name="address"
            placeholder={MultipleLang.content.modal_address_label}
            bind:value={selectedItemEdit.address}
            class="input-2 input-border focus:ring-[#1E96FC] focus:border-[#1E96FC] w-full p-3"
            class:input-border-error={errorsEdit.address &&
              errorsEdit.address.required}
            on:blur={onBlurEdit}
          />
          {#if errorsEdit.address && errorsEdit.address.required}
            <div class="text-red-500 absolute -bottom-4 left-0">
              {errorsEdit.address.msg}
            </div>
          {/if}
        </div>
      </div>
      <div
        class="flex flex-col gap-1 w-[530px]"
        class:form-item-translate={errorsEdit.address &&
          errorsEdit.address.required}
      >
        <div class="text-sm font-medium text-gray-700">
          {MultipleLang.content.modal_label_label}
        </div>
        <div class="relative w-[530px]">
          <input
            type="text"
            id="label"
            name="label"
            placeholder={MultipleLang.content.modal_label_label}
            bind:value={selectedItemEdit.label}
            class="input-2 input-border focus:ring-[#1E96FC] focus:border-[#1E96FC] w-full p-3"
            class:input-border-error={errorsEdit.label &&
              errorsEdit.label.required}
            on:blur={onBlurEdit}
          />
          {#if errorsEdit.label && errorsEdit.label.required}
            <div class="text-red-500 absolute -bottom-4 left-0">
              {errorsEdit.label.msg}
            </div>
          {/if}
        </div>
      </div>
      <div
        class="flex justify-end gap-2 mt-1"
        class:form-item-translate={(errorsEdit.label &&
          errorsEdit.label.required) ||
          (errorsEdit.address && errorsEdit.address.required)}
      >
        <button
          class="flex items-center gap-3 px-4 py-2 border border-[#1E96FC] rounded-xl"
          on:click={() => {
            errorsEdit = {};
            isOpenEditModal = false;
          }}
        >
          <div class="text-base font-medium text-[#1E96FC]">
            {MultipleLang.content.modal_cancel}
          </div>
        </button>
        <button
          class="flex items-center gap-3 px-4 py-2 bg-[#1E96FC] rounded-xl"
          type="submit"
        >
          <div class="text-base font-medium text-white">
            {MultipleLang.content.modal_edit}
          </div>
        </button>
      </div>
    </form>
  </AppOverlay>

  <AppOverlay isOpen={isOpenAddModal} on:close={() => (isOpenAddModal = false)}>
    <div class="flex flex-col gap-1 items-start max-w-[530px]">
      <div class="title-4 text-gray-600 font-semibold">
        {MultipleLang.content.modal_add_title}
      </div>
      <div class="text-sm text-gray-500">
        {MultipleLang.content.modal_add_sub_title}
      </div>
    </div>
    <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3 mt-4">
      <div
        class="flex flex-col gap-1 w-[530px]"
        class:form-item-translate={errors.address && errors.address.required}
      >
        <div class="text-sm font-medium text-gray-700">
          {MultipleLang.content.modal_address_label}
        </div>
        <div class="relative">
          <input
            type="text"
            id="address"
            name="address"
            placeholder={MultipleLang.content.modal_address_label}
            value=""
            class="input-2 input-border focus:ring-[#1E96FC] focus:border-[#1E96FC] w-full p-3"
            class:input-border-error={errors.address && errors.address.required}
            on:blur={onBlur}
          />
          {#if errors.address && errors.address.required}
            <div class="text-red-500 absolute -bottom-4 left-0">
              {errors.address.msg}
            </div>
          {/if}
        </div>
      </div>
      <div
        class="flex flex-col gap-1 w-[530px]"
        class:form-item-translate={errors.label && errors.label.required}
      >
        <div class="text-sm font-medium text-gray-700">
          {MultipleLang.content.modal_label_label}
        </div>
        <div class="relative">
          <input
            type="text"
            id="label"
            name="label"
            placeholder={MultipleLang.content.modal_label_label}
            value=""
            class="input-2 input-border focus:ring-[#1E96FC] focus:border-[#1E96FC] w-full p-3"
            class:input-border-error={errors.label && errors.label.required}
            on:blur={onBlur}
          />
          {#if errors.label && errors.label.required}
            <div class="text-red-500 absolute -bottom-4 left-0">
              {errors.label.msg}
            </div>
          {/if}
        </div>
      </div>
      <div
        class="flex justify-end gap-2 mt-1"
        class:form-item-translate={(errors.label && errors.label.required) ||
          (errors.address && errors.address.required)}
      >
        <button
          class="flex items-center gap-3 px-4 py-2 border border-[#1E96FC] rounded-xl"
          on:click={() => {
            errors = {};
            isOpenAddModal = false;
          }}
        >
          <div class="text-base font-medium text-[#1E96FC]">
            {MultipleLang.content.modal_cancel}
          </div>
        </button>
        <button
          class="flex items-center gap-3 px-4 py-2 bg-[#1E96FC] rounded-xl"
          type="submit"
        >
          <div class="text-base font-medium text-white">
            {MultipleLang.content.modal_add}
          </div>
        </button>
      </div>
    </form>
  </AppOverlay>
</div>

<style>
  .input-border {
    border: 1px solid rgb(229, 231, 235);
  }
  .input-border-error {
    border: 1px solid red;
  }
  .form-item-translate {
    margin-top: 10px;
  }
  .table-border {
    border: 0.5px solid rgb(229, 231, 235);
  }
</style>

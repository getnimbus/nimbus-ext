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
    Checkbox,
    Button,
  } from "flowbite-svelte";

  import AppOverlay from "../Overlay.svelte";

  let errors: any = {};
  let errorsEdit: any = {};
  let listAddress = [];
  let selectedItemEdit: any = {};
  let isOpenEditModal = false;
  let isOpenAddModal = false;

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

  const handleSelectAddress = (item) => {
    console.log("selected address: ", item);
  };

  onMount(() => {
    getListAddress();
  });
</script>

<div class="flex flex-col gap-2">
  <div class="flex justify-between items-center">
    <div class="title-3 text-gray-500">My address</div>
    <Button
      gradient
      color="cyanToBlue"
      on:click={() => (isOpenAddModal = true)}
    >
      <div class="uppercase">Add Address</div>
    </Button>
  </div>

  <!-- <form on:submit|preventDefault={onSubmit} class="flex gap-2">
    <div class="relative">
      <input
        type="text"
        id="address"
        name="address"
        placeholder="Address..."
        value=""
        class="input-2 input-border focus:ring-sky-300 focus:border-sky-300 w-[500px] p-3"
        class:input-border-error={errors.address && errors.address.required}
        on:blur={onBlur}
      />
      {#if errors.address && errors.address.required}
        <div class="text-red-500 absolute -bottom-4 left-0">
          {errors.address.msg}
        </div>
      {/if}
    </div>
    <div class="relative">
      <input
        type="text"
        id="label"
        name="label"
        placeholder="Label..."
        value=""
        class="input-2 input-border focus:ring-sky-300 focus:border-sky-300 w-[200px] p-3"
        class:input-border-error={errors.label && errors.label.required}
        on:blur={onBlur}
      />
      {#if errors.label && errors.label.required}
        <div class="text-red-500 absolute -bottom-4 left-0">
          {errors.label.msg}
        </div>
      {/if}
    </div>
    <Button gradient color="cyanToBlue" type="submit">
      <div class="uppercase">Add Address</div>
    </Button>
  </form> -->

  <div class="table-border mt-2 rounded">
    <Table hoverable={true}>
      <TableHead>
        <TableHeadCell />
        <TableHeadCell>Address</TableHeadCell>
        <TableHeadCell>Label</TableHeadCell>
        <TableHeadCell>Action</TableHeadCell>
      </TableHead>
      <TableBody class="divide-y">
        {#each listAddress as item}
          <TableBodyRow>
            <TableBodyCell>
              <Checkbox
                color="blue"
                class="cursor-pointer"
                on:click={() => handleSelectAddress(item)}
              />
            </TableBodyCell>
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
                Delete
              </div>
              <div
                class="text-blue-600 hover:underline dark:text-blue-500 transition-all cursor-pointer font-semibold"
                on:click={() => handleEdit(item)}
              >
                Edit
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
    <div class="flex flex-col gap-1 items-start">
      <div class="title-4 text-gray-600 font-semibold">Edit Your Address</div>
      <div class="text-sm text-gray-500">
        Edit your address will make change the information at page new tab
      </div>
    </div>
    <form
      on:submit|preventDefault={onSubmitEdit}
      class="flex flex-col gap-2 mt-4"
    >
      <div class="flex flex-col gap-1 w-[485px]">
        <div class="text-sm font-medium text-gray-700">Address</div>
        <div class="relative w-[485px]">
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Address..."
            bind:value={selectedItemEdit.address}
            class="input-2 input-border focus:ring-sky-300 focus:border-sky-300 w-full p-3"
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
        class="flex flex-col gap-1 w-[485px]"
        class:form-item-translate={errorsEdit.address &&
          errorsEdit.address.required}
      >
        <div class="text-sm font-medium text-gray-700">Label</div>
        <div class="relative">
          <input
            type="text"
            id="label"
            name="label"
            placeholder="Label..."
            bind:value={selectedItemEdit.label}
            class="input-2 input-border focus:ring-sky-300 focus:border-sky-300 w-full p-3"
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
        <Button
          outline
          gradient
          color="cyanToBlue"
          on:click={() => {
            errorsEdit = {};
            isOpenEditModal = false;
          }}
        >
          <div class="uppercase text-sky-500">Cancel</div>
        </Button>
        <Button gradient color="cyanToBlue" type="submit">
          <div class="uppercase">Edit</div>
        </Button>
      </div>
    </form>
  </AppOverlay>

  <AppOverlay isOpen={isOpenAddModal} on:close={() => (isOpenAddModal = false)}>
    <div class="flex flex-col gap-1 items-start">
      <div class="title-4 text-gray-600 font-semibold">Add Your Address</div>
      <div class="text-sm text-gray-500">
        Add your address will give you more option to see the information at
        page new tab
      </div>
    </div>
    <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3 mt-4">
      <div
        class="flex flex-col gap-1 w-[530px]"
        class:form-item-translate={errors.address && errors.address.required}
      >
        <div class="text-sm font-medium text-gray-700">Address</div>
        <div class="relative">
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Address..."
            value=""
            class="input-2 input-border focus:ring-sky-300 focus:border-sky-300 w-full p-3"
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
        <div class="text-sm font-medium text-gray-700">Label</div>
        <div class="relative">
          <input
            type="text"
            id="label"
            name="label"
            placeholder="Label..."
            value=""
            class="input-2 input-border focus:ring-sky-300 focus:border-sky-300 w-full p-3"
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
        <Button
          outline
          gradient
          color="cyanToBlue"
          on:click={() => {
            errors = {};
            isOpenAddModal = false;
          }}
        >
          <div class="uppercase text-sky-500">Cancel</div>
        </Button>
        <Button gradient color="cyanToBlue" type="submit">
          <div class="uppercase">Add</div>
        </Button>
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

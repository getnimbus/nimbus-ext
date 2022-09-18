<svelte:options tag="tab-accounts" />

<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import { isOverlayOpen } from "../../stores/OverlayStores";
  import { v4 as uuidv4 } from "uuid";

  import "../Overlay.svelte";

  let errors: any = {};
  let errorsEdit: any = {};
  let listAddress = [];
  let selectedItemEdit: any = {};

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
    const regexETHAddress = /0x[a-fA-F0-9]{40}/g;

    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    validateForm(data);

    if (
      !Object.keys(errors).some((inputName) => errors[inputName]["required"])
    ) {
      if (data.address && !data.address.match(regexETHAddress)) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: "Please enter your address again",
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

      getListAddress();
    } else {
      console.log("Invalid Form");
    }
  };

  const onSubmitEdit = (e) => {
    const formData = new FormData(e.target);
    const regexETHAddress = /0x[a-fA-F0-9]{40}/g;

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
      if (data.address && !data.address.match(regexETHAddress)) {
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
        isOverlayOpen.set(false);

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
    isOverlayOpen.set(true);
    selectedItemEdit = item;
  };

  onMount(() => {
    getListAddress();
  });
</script>

<div class="flex flex-col gap-2">
  <div class="title-3 text-gray-500 mb-2">My address</div>
  <form on:submit|preventDefault={onSubmit} class="flex gap-2">
    <div class="relative">
      <input
        type="text"
        id="address"
        name="address"
        placeholder="Address..."
        value=""
        class="input-2 input-border w-[500px] p-3"
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
        class="input-2 input-border w-[200px] p-3"
        on:blur={onBlur}
      />
      {#if errors.label && errors.label.required}
        <div class="text-red-500 absolute -bottom-4 left-0">
          {errors.label.msg}
        </div>
      {/if}
    </div>
    <button type="submit" class="btn-primary uppercase">Add Address</button>
  </form>

  <div class="table-border mt-5 rounded">
    <div class="grid grid-cols-6 bg-gray-100 p-3 uppercase">
      <div class="col-span-4 title-5">Address</div>
      <div class="title-5">Label</div>
      <div class="title-5">Action</div>
    </div>

    {#if listAddress.length <= 0}
      <div class="text-black text-center title-5 py-3">Empty</div>
    {:else}
      {#each listAddress as item}
        <div
          class="grid grid-cols-6 items-center p-3 text-sm item-table-border"
        >
          <div class="col-span-4 font-medium">{item.address}</div>
          <div class="bg-gray-100 text-gray-500 w-max px-3 py-1 rounded-xl">
            {item.label}
          </div>
          <div class="flex gap-5">
            <div
              class="text-red-500 cursor-pointer font-semibold"
              on:click={() => handleDelete(item)}
            >
              Delete
            </div>
            <div
              class="text-sky-500 cursor-pointer font-semibold"
              on:click={() => handleEdit(item)}
            >
              Edit
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  {#if $isOverlayOpen}
    <app-overlay>
      <div class="flex flex-col gap-1 items-center">
        <div class="title-4 text-gray-600 font-semibold">Edit Your Address</div>
        <div class="text-sm text-gray-500">
          Edit your address will make change the information at page new tab
        </div>
      </div>

      <form
        on:submit|preventDefault={onSubmitEdit}
        class="flex flex-col gap-5 mt-4"
      >
        <div class="flex items-center gap-2">
          <div class="w-12">Address:</div>
          <div class="relative flex-[0.945]">
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Address..."
              bind:value={selectedItemEdit.address}
              class="input-2 input-border w-full p-3"
              on:blur={onBlurEdit}
            />
            {#if errorsEdit.address && errorsEdit.address.required}
              <div class="text-red-500 absolute -bottom-4 left-0">
                {errorsEdit.address.msg}
              </div>
            {/if}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-12">Label:</div>
          <div class="relative flex-[0.945]">
            <input
              type="text"
              id="label"
              name="label"
              placeholder="Label..."
              bind:value={selectedItemEdit.label}
              class="input-2 input-border w-full p-3"
              on:blur={onBlurEdit}
            />
            {#if errorsEdit.label && errorsEdit.label.required}
              <div class="text-red-500 absolute -bottom-4 left-0">
                {errorsEdit.label.msg}
              </div>
            {/if}
          </div>
        </div>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary flex-1 uppercase"
            >Edit</button
          >
          <button
            class="btn-secondary input-border flex-1 uppercase"
            on:click={() => isOverlayOpen.set(false)}>Cancel</button
          >
        </div>
      </form>
    </app-overlay>
  {/if}
</div>

<style>
  .input-border {
    border: 1px solid skyblue;
  }
  .table-border {
    border: 0.5px solid rgb(229, 231, 235);
  }
  .item-table-border {
    border-bottom: 0.5px solid rgb(229, 231, 235);
  }
</style>

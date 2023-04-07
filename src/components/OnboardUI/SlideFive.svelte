<script lang="ts">
  import * as browser from "webextension-polyfill";
  import { getLocalImg } from "~/utils";
  import { v4 as uuidv4 } from "uuid";

  export let skip = () => {};

  import Button from "~/components/Button.svelte";

  import PerformanceOneFeat from "../../assets/performance_one_feat.svg";
  import PerformanceTwoFeat from "../../assets/performance_two_feat.svg";
  import Wallet from "../../assets/wallet.svg";

  let address = "";
  let label = "";
  let errors: any = {};
  let listAddress = [];

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
          msg: "Please enter your wallet address again!",
        };
        return;
      }

      const isDuplicatedAddress = listAddress.some((item) => {
        return item.value === data.address;
      });

      if (isDuplicatedAddress) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: "This wallet address is duplicated!",
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

      browser.storage.sync
        .set({
          selectedWallet: {
            logo: Wallet,
            id: data.id,
            label: data.label,
            value: data.address,
          },
        })
        .then(() => {
          console.log("save selected address to sync storage");
        });

      e.target.reset();
      skip();
    } else {
      console.log("Invalid Form");
    }
  };

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

<div class="h-[95vh] flex justify-center items-center">
  <form
    on:submit|preventDefault={onSubmit}
    class="h-[90%] flex flex-col justify-between items-center"
  >
    <div class="flex-1 flex flex-col items-center justify-center gap-6">
      <div class="flex flex-col items-center gap-6">
        <div class="text-5xl text-black font-normal">Add your address</div>
        <div class="text-lg text-[#00000099] font-normal">
          So you can easily track Profit and Loss for every move
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <div class="relative">
          <img src={getLocalImg(PerformanceOneFeat)} alt="" />
          <div class="absolute bottom-10 -left-18">
            <img src={getLocalImg(PerformanceTwoFeat)} alt="" />
          </div>
        </div>
        <div class="bg-white rounded-xl p-3 border">
          <div class="title-3 text-gray-600 font-semibold">Your wallet</div>
          <div class="flex flex-col gap-3 mt-3">
            <div class="flex flex-col gap-1">
              <div class="flex flex-col gap-1">
                <div
                  class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
                    address ? "bg-[#F0F2F7]" : ""
                  }`}
                  class:input-border-error={errors.address &&
                    errors.address.required}
                >
                  <div class="text-xs text-[#666666] font-medium">Address</div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Address"
                    value=""
                    class={`p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B] ${
                      address ? "bg-[#F0F2F7]" : ""
                    }`}
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
                  class:input-border-error={errors.label &&
                    errors.label.required}
                >
                  <div class="text-xs text-[#666666] font-medium">Label</div>
                  <input
                    type="text"
                    id="label"
                    name="label"
                    placeholder="Label"
                    value=""
                    class={`p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B] ${
                      label ? "bg-[#F0F2F7]" : ""
                    }`}
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
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="secondary" on:click={skip}>Skip</Button>
      <Button className="" type="submit">Continue</Button>
    </div>
  </form>
</div>

<style>
  .input-border {
    border: 0.5px solid rgb(229, 231, 235);
  }
  .input-border-error {
    border: 0.5px solid red;
  }
</style>

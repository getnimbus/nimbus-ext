<svelte:options tag="tab-accounts" />

<script>
  let errors = {};

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

  const isRequiredFieldValid = (value) => {
    return value != null && value !== "";
  };

  const onBlur = (e) => {
    if (e.target.name === "address" && e.target.value) {
      errors["address"] = { ...errors["address"], required: false };
    }
    if (e.target.name === "label" && e.target.value) {
      errors["label"] = { ...errors["label"], required: false };
    }
  };

  const onSubmit = (e) => {
    const formData = new FormData(e.target);
    const regexETHAddress = /0x[a-fA-F0-9]{40}/g;

    const data = {};
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
      console.log("data form", data);
      e.target.reset();
    } else {
      console.log("Invalid Form");
    }
  };
</script>

<div class="flex flex-col gap-2">
  <div class="title-3 text-gray-500 mb-2">My address</div>
  <form on:submit|preventDefault={onSubmit} class="flex gap-3">
    <div class="relative">
      <input
        type="text"
        id="address"
        name="address"
        placeholder="Address..."
        value=""
        class="input-2 input-border w-[240px] p-3"
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
        class="input-2 input-border w-[240px] p-3"
        on:blur={onBlur}
      />
      {#if errors.label && errors.label.required}
        <div class="text-red-500 absolute -bottom-4 left-0">
          {errors.label.msg}
        </div>
      {/if}
    </div>
    <button type="submit" class="btn-primary">Add Address</button>
  </form>
</div>

<style>
  .input-border {
    border: 1px solid skyblue;
  }
</style>

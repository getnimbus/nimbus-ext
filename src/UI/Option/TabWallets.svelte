<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { dndzone } from "svelte-dnd-action";
  import {
    getAddressContext,
    listLogoCEX,
    listProviderCEX,
    chainList,
  } from "~/utils";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { wallet, chain, typeWallet, selectedPackage } from "~/store";
  import mixpanel from "mixpanel-browser";
  import { nimbus } from "~/lib/network";
  import Vezgo from "vezgo-sdk-js/dist/vezgo.es5.js";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";

  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";
  import "~/components/Loading.custom.svelte";

  import Plus from "~/assets/plus.svg";
  import User from "~/assets/user.png";
  import Success from "~/assets/shield-done.svg";
  import SolanaLogo from "~/assets/solana.png";

  const MultipleLang = {
    title: i18n("optionsPage.accounts-page-title", "My wallets"),
    content: {
      btn_text: i18n(
        "optionsPage.accounts-page-content.address-btn-text",
        "Add Account"
      ),
      address_header_table: i18n(
        "optionsPage.accounts-page-content.address-header-table",
        "Account"
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
        "Account"
      ),
      modal_label_label: i18n(
        "optionsPage.accounts-page-content.modal-label-label",
        "Label"
      ),
      modal_add_title: i18n(
        "optionsPage.accounts-page-content.modal-add-title",
        "Add your account"
      ),
      modal_add_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-add-sub-title",
        "Add your account will give you more option to see the information at page new tab"
      ),
      modal_delete_title: i18n(
        "optionsPage.accounts-page-content.modal-delete-title",
        "Are you sure?"
      ),
      modal_delete_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-delete-sub-title",
        "Do you really want to delete this account? This process cannot revert"
      ),
      modal_edit_title: i18n(
        "optionsPage.accounts-page-content.modal-edit-title",
        "Edit your account"
      ),
      modal_edit_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-edit-sub-title",
        "Edit your account will make change the information at page new tab"
      ),
      address_required: i18n(
        "optionsPage.accounts-page-content.address-required",
        "Account is required"
      ),
      label_required: i18n(
        "optionsPage.accounts-page-content.label-required",
        "Label is required"
      ),
      re_input_address: i18n(
        "optionsPage.accounts-page-content.re-input-address",
        "Please enter your account again!"
      ),
      duplicate_address: i18n(
        "optionsPage.accounts-page-content.duplicate-address",
        "This account is duplicated!"
      ),
    },
  };

  let packageSelected = "";
  selectedPackage.subscribe((value) => {
    packageSelected = value;
  });

  let userInfo = {};

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
  let isLoadingEdit = false;
  let isLoadingDelete = false;
  let isLoadingConnectCEX = false;
  let showDisableAddWallet = false;

  let show = false;
  let counter = 3;
  let toastMsg = "";
  let isSuccess = false;

  let isOpenModal = false;
  let isLoadingSendMail = false;
  let email = "";

  let isDisabled = false;
  let tooltipDisableAddBtn = "";

  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;
  let container;

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

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

  const queryClient = useQueryClient();
  const query = createQuery({
    queryKey: ["list-address"],
    queryFn: () => getListAddress(),
    staleTime: Infinity,
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      formatDataListAddress($query.data);
    }
  }

  const formatDataListAddress = (data) => {
    const structWalletData = data.map((item) => {
      return {
        position: item.position,
        id: item.id,
        type: item.type,
        label: item.label,
        address: item.type === "CEX" ? item.id : item.accountId,
      };
    });
    listAddress = structWalletData;
  };

  const getListAddress = async () => {
    const response: any = await nimbus.get("/accounts/list");
    return response?.data;
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
        queryClient.invalidateQueries(["list-address"]);
        toastMsg = "Successfully add On-chain account!";
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
          .connect({
            providers: listProviderCEX,
          })
          .onConnection(async function (account) {
            await nimbus.get("/accounts/sync");

            queryClient.invalidateQueries(["list-address"]);
            isLoadingConnectCEX = false;
            isOpenAddModal = false;

            toastMsg = "Successfully add CEX account!";
            isSuccess = true;
            trigger();
            mixpanel.track("user_add_address");
          })
          .onError(function (error) {
            console.error("connection vezgo error", error);

            queryClient.invalidateQueries(["list-address"]);
            isLoadingConnectCEX = false;
            isOpenAddModal = false;

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
    isLoadingEdit = true;
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

        queryClient.invalidateQueries(["list-address"]);
        e.target.reset();
        isOpenEditModal = false;
        isLoadingEdit = false;
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

          queryClient.invalidateQueries(["list-address"]);
          e.target.reset();
          isOpenEditModal = false;
          isLoadingEdit = false;
          toastMsg = "Successfully edit your wallet!";
          isSuccess = true;
          trigger();
          mixpanel.track("user_edit_address");
        } else {
          console.log("Invalid Form");
          isLoadingEdit = false;
        }
      }
    } catch (e) {
      console.error(e);
      toastMsg = "Something wrong when edit your wallet. Please try again!";
      isSuccess = false;
      isLoadingEdit = false;
      trigger();
    }
  };

  // Delete account
  const handleDelete = async (item) => {
    isLoadingDelete = true;
    try {
      await nimbus.delete(`/accounts/${item.id}`, {});
      queryClient.invalidateQueries(["list-address"]);
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
    if (
      localStorage.getItem("isGetUserEmailYet") !== null &&
      localStorage.getItem("isGetUserEmailYet") === "true"
    ) {
      return;
    }
    localStorage.setItem("isGetUserEmailYet", "false");
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

  // Handle get user email
  const onSubmitGetEmail = async (e) => {
    isLoadingSendMail = true;
    const formData = new FormData(e.target);
    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    try {
      await nimbus.post("/subscription/analysis", {
        email: data.email,
        address: selectedWallet,
      });
      isLoadingSendMail = false;
      localStorage.setItem("isGetUserEmailYet", "true");
      toastMsg = "Ready to receive exclusive benefits soon!";
      isSuccess = true;
      trigger();
    } catch (e) {
      isLoadingSendMail = false;
      toastMsg = "Something wrong when sending email. Please try again!";
      isSuccess = false;
      trigger();
    } finally {
      isOpenModal = false;
    }
  };

  $: {
    if (listAddress.length === 3 && packageSelected === "FREE") {
      isDisabled = true;
    }
    if (listAddress.length === 7 && packageSelected === "EXPLORER") {
      if (
        localStorage.getItem("isGetUserEmailYet") !== null &&
        localStorage.getItem("isGetUserEmailYet") === "false"
      ) {
        localStorage.setItem("isGetUserEmailYet", "true");
      }
      isDisabled = true;
    }
    if (packageSelected === "PROFESSIONAL") {
      if (
        localStorage.getItem("isGetUserEmailYet") !== null &&
        localStorage.getItem("isGetUserEmailYet") === "false"
      ) {
        localStorage.setItem("isGetUserEmailYet", "true");
      }
    }
  }

  $: {
    if (Object.keys(userInfo).length === 0) {
      tooltipDisableAddBtn = "Connect wallet to add account";
    }
    if (isDisabled) {
      if (packageSelected === "FREE") {
        tooltipDisableAddBtn =
          "Get the EXPLORER Plan to be able to add more accounts and experience our in-depth investment analysis";
      }
      if (packageSelected === "EXPLORER") {
        tooltipDisableAddBtn =
          "Get the PROFESSIONAL Plan so you can add unlimited accounts and experience all our functions";
      }
    }
  }

  let selectedAddresses = [];
  let nameBundle = "";
  let listBundle = [];
  let selectedBundle = {};
  let isAddBundle = false;
  let isLoadingBundle = false;

  const queryListBundle = createQuery({
    queryKey: ["list-bundle"],
    queryFn: () => getListBundle(),
    staleTime: Infinity,
  });

  const getListBundle = async () => {
    const response: any = await nimbus.get("/address/personalize/bundle");
    return response.data;
  };

  $: {
    if (
      !$queryListBundle.isError &&
      $queryListBundle.data &&
      Object.keys($queryListBundle.data).length !== 0
    ) {
      const bundleData = Object.getOwnPropertyNames($queryListBundle.data);
      listBundle = bundleData.map((item) => {
        return {
          name: item,
          addresses: $queryListBundle.data[item]?.map(
            (eachItem) => eachItem.address
          ),
        };
      });
    }
  }

  const handleResetState = () => {
    nameBundle = "";
    selectedBundle = {};
  };

  const selectedLastBundle = (data) => {
    const bundleData = Object.getOwnPropertyNames(data);
    listBundle = bundleData.map((item) => {
      return {
        name: item,
        addresses: data[item]?.map((eachItem) => eachItem.address),
      };
    });
    selectedBundle = listBundle[listBundle.length - 1];
    selectedAddresses = listBundle[listBundle.length - 1].addresses;
    nameBundle = listBundle[listBundle.length - 1].name;
  };

  const onSubmitBundle = async () => {
    if (selectedAddresses.length === 7) {
      toastMsg =
        "You can create your bundle with maximum is 7 addresses. Please try again!";
      isSuccess = false;
      trigger();
      isLoadingBundle = false;
      return;
    }

    if (selectedAddresses.length === 0) {
      toastMsg = "Please select addresses to bundle!";
      isSuccess = false;
      trigger();
      isLoadingBundle = false;
      return;
    }

    isLoadingBundle = true;
    try {
      const formData = {
        name: nameBundle,
        addresses: selectedAddresses,
      };

      if (selectedBundle && Object.keys(selectedBundle).length !== 0) {
        const response = await nimbus.put(
          `/address/personalize/bundle?name=${selectedBundle?.name}`,
          formData
        );
        selectedLastBundle(response.data);
        toastMsg = "Successfully edit your bundle!";
      } else {
        const response = await nimbus.post(
          "/address/personalize/bundle",
          formData
        );
        selectedLastBundle(response.data);
        toastMsg = "Successfully create your bundle!";
      }
      isSuccess = true;
      trigger();
      isLoadingBundle = false;
    } catch (e) {
      toastMsg = `Something wrong when ${
        selectedBundle && Object.keys(selectedBundle).length !== 0
          ? "edit"
          : "create"
      } your bundle. Please try again!`;
      isSuccess = false;
      trigger();
      isLoadingBundle = false;
      console.error("e: ", e);
    }
  };

  const handleDeleteBundle = async () => {
    try {
      const response = await nimbus.delete(
        `/address/personalize/bundle?name=${selectedBundle?.name}`,
        selectedBundle
      );
      toastMsg = "Successfully delete your bundle!";
      isSuccess = true;
      trigger();
      queryClient.invalidateQueries(["list-bundle"]);
      handleResetState();
      selectedAddresses = [];
      isAddBundle = false;
    } catch (e) {
      toastMsg = "Something wrong when delete your bundle. Please try again!";
      isSuccess = false;
      trigger();
      console.error("e: ", e);
    }
  };
</script>

<div class="flex flex-col gap-4">
  {#if listAddress && listAddress.length === 0}
    <div class="flex justify-between items-center">
      <div class="xl:title-3 title-1 text-gray-500">{MultipleLang.title}</div>
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
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      <div class="xl:title-3 title-1 text-gray-500">{MultipleLang.title}</div>
      <div class="flex justify-between items-center">
        {#if listBundle && listBundle.length === 0}
          <div class="text-base">
            Create your bundle with up to 7 addresses per bundle!
          </div>
        {:else}
          <div
            class="relative overflow-hidden w-full flex gap-3 justify-between items-center"
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
              class="w-max flex gap-3 overflow-x-auto whitespace-nowrap"
              bind:this={scrollContainer}
              on:scroll={handleScroll}
            >
              <AnimateSharedLayout>
                {#each listBundle as item}
                  <div
                    class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                    on:click={() => {
                      selectedBundle = item;
                      selectedAddresses = item.addresses;
                      nameBundle = item.name;
                    }}
                  >
                    <div
                      class={`relative ${
                        selectedBundle === item && "text-white"
                      }`}
                      style="z-index: 2"
                    >
                      {item.name}
                    </div>
                    {#if item === selectedBundle}
                      <Motion
                        let:motion
                        layoutId="active-pill"
                        transition={{ type: "spring", duration: 0.6 }}
                      >
                        <div
                          class="absolute inset-0 rounded-full bg-[#1E96FC]"
                          style="z-index: 1"
                          use:motion
                        />
                      </Motion>
                    {/if}
                  </div>
                {/each}
              </AnimateSharedLayout>
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
        {/if}
        <div class="flex gap-4">
          <!-- add bundle -->
          <div class="flex items-center gap-4">
            {#if listBundle && listBundle.length !== 0 && selectedBundle && Object.keys(selectedBundle).length !== 0}
              <div
                class="text-red-500 font-medium w-max cursor-pointer"
                on:click={handleDeleteBundle}
              >
                Delete
              </div>
            {/if}
            <div class="xl:w-max w-[260px]">
              <Button
                variant="tertiary"
                on:click={() => {
                  isAddBundle = true;
                  handleResetState();
                  selectedAddresses = [];
                }}
              >
                <img src={Plus} alt="" class="xl:w-3 xl:h-3 w-4 h-4" />
                <div class="xl:text-base text-2xl font-medium text-white">
                  Add bundle
                </div>
              </Button>
            </div>
          </div>
          <!-- add account -->
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
              <div>
                {#if localStorage.getItem("isGetUserEmailYet") !== null && localStorage.getItem("isGetUserEmailYet") === "false"}
                  <Button
                    variant="tertiary"
                    on:click={() => {
                      if (
                        localStorage.getItem("isGetUserEmailYet") !== null &&
                        localStorage.getItem("isGetUserEmailYet") === "false"
                      ) {
                        isOpenModal = true;
                      }
                    }}
                  >
                    <img src={Plus} alt="" class="xl:w-3 xl:h-3 w-4 h-4" />
                    <div class="xl:text-base text-2xl font-medium text-white">
                      Add account
                    </div>
                  </Button>
                {:else}
                  <Button variant="disabled" disabled>
                    <img src={Plus} alt="" class="xl:w-3 xl:h-3 w-4 h-4" />
                    <div class="xl:text-base text-2xl font-medium text-white">
                      Add account
                    </div>
                  </Button>
                {/if}
              </div>
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
                class="absolute transform -top-12 right-0"
                style="z-index: 2147483648;"
              >
                <tooltip-detail text={tooltipDisableAddBtn} />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if isAddBundle || (selectedBundle && selectedBundle !== null && Object.keys(selectedBundle).length !== 0)}
    <form on:submit|preventDefault={onSubmitBundle} class="flex flex-col gap-6">
      <div
        class={`flex flex-col gap-1 input-2 w-full py-[6px] px-3 ${
          nameBundle ? "bg-[#F0F2F7]" : ""
        }`}
      >
        <div class="xl:text-base text-xl text-[#666666] font-medium">
          Bundle
        </div>
        <input
          type="text"
          placeholder="Your bundle name"
          class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
            nameBundle ? "bg-[#F0F2F7]" : ""
          }`}
          required
          bind:value={nameBundle}
        />
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
          {#if $query.isFetching}
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
            <tbody>
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
                        <div class="flex justify-center">
                          <input
                            type="checkbox"
                            value={item.address}
                            bind:group={selectedAddresses}
                            class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                          />
                        </div>
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
      <div class="flex justify-end lg:gap-2 gap-6">
        <div class="lg:w-[120px] w-full">
          <Button
            variant="secondary"
            on:click={() => {
              selectedAddresses = selectedBundle.addresses;
              isAddBundle = false;
              handleResetState();
            }}
          >
            {MultipleLang.content.modal_cancel}</Button
          >
        </div>
        <div class="lg:w-[120px] w-full">
          <Button type="submit" variant="tertiary" isLoading={isLoadingBundle}>
            {#if selectedBundle && Object.keys(selectedBundle).length !== 0}
              {MultipleLang.content.modal_edit}
            {:else}
              {MultipleLang.content.modal_add}
            {/if}
          </Button>
        </div>
      </div>
    </form>
  {:else}
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
        {#if $query.isFetching}
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
  {/if}
</div>

<!-- Modal edit account -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenEditModal}
  on:close={() => (isOpenEditModal = false)}
>
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
        <div class="text-red-500">
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
        <div class="text-red-500">
          {errorsEdit.label.msg}
        </div>
      {/if}
    </div>
    <div class="flex justify-end lg:gap-2 gap-6">
      <div class="lg:w-[120px] w-full">
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
      <div class="lg:w-[120px] w-full">
        <Button type="submit" variant="tertiary">
          {MultipleLang.content.modal_edit}</Button
        >
      </div>
    </div>
  </form>
</AppOverlay>

<!-- Modal add DEX account -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenAddModal}
  on:close={() => (isOpenAddModal = false)}
>
  <div class="xl:title-3 title-1 text-gray-600 font-semibold">
    {MultipleLang.content.modal_add_title}
  </div>
  <div class="flex flex-col mt-4 gap-7">
    <div class="flex flex-col gap-3">
      <div class="flex justify-center">
        <div class="w-max">
          <Button
            variant="tertiary"
            isLoading={isLoadingConnectCEX}
            on:click={onSubmitCEX}
          >
            <div class="xl:text-base text-2xl font-medium text-white">
              Connect Exchange
            </div>
          </Button>
        </div>
      </div>
      <div class="xl:text-base text-xl flex items-center justify-center gap-1">
        <img src={Success} alt="" />
        Bank-level security/encryption.
        <a
          href="https://vezgo.com/security"
          class="text-blue-500 cursor-pointer"
          target="_blank">Learn more</a
        >
      </div>
      <div class="flex justify-center items-center gap-6 my-3">
        {#each listLogoCEX as logo}
          <div
            class="w-8 h-8 rounded-full overflow-hidden flex justify-center items-center"
          >
            <img src={logo} alt="" class="w-full h-full object-contain" />
          </div>
        {/each}
        <div class="text-gray-400">+22 More</div>
      </div>
    </div>
    <div class="border-t-[1px] relative">
      <div
        class="absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-gray-400 bg-white text-sm px-2"
      >
        Or
      </div>
    </div>
    <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3 mt-2">
      <div class="flex flex-col gap-1">
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            address ? "bg-[#F0F2F7]" : ""
          }`}
          class:input-border-error={errors.address && errors.address.required}
        >
          <div class="xl:text-base text-xl text-[#666666] font-medium">
            Address
          </div>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Your wallet address"
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
      <div class="flex justify-center items-center gap-6 my-3">
        {#each [{ logo: SolanaLogo, label: "Solana", value: "SOL" }].concat(chainList) as item}
          <div
            class="w-8 h-8 rounded-full overflow-hidden flex justify-center items-center"
          >
            <img src={item.logo} alt="" class="w-full h-full object-contain" />
          </div>
        {/each}
        <div class="text-gray-400">More soon</div>
      </div>
      <div class="flex justify-end lg:gap-2 gap-6">
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
          <Button type="submit" variant="tertiary">
            {MultipleLang.content.modal_add}</Button
          >
        </div>
      </div>
    </form>
  </div>
</AppOverlay>

<!-- Modal confirm delete account -->
<AppOverlay
  clickOutSideToClose
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
  <div class="flex justify-end lg:gap-2 gap-6 mt-4">
    <div class="lg:w-[120px] w-full h-[36px]">
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
    <div class="lg:w-[120px] w-full h-[36px]">
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

<!-- Modal get user email -->
<AppOverlay
  clickOutSideToClose
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
            required
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
      <div class="flex justify-end gap-2">
        <div class="xl:w-[120px] w-full">
          <Button
            variant="secondary"
            on:click={() => {
              isOpenModal = false;
            }}
          >
            {MultipleLang.content.modal_cancel}</Button
          >
        </div>
        <div class="xl:w-[120px] w-full">
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

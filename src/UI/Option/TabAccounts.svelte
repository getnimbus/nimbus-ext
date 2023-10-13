<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { dndzone } from "svelte-dnd-action";
  import { listLogoCEX, listProviderCEX, chainList } from "~/utils";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import {
    wallet,
    chain,
    typeWallet,
    selectedPackage,
    isDarkMode,
    user,
  } from "~/store";
  import mixpanel from "mixpanel-browser";
  import { API_URL, nimbus } from "~/lib/network";
  import Vezgo from "vezgo-sdk-js/dist/vezgo.es5.js";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { wait } from "~/entries/background/utils";
  import { useNavigate } from "svelte-navigator";
  import * as browser from "webextension-polyfill";

  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";
  import Loading from "~/components/Loading.svelte";

  import Plus from "~/assets/plus.svg";
  import PlusBlack from "~/assets/plus-black.svg";
  import User from "~/assets/user.png";
  import Success from "~/assets/shield-done.svg";
  import SolanaLogo from "~/assets/solana.png";

  const MultipleLang = {
    title: i18n("optionsPage.accounts-page-title", "Account Settings"),
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

  const navigate = useNavigate();

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let packageSelected = "";
  selectedPackage.subscribe((value) => {
    packageSelected = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let errors: any = {};
  let errorsEdit: any = {};
  let listAddress = [];
  let listAddressWithoutBundle = [];
  let selectedItemEdit: any = {};
  let isOpenEditModal = false;
  let isOpenAddModal = false;
  let isOpenConfirmDelete = false;
  let selectedWallet = {};
  let address = "";
  let label = "";
  let isLoadingAddDEX = false;
  let isLoadingDelete = false;
  let isLoadingEditDEX = false;
  let isLoadingConnectCEX = false;
  let showDisableAddWallet = false;
  let showDisableBundle = false;
  let selectedHoverBundle;
  let isLoadingDeleteBundles = false;
  let isOpenConfirmDeleteBundles = false;

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

  let selectedAddresses = [];
  let nameBundle = "";
  let listBundle = [];
  let selectedBundle = {};
  let isAddBundle = false;
  let isLoadingBundle = false;

  let timerDebounceSort;

  const queryClient = useQueryClient();

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

  const validateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      return response?.data?.type;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const validateForm = async (data) => {
    const isDuplicatedAddress = listAddress.some((item) => {
      return item.address.toLowerCase() === data.address.toLowerCase();
    });
    const addressValidate = await validateAddress(data.address);

    if (!isRequiredFieldValid(data.address)) {
      errors["address"] = {
        ...errors["address"],
        required: true,
        msg: MultipleLang.content.address_required,
      };
    } else {
      if (data.address && !addressValidate) {
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

  const validateFormEdit = async (data) => {
    const addressValidate = await validateAddress(selectedItemEdit.address);

    if (!isRequiredFieldValid(selectedItemEdit.address)) {
      errorsEdit["address"] = {
        ...errorsEdit["address"],
        required: true,
        msg: MultipleLang.content.address_required,
      };
    } else {
      if (!addressValidate) {
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
    const response: any = await nimbus.get("/accounts/list");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

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
    listAddressWithoutBundle = structWalletData.filter(
      (item) => item.type !== "BUNDLE"
    );

    if (listAddressWithoutBundle && listAddressWithoutBundle?.length === 1) {
      browser.storage.sync.set({
        selectedWallet: listAddressWithoutBundle[0]?.address,
      });
      browser.storage.sync.set({ selectedChain: "ALL" });
      browser.storage.sync.set({
        typeWalletAddress: "EVM",
      });
      chain.update((n) => (n = "ALL"));
      typeWallet.update((n) => (n = "EVM"));
      wallet.update((n) => (n = listAddressWithoutBundle[0]?.address));
    }
  };

  $: query = createQuery({
    queryKey: ["list-address"],
    queryFn: () => getListAddress(),
    staleTime: Infinity,
    retry: false,
    enabled: Object.keys(userInfo).length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      formatDataListAddress($query.data);
    }
  }

  // Add DEX address account
  const onSubmit = async (e) => {
    isLoadingAddDEX = true;
    try {
      const formData = new FormData(e.target);

      const data: any = {};
      for (let field of formData) {
        const [key, value] = field;
        data[key] = value;
      }

      await validateForm(data);

      if (
        !Object.keys(errors).some((inputName) => errors[inputName]["required"])
      ) {
        Object.assign(data, { id: data.address });

        const response = await nimbus.post("/accounts", {
          type: "DEX",
          publicAddress: data.address,
          accountId: data.address,
          label: data.label,
        });

        e.target.reset();
        isLoadingAddDEX = false;
        isOpenAddModal = false;
        queryClient.refetchQueries(["list-address"]);

        const searchAccountType = await validateAddress(
          response?.data?.accountId
        );

        browser.storage.sync.set({ selectedChain: "ALL" });
        browser.storage.sync.set({
          typeWalletAddress: searchAccountType,
        });
        browser.storage.sync.set({
          selectedWallet: response?.data?.accountId,
        });

        chain.update((n) => (n = "ALL"));
        typeWallet.update((n) => (n = searchAccountType));
        wallet.update((n) => (n = response?.data?.accountId));

        toastMsg = "Successfully add On-chain account!";
        isSuccess = true;
        trigger();
        mixpanel.track("user_add_address");

        errors["address"] = { ...errors["address"], required: false, msg: "" };
        errors["label"] = { ...errors["label"], required: false, msg: "" };
      } else {
        console.error("Invalid Form");
        isLoadingAddDEX = false;
      }
    } catch (e) {
      console.error(e);
      isLoadingAddDEX = false;
      toastMsg = "Something wrong when add DEX account. Please try again!";
      isSuccess = false;
      trigger();
    }
  };

  // Add CEX address account
  const onSubmitCEX = () => {
    const evmToken = localStorage.getItem("evm_token");
    if (evmToken) {
      isLoadingConnectCEX = true;
      const vezgo: any = Vezgo.init({
        clientId: "6st9c6s816su37qe8ld1d5iiq2",
        authEndpoint: `${API_URL}/auth/vezgo`,
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

            queryClient.refetchQueries(["list-address"]);

            await wait(1000);

            isLoadingConnectCEX = false;
            isOpenAddModal = false;

            toastMsg = "Successfully add CEX account!";
            isSuccess = true;
            trigger();
            mixpanel.track("user_add_address");
          })
          .onError(function (error) {
            console.error("connection vezgo error", error);

            queryClient.refetchQueries(["list-address"]);
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
    isLoadingEditDEX = true;
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

        queryClient.refetchQueries(["list-address"]);
        e.target.reset();
        isOpenEditModal = false;
        isLoadingEditDEX = false;
        toastMsg = "Successfully edit your wallet!";
        isSuccess = true;
        trigger();
        mixpanel.track("user_edit_address");
      } else {
        await validateFormEdit(data);
        if (
          !Object.keys(errorsEdit).some(
            (inputName) => errorsEdit[inputName]["required"]
          )
        ) {
          Object.assign(data, { id: data.address });

          await nimbus.put(`/accounts/${selectedItemEdit.id}`, {
            accountId: selectedItemEdit.address,
            label: data.label,
          });

          queryClient.refetchQueries(["list-address"]);
          e.target.reset();
          isOpenEditModal = false;
          isLoadingEditDEX = false;
          toastMsg = "Successfully edit your wallet!";
          isSuccess = true;
          trigger();
          mixpanel.track("user_edit_address");
        } else {
          console.error("Invalid Form");
          isLoadingEditDEX = false;
        }
      }
    } catch (e) {
      console.error(e);
      toastMsg = "Something wrong when edit your wallet. Please try again!";
      isSuccess = false;
      isLoadingEditDEX = false;
      trigger();
    }
  };

  // Delete account
  const handleDelete = async (item) => {
    isLoadingDelete = true;
    try {
      await nimbus.delete(`/accounts/${item.id}`, {});
      queryClient.refetchQueries(["list-address"]);
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

  const debounceSort = (listAddress) => {
    clearTimeout(timerDebounceSort);
    timerDebounceSort = setTimeout(() => {
      handleSortListAddress(listAddress);
    }, 300);
  };

  // Sort list address
  const handleSortListAddress = async (listAddress) => {
    try {
      const formatListAddress = listAddress.map((item, index) => {
        return {
          id: item.id,
          publicAddress: item.address,
          position: index,
        };
      });
      await nimbus.post(`/accounts/sorting`, formatListAddress);
      queryClient.refetchQueries(["list-address"]);
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
    if (
      listAddress.filter((item) => item.type !== "BUNDLE")?.length > 2 &&
      packageSelected === "FREE"
    ) {
      isDisabled = true;
    } else {
      isDisabled = false;
    }

    if (
      listAddress.filter((item) => item.type !== "BUNDLE")?.length > 6 &&
      packageSelected === "EXPLORER"
    ) {
      if (
        localStorage.getItem("isGetUserEmailYet") !== null &&
        localStorage.getItem("isGetUserEmailYet") === "false"
      ) {
        localStorage.setItem("isGetUserEmailYet", "true");
      }
      isDisabled = true;
    } else {
      isDisabled = false;
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
          "You've reached the maximum number of accounts. Upgrade to the EXPLORER Plan to add more";
      }
      if (packageSelected === "EXPLORER") {
        tooltipDisableAddBtn =
          "You've reached the maximum number of accounts. Upgrade to the ALPHA Plan to add more";
      }
    }
  }

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

  const getListBundle = async () => {
    const response: any = await nimbus.get("/address/personalize/bundle");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response.data;
  };

  $: queryListBundle = createQuery({
    queryKey: ["list-bundle"],
    queryFn: () => getListBundle(),
    staleTime: Infinity,
    enabled: Object.keys(userInfo).length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (
      !$queryListBundle.isError &&
      $queryListBundle.data &&
      $queryListBundle?.data?.length !== 0
    ) {
      listBundle = $queryListBundle?.data.map((item) => {
        return {
          name: item?.name,
          addresses: item?.accounts?.map((eachAccount) => eachAccount.address),
        };
      });
    }
  }

  const handleResetBundleState = () => {
    nameBundle = "";
    selectedBundle = {};
  };

  // handle submit (create and edit) bundle
  const onSubmitBundle = async () => {
    if (selectedAddresses.length > 100) {
      toastMsg =
        "You can create your bundle with maximum is 100 addresses. Please try again!";
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

    if (
      listBundle.find((item) => item.name === nameBundle) &&
      selectedBundle &&
      Object.keys(selectedBundle).length === 0
    ) {
      toastMsg = "Bundle already existed!";
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
        await nimbus.put(
          `/address/personalize/bundle?name=${selectedBundle?.name}`,
          formData
        );

        queryClient.invalidateQueries(["list-bundle"]);
        queryClient.invalidateQueries(["list-address"]);
        queryClient.invalidateQueries(["overview"]);
        queryClient.invalidateQueries(["vaults"]);
        queryClient.invalidateQueries(["token-holding"]);
        queryClient.invalidateQueries(["nft-holding"]);
        queryClient.invalidateQueries(["personalize-tag"]);
        queryClient.invalidateQueries(["compare"]);
        queryClient.invalidateQueries(["historical"]);
        queryClient.invalidateQueries(["inflow-outflow"]);

        toastMsg = "Successfully edit your bundle!";
      } else {
        const response = await nimbus.post(
          "/address/personalize/bundle",
          formData
        );

        queryClient.refetchQueries(["list-bundle"]);
        queryClient.invalidateQueries(["list-address"]);

        listBundle = response?.data.map((item) => {
          return {
            name: item?.name,
            addresses: item?.accounts?.map(
              (eachAccount) => eachAccount.address
            ),
          };
        });
        selectedBundle = listBundle[listBundle.length - 1];
        selectedAddresses = listBundle[listBundle.length - 1].addresses;
        nameBundle = listBundle[listBundle.length - 1].name;

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

  // handle delete bundle
  const handleDeleteBundle = async () => {
    isLoadingDeleteBundles = true;
    try {
      const response = await nimbus.delete(
        `/address/personalize/bundle?name=${selectedBundle?.name}`,
        selectedBundle
      );
      toastMsg = "Successfully delete your bundle!";
      isSuccess = true;
      trigger();
      listBundle = listBundle.filter(
        (item) => item.name !== selectedBundle?.name
      );
      queryClient.refetchQueries(["list-bundle"]);
      queryClient.invalidateQueries(["list-address"]);
      handleResetBundleState();
      selectedAddresses = [];
      isAddBundle = false;
      isLoadingDeleteBundles = false;
      isOpenConfirmDeleteBundles = false;
    } catch (e) {
      toastMsg = "Something wrong when delete your bundle. Please try again!";
      isSuccess = false;
      trigger();
      isLoadingDeleteBundles = false;
      isOpenConfirmDeleteBundles = false;
      console.error("e: ", e);
    }
  };

  const handleToggleCheckAll = (e) => {
    if (e.target.checked) {
      selectedAddresses = listAddressWithoutBundle.map((item) => item.address);
    } else {
      selectedAddresses = [];
    }
  };
</script>

<div class="flex flex-col gap-4">
  {#if (listAddress && listAddress.length === 0) || $query.isError}
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <div class="xl:title-3 title-1">
          {MultipleLang.title}
        </div>
        <div class="xl:text-base text-xl text-gray-500">
          Management your wallet address and bundles
        </div>
      </div>
      <div class="relative xl:w-max w-[200px]">
        {#if Object.keys(userInfo).length !== 0}
          <Button variant="tertiary" on:click={() => (isOpenAddModal = true)}>
            <img src={Plus} alt="" width="12" height="12" />
            <div class="text-2xl font-medium text-white xl:text-base">
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
              <img
                src={darkMode ? PlusBlack : Plus}
                alt=""
                width="12"
                height="12"
              />
              <div
                class={`text-2xl font-medium xl:text-base ${
                  darkMode ? "text-gray-400" : "text-white"
                }`}
              >
                {MultipleLang.content.btn_text}
              </div>
            </Button>
            {#if showDisableAddWallet}
              <div
                class="absolute transform -translate-x-1/2 -top-8 left-1/2 w-max"
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
      <div class="flex flex-col gap-1">
        <div class="xl:title-3 title-1">
          {MultipleLang.title}
        </div>
        <div class="xl:text-base text-xl text-gray-500">
          Management your wallet address and bundles
        </div>
      </div>
      {#if !$query.isError}
        <div class="flex items-center justify-between gap-10">
          {#if listBundle && listBundle.length === 0}
            <div class="text-xl xl:text-base">
              Create your bundle with up to 7 addresses per bundle!
            </div>
          {:else}
            <div
              class="relative flex items-center justify-between w-full gap-3 overflow-hidden"
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
                class="flex gap-3 px-2 overflow-x-auto w-max whitespace-nowrap"
                bind:this={scrollContainer}
                on:scroll={handleScroll}
              >
                <AnimateSharedLayout>
                  {#each listBundle.sort((a, b) => {
                    if (a.name === "Your wallets") return -1;
                    if (b.name === "Your wallets") return 1;
                    return 0;
                  }) as item}
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
                      {#if selectedBundle === item}
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
          <div class="flex justify-end flex-1 gap-4">
            <!-- add bundle -->
            <div class="flex items-center gap-4">
              {#if listBundle && listBundle.length !== 0 && selectedBundle && Object.keys(selectedBundle).length !== 0 && selectedBundle?.name !== "Your wallets"}
                <div
                  class="text-2xl font-semibold text-red-500 cursor-pointer w-max xl:text-base"
                  on:click={() => (isOpenConfirmDeleteBundles = true)}
                >
                  Delete
                </div>
              {/if}
              <div class="xl:w-max w-[200px]">
                <Button
                  variant="tertiary"
                  on:click={() => {
                    isAddBundle = true;
                    handleResetBundleState();
                    selectedAddresses = [];
                  }}
                >
                  <img src={Plus} alt="" class="w-4 h-4 xl:w-3 xl:h-3" />
                  <div class="text-2xl font-medium text-white xl:text-base">
                    Add bundle
                  </div>
                </Button>
              </div>
            </div>

            <!-- add account -->
            <div
              class="relative xl:w-max w-[200px]"
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
                      <img src={Plus} alt="" class="w-4 h-4 xl:w-3 xl:h-3" />
                      <div class="text-2xl font-medium text-white xl:text-base">
                        Add account
                      </div>
                    </Button>
                  {:else}
                    <Button variant="disabled" disabled>
                      <img
                        src={darkMode ? PlusBlack : Plus}
                        alt=""
                        class="w-4 h-4 xl:w-3 xl:h-3"
                      />
                      <div
                        class={`text-2xl font-medium xl:text-base ${
                          darkMode ? "text-gray-400" : "text-white"
                        }`}
                      >
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
                  <img src={Plus} alt="" class="w-4 h-4 xl:w-3 xl:h-3" />
                  <div class="text-2xl font-medium text-white xl:text-base">
                    Add account
                  </div>
                </Button>
              {/if}
              {#if showDisableAddWallet}
                <div
                  class="absolute right-0 transform -top-12"
                  style="z-index: 2147483648;"
                >
                  <tooltip-detail text={tooltipDisableAddBtn} />
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div class="border-t-[1.5px] border_0000000d pt-4">
    <!-- render table -->
    {#if isAddBundle || (selectedBundle && selectedBundle !== null && Object.keys(selectedBundle).length !== 0)}
      <form
        on:submit|preventDefault={onSubmitBundle}
        class="flex flex-col gap-4"
      >
        <div
          class={`flex flex-col gap-1 input-2 w-full py-[6px] px-3 ${
            nameBundle && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
        >
          <div class="xl:text-base text-2xl text-[#666666] font-medium">
            Bundle
          </div>
          <input
            type="text"
            placeholder="Your bundle name"
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
              nameBundle && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            }`}
            required
            disabled={selectedBundle?.name === "Your wallets" ? true : false}
            bind:value={nameBundle}
          />
        </div>

        <div class={`${$query.isLoading ? "h-[400px]" : ""}`}>
          <div
            class={`border border_0000000d rounded-[10px] xl:overflow-hidden overflow-x-auto h-full ${
              darkMode ? "bg-[#131313]" : "bg-[#fff]"
            }`}
          >
            <table class="table-auto xl:w-full w-[1800px] h-full">
              <thead>
                <tr class="bg_f4f5f8">
                  <th class="flex items-center justify-start gap-6 py-3 pl-3">
                    <input
                      type="checkbox"
                      on:change={handleToggleCheckAll}
                      class="cursor-pointer relative w-5 h-5 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                    />
                    <div class="text-xl font-semibold uppercase xl:text-xs">
                      {MultipleLang.content.label_header_table}
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-xl font-semibold text-left uppercase xl:text-xs"
                    >
                      {MultipleLang.content.address_header_table}
                    </div>
                  </th>
                  <th class="py-3 pr-3">
                    <div
                      class="text-xl font-semibold text-right uppercase xl:text-xs"
                    >
                      {MultipleLang.content.action_header_table}
                    </div>
                  </th>
                </tr>
              </thead>
              {#if $query.isLoading}
                <tbody>
                  <tr>
                    <td colspan="3">
                      <div
                        class="flex items-center justify-center h-full px-3 py-4"
                      >
                        <Loading />
                      </div>
                    </td>
                  </tr>
                </tbody>
              {:else}
                <tbody>
                  {#if listAddress && listAddress.length === 0}
                    <tr>
                      <td colspan="3">
                        <div
                          class="flex items-center justify-center h-full px-3 py-4"
                        >
                          No address
                        </div>
                      </td>
                    </tr>
                  {:else}
                    {#each listAddressWithoutBundle as item (item.id)}
                      <tr class="transition-all group">
                        <td
                          class={`pl-3 py-3 ${
                            darkMode
                              ? "group-hover:bg-[#000]"
                              : "group-hover:bg-gray-100"
                          }`}
                        >
                          <div
                            class="flex items-center gap-6 text-2xl text-left xl:text-base"
                          >
                            <div class="flex justify-center">
                              <input
                                type="checkbox"
                                value={item.address}
                                bind:group={selectedAddresses}
                                class="cursor-pointer relative w-5 h-5 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                              />
                            </div>
                            {item.label}
                          </div>
                        </td>

                        <td
                          class={`py-3  ${
                            darkMode
                              ? "group-hover:bg-[#000]"
                              : "group-hover:bg-gray-100"
                          }`}
                        >
                          <div
                            class="bg-[#6AC7F533] text_27326F w-max px-3 py-1 rounded-[5px] xl:text-base text-2xl"
                          >
                            <Copy
                              address={item.address}
                              iconColor={`${darkMode ? "#fff" : "#000"}`}
                              color={`${darkMode ? "#fff" : "#000"}`}
                            />
                          </div>
                        </td>

                        <td
                          class={`py-3 pr-3 ${
                            darkMode
                              ? "group-hover:bg-[#000]"
                              : "group-hover:bg-gray-100"
                          }`}
                        >
                          <div class="flex justify-end gap-6">
                            <div
                              class="text-2xl font-semibold text-red-600 transition-all cursor-pointer hover:underline dark:text-red-500 xl:text-base"
                              on:click={() => {
                                isOpenConfirmDelete = true;
                                selectedWallet = item;
                              }}
                            >
                              {MultipleLang.content.modal_delete}
                            </div>
                            <div
                              class="text-2xl font-semibold text-blue-600 transition-all cursor-pointer hover:underline dark:text-blue-500 xl:text-base"
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
        <div class="flex justify-end gap-6 lg:gap-2">
          <div class="w-[120px]">
            <Button
              variant="secondary"
              on:click={() => {
                selectedAddresses = selectedBundle.addresses;
                isAddBundle = false;
                handleResetBundleState();
              }}
            >
              {MultipleLang.content.modal_cancel}</Button
            >
          </div>
          <div class="w-[120px]">
            <Button
              type="submit"
              variant="tertiary"
              isLoading={isLoadingBundle}
            >
              {#if selectedBundle && Object.keys(selectedBundle).length !== 0}
                Save
              {:else}
                {MultipleLang.content.modal_add}
              {/if}
            </Button>
          </div>
        </div>
      </form>
    {:else}
      <div class={`${$query.isLoading ? "h-[400px]" : ""}`}>
        <div
          class={`border border_0000000d rounded-[10px] xl:overflow-hidden overflow-x-auto h-full ${
            darkMode ? "bg-[#131313]" : "bg-[#fff]"
          }`}
        >
          <table class="table-auto xl:w-full w-[1800px] h-full">
            <thead>
              <tr class="bg_f4f5f8">
                <th class="py-3 pl-3">
                  <div
                    class="text-xl font-semibold text-left uppercase xl:text-xs"
                  >
                    {MultipleLang.content.label_header_table}
                  </div>
                </th>
                <th class="py-3">
                  <div
                    class="text-xl font-semibold text-left uppercase xl:text-xs"
                  >
                    {MultipleLang.content.address_header_table}
                  </div>
                </th>
                <th class="py-3 pr-3">
                  <div
                    class="text-xl font-semibold text-right uppercase xl:text-xs"
                  >
                    {MultipleLang.content.action_header_table}
                  </div>
                </th>
              </tr>
            </thead>
            {#if $query.isError}
              <tbody>
                <tr>
                  <td colspan="3">
                    <div
                      class="flex items-center justify-center h-full px-3 py-4"
                    >
                      Please connect wallet
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else if $query.isLoading}
              <tbody>
                <tr>
                  <td colspan="3">
                    <div
                      class="flex items-center justify-center h-full px-3 py-4"
                    >
                      <Loading />
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else}
              <tbody
                use:dndzone={{
                  items: listAddressWithoutBundle,
                  flipDurationMs: 300,
                  dropTargetStyle: { outline: "none" },
                  transformDraggedElement: (draggedEl, data, index) => {
                    draggedEl.classList.add("myStyle");
                  },
                }}
                on:consider={(e) => {
                  listAddressWithoutBundle = e.detail.items;
                }}
                on:finalize={(e) => {
                  listAddressWithoutBundle = e.detail.items;
                  debounceSort(e.detail.items);
                }}
              >
                {#if (listAddressWithoutBundle && listAddressWithoutBundle.length === 0) || $query.isError}
                  <tr>
                    <td colspan="3">
                      <div
                        class="flex items-center justify-center h-full px-3 py-4 text-2xl xl:text-base"
                      >
                        No address
                      </div>
                    </td>
                  </tr>
                {:else}
                  {#each listAddressWithoutBundle as item (item.id)}
                    <tr class="transition-all group">
                      <td
                        class={`pl-3 py-3 ${
                          darkMode
                            ? "group-hover:bg-[#000]"
                            : "group-hover:bg-gray-100"
                        }`}
                      >
                        <div
                          class="flex items-center gap-3 text-2xl text-left xl:text-base"
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
                          {item.label}
                        </div>
                      </td>

                      <td
                        class={`py-3 ${
                          darkMode
                            ? "group-hover:bg-[#000]"
                            : "group-hover:bg-gray-100"
                        }`}
                      >
                        <div
                          class="text_27326F w-max px-3 py-1 rounded-[5px] xl:text-base text-2xl"
                        >
                          <Copy
                            address={item.address}
                            iconColor={`${darkMode ? "#fff" : "#000"}`}
                            color={`${darkMode ? "#fff" : "#000"}`}
                          />
                        </div>
                      </td>

                      <td
                        class={`py-3 pr-3 ${
                          darkMode
                            ? "group-hover:bg-[#000]"
                            : "group-hover:bg-gray-100"
                        }`}
                      >
                        <div class="flex justify-end gap-6">
                          <div
                            class="text-2xl font-semibold text-red-600 transition-all cursor-pointer hover:underline dark:text-red-500 xl:text-base"
                            on:click={() => {
                              isOpenConfirmDelete = true;
                              selectedWallet = item;
                            }}
                          >
                            {MultipleLang.content.modal_delete}
                          </div>
                          <div
                            class="text-2xl font-semibold text-blue-600 transition-all cursor-pointer hover:underline dark:text-blue-500 xl:text-base"
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
    {/if}
  </div>
</div>

<!-- Modal add DEX account -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenAddModal}
  on:close={() => (isOpenAddModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="font-semibold xl:title-3 title-1">
      {MultipleLang.content.modal_add_title}
    </div>
    <div class="flex flex-col gap-7">
      <div class="flex flex-col gap-3">
        <div class="flex justify-center">
          <div class="w-max">
            <Button
              variant="tertiary"
              isLoading={isLoadingConnectCEX}
              disabled={isLoadingConnectCEX}
              on:click={onSubmitCEX}
            >
              <div class="text-2xl font-medium text-white xl:text-base">
                Connect Exchange
              </div>
            </Button>
          </div>
        </div>
        <div
          class="flex items-center justify-center gap-1 text-2xl xl:text-base"
        >
          <img src={Success} alt="" />
          Bank-level security/encryption.
          <a
            href="https://vezgo.com/security"
            class="text-blue-500 cursor-pointer"
            target="_blank">Learn more</a
          >
        </div>
        <div
          class="flex items-center justify-center gap-6 my-3 text-2xl xl:text-base"
        >
          {#each listLogoCEX as logo}
            <div
              class="flex items-center justify-center w-10 h-10 overflow-hidden rounded-full xl:w-8 xl:h-8"
            >
              <img src={logo} alt="" class="object-contain w-full h-full" />
            </div>
          {/each}
          <div class="text-gray-400">+22 More</div>
        </div>
      </div>
      <div class="border-t-[1px] relative">
        <div
          class={`absolute xl:top-[-10px] top-[-14px] left-1/2 transform -translate-x-1/2 text-gray-400 ${
            darkMode ? "bg-[#0f0f0f]" : "bg-white"
          } xl:text-sm text-xl px-2`}
        >
          Or
        </div>
      </div>
      <form
        on:submit|preventDefault={onSubmit}
        class="flex flex-col gap-3 mt-2"
      >
        <div class="flex flex-col gap-6 xl:gap-3">
          <div class="flex flex-col gap-1">
            <div
              class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
                address && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
              }`}
              class:input-border-error={errors.address &&
                errors.address.required}
            >
              <div class="xl:text-base text-2xl text-[#666666] font-medium">
                Address
              </div>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Your wallet address"
                value=""
                class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
                  address && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
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
                label && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
              }`}
              class:input-border-error={errors.label && errors.label.required}
            >
              <div class="xl:text-base text-2xl text-[#666666] font-medium">
                {MultipleLang.content.modal_label_label}
              </div>
              <input
                type="text"
                id="label"
                name="label"
                placeholder={MultipleLang.content.modal_label_label}
                value=""
                class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
                  label && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
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
        <div
          class="flex items-center justify-center gap-6 my-3 text-2xl xl:text-base"
        >
          {#each [{ logo: SolanaLogo, label: "Solana", value: "SOL" }].concat(chainList) as item}
            <div
              class="flex items-center justify-center w-10 h-10 overflow-hidden rounded-full xl:w-8 xl:h-8"
            >
              <img
                src={item.logo}
                alt=""
                class="object-contain w-full h-full"
              />
            </div>
          {/each}
          <div class="text-gray-400">More soon</div>
        </div>
        <div class="flex justify-end gap-6 lg:gap-2">
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
            <Button
              type="submit"
              variant="tertiary"
              isLoading={isLoadingAddDEX}
              disabled={isLoadingAddDEX}
            >
              {MultipleLang.content.modal_add}</Button
            >
          </div>
        </div>
      </form>
    </div>
  </div>
</AppOverlay>

<!-- Modal edit account -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenEditModal}
  on:close={() => (isOpenEditModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="font-semibold xl:title-3 title-1">
      {MultipleLang.content.modal_edit_title}
    </div>
    <form
      on:submit|preventDefault={onSubmitEdit}
      class="flex flex-col gap-10 xl:gap-3"
    >
      <div class="flex flex-col gap-6 xl:gap-3">
        <div class="flex flex-col gap-1">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              address && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
            }`}
            class:input-border-error={errorsEdit.address &&
              errorsEdit.address.required}
          >
            <div class="xl:text-base text-2xl font-semibold text-[#666666]">
              {MultipleLang.content.modal_address_label}
            </div>
            <input
              disabled={true}
              type="text"
              id="address"
              name="address"
              placeholder={MultipleLang.content.modal_address_label}
              value={selectedItemEdit.address}
              class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
                address && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
              }`}
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
              label && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
            }`}
            class:input-border-error={errorsEdit.label &&
              errorsEdit.label.required}
          >
            <div class="xl:text-base text-2xl font-semibold text-[#666666]">
              {MultipleLang.content.modal_label_label}
            </div>
            <input
              type="text"
              id="label"
              name="label"
              placeholder={MultipleLang.content.modal_label_label}
              bind:value={selectedItemEdit.label}
              class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
                label && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
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
      </div>
      <div class="flex justify-end gap-6 lg:gap-2">
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
          <Button
            type="submit"
            variant="tertiary"
            isLoading={isLoadingEditDEX}
            disabled={isLoadingEditDEX}
          >
            {MultipleLang.content.modal_edit}</Button
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
  <div class="flex flex-col gap-10 xl:gap-4">
    <div class="flex flex-col items-start gap-1">
      <div class="font-semibold xl:title-3 title-1">
        {MultipleLang.content.modal_delete_title}
      </div>
      <div class="text-2xl text-gray-500 xl:text-sm">
        {MultipleLang.content.modal_delete_sub_title}
      </div>
    </div>
    <div class="flex justify-end gap-6 lg:gap-2">
      <div class="lg:w-[120px] w-full">
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
      <div class="lg:w-[120px] w-full">
        <Button
          variant="delete"
          isLoading={isLoadingDelete}
          disabled={isLoadingDelete}
          on:click={() => {
            handleDelete(selectedWallet);
          }}
        >
          {MultipleLang.content.modal_delete}
        </Button>
      </div>
    </div>
  </div>
</AppOverlay>

<!-- Modal confirm delete bundles -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenConfirmDeleteBundles}
  on:close={() => (isOpenConfirmDeleteBundles = false)}
>
  <div class="flex flex-col gap-10 xl:gap-4">
    <div class="flex flex-col items-start gap-1">
      <div class="font-semibold xl:title-3 title-1">
        {MultipleLang.content.modal_delete_title}
      </div>
      <div class="text-2xl text-gray-500 xl:text-sm">
        Do you really want to delete this bundles? This process cannot revert
      </div>
    </div>
    <div class="flex justify-end gap-6 lg:gap-2">
      <div class="lg:w-[120px] w-full">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenConfirmDeleteBundles = false;
          }}
        >
          {MultipleLang.content.modal_cancel}
        </Button>
      </div>
      <div class="lg:w-[120px] w-full">
        <Button
          variant="delete"
          isLoading={isLoadingDeleteBundles}
          disabled={isLoadingDeleteBundles}
          on:click={handleDeleteBundle}
        >
          {MultipleLang.content.modal_delete}
        </Button>
      </div>
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
  <div class="flex flex-col gap-4">
    <div class="flex flex-col items-start gap-1">
      <div class="font-semibold xl:title-3 title-1">
        Let's us know your email
      </div>
      <div class="text-2xl text-gray-500 xl:text-sm">
        Add your email to get updates from us and receive exclusive benefits
        soon.
      </div>
    </div>
    <form
      on:submit|preventDefault={onSubmitGetEmail}
      class="flex flex-col gap-10 xl:gap-3"
    >
      <div
        class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
          email && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
        }`}
      >
        <div class="xl:text-base text-2xl text-[#666666] font-medium">
          Email
        </div>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Your email"
          value=""
          class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
            email && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
          }
              `}
          on:keyup={({ target: { value } }) => (email = value)}
        />
      </div>
      <div class="flex justify-end gap-6 lg:gap-2">
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

{#if show}
  <div class="fixed z-10 w-full top-3 right-3">
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
  </div>
{/if}

<style>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }

  :global(body) .bg_f4f5f8 {
    background: #f4f5f8;
  }
  :global(body.dark) .bg_f4f5f8 {
    background: #131313;
  }

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

  :global(body) .myStyle {
    display: flex !important;
    justify-content: space-between !important;
    background: #f3f4f6 !important;
  }

  :global(body.dark) .myStyle {
    display: flex !important;
    justify-content: space-between !important;
    background: black !important;
  }
</style>

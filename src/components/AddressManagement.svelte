<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import {
    wallet,
    chain,
    typeWallet,
    user,
    selectedPackage,
    isDarkMode,
    selectedBundle,
    triggerConnectWallet,
    userPublicAddress,
  } from "~/store";
  import { i18n } from "~/lib/i18n";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import {
    chainList,
    listLogoCEX,
    listProviderCEX,
    clickOutside,
    driverObj,
  } from "~/utils";
  import mixpanel from "mixpanel-browser";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { API_URL, nimbus } from "~/lib/network";
  import { Toast, Avatar } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import Vezgo from "vezgo-sdk-js/dist/vezgo.es5.js";
  import { useNavigate } from "svelte-navigator";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import { wait } from "~/entries/background/utils";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  export let type: "portfolio" | "order" = "portfolio";
  export let title;

  import Loading from "./Loading.svelte";
  import Button from "~/components/Button.svelte";
  import Select from "~/components/Select.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Copy from "~/components/Copy.svelte";
  import HiddenPortfolio from "./HiddenPortfolio.svelte";

  import Plus from "~/assets/plus.svg";
  import PlusBlack from "~/assets/plus-black.svg";
  import All from "~/assets/all.svg";
  import BitcoinLogo from "~/assets/bitcoin.png";
  import SolanaLogo from "~/assets/solana.png";
  import FollowWhale from "~/assets/whale-tracking.gif";
  import Success from "~/assets/shield-done.svg";
  import Bundles from "~/assets/bundles.png";
  // import "driver.js/dist/driver.css";

  const MultipleLang = {
    empty_wallet: i18n("newtabPage.empty-wallet", "No account added yet."),
    addwallet: i18n(
      "newtabPage.addwallet",
      "Add your account to keep track of your investments."
    ),
    content: {
      btn_text: i18n(
        "optionsPage.accounts-page-content.address-btn-text",
        "Add Wallet"
      ),
      modal_cancel: i18n(
        "optionsPage.accounts-page-content.modal-cancel",
        "Cancel"
      ),
      modal_add: i18n(
        "optionsPage.accounts-page-content.modal-add-wallet",
        "Add"
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
        "Add your account"
      ),
      modal_add_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-add-sub-title",
        "Add your account will give you more option to see the information at page new tab"
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
  const queryClient = useQueryClient();

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let packageSelected = "";
  selectedPackage.subscribe((value) => {
    packageSelected = value;
  });

  let selectBundle = {};
  selectedBundle.subscribe((value) => {
    selectBundle = value;
  });

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  let showFollowTooltip = false;
  let showCommandTooltip = false;
  let showDisableAddWallet = false;
  let listAddress = [];
  let address = "";
  let label = "";
  let errors: any = {};
  let isLoadingAddDEX = false;
  let isOpenAddModal = false;
  let isOpenFollowWhaleModal = false;
  let isOpenModal = false;
  let isLoadingSendMail = false;
  let email = "";
  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;
  let container;
  let isLoadingConnectCEX = false;

  let isDisabled = false;
  let tooltipDisableAddBtn = "";
  let showPopover = false;

  let groupedToBundles = true;
  let selectYourWalletsBundle = [];

  let indexSelectedAddress = 0;

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
      return item.value.toLowerCase() === data.address.toLowerCase();
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
        return;
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

  const getListAddress = async () => {
    const response: any = await nimbus.get("/accounts/list");
    return response?.data;
  };

  const query = createQuery({
    queryKey: ["list-address"],
    queryFn: () => getListAddress(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
    onSuccess(data) {
      if (data.length === 0) {
        handleCreateUser();
      }
    },
  });

  $: {
    if (
      !$query.isError &&
      $query.data !== undefined &&
      $query.data.length !== 0
    ) {
      formatDataListAddress($query.data);
    }
  }

  const initialUpdateStateFromParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressParams = urlParams.get("address");
    const chainParams = urlParams.get("chain");
    const typeParams = urlParams.get("type");

    // reset all global state if list address is empty
    if (!chainParams && listAddress.length === 0) {
      chain.update((n) => (n = ""));
    }
    if (!addressParams && listAddress.length === 0) {
      wallet.update((n) => (n = ""));
    }
    if (!typeParams && listAddress.length === 0) {
      typeWallet.update((n) => (n = ""));
    }

    // update global chain state
    if (chainParams) {
      chain.update((n) => (n = chainParams));
    }

    // update global address state
    if (addressParams) {
      wallet.update((n) => (n = addressParams));
    }

    // update global type wallet state
    if (typeParams) {
      typeWallet.update((n) => (n = typeParams));
    }

    // check type address and handle logic update global state
    if (typeParams === "CEX") {
      chain.update((n) => (n = "ALL"));
      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          `?type=${typeWalletAddress}&address=${selectedWallet}`
      );
    }

    // if list address is empty and no chain params and have address param
    if (
      !chainParams &&
      listAddress.length === 0 &&
      addressParams &&
      typeParams
    ) {
      chain.update((n) => (n = "ALL"));

      if (typeParams === "BTC" || typeParams === "SOL") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${typeWalletAddress}&address=${selectedWallet}`
        );
      }

      if (typeParams === "EVM") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${typeWalletAddress}&chain=${selectedChain}&address=${selectedWallet}`
        );
      }
    }

    // if no chain params and list address is not empty
    if (!chainParams && listAddress.length !== 0 && typeParams) {
      if (typeParams === "EVM") {
        chain.update((n) => (n = "ALL"));
      }
      if (typeParams === "BTC" || typeParams === "SOL") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${typeWalletAddress}&address=${selectedWallet}`
        );
      }
    }
  };

  const handleUpdateParams = () => {
    const selected = listAddress.find((item) => {
      return item.value === selectedWallet;
    });

    if (selected && Object.keys(selected).length !== 0) {
      if (selected.type === "BUNDLE") {
        typeWallet.update((n) => (n = "BUNDLE"));
        browser.storage.sync.set({ typeWalletAddress: "BUNDLE" });
        chain.update((n) => (n = "ALL"));
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${typeWalletAddress}&address=${selectedWallet}`
        );
      }

      if (selected.type === "CEX") {
        typeWallet.update((n) => (n = "CEX"));
        browser.storage.sync.set({ typeWalletAddress: "CEX" });
        chain.update((n) => (n = "ALL"));
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${typeWalletAddress}&address=${selectedWallet}`
        );
      }

      if (selected.type === "EVM") {
        typeWallet.update((n) => (n = "EVM"));
        browser.storage.sync.set({ typeWalletAddress: "EVM" });
        if (selectedChain) {
          chain.update((n) => (n = selectedChain));
        } else {
          chain.update((n) => (n = "ALL"));
        }
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${typeWalletAddress}&chain=${selectedChain}&address=${selectedWallet}`
        );
      }

      if (selected.type === "SOL") {
        typeWallet.update((n) => (n = "SOL"));
        browser.storage.sync.set({ typeWalletAddress: "SOL" });
        chain.update((n) => (n = "ALL"));
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${typeWalletAddress}&address=${selectedWallet}`
        );
      }

      if (selected.type === "BTC") {
        typeWallet.update((n) => (n = "BTC"));
        browser.storage.sync.set({ typeWalletAddress: "BTC" });
        chain.update((n) => (n = "ALL"));
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${typeWalletAddress}&address=${selectedWallet}`
        );
      }
    }
  };

  const formatDataListAddress = async (data) => {
    const structWalletData = data.map((item) => {
      let logo = All;
      if (item?.type === "BTC") {
        logo = BitcoinLogo;
      }
      if (item?.type === "SOL") {
        logo = SolanaLogo;
      }
      if (item?.type === "BUNDLE") {
        logo = Bundles;
      }
      return {
        id: item.id,
        type: item.type,
        label: item.label,
        value: item.type === "CEX" ? item.id : item.accountId,
        logo: item.type === "CEX" ? item.logo : logo,
        accounts:
          item?.accounts?.map((account) => {
            let logo = All;
            if (account?.type === "BTC") {
              logo = BitcoinLogo;
            }
            if (account?.type === "SOL") {
              logo = SolanaLogo;
            }
            return {
              id: account?.id,
              type: account?.type,
              label: account?.label,
              value: account?.type === "CEX" ? account?.id : account?.accountId,
              logo: account?.type === "CEX" ? account?.logo : logo,
            };
          }) || [],
      };
    });

    listAddress = structWalletData;

    const selectYourBundle = listAddress.find(
      (item) => item.type === "BUNDLE" && item.label === "Your wallets"
    );
    selectYourWalletsBundle = selectYourBundle?.accounts.map(
      (item) => item.value
    );

    if (selectYourBundle === undefined) {
      await nimbus.post("/address/personalize/bundle", {
        name: "Your wallets",
        addresses: listAddress.map((item) => item.value),
      });
      queryClient.invalidateQueries(["list-bundle"]);
    }

    // check type wallet
    const selectedTypeWalletRes = await browser.storage.sync.get(
      "typeWalletAddress"
    );
    if (selectedTypeWalletRes?.typeWalletAddress !== null) {
      typeWallet.update((n) => (n = selectedTypeWalletRes.typeWalletAddress));
    } else {
      typeWallet.update((n) => (n = listAddress[0]?.type));
    }

    // check chain wallet
    const selectedChainRes = await browser.storage.sync.get("selectedChain");
    if (selectedChainRes?.selectedChain !== null) {
      chain.update((n) => (n = selectedChainRes.selectedChain));
    } else {
      chain.update((n) => (n = "ALL"));
    }

    // check wallet
    const selectedWalletRes = await browser.storage.sync.get("selectedWallet");
    if (selectedWalletRes?.selectedWallet !== null) {
      wallet.update((n) => (n = selectedWalletRes.selectedWallet));
    } else {
      wallet.update((n) => (n = listAddress[0]?.value));
    }

    initialUpdateStateFromParams();
  };

  const handleCreateUser = async () => {
    const evmAddress = localStorage.getItem("evm_address");
    if (evmAddress) {
      try {
        await nimbus.post("/accounts", {
          type: "DEX",
          publicAddress: evmAddress,
          accountId: evmAddress,
          label: "My address",
        });
        wallet.update((n) => (n = evmAddress));
        await nimbus.post("/address/personalize/bundle", {
          name: "Your wallets",
          addresses: [evmAddress],
        });
        queryClient.invalidateQueries(["list-bundle"]);
        queryClient.invalidateQueries(["list-address"]);
        mixpanel.track("user_add_address");
      } catch (e) {
        console.error(e);
      }
    }
  };

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
        const dataFormat = {
          id: data.address,
          label: data.label,
          value: data.address,
        };

        if (groupedToBundles) {
          await nimbus.put(
            `/address/personalize/bundle?name=${"Your wallets"}`,
            {
              name: "Your wallets",
              addresses: selectYourWalletsBundle.concat([dataFormat.value]),
            }
          );
          queryClient.invalidateQueries(["list-bundle"]);
        }

        await nimbus.post("/accounts", {
          type: "DEX",
          publicAddress: dataFormat.value,
          accountId: dataFormat.value,
          label: dataFormat.label,
        });

        const searchAccountType = await validateAddress(dataFormat.value);
        queryClient.invalidateQueries(["list-address"]);
        wallet.update((n) => (n = dataFormat.value));
        chain.update((n) => (n = "ALL"));
        typeWallet.update((n) => (n = searchAccountType));

        browser.storage.sync.set({ selectedChain: "ALL" });
        browser.storage.sync.set({
          typeWalletAddress: searchAccountType,
        });
        browser.storage.sync.set({
          selectedWallet: dataFormat.value,
        });

        if (searchAccountType === "EVM") {
          window.history.replaceState(
            null,
            "",
            window.location.pathname +
              `?type=${searchAccountType}&chain=ALL&address=${dataFormat.value}`
          );
        }
        if (searchAccountType === "BTC" || searchAccountType === "SOL") {
          window.history.replaceState(
            null,
            "",
            window.location.pathname +
              `?type=${searchAccountType}&address=${dataFormat.value}`
          );
        }

        e.target.reset();
        errors = {};
        isOpenAddModal = false;
        isLoadingAddDEX = false;

        toastMsg = "Successfully add On-Chain account!";
        isSuccessToast = true;
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
      toastMsg = "Something wrong when add DEX account. Please try again!";
      isSuccessToast = false;
      isLoadingAddDEX = false;
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

            queryClient.invalidateQueries(["list-address"]);

            await wait(1000);

            if (listAddress[listAddress.length - 1]?.type === "CEX") {
              chain.update((n) => (n = "ALL"));
              wallet.update(
                (n) => (n = listAddress[listAddress.length - 1]?.id)
              );
              typeWallet.update((n) => (n = "CEX"));

              await nimbus.put(
                `/address/personalize/bundle?name=${"Your wallets"}`,
                {
                  name: "Your wallets",
                  addresses: selectYourWalletsBundle.concat([
                    listAddress[listAddress.length - 1]?.id,
                  ]),
                }
              );
              queryClient.invalidateQueries(["list-bundle"]);
            }

            await wait(300);

            queryClient.invalidateQueries(["list-address"]);

            isLoadingConnectCEX = false;
            isOpenAddModal = false;

            toastMsg = "Successfully add CEX account!";
            isSuccessToast = true;
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
            isSuccessToast = false;
            trigger();
          });
      }
    }
  };

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
      isSuccessToast = true;
      trigger();
    } catch (e) {
      isLoadingSendMail = false;
      toastMsg = "Something wrong when sending email. Please try again!";
      isSuccessToast = false;
      trigger();
    } finally {
      isOpenModal = false;
    }
  };

  onMount(() => {
    initialUpdateStateFromParams();
    if (
      localStorage.getItem("isGetUserEmailYet") !== null &&
      localStorage.getItem("isGetUserEmailYet") === "true"
    ) {
      return;
    }
    localStorage.setItem("isGetUserEmailYet", "false");
  });

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        browser.storage.sync.set({ selectedWallet: selectedWallet });
        browser.storage.sync.set({ selectedChain: selectedChain });

        if (selectedWallet === "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0") {
          window.history.replaceState(
            null,
            "",
            window.location.pathname +
              `?type=EVM&chain=${selectedChain}&address=${selectedWallet}`
          );
        } else {
          handleUpdateParams();
        }
      }
    }
  }

  $: {
    if (
      address &&
      errors.address &&
      errors.address.msg === MultipleLang.content.address_required
    ) {
      errors["address"] = { ...errors["address"], required: false, msg: "" };
    }
    if (
      label &&
      errors.label &&
      errors.label.msg === MultipleLang.content.label_required
    ) {
      errors["label"] = { ...errors["label"], required: false, msg: "" };
    }
  }

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

  $: {
    if (Object.keys(userInfo).length === 0) {
      tooltipDisableAddBtn = "Connect wallet to add account";
      listAddress = [];
      const urlParams = new URLSearchParams(window.location.search);
      const addressParams = urlParams.get("address");
      if (!addressParams) {
        window.history.replaceState(null, "", "/");
      }
    }
  }

  $: {
    if (selectedWallet) {
      selectedBundle.update(
        (n) => (n = listAddress.find((item) => item.value === selectedWallet))
      );
    }
  }

  $: {
    if (selectedWallet) {
      const selectedAddress = listAddress
        .sort((a, b) => {
          if (a.type === "BUNDLE" && a.label === "Your wallets") return -1;
          if (b.type === "BUNDLE" && b.label === "Your wallets") return 1;
          return 0;
        })
        .find(
          (item) => item.value.toLowerCase() === selectedWallet.toLowerCase()
        );
      indexSelectedAddress = listAddress.indexOf(selectedAddress);
    }
  }

  $: console.log("this is wallet  : ", $wallet);

  $: {
    if (
      !localStorage.getItem("view-use-wallet-or-demo-tour") &&
      !$userPublicAddress
    ) {
      setTimeout(() => {
        driverObj.highlight({
          element: "#view-use-wallet-or-demo",
          popover: {
            title: "Introduce App",
            description: "Add wallet or view Demo wallet",
          },
        });
        localStorage.setItem("view-use-wallet-or-demo-tour", "true");
      }, 1000);
    }
  }

  const handleSelectNextAddress = () => {
    if (indexSelectedAddress < listAddress.length - 1) {
      indexSelectedAddress = indexSelectedAddress + 1;

      const selectAddress = listAddress.sort((a, b) => {
        if (a.type === "BUNDLE" && a.label === "Your wallets") return -1;
        if (b.type === "BUNDLE" && b.label === "Your wallets") return 1;
        return 0;
      })[indexSelectedAddress];

      wallet.update((n) => (n = selectAddress.value));
      browser.storage.sync.set({ selectedWallet: selectedWallet });
      browser.storage.sync.set({ selectedChain: selectedChain });
      handleUpdateParams();
    }
  };

  const handleSelectPrevAddress = () => {
    if (indexSelectedAddress > 0) {
      indexSelectedAddress = indexSelectedAddress - 1;

      const selectAddress = listAddress.sort((a, b) => {
        if (a.type === "BUNDLE" && a.label === "Your wallets") return -1;
        if (b.type === "BUNDLE" && b.label === "Your wallets") return 1;
        return 0;
      })[indexSelectedAddress];

      wallet.update((n) => (n = selectAddress.value));
      browser.storage.sync.set({ selectedWallet: selectedWallet });
      browser.storage.sync.set({ selectedChain: selectedChain });
      handleUpdateParams();
    }
  };
</script>

{#if $query.isFetching}
  <div class="flex items-center justify-center h-screen">
    <Loading />
  </div>
{:else}
  <div>
    {#if listAddress.length === 0 && selectedWallet?.length === 0}
      <div class="flex items-center justify-center h-screen">
        <div
          class="flex flex-col items-center justify-center w-2/3 gap-4 p-6"
          id="view-use-wallet-or-demo"
        >
          {#if $query.isError && Object.keys(userInfo).length !== 0}
            <div class="xl:text-lg text-2xl">
              {$query.error}
            </div>
          {:else}
            <div class="xl:text-lg text-2xl">
              {#if Object.keys(userInfo).length !== 0}
                {MultipleLang.addwallet}
              {:else}
                Connect wallet to start tracking your investments
              {/if}
            </div>
            {#if Object.keys(userInfo).length !== 0}
              <div class="w-max">
                <Button
                  variant="tertiary"
                  on:click={() => (isOpenAddModal = true)}
                >
                  <img src={Plus} alt="" width="12" height="12" />
                  <div class="text-2xl font-medium text-white xl:text-base">
                    {MultipleLang.content.btn_text}
                  </div>
                </Button>
              </div>
            {:else}
              <div class="flex flex-col gap-4">
                <Button
                  on:click={() => {
                    triggerConnectWallet.update((n) => (n = true));
                    driverObj.destroy();
                  }}
                >
                  <div class="text-2xl font-medium xl:text-base">
                    Connect Wallet
                  </div>
                </Button>
                <div
                  class="text-2xl font-medium xl:text-base mt-2 hover:underline text-[#1E96FC] cursor-pointer"
                  on:click={() => {
                    mixpanel.track("user_search");
                    chain.update((n) => (n = "ALL"));
                    wallet.update(
                      (n) => (n = "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0")
                    );
                    typeWallet.update((n) => (n = "EVM"));
                    navigate(
                      `/?type=EVM&chain=ALL&address=0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0`
                    );
                    driverObj.destroy();
                  }}
                >
                  Try Demo account
                </div>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {:else}
      <div class="header header-container">
        <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
          <div class="flex flex-col mb-5 gap-14">
            <div class="flex items-center justify-between gap-6">
              <!-- desktop list address wallet -->
              <div class="hidden xl:block">
                {#if listAddress && listAddress?.length !== 0}
                  <div class="flex items-center gap-5">
                    {#if listAddress.length > 5}
                      <AnimateSharedLayout>
                        {#each listAddress.slice(0, 5).sort((a, b) => {
                          if (a.type === "BUNDLE" && a.label === "Your wallets") return -1;
                          if (b.type === "BUNDLE" && b.label === "Your wallets") return 1;
                          return 0;
                        }) as item}
                          <div
                            id={item.value}
                            class="relative xl:text-base text-2xl text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                            class:hover:no-underline={item.value ===
                              selectedWallet}
                            on:click={() => {
                              wallet.update((n) => (n = item.value));
                            }}
                          >
                            <img
                              src={item.logo}
                              alt=""
                              class={`w-5 h-5 xl:w-4 xl:h-4 ${
                                item.type !== "BUNDLE" ? "rounded-full" : ""
                              }`}
                            />
                            {item.label}
                            {#if item.value === selectedWallet}
                              <Motion
                                let:motion
                                layoutId="active-pill"
                                transition={{
                                  type: "spring",
                                  duration: 0.6,
                                }}
                              >
                                <div
                                  class="absolute inset-0 rounded-full bg-[#ffffff1c]"
                                  use:motion
                                />
                              </Motion>
                            {/if}
                          </div>
                        {/each}
                      </AnimateSharedLayout>
                      <div class="relative">
                        <div class="relative z-40">
                          <Select
                            type="wallet"
                            positionSelectList="right-0"
                            listSelect={listAddress.slice(
                              5,
                              listAddress.length
                            )}
                            bind:selected={selectedWallet}
                          />
                        </div>
                        {#if listAddress
                          .slice(5, listAddress.length)
                          .find((item) => item.value === selectedWallet) !== undefined}
                          <div
                            class="absolute inset-0 rounded-full bg-[#ffffff1c] z-1"
                          />
                        {/if}
                      </div>
                      {#if listAddress.length > 10}
                        <div class="flex items-center gap-3">
                          <div
                            class={`cursor-pointer overflow-hidden border border-white rounded-full ${
                              indexSelectedAddress === 0 ? "opacity-50" : ""
                            }`}
                            on:click={handleSelectPrevAddress}
                          >
                            <div class="transform -translate-x-[1px]">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fill="#fff"
                                  fill-rule="evenodd"
                                  d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                          <div
                            class={`cursor-pointer overflow-hidden border border-white rounded-full ${
                              indexSelectedAddress === listAddress.length - 1
                                ? "opacity-50"
                                : ""
                            }`}
                            on:click={handleSelectNextAddress}
                          >
                            <div class="transform translate-x-[1px]">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fill="#fff"
                                  fill-rule="evenodd"
                                  d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10L7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      {/if}
                    {:else}
                      <AnimateSharedLayout>
                        {#each listAddress as item}
                          <div
                            id={item.value}
                            class="relative xl:text-base text-2xl text-white py-1 xl:pl-2 xl:pr-3 px-3 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                            class:hover:no-underline={item.value ===
                              selectedWallet}
                            on:click={() => {
                              wallet.update((n) => (n = item.value));
                            }}
                          >
                            <img
                              src={item.logo}
                              alt=""
                              class={`w-5 h-5 xl:w-4 xl:h-4 ${
                                item.type !== "BUNDLE" ? "rounded-full" : ""
                              }`}
                            />
                            {item.label}
                            {#if item.value === selectedWallet}
                              <Motion
                                let:motion
                                layoutId="active-pill"
                                transition={{
                                  type: "spring",
                                  duration: 0.6,
                                }}
                              >
                                <div
                                  class="absolute inset-0 rounded-full bg-[#ffffff1c]"
                                  use:motion
                                />
                              </Motion>
                            {/if}
                          </div>
                        {/each}
                      </AnimateSharedLayout>
                    {/if}
                  </div>
                {:else}
                  <div class="text-2xl font-medium text-white xl:text-base">
                    {MultipleLang.empty_wallet}
                  </div>
                {/if}
              </div>

              <!-- mobile list address wallet -->
              {#if listAddress && listAddress?.length !== 0}
                <div
                  class="relative flex flex-row items-center justify-between w-full gap-3 overflow-hidden xl:hidden"
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
                    class="container flex gap-3 overflow-x-auto w-max whitespace-nowrap"
                    bind:this={scrollContainer}
                    on:scroll={handleScroll}
                  >
                    {#each listAddress.sort((a, b) => {
                      if (a.type === "BUNDLE" && a.label === "Your wallets") return -1;
                      if (b.type === "BUNDLE" && b.label === "Your wallets") return 1;
                      return 0;
                    }) as item}
                      <div
                        id={item.value}
                        class="w-max flex-shrink-0 relative text-2xl text-white py-1 px-3 flex items-center gap-2 rounded-[100px]"
                        class:hover:no-underline={item.value === selectedWallet}
                        on:click={() => {
                          wallet.update((n) => (n = item.value));
                        }}
                      >
                        <img src={item.logo} alt="" class="w-5 h-5" />
                        {item.label}
                        {#if item.value === selectedWallet}
                          <Motion
                            let:motion
                            layoutId="active-pill"
                            transition={{ type: "spring", duration: 0.6 }}
                          >
                            <div
                              class="absolute inset-0 rounded-full bg-[#ffffff1c]"
                              use:motion
                            />
                          </Motion>
                        {/if}
                      </div>
                    {/each}
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
              {:else}
                <div
                  class="block text-2xl font-medium text-white xl:hidden xl:text-base"
                >
                  {MultipleLang.empty_wallet}
                </div>
              {/if}

              <!-- btn add address wallet -->
              <div
                class="relative xl:w-max w-[260px] flex justify-end"
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
                            localStorage.getItem("isGetUserEmailYet") !==
                              null &&
                            localStorage.getItem("isGetUserEmailYet") ===
                              "false"
                          ) {
                            isOpenModal = true;
                          }
                        }}
                      >
                        <img src={Plus} alt="" class="w-4 h-4 xl:w-3 xl:h-3" />
                        <div
                          class="text-2xl font-medium text-white xl:text-base"
                        >
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
                    class={`absolute transform ${
                      Object.keys(userInfo).length === 0 ? "-top-8" : "-top-12"
                    } right-0`}
                    style="z-index: 2147483648;"
                  >
                    <div
                      class="max-w-[360px] text-white bg-black py-1 px-2 text-xs rounded relative w-max normal-case"
                    >
                      {tooltipDisableAddBtn}
                    </div>
                  </div>
                {/if}
              </div>
            </div>

            <div class="flex items-end justify-between">
              <div class="flex flex-col gap-3">
                <div class="flex items-end gap-6">
                  <div class="font-medium text-white xl:text-5xl text-7xl">
                    {title}
                  </div>
                  {#if type === "portfolio"}
                    <span class="xl:pb-0 pb-3 xl:-ml-2">
                      <HiddenPortfolio />
                    </span>
                    <div class="xl:block hidden">
                      <slot name="reload" />
                    </div>
                  {/if}
                </div>

                <div class="flex items-center gap-4">
                  {#if selectBundle && Object.keys(selectBundle).length !== 0 && selectBundle?.type === "BUNDLE"}
                    <div
                      class="relative"
                      on:click={() => (showPopover = !showPopover)}
                    >
                      <div class="flex cursor-pointer">
                        {#if selectBundle && selectBundle?.accounts && selectBundle?.accounts?.length > 8}
                          {#each selectBundle?.accounts.slice(0, 7) as item, index}
                            <div class={`${index > 0 && "-ml-2"}`}>
                              <div class="hidden xl:block">
                                <Avatar src={item?.logo} stacked size="sm" />
                              </div>
                              <div class="block xl:hidden">
                                <Avatar src={item?.logo} stacked size="md" />
                              </div>
                            </div>
                          {/each}
                          <div class="-ml-2">
                            <div class="hidden xl:block">
                              <Avatar stacked size="sm">...</Avatar>
                            </div>
                            <div class="block xl:hidden">
                              <Avatar stacked size="md">...</Avatar>
                            </div>
                          </div>
                        {:else}
                          {#each selectBundle?.accounts as item, index}
                            <div class={`${index > 0 && "-ml-2"}`}>
                              <div class="hidden xl:block">
                                <Avatar src={item?.logo} stacked size="sm" />
                              </div>
                              <div class="block xl:hidden">
                                <Avatar src={item?.logo} stacked size="md" />
                              </div>
                            </div>
                          {/each}
                        {/if}
                      </div>
                      {#if showPopover}
                        <div
                          class="select_content absolute left-0 z-50 flex flex-col xl:gap-3 gap-6 px-3 xl:py-2 py-3 text-sm transform rounded-lg top-12 w-max xl:max-h-[300px] xl:max-h-[310px] max-h-[380px]"
                          style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15); overflow-y: overlay;"
                          use:clickOutside
                          on:click_outside={() => (showPopover = false)}
                        >
                          {#each selectBundle?.accounts as item}
                            <div class="hidden xl:flex xl:flex-col">
                              <div
                                class="text-2xl xl:text-xs font-medium text_00000099"
                              >
                                {item.label}
                              </div>
                              <div class="text-3xl xl:text-sm">
                                <Copy
                                  address={item?.value}
                                  iconColor={darkMode ? "#fff" : "#000"}
                                  color={darkMode ? "#fff" : "#000"}
                                  isShorten
                                />
                              </div>
                            </div>
                            <div class="flex flex-col xl:hidden">
                              <div
                                class="text-2xl xl:text-xs font-medium text_00000099"
                              >
                                {item.label}
                              </div>
                              <div class="text-3xl xl:text-sm">
                                <Copy
                                  address={item?.value}
                                  iconColor={darkMode ? "#fff" : "#000"}
                                  color={darkMode ? "#fff" : "#000"}
                                  isShorten
                                  iconSize={24}
                                />
                              </div>
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <div class="hidden text-3xl xl:text-base xl:block">
                      <Copy
                        address={selectedWallet}
                        iconColor="#fff"
                        color="#fff"
                      />
                    </div>
                    <div class="block text-3xl xl:text-base xl:hidden">
                      <Copy
                        address={selectedWallet}
                        iconColor="#fff"
                        color="#fff"
                        isShorten
                        iconSize={24}
                      />
                    </div>
                  {/if}
                  <!-- <div
                    class="relative"
                    on:mouseenter={() => {
                      showFollowTooltip = true;
                    }}
                    on:mouseleave={() => {
                      showFollowTooltip = false;
                    }}
                  >
                    <Button
                      variant="secondary"
                      on:click={() => (isOpenFollowWhaleModal = true)}
                    >
                      Follow this whale 🐳
                    </Button>
                    {#if showFollowTooltip}
                      <div
                        class="absolute transform -translate-x-1/2 -top-8 left-1/2 w-max"
                        style="z-index: 2147483648;"
                      >
                        <tooltip-detail
                          text={"Alert me when it makes a move"}
                        />
                      </div>
                    {/if}
                  </div> -->
                  <div class="hidden xl:block">
                    {#if typeWalletAddress === "BTC"}
                      <div
                        use:tooltip={{
                          content: `<tooltip-detail text="Coming soon!" />`,
                          allowHTML: true,
                          placement: "top",
                          interactive: true,
                        }}
                      >
                        <Button variant="premium" disabled>
                          <div
                            class={`${
                              darkMode ? "text-gray-400" : "text-white"
                            }`}
                          >
                            Optimize return
                          </div>
                        </Button>
                      </div>
                    {:else}
                      <div>
                        {#if Object.keys(userInfo).length !== 0}
                          <div
                            use:tooltip={{
                              content: `<tooltip-detail text="Optimize this portfolio by Minimizing risk & Maximizing return" />`,
                              allowHTML: true,
                              placement: "top",
                              interactive: true,
                            }}
                          >
                            <Button
                              variant="premium"
                              on:click={() => {
                                navigate(
                                  `/compare?address=${encodeURIComponent(
                                    selectedWallet
                                  )}`
                                );
                                mixpanel.track("user_compare");
                              }}>Optimize return</Button
                            >
                          </div>
                        {:else}
                          <Button variant="premium" disabled
                            >Optimize return</Button
                          >
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-6">
                <div class="block xl:hidden">
                  {#if typeWalletAddress === "BTC"}
                    <div
                      use:tooltip={{
                        content: `<tooltip-detail text="Coming soon!" />`,
                        allowHTML: true,
                        placement: "top",
                        interactive: true,
                      }}
                    >
                      <Button variant="premium" disabled>
                        <div
                          class={`${darkMode ? "text-gray-400" : "text-white"}`}
                        >
                          Optimize return
                        </div>
                      </Button>
                    </div>
                  {:else}
                    <div>
                      {#if Object.keys(userInfo).length !== 0}
                        <div
                          use:tooltip={{
                            content: `<tooltip-detail text="Optimize this portfolio by Minimizing risk & Maximizing return" />`,
                            allowHTML: true,
                            placement: "top",
                            interactive: true,
                          }}
                        >
                          <Button
                            variant="premium"
                            on:click={() => {
                              navigate(
                                `/compare?address=${encodeURIComponent(
                                  selectedWallet
                                )}`
                              );
                              mixpanel.track("user_compare");
                            }}>Optimize return</Button
                          >
                        </div>
                      {:else}
                        <Button variant="premium" disabled
                          >Optimize return</Button
                        >
                      {/if}
                    </div>
                  {/if}
                </div>
                {#if typeWalletAddress === "EVM"}
                  <Select
                    type="chain"
                    positionSelectList="right-0"
                    listSelect={chainList}
                    bind:selected={selectedChain}
                  />
                {/if}
              </div>
            </div>

            {#key selectedWallet || selectedChain}
              {#if type === "portfolio"}
                <slot name="overview" />
              {/if}
            {/key}
          </div>
        </div>
      </div>

      {#key selectedWallet || selectedChain}
        <slot name="body" />
      {/key}
    {/if}
  </div>
{/if}

<!-- Modal add DEX account -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenAddModal}
  on:close={() => (isOpenAddModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="font-medium xl:title-3 title-1">
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
              <div class="font-medium text-white xl:text-base text-2xl">
                Connect Exchange
              </div>
            </Button>
          </div>
        </div>
        <div
          class="flex items-center justify-center gap-1 xl:text-base text-2xl"
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
          class="flex items-center justify-center gap-6 my-3 xl:text-base text-2xl"
        >
          {#each listLogoCEX as logo}
            <div
              class="flex items-center justify-center xl:w-8 xl:h-8 w-10 h-10 overflow-hidden rounded-full"
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
        <div class="flex flex-col xl:gap-3 gap-6">
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
                placeholder={"Your wallet address"}
                value=""
                class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
                  address && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
                } `}
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
          class="flex items-center justify-end gap-2 text-[#666666] xl:mt-0 mt-3"
        >
          <div class="xl:text-sm text-2xl">Is it your wallet?</div>
          <label class="switch">
            <input type="checkbox" bind:checked={groupedToBundles} />
            <span class="slider" />
          </label>
        </div>
        <div
          class="flex items-center justify-center gap-6 my-3 xl:text-base text-xl"
        >
          {#each [{ logo: SolanaLogo, label: "Solana", value: "SOL" }].concat(chainList) as item}
            <div
              class="flex items-center justify-center xl:w-8 xl:h-8 w-10 h-10 overflow-hidden rounded-full"
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

<!-- Modal follow Whales -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenFollowWhaleModal}
  on:close={() => (isOpenFollowWhaleModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <div class="text-2xl xl:text-base">
        Go to <a
          href="https://t.me/GetNimbusBot"
          target="_blank"
          class="text-blue-500">https://t.me/GetNimbusBot</a
        >
      </div>
      <div class="text-2xl xl:text-base">Use the command as follow video</div>
    </div>
    <div class="xl:h-[350px] h-[650px]">
      <img src={FollowWhale} alt="" class="object-contain w-full h-full" />
    </div>
    <div class="flex justify-end w-full">
      <CopyToClipboard
        text={`/start ${selectedWallet} ${
          listAddress.filter((item) => item.value === selectedWallet)?.[0]
            ?.label || ""
        }`}
        let:copy
      >
        <div
          class="relative w-max"
          on:mouseenter={() => {
            showCommandTooltip = true;
          }}
          on:mouseleave={() => {
            showCommandTooltip = false;
          }}
        >
          <Button
            on:click={() => {
              copy();
              isOpenFollowWhaleModal = false;
              showCommandTooltip = false;
            }}>Copy command</Button
          >

          {#if showCommandTooltip}
            <div
              class="absolute transform -translate-x-1/2 -top-8 left-1/2 w-max"
              style="z-index: 2147483648;"
            >
              <tooltip-detail
                text={`/start ${selectedWallet} ${
                  listAddress.filter(
                    (item) => item.value === selectedWallet
                  )?.[0]?.label || ""
                }`}
              />
            </div>
          {/if}
        </div>
      </CopyToClipboard>
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
    <div class="flex flex-col gap-1 items-start">
      <div class="xl:title-3 title-1 font-semibold">
        Let's us know your email
      </div>
      <div class="xl:text-sm text-2xl text-gray-500">
        Add your email to get updates from us and receive exclusive benefits
        soon.
      </div>
    </div>
    <form
      on:submit|preventDefault={onSubmitGetEmail}
      class="flex flex-col xl:gap-3 gap-10"
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
          }`}
          on:keyup={({ target: { value } }) => (email = value)}
        />
      </div>
      <div class="flex justify-end lg:gap-2 gap-6">
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

{#if showToast}
  <div class="fixed top-3 right-3 w-full z-10">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
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

<style windi:preflights:global windi:safelist:global>
  .header {
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }

  .input-border {
    border: 1px solid rgb(229, 231, 235);
  }

  .input-border-error {
    border: 1px solid red;
  }

  .container::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .container {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  :global(body) .header-container {
    background-color: #27326f;
    background-image: url("~/assets/capa.svg");
  }
  :global(body.dark) .header-container {
    background-color: #080808;
    background-image: url("~/assets/capa-dark.svg");
  }

  :global(body) .select_content {
    background: #ffffff;
    border: 0.5px solid transparent;
  }
  :global(body.dark) .select_content {
    background: #131313;
    border: 0.5px solid #cdcdcd59;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 34px;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }
  input:checked + .slider {
    background-color: #2196f3;
  }
  input:checked + .slider {
    box-shadow: 0 0 1px #2196f3;
  }
  input:checked + .slider:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
  }
</style>

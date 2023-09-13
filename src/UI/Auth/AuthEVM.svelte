<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-navigator";
  import onboard from "~/lib/web3-onboard";
  import { ethers } from "ethers";
  import {
    wallet,
    chain,
    typeWallet,
    user,
    isFirstTimeLogin,
    isDarkMode,
  } from "~/store";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";
  import { shorterAddress, clickOutside } from "~/utils";
  import { useNavigate } from "svelte-navigator";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import * as browser from "webextension-polyfill";

  import DarkMode from "~/components/DarkMode.svelte";

  import User from "~/assets/user.png";

  const wallets$ = onboard.state.select("wallets");
  const navigate = useNavigate();

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

  let showPopover = false;
  let addressWallet = "";
  let invitation = "";

  const queryClient = useQueryClient();

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let invitationParams = urlParams.get("invitation");
    if (invitationParams) {
      invitation = invitationParams;
    }

    const evmToken = localStorage.getItem("evm_token");
    const evmAddress = localStorage.getItem("evm_address");
    if (evmToken && evmAddress) {
      addressWallet = evmAddress;
      user.update(
        (n) =>
          (n = {
            picture: User,
          })
      );
    } else {
      handleSignOut();
    }
  });

  const connect = async () => {
    try {
      const res = await onboard.connectWallet();
      if (res && res.length !== 0) {
        handleGetNonce(res?.[0]?.provider, res?.[0]?.accounts[0]?.address);
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const disconnect = (value: any) => {
    if (value && Object.keys(value).length !== 0) {
      onboard.disconnectWallet({ label: value.label });
    }
  };

  const handleSignOut = () => {
    user.update((n) => (n = {}));
    wallet.update((n) => (n = ""));
    chain.update((n) => (n = ""));
    typeWallet.update((n) => (n = ""));
    showPopover = false;
    localStorage.removeItem("evm_address");
    localStorage.removeItem("evm_token");
    addressWallet = "";
    disconnect($wallets$?.[0]);
    queryClient.invalidateQueries(["list-address"]);
  };

  const handleSignAddressMessage = async (provider, signatureString) => {
    try {
      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider, "any");
        const signer = await ethersProvider?.getSigner();
        const signature = await signer.signMessage(
          `I am signing my one-time nonce: ${signatureString}`
        );
        if (signature) {
          return signature;
        } else {
          return "";
        }
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetNonce = async (provider, address) => {
    try {
      const res = await nimbus.post("/users/nonce", {
        publicAddress: address,
        referrer: invitation.length !== 0 ? invitation : undefined,
      });
      if (res && res.data) {
        const signatureString = await handleSignAddressMessage(
          provider,
          res.data.nonce
        );
        if (signatureString) {
          const payload = {
            signature: signatureString,
            publicAddress: address,
          };
          handleGetEVMToken(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetEVMToken = async (data) => {
    try {
      const res = await nimbus.post("/auth/evm", data);
      if (res?.data?.result) {
        addressWallet = data.publicAddress;
        localStorage.setItem("evm_address", data.publicAddress);
        localStorage.setItem("evm_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        queryClient.invalidateQueries(["list-address"]);
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const getListAddress = async () => {
    const response: any = await nimbus.get("/accounts/list");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
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
      navigate("/");
    },
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      formatDataListAddress($query.data);
    }
  }

  const formatDataListAddress = (data) => {
    const structWalletData = data.map((item) => {
      return {
        id: item.id,
        type: item.type,
        label: item.label,
        value: item.type === "CEX" ? item.id : item.accountId,
        logo: item.logo,
      };
    });
    if (structWalletData && structWalletData.length === 0) {
      handleAddAccount(addressWallet);
    } else {
      isFirstTimeLogin.update((n) => (n = false));
    }
  };

  // Add DEX address account
  const handleAddAccount = async (publicAddress) => {
    try {
      await nimbus.post("/accounts", {
        type: "DEX",
        publicAddress: publicAddress,
        accountId: publicAddress,
        label: "My address",
      });

      chain.update((n) => (n = "ALL"));
      wallet.update((n) => (n = publicAddress));
      typeWallet.update((n) => (n = "DEX"));

      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          `?type=${typeWalletAddress}&chain=${selectedChain}&address=${selectedWallet}`
      );

      isFirstTimeLogin.update((n) => (n = true));

      mixpanel.track("user_add_address");
    } catch (e) {
      console.error(e);
    }
  };
</script>

{#if Object.keys(userInfo).length !== 0}
  <div class="relative">
    <div
      class="xl:w-[40px] xl:h-[40px] w-16 h-16 rounded-full overflow-hidden cursor-pointer"
      on:click={() => (showPopover = !showPopover)}
    >
      <img src={userInfo.picture} alt="" class="object-cover w-full h-full" />
    </div>

    {#if showPopover}
      <div
        class="select_content absolute right-0 z-50 flex flex-col gap-1 px-3 xl:py-2 py-3 text-sm transform rounded-lg xl:top-12 top-20 w-max"
        style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
        use:clickOutside
        on:click_outside={() => (showPopover = false)}
      >
        <div
          class="flex flex-col gap-3 mx-2 pt-1 pb-2 border-b-[1px] border_0000001a"
        >
          <div class="text-2xl xl:text-base">
            GM 👋, {shorterAddress(addressWallet)}
          </div>
          <DarkMode />
        </div>
        <div
          class={`flex items-center gap-1 text-2xl font-medium text-yellow-400 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 ${
            darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
          }`}
          on:click={() => {
            navigate("/upgrade");
            showPopover = false;
          }}
        >
          Upgrade
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="#ffb800"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.6629 3.5843C14.7217 3.57771 14.7811 3.58901 14.8339 3.61685C14.8867 3.64495 14.9305 3.68852 14.9599 3.74223C14.9893 3.79594 15.0031 3.85745 14.9994 3.91919L14.4836 12.7921H1.51642L1.00059 3.91919C0.996892 3.85745 1.01055 3.79592 1.0399 3.74216C1.06924 3.68841 1.11299 3.64476 1.16578 3.6166C1.21856 3.58843 1.27808 3.57697 1.33702 3.58362C1.39596 3.59026 1.45175 3.61473 1.49755 3.65401L4.60499 6.30708L7.76082 2.11502C7.79036 2.07895 7.82704 2.04999 7.86833 2.03014C7.90962 2.01028 7.95455 2 8.00001 2C8.04548 2 8.0904 2.01028 8.1317 2.03014C8.17299 2.04999 8.20967 2.07895 8.23921 2.11502L11.395 6.30708L14.5025 3.65401C14.5484 3.61511 14.6041 3.5909 14.6629 3.5843ZM1.55334 13.4273L1.55781 13.5041C1.577 13.827 1.71333 14.1301 1.93906 14.3518C2.1648 14.5735 2.46298 14.6971 2.77297 14.6976H13.2271C13.537 14.6971 13.8352 14.5735 14.061 14.3518C14.2867 14.1301 14.423 13.827 14.4422 13.5041L14.4467 13.4273H1.55334Z"
              fill="#ffb800"
            />
          </svg>
        </div>
        <Link to="invitation">
          <div
            class={`text-2xl text_00000066 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 ${
              darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
            }`}
            on:click={() => (showPopover = false)}
          >
            Invite
          </div>
        </Link>

        <!-- <a
          href="entries/options/index.html?tab=wallets"
          target="_blank"
          class={`hidden text-2xl text_00000066 cursor-pointer xl:block xl:text-base rounded-md transition-all px-2 py-1 ${
            darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
          }`}
          on:click={() => (showPopover = false)}
        >
          Settings
        </a> -->

        <Link to="options/?tab=wallets">
          <div
            class={`hidden text-2xl text_00000066 cursor-pointer xl:block xl:text-base rounded-md transition-all px-2 py-1 ${
              darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
            }`}
            on:click={() => (showPopover = false)}
          >
            Settings
          </div>
        </Link>

        <div
          class={`text-2xl font-medium text-red-500 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 ${
            darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
          }`}
          on:click={handleSignOut}
        >
          Logout
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div
    on:click={() => {
      connect();
      mixpanel.track("user_connect_wallet");
    }}
    class="text-2xl font-semibold text-white cursor-pointer xl:text-base"
  >
    Connect Wallet
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
  :global(body) .select_content {
    background: #ffffff;
    border: 0.5px solid transparent;
  }
  :global(body.dark) .select_content {
    background: #131313;
    border: 0.5px solid #cdcdcd59;
  }
</style>

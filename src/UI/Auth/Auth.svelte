<script lang="ts">
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { Link } from "svelte-navigator";
  import onboard from "~/lib/web3-onboard";
  import { ethers } from "ethers";
  import {
    wallet,
    chain,
    typeWallet,
    user,
    selectedPackage,
    isDarkMode,
    isShowHeaderMobile,
    triggerConnectWallet,
    userId,
    userPublicAddress,
    suiWalletInstance,
    tonConnector,
  } from "~/store";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";
  import { shorterAddress, clickOutside } from "~/utils";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import QRCode from "qrcode-generator";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { wait } from "~/entries/background/utils";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import {
    // BackpackWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import bs58 from "bs58";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { navigate } from "svelte-navigator";
  import type { WalletState } from "nimbus-sui-kit";

  import Tooltip from "~/components/Tooltip.svelte";
  import DarkMode from "~/components/DarkMode.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Loading from "~/components/Loading.svelte";
  import Button from "~/components/Button.svelte";
  import GoogleAuth from "./GoogleAuth.svelte";
  import SuiAuth from "./SUIAuth.svelte";
  import SolanaAuth from "./SolanaAuth.svelte";

  import User from "~/assets/user.png";
  import Logo from "~/assets/logo-1.svg";
  import Reload from "~/assets/reload-black.svg";
  import ReloadWhite from "~/assets/reload-white.svg";
  import Evm from "~/assets/chains/evm.png";
  import TonAuth from "./TonAuth.svelte";

  export let displayName;
  export let publicAddress;
  export let buyPackage = "Free";

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    // new BackpackWalletAdapter(),
  ];

  const wallets$ = onboard.state.select("wallets");

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

  let showPopover = false;
  let invitation = "";

  const queryClient = useQueryClient();

  let isOpenModalSync = false;
  let isCopied = false;
  let timer = null;
  let syncMobileCode = "";
  let qrImageDataUrl = "";

  let timeCountdown = 59;
  let timerCountdown;
  let loading = false;
  let isShowTooltipCopy = false;

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationParams = urlParams.get("invitation");
    if (invitationParams) {
      invitation = invitationParams;
    }

    const authToken = localStorage.getItem("auth_token");
    const solanaToken = localStorage.getItem("solana_token");
    const suiToken = localStorage.getItem("sui_token");
    const tonToken = localStorage.getItem("ton_token");
    const evmToken = localStorage.getItem("evm_token");
    if (evmToken || solanaToken || suiToken || tonToken || authToken) {
      user.update(
        (n) =>
          (n = {
            picture: User,
          })
      );
    }
  });

  const handleGetCodeSyncMobile = async () => {
    loading = true;
    try {
      const res: any = await nimbus.get("/users/cross-login");
      if (res?.data) {
        syncMobileCode = res?.data?.code;
        const expiredAt = dayjs.unix(res?.data?.expiredAt);
        const currentTime = dayjs();

        // Check if the time difference is more than 1 minute
        if (currentTime.diff(expiredAt, "second") > 60) {
          // Make another API call to get a new sync code
          const newResponse = await nimbus.get("/users/cross-login");
          if (newResponse) {
            syncMobileCode = res?.data?.code;
          }
        } else {
          // Schedule the next check after 1 minute
          timer = setTimeout(handleGetCodeSyncMobile, 60000);

          timerCountdown = setInterval(() => {
            timeCountdown -= 1;
            if (timeCountdown < 0) {
              timeCountdown = 59;
              clearInterval(timerCountdown);
            }
          }, 1000);
        }
      }
    } catch (e) {
      syncMobileCode = undefined;
      timeCountdown = 59;
      clearTimeout(timer);
      clearInterval(timerCountdown);
      console.error("error: ", e);
    } finally {
      loading = false;
    }
  };

  const handleSignOut = () => {
    mixpanel.track("user_logout");
    try {
      user.update((n) => (n = {}));
      wallet.update((n) => (n = ""));
      chain.update((n) => (n = ""));
      typeWallet.update((n) => (n = ""));
      userPublicAddress.update((n) => (n = ""));
      selectedPackage.update((n) => (n = "FREE"));
      showPopover = false;

      localStorage.removeItem("public_address");

      localStorage.removeItem("evm_token");
      disconnect($wallets$?.[0]);

      localStorage.removeItem("solana_token");
      $walletStore.disconnect();

      localStorage.removeItem("ton_token");
      if ($tonConnector.connected) {
        $tonConnector.disconnect();
      }

      localStorage.removeItem("sui_token");
      if (
        ($suiWalletInstance as WalletState) &&
        ($suiWalletInstance as WalletState).connected
      ) {
        ($suiWalletInstance as WalletState).disconnect();
      }

      localStorage.removeItem("auth_token");

      queryClient?.invalidateQueries(["list-address"]);
      queryClient?.invalidateQueries(["users-me"]);
      navigate("/", { replace: true });
      mixpanel.reset();
    } catch (error) {
      console.log(error);
    }
  };

  // handle EVM login
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
            publicAddress: address?.toLowerCase(),
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
      const res: any = await nimbus.post("/auth/evm", data);
      if (res?.data?.result) {
        triggerConnectWallet.update((n) => (n = false));
        localStorage.removeItem("auth_token");
        localStorage.setItem("evm_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        toastMsg = "Login with EVM successfully!";
        isSuccessToast = true;
        trigger();
        queryClient?.invalidateQueries(["users-me"]);
        queryClient?.invalidateQueries(["list-address"]);
      } else {
        toastMsg = res?.error;
        isSuccessToast = false;
        trigger();
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  // handle Solana login
  $: solanaPublicAddress = $walletStore?.publicKey?.toBase58();

  $: {
    if (solanaPublicAddress) {
      const solanaToken = localStorage.getItem("solana_token");
      if (!solanaToken) {
        triggerConnectWallet.update((n) => (n = false));
        if ($user && Object.keys($user).length === 0) {
          handleGetSolanaNonce(solanaPublicAddress);
        }
      }
    }
  }

  const handleSignSolanaAddressMessage = async (signatureString) => {
    if ($walletStore.connected) {
      const res = await $walletStore?.signMessage(
        Uint8Array.from(
          Array.from(`I am signing my one-time nonce: ${signatureString}`).map(
            (letter) => letter.charCodeAt(0)
          )
        )
      );
      if (res) {
        return bs58.encode(res);
      } else {
        return "";
      }
    }
  };

  const handleGetSolanaNonce = async (address) => {
    try {
      const res: any = await nimbus.post("/users/nonce", {
        publicAddress: address,
        referrer: invitation.length !== 0 ? invitation : undefined,
      });
      if (res && res.data) {
        const signatureString = await handleSignSolanaAddressMessage(
          res?.data?.nonce
        );
        if (signatureString) {
          const payload = {
            signature: signatureString,
            publicAddress: address,
          };
          handleGetSolanaToken(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetSolanaToken = async (data) => {
    try {
      const res: any = await nimbus.post("/auth/solana", data);
      if (res?.data?.result) {
        triggerConnectWallet.update((n) => (n = false));
        localStorage.removeItem("auth_token");
        localStorage.setItem("solana_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        toastMsg = "Login with Solana successfully!";
        isSuccessToast = true;
        trigger();
        queryClient?.invalidateQueries(["users-me"]);
        queryClient?.invalidateQueries(["list-address"]);
      } else {
        toastMsg = res?.error;
        isSuccessToast = false;
        trigger();
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  $: {
    if (syncMobileCode) {
      const qrcode = QRCode(0, "L");
      qrcode.addData(`https://app.getnimbus.io/?code=${syncMobileCode}`);
      qrcode.make();
      qrImageDataUrl = qrcode.createDataURL(7);
    }
  }

  $: {
    if ($triggerConnectWallet) {
      mixpanel.track("user_connect_wallet");
    }
  }
</script>

{#if $user && Object.keys($user).length !== 0}
  <div class="relative">
    <div
      class="xl:flex hidden flex-col gap-1 items-center py-1 relative xl:h-[50px] w-[50px]"
    >
      <div
        class="xl:w-[40px] xl:h-[40px] w-16 h-16 rounded-full overflow-hidden cursor-pointer mx-auto"
        on:click={() => (showPopover = !showPopover)}
      >
        <img src={$user?.picture} alt="" class="object-cover w-full h-full" />
      </div>
      {#if buyPackage !== "Free"}
        <div
          class="cursor-pointer flex items-center gap-1 absolute -bottom-1 left-1/2 transform -translate-x-1/2 z-10 rounded px-1 bg-[#ffb800]"
        >
          <div class="text-white text-xs">
            {#if buyPackage === "Explorer"}
              Explorer
            {/if}
            {#if buyPackage === "Professional"}
              Alpha
            {/if}
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="#fff"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.6629 3.5843C14.7217 3.57771 14.7811 3.58901 14.8339 3.61685C14.8867 3.64495 14.9305 3.68852 14.9599 3.74223C14.9893 3.79594 15.0031 3.85745 14.9994 3.91919L14.4836 12.7921H1.51642L1.00059 3.91919C0.996892 3.85745 1.01055 3.79592 1.0399 3.74216C1.06924 3.68841 1.11299 3.64476 1.16578 3.6166C1.21856 3.58843 1.27808 3.57697 1.33702 3.58362C1.39596 3.59026 1.45175 3.61473 1.49755 3.65401L4.60499 6.30708L7.76082 2.11502C7.79036 2.07895 7.82704 2.04999 7.86833 2.03014C7.90962 2.01028 7.95455 2 8.00001 2C8.04548 2 8.0904 2.01028 8.1317 2.03014C8.17299 2.04999 8.20967 2.07895 8.23921 2.11502L11.395 6.30708L14.5025 3.65401C14.5484 3.61511 14.6041 3.5909 14.6629 3.5843ZM1.55334 13.4273L1.55781 13.5041C1.577 13.827 1.71333 14.1301 1.93906 14.3518C2.1648 14.5735 2.46298 14.6971 2.77297 14.6976H13.2271C13.537 14.6971 13.8352 14.5735 14.061 14.3518C14.2867 14.1301 14.423 13.827 14.4422 13.5041L14.4467 13.4273H1.55334Z"
              fill="#fff"
            />
          </svg>
        </div>
      {/if}
    </div>

    <div class="xl:hidden block">
      <div
        class="text-2xl font-medium text-white"
        on:click={() => {
          handleSignOut();
          isShowHeaderMobile.update((n) => (n = false));
        }}
      >
        Log out
      </div>
    </div>

    {#if showPopover}
      <div
        class="select_content absolute top-15 right-0 z-50 flex flex-col gap-1 px-3 xl:py-2 py-3 text-sm transform rounded-lg w-max"
        style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15); z-index: 2147483647;"
        use:clickOutside
        on:click_outside={() => (showPopover = false)}
      >
        <div
          class="flex flex-col gap-3 mx-2 pt-1 pb-2 border-b-[1px] border_0000001a"
        >
          <div class="text-2xl xl:text-base">
            GM 👋, {displayName
              ? displayName
              : shorterAddress(
                  localStorage.getItem("public_address") || publicAddress
                )}
          </div>
          <DarkMode />
        </div>

        <div
          on:click={() => {
            showPopover = false;
          }}
        >
          <Link to="upgrade">
            <div
              class={`flex items-center gap-1 text-2xl font-medium text-yellow-400 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 ${
                $isDarkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
              }`}
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
          </Link>
        </div>

        <div on:click={() => (showPopover = false)}>
          <Link to={`profile?id=${$userId}`}>
            <div
              class={`text-2xl text_00000066 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 ${
                $isDarkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
              }`}
            >
              My Profile
            </div>
          </Link>
        </div>

        <div
          class={`hidden text-2xl text_00000066 cursor-pointer xl:block xl:text-base rounded-md transition-all px-2 py-1 ${
            $isDarkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
          }`}
          on:click={() => {
            isOpenModalSync = true;
            handleGetCodeSyncMobile();
            showPopover = false;
          }}
        >
          Sync session
        </div>

        <div on:click={() => (showPopover = false)}>
          <Link to="invitation">
            <div
              class={`text-2xl text_00000066 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 ${
                $isDarkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
              }`}
            >
              Invite
            </div>
          </Link>
        </div>

        <div on:click={() => (showPopover = false)}>
          <Link to="settings/?tab=accounts">
            <div
              class={`hidden text-2xl text_00000066 cursor-pointer xl:block xl:text-base rounded-md transition-all px-2 py-1 ${
                $isDarkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
              }`}
            >
              Settings
            </div>
          </Link>
        </div>

        <div
          class={`text-2xl font-medium text-red-500 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 ${
            $isDarkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
          }`}
          on:click={handleSignOut}
        >
          Log out
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div
    on:click={() => {
      triggerConnectWallet.update((n) => (n = true));
      mixpanel.track("user_connect_wallet");
      isShowHeaderMobile.update((n) => (n = false));
    }}
    class="button xl:text-base text-2xl font-semibold text-white cursor-pointer"
  >
    Connect Wallet
  </div>
{/if}

<WalletProvider localStorageKey="walletAdapter" {wallets} autoConnect />

<!-- Modal sync user to mobile -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModalSync}
  on:close={() => {
    isOpenModalSync = false;
    timeCountdown = 59;
    clearTimeout(timer);
    clearInterval(timerCountdown);
  }}
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1 items-start">
      <div class="xl:title-3 title-1 font-semibold">Sync session</div>
      <div class="xl:text-sm text-2xl text-gray-500">
        More convenience in managing your portfolio on mobile devices
      </div>
    </div>
    <div class="flex flex-col gap-1 justify-center items-center">
      <div class="text-sm">
        The code is expired in {timeCountdown}s
      </div>
      <div class="flex items-center gap-2">
        <div
          class="cursor-pointer"
          class:loading
          on:click={() => {
            syncMobileCode = undefined;
            timeCountdown = 59;
            clearTimeout(timer);
            clearInterval(timerCountdown);
            handleGetCodeSyncMobile();
          }}
        >
          <img
            src={$isDarkMode ? ReloadWhite : Reload}
            alt=""
            class="w-4 h-4 xl:w-3 xl:h-3"
          />
        </div>
        <div class="text-sm">Generate new code</div>
      </div>
    </div>
    <div class="flex justify-center items-center -mt-2">
      <div class="border rounded-xl overflow-hidden bg-white w-[57%]">
        <div class="bg-[#f3f4f6] py-2 px-4">
          <img src={Logo} alt="Logo" class="h-12 w-auto -ml-3" />
        </div>
        {#if loading}
          <div class="flex justify-center items-center h-60">
            <Loading />
          </div>
        {:else}
          <div class="flex justify-center">
            {#if qrImageDataUrl !== undefined}
              <img src={qrImageDataUrl} alt="QR Code" />
            {:else}
              <div class="flex flex-col items-center gap-1 text-sm py-30">
                <div>Something wrong when generate QR code.</div>
                <div
                  class="text-blue-500 cursor-pointer"
                  on:click={() => {
                    handleGetCodeSyncMobile();
                  }}
                >
                  Try again
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <div class="text-xs text-center font-medium text-[#9ca3af] px-4 pb-3">
          Investment in crypto more convenience with Nimbus
        </div>
      </div>
    </div>
    <div class="flex flex-col items-center mt-2 gap-4">
      <div class="w-[57%]">
        <CopyToClipboard
          text={syncMobileCode}
          let:copy
          on:copy={async () => {
            isCopied = true;
            await wait(1000);
            isCopied = false;
          }}
        >
          <div class="flex items-center gap-2">
            <div class="flex-1 border rounded-lg py-2 px-3 text-base">
              {#if loading}
                -
              {:else}
                {syncMobileCode}
              {/if}
            </div>
            <div
              class="cursor-pointer border w-max p-2 rounded-lg relative"
              on:click={copy}
              on:mouseover={() => {
                isShowTooltipCopy = true;
              }}
              on:mouseleave={() => (isShowTooltipCopy = false)}
            >
              {#if isCopied}
                <svg
                  width={21}
                  height={21}
                  id="Layer_1"
                  data-name="Layer 1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 122.88 74.46"
                  fill={$isDarkMode ? "#fff" : "#000"}
                  ><path
                    fill-rule="evenodd"
                    d="M1.87,47.2a6.33,6.33,0,1,1,8.92-9c8.88,8.85,17.53,17.66,26.53,26.45l-3.76,4.45-.35.37a6.33,6.33,0,0,1-8.95,0L1.87,47.2ZM30,43.55a6.33,6.33,0,1,1,8.82-9.07l25,24.38L111.64,2.29c5.37-6.35,15,1.84,9.66,8.18L69.07,72.22l-.3.33a6.33,6.33,0,0,1-8.95.12L30,43.55Zm28.76-4.21-.31.33-9.07-8.85L71.67,4.42c5.37-6.35,15,1.83,9.67,8.18L58.74,39.34Z"
                  /></svg
                >
              {:else}
                <svg
                  width={21}
                  height={21}
                  viewBox="0 0 12 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.1875 3.3125H10.6875V10.1875H3.8125V7.6875"
                    stroke={$isDarkMode ? "#fff" : "#000"}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8.1875 0.8125H1.3125V7.6875H8.1875V0.8125Z"
                    stroke={$isDarkMode ? "#fff" : "#000"}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {/if}
              {#if isShowTooltipCopy}
                <div
                  class="absolute left-1/2 transform -translate-x-1/2 -top-8"
                  style="z-index: 2147483648;"
                >
                  <Tooltip text="Copy code" />
                </div>
              {/if}
            </div>
          </div>
        </CopyToClipboard>
      </div>
    </div>
    <div class="flex flex-col items-center mt-2 gap-4">
      <div class="border-t-[1px] relative w-[57%]">
        <div
          class={`absolute xl:top-[-10px] top-[-14px] left-1/2 transform -translate-x-1/2 text-gray-400 text-xs px-2 ${
            $isDarkMode ? "bg-[#0f0f0f]" : "bg-white"
          }`}
        >
          Or open Telegram
        </div>
      </div>
      <div class="w-[57%]">
        <a
          href={`https://t.me/GetNimbusBot?start=${syncMobileCode}`}
          target="_blank"
        >
          <Button variant="primary">Sync to Telegram</Button>
        </a>
      </div>
    </div>
  </div>
</AppOverlay>

<!-- Modal connect wallet -->
<AppOverlay
  clickOutSideToClose
  isOpen={$triggerConnectWallet}
  on:close={() => {
    triggerConnectWallet.update((n) => (n = false));
  }}
>
  <div class="flex flex-col gap-4">
    <div class="xl:title-3 title-1 font-medium text-center">
      Connect wallet to enjoy more features
    </div>
    <div class="flex flex-col items-center justify-center gap-4">
      <div
        class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] min-w-[250px] ${
          $isDarkMode
            ? "border-white text-white"
            : "border-[#27326f] text-[#27326f]"
        }`}
        on:click={() => {
          connect();
          mixpanel.track("user_login_evm");
        }}
      >
        <img src={Evm} alt="" width="24" height="24" />
        <div class="font-semibold text-[15px]">Login with EVM</div>
      </div>
      <SolanaAuth text="Login with Solana" />
      <TonAuth />
      <SuiAuth />
      <GoogleAuth />
    </div>
  </div>
</AppOverlay>

{#if showToast}
  <div class="fixed top-3 right-3 w-full" style="z-index: 2147483648;">
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
  .button {
    animation: pulse 0.5s infinite alternate; /* Adjust the duration and other parameters as needed */
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }

    100% {
      transform: scale(1.1); /* Adjust the scaling factor as needed */
    }
  }

  :global(body) .select_content {
    background: #ffffff;
    border: 0.5px solid transparent;
  }
  :global(body.dark) .select_content {
    background: #131313;
    border: 0.5px solid #cdcdcd59;
  }

  .loading {
    animation-name: loading;
    animation-duration: 1.4s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  @keyframes loading {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

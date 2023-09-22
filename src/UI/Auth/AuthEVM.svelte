<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import dayjs from "dayjs";
  import { Link } from "svelte-navigator";
  import onboard from "~/lib/web3-onboard";
  import { ethers } from "ethers";
  import {
    wallet,
    chain,
    typeWallet,
    user,
    isDarkMode,
    isShowHeaderMobile,
  } from "~/store";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";
  import { shorterAddress, clickOutside } from "~/utils";
  import { useQueryClient } from "@tanstack/svelte-query";
  import QRCode from "qrcode-generator";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { wait } from "~/entries/background/utils";

  import DarkMode from "~/components/DarkMode.svelte";
  import AppOverlay from "~/components/Overlay.svelte";

  import User from "~/assets/user.png";
  import Logo from "~/assets/logo-1.svg";

  const wallets$ = onboard.state.select("wallets");

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
  let invitation = "";

  const queryClient = useQueryClient();

  let isOpenModalSync = false;
  let isCopied = false;
  let timer = null;
  let syncMobileCode = "";
  let qrImageDataUrl = "";

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationParams = urlParams.get("invitation");
    if (invitationParams) {
      invitation = invitationParams;
    }

    const evmToken = localStorage.getItem("evm_token");
    if (evmToken) {
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
    disconnect($wallets$?.[0]);
    queryClient.invalidateQueries(["list-address"]);
    queryClient.invalidateQueries(["users-me"]);
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
        localStorage.setItem("evm_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        queryClient.invalidateQueries(["list-address"]);
        queryClient.invalidateQueries(["users-me"]);
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetCodeSyncMobile = async () => {
    try {
      const res = await nimbus.get("/users/cross-login");
      if (res?.data) {
        syncMobileCode = res?.data?.code;
        const expiredAt = dayjs.unix(res?.data?.expiredAt);
        const currentTime = dayjs();

        // Check if the time difference is more than 1 minute
        if (currentTime.diff(expiredAt, "second") > 50) {
          // Make another API call to get a new sync code
          const newResponse = await nimbus.get("/users/cross-login");
          if (newResponse) {
            syncMobileCode = res?.data?.code;
          }
        } else {
          // Schedule the next check after 1 minute
          timer = setTimeout(handleGetCodeSyncMobile, 50000); // 60000 milliseconds = 1 minute
        }
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  onMount(() => {
    if (isOpenModalSync) {
      handleGetCodeSyncMobile();
    }
  });

  onDestroy(() => {
    clearTimeout(timer);
  });

  $: {
    if (syncMobileCode) {
      const qrcode = QRCode(0, "L");
      qrcode.addData(`https://beta.getnimbus.io/?code=${syncMobileCode}`);
      qrcode.make();
      qrImageDataUrl = qrcode.createDataURL(7);
    }
  }
</script>

{#if Object.keys(userInfo).length !== 0}
  <div class="relative">
    <div
      class="xl:block hidden xl:w-[40px] xl:h-[40px] w-16 h-16 rounded-full overflow-hidden cursor-pointer"
      on:click={() => (showPopover = !showPopover)}
    >
      <img src={userInfo?.picture} alt="" class="object-cover w-full h-full" />
    </div>

    <div class="xl:hidden flex items-center gap-5">
      <div
        class="xl:w-[40px] xl:h-[40px] w-16 h-16 rounded-full overflow-hidden"
      >
        <img
          src={userInfo?.picture}
          alt=""
          class="object-cover w-full h-full"
        />
      </div>
      <div
        class="text-3xl font-medium text-white"
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
        class="select_content absolute right-0 z-50 flex flex-col gap-1 px-3 xl:py-2 py-3 text-sm transform rounded-lg xl:top-12 top-20 w-max"
        style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
        use:clickOutside
        on:click_outside={() => (showPopover = false)}
      >
        <div
          class="flex flex-col gap-3 mx-2 pt-1 pb-2 border-b-[1px] border_0000001a"
        >
          <div class="text-2xl xl:text-base">
            GM 👋, {shorterAddress(localStorage.getItem("evm_address") || "")}
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
                darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
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

        <div
          class={`hidden text-2xl text_00000066 cursor-pointer xl:block xl:text-base rounded-md transition-all px-2 py-1 ${
            darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
          }`}
          on:click={() => {
            isOpenModalSync = true;
            handleGetCodeSyncMobile();
            showPopover = false;
          }}
        >
          Sync to mobile
        </div>

        <div on:click={() => (showPopover = false)}>
          <Link to="invitation">
            <div
              class={`text-2xl text_00000066 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 ${
                darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
              }`}
            >
              Invite
            </div>
          </Link>
        </div>

        <div on:click={() => (showPopover = false)}>
          <Link to="options/?tab=wallets">
            <div
              class={`hidden text-2xl text_00000066 cursor-pointer xl:block xl:text-base rounded-md transition-all px-2 py-1 ${
                darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
              }`}
            >
              Settings
            </div>
          </Link>
        </div>

        <div
          class={`text-2xl font-medium text-red-500 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 ${
            darkMode ? "hover:bg-[#222222]" : "hover:bg-[#eff0f4]"
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
      connect();
      mixpanel.track("user_connect_wallet");
      isShowHeaderMobile.update((n) => (n = false));
    }}
    class="text-3xl font-semibold text-white cursor-pointer xl:text-base"
  >
    Connect Wallet
  </div>
{/if}

<!-- Modal sync user to mobile -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModalSync}
  on:close={() => {
    isOpenModalSync = false;
    clearTimeout(timer);
  }}
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1 items-start">
      <div class="xl:title-3 title-1 font-semibold">Sync session to mobile</div>
      <div class="xl:text-sm text-2xl text-gray-500">
        More convenience in managing your portfolio on mobile devices
      </div>
    </div>
    <div class="flex justify-center items-center">
      <div class="border rounded-xl overflow-hidden bg-white w-[57%]">
        <div class="bg-[#f3f4f6] py-2 px-4">
          <img src={Logo} alt="Logo" class="h-12 w-auto -ml-3" />
        </div>
        <div class="flex justify-center">
          <img src={qrImageDataUrl} alt="QR Code" />
        </div>
        <div class="text-xs text-center font-medium text-[#9ca3af] px-4 pb-3">
          Investment in crypto more convenience with Nimbus
        </div>
      </div>
    </div>
    <div class="flex flex-col items-center mt-2 gap-4">
      <div class="border-t-[1px] relative w-[57%]">
        <div
          class={`absolute xl:top-[-10px] top-[-14px] left-1/2 transform -translate-x-1/2 text-gray-400 text-xs px-2 ${
            darkMode ? "bg-[#0f0f0f]" : "bg-white"
          }`}
        >
          Or enter the code manually
        </div>
      </div>
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
              {syncMobileCode}
            </div>
            <div
              class="cursor-pointer border w-max p-2 rounded-lg"
              on:click={copy}
            >
              {#if isCopied}
                <svg
                  width={21}
                  height={21}
                  id="Layer_1"
                  data-name="Layer 1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 122.88 74.46"
                  fill={darkMode ? "#fff" : "#000"}
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
                    stroke={darkMode ? "#fff" : "#000"}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8.1875 0.8125H1.3125V7.6875H8.1875V0.8125Z"
                    stroke={darkMode ? "#fff" : "#000"}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {/if}
            </div>
          </div>
        </CopyToClipboard>
      </div>
    </div>
  </div>
</AppOverlay>

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

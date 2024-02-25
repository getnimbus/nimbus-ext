<script lang="ts">
  import { useQueryClient } from "@tanstack/svelte-query";
  import { GoogleAuthProvider } from "firebase/auth";
  import mixpanel from "mixpanel-browser";
  import {
    SuiConnector,
    WidgetConfig,
    WalletState,
  } from "nimbus-sui-connector";
  import { isDarkMode, user } from "~/store";

  import User from "~/assets/user.png";
  import Google from "~/assets/google.png";
  import ReactAdapter from "../SwapWidget/ReactAdapter.svelte";
  import { P } from "flowbite-svelte";
  import { nimbus } from "~/lib/network";
  import { onMount } from "svelte";

  export let handleCloseAuthModal = () => {};
  let walletInstance: WalletState;
  let invitation = "";
  const queryClient = useQueryClient();

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationParams = urlParams.get("invitation");
    if (invitationParams) {
      invitation = invitationParams;
    }
  });

  const handleSUIAuth = async () => {
    mixpanel.track("user_login_sui");
    try {
      console.log({ walletInstance });
      if (walletInstance) {
        // walletInstance;
        walletInstance.toggleSelect();
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const onConnectSuccess = () => {
    console.log("Success connect", walletInstance);
    if (walletInstance) {
      walletInstance.toggleSelect(); // Close the list
      handleGetNonce(walletInstance?.account.address);
    } else {
      // Work around to try again
      setTimeout(() => {
        onConnectSuccess();
      }, 500);
    }
  };

  const widgetConfig = {
    walletFn: (wallet) => {
      walletInstance = wallet;
    },
    onConnectSuccess,
    onConnectError: console.error,
  };

  const handleGetSUIToken = async (data) => {
    try {
      const res = await nimbus.post("/auth/sui", data);
      console.log(res);
      if (res?.data?.result) {
        handleCloseAuthModal();
        localStorage.setItem("evm_token", res?.data?.result); // TODO: For compatible, check if we need to set it to sui_token
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        queryClient.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetNonce = async (address: string) => {
    try {
      const res = await nimbus.post("/users/nonce", {
        publicAddress: address,
        referrer: invitation.length !== 0 ? invitation : undefined,
      });
      if (res && res.data) {
        const signature = await handleSignAddressMessage(
          res.data.nonce as string
        );
        if (signature) {
          const payload = {
            signature: signature.signature,
            bytes: signature.bytes,
            publicAddress: address?.toLowerCase(),
          };
          handleGetSUIToken(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleSignAddressMessage = async (nonce: string) => {
    const msg = await walletInstance.signPersonalMessage({
      message: new TextEncoder().encode(
        `I am signing my one-time nonce: ${nonce}`
      ),
    });

    return msg;
  };

  // $: {
  //   console.log("connectred", walletInstance?.account.address);
  //   if (walletInstance?.account.address) {
  //     handleGetNonce(walletInstance?.account.address);
  //   }
  // }

  $: console.log(widgetConfig);
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] min-w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleSUIAuth}
>
  <img src={Google} alt="" width="22" height="22" />
  <div class="font-semibold text-[15px]">Login with SUI</div>
  <ReactAdapter
    element={SuiConnector}
    config={widgetConfig}
    integrator="svelte-example"
  />
</div>

<style>
</style>

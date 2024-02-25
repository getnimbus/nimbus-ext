<script lang="ts">
  import { onMount } from "svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";
  import { SuiConnector, WalletState } from "nimbus-sui-connector";
  import { isDarkMode, user, suiWalletInstance } from "~/store";
  import { nimbus } from "~/lib/network";

  import ReactAdapter from "~/components/ReactAdapter.svelte";

  import User from "~/assets/user.png";
  import SUI from "~/assets/chains/sui.svg";

  export let handleCloseAuthModal = () => {};

  const queryClient = useQueryClient();
  const chains = [
    {
      id: "sui:mainnet",
      name: "Mainnet",
      rpcUrl: "https://fullnode.mainnet.sui.io",
    },
  ];

  const onConnectSuccess = (msg) => {
    console.log("Success connect: ", msg);
    if ($suiWalletInstance) {
      ($suiWalletInstance as WalletState).toggleSelect();
    }
  };

  const onConnectError = (msg) => {
    console.error("Error connect", msg);
    if ($suiWalletInstance) {
      ($suiWalletInstance as WalletState).toggleSelect();
    }
  };

  const widgetConfig = {
    walletFn: (wallet) => {
      suiWalletInstance.update((n) => (n = wallet));
    },
    onConnectSuccess,
    onConnectError,
  };

  let invitation = "";

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
      if ($suiWalletInstance) {
        ($suiWalletInstance as WalletState).toggleSelect();
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  $: {
    if (
      ($suiWalletInstance as WalletState) &&
      ($suiWalletInstance as WalletState).connected
    ) {
      handleGetNonce(($suiWalletInstance as WalletState)?.account?.address);
    }
  }

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
    const msg = await ($suiWalletInstance as WalletState).signPersonalMessage({
      message: new TextEncoder().encode(
        `I am signing my one-time nonce: ${nonce}`
      ),
    });
    return msg;
  };

  const handleGetSUIToken = async (data) => {
    try {
      const res = await nimbus.post("/auth/sui", data);
      if (res?.data?.result) {
        handleCloseAuthModal();
        localStorage.removeItem("auth_token");
        localStorage.setItem("sui_token", res?.data?.result);
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
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] min-w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleSUIAuth}
>
  <img src={SUI} class="h-[24px] w-auto" />
  <div class="font-semibold text-[15px]">Login with Sui</div>
</div>

<ReactAdapter
  element={SuiConnector}
  config={widgetConfig}
  autoConnect={false}
  {chains}
  integrator="svelte-example"
/>

<style>
</style>

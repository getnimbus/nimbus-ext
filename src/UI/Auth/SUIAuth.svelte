<script lang="ts">
  import { onMount } from "svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";
  import type { WalletState } from "nimbus-sui-kit";
  import {
    isDarkMode,
    user,
    suiWalletInstance,
    triggerConnectWallet,
  } from "~/store";
  import { nimbus } from "~/lib/network";
  import { triggerToast } from "~/utils/functions";

  import User from "~/assets/user.png";
  import SUI from "~/assets/chains/sui.png";

  const queryClient = useQueryClient();

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
      ($suiWalletInstance as WalletState).toggleSelect();
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
      const res: any = await nimbus.post("/users/nonce", {
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
            publicAddress: address?.toLowerCase(),
          };
          handleGetSUIToken(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
      if (
        ($suiWalletInstance as WalletState) &&
        ($suiWalletInstance as WalletState).connected
      ) {
        ($suiWalletInstance as WalletState).disconnect();
      }
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
      const res: any = await nimbus.post("/auth/sui", data);
      if (res?.data?.result) {
        triggerConnectWallet.update((n) => (n = false));
        localStorage.removeItem("auth_token");
        localStorage.setItem("sui_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );

        triggerToast("Login with Sui successfully!", "success");
        queryClient.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
      } else {
        triggerToast(res?.error, "fail");
      }
    } catch (e) {
      console.error("error: ", e);
      triggerToast(
        "There are some problem when login Sui account. Please try again!",
        "fail"
      );
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-3 text-white border cursor-pointer rounded-[12px] w-[219px] h-[42px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleSUIAuth}
>
  <img src={SUI} class="h-[24px] w-[24px]" />
  <div class="font-normal text-[15px]">Log in with Sui</div>
</div>

<style windi:preflights:global windi:safelist:global></style>

<script lang="ts">
  import { onMount } from "svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";
  import {
    isDarkMode,
    user,
    triggerConnectWallet,
    tonConnector,
  } from "~/store";
  import { nimbus } from "~/lib/network";
  import { v4 as uuidv4 } from "uuid";
  import { triggerToast } from "~/utils";

  import User from "~/assets/user.png";
  import Ton from "~/assets/chains/ton.png";

  const queryClient = useQueryClient();

  let invitation = "";

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationParams = urlParams.get("invitation");
    if (invitationParams) {
      invitation = invitationParams;
    }
  });

  const handleTonAuth = async () => {
    mixpanel.track("user_login_ton");
    const uuid = uuidv4();
    if ($tonConnector.connected) {
      $tonConnector.disconnect();
    }
    handleGetNonce(uuid);
  };

  const handleGetNonce = async (id: string) => {
    try {
      const res: any = await nimbus.post("/users/nonce", {
        publicAddress: id,
        referrer: invitation.length !== 0 ? invitation : undefined,
      });
      if (res && res.data) {
        const msg = `I am signing my one-time nonce: ${res.data.nonce}`;

        $tonConnector.setConnectRequestParameters({
          state: "ready",
          value: { tonProof: msg },
        });

        $tonConnector.openModal();

        $tonConnector.onStatusChange((wallet) => {
          if (
            wallet &&
            wallet.connectItems?.tonProof &&
            "proof" in wallet.connectItems.tonProof
          ) {
            handleGetTonToken(wallet, id);
          }
        });
      }
    } catch (e) {
      console.error("error: ", e);
      if ($tonConnector.connected) {
        $tonConnector.disconnect();
      }
    }
  };

  const handleGetTonToken = async (data, id) => {
    try {
      const formatData = {
        account: {
          address: data?.account?.address,
          chain: data?.account?.chain,
          walletStateInit: data?.account?.walletStateInit,
        },
        connectItems: {
          tonProof: {
            name: data?.connectItems?.tonProof?.name,
            proof: {
              timestamp: data?.connectItems?.tonProof?.proof?.timestamp,
              domain: {
                lengthBytes:
                  data?.connectItems?.tonProof?.proof?.domain?.lengthBytes,
                value: data?.connectItems?.tonProof?.proof?.domain?.value,
              },
              signature: data?.connectItems?.tonProof?.proof?.signature,
            },
          },
        },
      };
      const res: any = await nimbus.post(`/auth/ton?loginId=${id}`, {
        walletInfo: formatData,
      });
      if (res?.data?.result) {
        triggerConnectWallet.update((n) => (n = false));
        localStorage.removeItem("auth_token");
        localStorage.setItem("ton_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );

        triggerToast("Login with Ton successfully!", "success");
        queryClient.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
      } else {
        triggerToast(res?.error, "fail");
      }
    } catch (e) {
      console.error("error: ", e);
      triggerToast(
        "There are some problem when login TON account. Please try again!",
        "fail"
      );
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-3 text-white border cursor-pointer rounded-[12px] w-[219px] h-[42px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  style="padding: 9px 21px 11px;"
  on:click={handleTonAuth}
>
  <img src={Ton} class="h-[22px] w-[24px]" />
  <div class="font-normal text-[15px]">Log in with Ton</div>
</div>

<style windi:preflights:global windi:safelist:global></style>

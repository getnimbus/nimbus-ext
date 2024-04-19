<script lang="ts">
  import { isDarkMode, user, tonConnector } from "~/store";
  import { nimbus } from "~/lib/network";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { v4 as uuidv4 } from "uuid";

  import User from "~/assets/user.png";
  import Ton from "~/assets/chains/ton.png";

  export let data;
  export let reCallAPI = () => {};

  const queryClient = useQueryClient();

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

  const handleTonAuth = async () => {
    const uuid = uuidv4();
    if ($tonConnector.connected) {
      $tonConnector.disconnect();
    }
    handleGetNonce(uuid);
  };

  const handleGetNonce = async (id: string) => {
    try {
      const msg = `I am signing my one-time nonce: ${Math.floor(Math.random() * 10000)}`;

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
          handleUpdatePublicAddress(wallet, id);
        }
      });
    } catch (e) {
      console.error("error: ", e);
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
      const res = await nimbus.post(`/auth/ton?loginId=${id}`, {
        walletInfo: formatData,
      });
      if (res?.data?.result) {
        localStorage.setItem("ton_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        queryClient?.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
        queryClient.invalidateQueries(["list-bundle"]);
        queryClient.invalidateQueries(["link-socials"]);
        reCallAPI();
        toastMsg = "Link your wallet successfully!";
        isSuccessToast = false;
        trigger();
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleUpdatePublicAddress = async (payload, id) => {
    try {
      let params: any = {
        kind: "wallet",
        type: null,
        userPublicAddress: payload?.account?.address,
        id: data?.uid,
        info: data?.info,
        displayName: data?.name,
      };
      const res = await nimbus.post("/accounts/link", params);
      if (res && res?.error) {
        toastMsg = res?.error;
        isSuccessToast = false;
        trigger();
        return;
      } else {
        toastMsg = "Your are successfully connect your Ton wallet!";
        isSuccessToast = false;
        trigger();
      }
      // localStorage.removeItem("auth_token");
      // handleGetTonToken(payload, id);
      queryClient?.invalidateQueries(["users-me"]);
      queryClient.invalidateQueries(["list-address"]);
      queryClient.invalidateQueries(["list-bundle"]);
      queryClient.invalidateQueries(["link-socials"]);
      reCallAPI();
      toastMsg = "Link your wallet successfully!";
      isSuccessToast = false;
      trigger();
    } catch (e) {
      console.log(e);
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleTonAuth}
>
  <img src={Ton} class="h-[24px] w-auto" />
  <div class="font-semibold text-[15px]">Login with Ton</div>
</div>

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
</style>

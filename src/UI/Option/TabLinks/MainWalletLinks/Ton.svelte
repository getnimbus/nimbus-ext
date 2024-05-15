<script lang="ts">
  import { isDarkMode, tonConnector, userPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { v4 as uuidv4 } from "uuid";

  import Ton from "~/assets/chains/ton.png";

  export let data;
  export let isPrimaryLogin;

  const queryClient = useQueryClient();

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 5;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 5;
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
      const res: any = await nimbus.post("/users/nonce?verified=true", {
        publicAddress: id,
        referrer: undefined,
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
            handleUpdatePublicAddress(wallet, id);
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

  const handleUpdatePublicAddress = async (payload, id) => {
    try {
      const formatData = {
        account: {
          address: payload?.account?.address,
          chain: payload?.account?.chain,
          walletStateInit: payload?.account?.walletStateInit,
        },
        connectItems: {
          tonProof: {
            name: payload?.connectItems?.tonProof?.name,
            proof: {
              timestamp: payload?.connectItems?.tonProof?.proof?.timestamp,
              domain: {
                lengthBytes:
                  payload?.connectItems?.tonProof?.proof?.domain?.lengthBytes,
                value: payload?.connectItems?.tonProof?.proof?.domain?.value,
              },
              signature: payload?.connectItems?.tonProof?.proof?.signature,
            },
          },
        },
      };

      const params: any = {
        id: isPrimaryLogin ? data?.uid : $userPublicAddress,
        kind: "wallet",
        type: null,
        userPublicAddress: formatData?.account?.address,
        signature: formatData?.connectItems?.tonProof?.proof?.signature,
      };
      const res: any = await nimbus.post(
        `/accounts/link?loginId=${id}`,
        params
      );
      if (res && res?.error) {
        toastMsg = res?.error;
        isSuccessToast = false;
        trigger();
        return;
      }

      queryClient.invalidateQueries(["link-socials"]);
      toastMsg = "Your are successfully connect your Ton wallet!";
      isSuccessToast = false;
      trigger();
    } catch (e) {
      console.log(e);
      toastMsg =
        "Something wrong when connect your Ton wallet. Please try again!";
      isSuccessToast = true;
      trigger();
    } finally {
      if ($tonConnector.connected) {
        $tonConnector.disconnect();
      }
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] md:w-[310px] w-full ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleTonAuth}
>
  <img src={Ton} class="h-[24px] w-auto" />
  <div class="font-semibold text-[15px]">Connect Ton Wallet</div>
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

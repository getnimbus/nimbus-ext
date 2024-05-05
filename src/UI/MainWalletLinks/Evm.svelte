<script lang="ts">
  import onboard from "~/lib/web3-onboard";
  import { ethers } from "ethers";
  import { isDarkMode, userPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import Evm from "~/assets/chains/evm.png";

  export let data;
  export let isPrimaryLogin;

  const queryClient = useQueryClient();
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

  const disconnect = (value: any) => {
    if (value && Object.keys(value).length !== 0) {
      onboard.disconnectWallet({ label: value.label });
    }
  };

  // handle evm login
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
      const res: any = await nimbus.post("/users/nonce?verified=true", {
        publicAddress: address,
        referrer: undefined,
      });
      if (res && res.data) {
        const signatureString = await handleSignAddressMessage(
          provider,
          res?.data?.nonce
        );
        if (signatureString) {
          const payload = {
            signature: signatureString,
            publicAddress: address?.toLowerCase(),
          };
          handleUpdatePublicAddress(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
      disconnect($wallets$?.[0]);
    }
  };

  const handleUpdatePublicAddress = async (payload) => {
    try {
      const params: any = {
        id: isPrimaryLogin ? data?.uid : $userPublicAddress,
        kind: "wallet",
        type: null,
        userPublicAddress: payload?.publicAddress,
        signature: payload?.signature,
      };
      const res = await nimbus.post("/accounts/link", params);
      if (res && res?.error) {
        toastMsg = res?.error;
        isSuccessToast = false;
        trigger();
        return;
      }

      queryClient.invalidateQueries(["link-socials"]);
      toastMsg = "Your are successfully connect your Evm wallet!";
      isSuccessToast = true;
      trigger();
    } catch (e) {
      console.log(e);
      toastMsg =
        "Something wrong when connect your Evm wallet. Please try again!";
      isSuccessToast = true;
      trigger();
    } finally {
      disconnect($wallets$?.[0]);
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={connect}
>
  <img src={Evm} alt="" width="24" height="24" />
  <div class="font-semibold text-[15px]">Connect EVM</div>
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
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>

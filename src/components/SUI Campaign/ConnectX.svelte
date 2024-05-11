<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { TwitterAuthProvider, signInWithPopup } from "firebase/auth";
  import { auth } from "~/lib/firebase";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { useQueryClient } from "@tanstack/svelte-query";
  import {
    selectedPackage,
    typeWallet,
    user,
    userPublicAddress,
    chain,
    wallet,
    tonConnector,
    suiWalletInstance,
  } from "~/store";
  import { walletStore } from "@aztemi/svelte-on-solana-wallet-adapter-core";
  import onboard from "~/lib/web3-onboard";
  import type { WalletState } from "nimbus-sui-kit";

  import Button from "~/components/Button.svelte";

  import User from "~/assets/user.png";

  const queryClient = useQueryClient();
  const twitterProvider = new TwitterAuthProvider();

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

  const handleTwitterAuth = async () => {
    try {
      const res: any = await signInWithPopup(auth, twitterProvider).then(
        (result) => result.user
      );
      if (res) {
        if ($user && Object.keys($user).length === 0) {
          handleGetTwitterToken(
            res.uid,
            "twitter",
            res?.reloadUserInfo?.screenName,
            res?.reloadUserInfo?.screenName
          );
          return;
        }

        handleAddTwitter(
          res,
          res.uid,
          res?.reloadUserInfo?.providerUserInfo[0]?.email,
          res?.reloadUserInfo?.screenName
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddTwitter = async (res, id, info, displayName) => {
    try {
      const params: any = {
        kind: "social",
        id,
        type: "twitter",
        info,
        displayName,
        userPublicAddress: $userPublicAddress,
      };

      const response: any = await nimbus.post("/accounts/link", params);
      if (response && response?.error) {
        handleSignOut();

        handleGetTwitterToken(
          res.uid,
          "twitter",
          res?.reloadUserInfo?.providerUserInfo[0]?.email,
          res?.reloadUserInfo?.screenName
        );
      } else {
        queryClient?.invalidateQueries(["link-socials"]);

        toastMsg = "Successfully connect X account!";
        isSuccessToast = true;
        trigger();
      }
    } catch (e) {
      console.log(e);
      toastMsg =
        "There are some problem when connect X account. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };

  const handleGetTwitterToken = async (uid, type, info, displayName) => {
    try {
      const res: any = await nimbus.post("/auth", {
        uid,
        type,
        info,
        displayName: displayName ? displayName : info,
      });
      if (res?.data?.result) {
        localStorage.setItem("auth_token", res?.data?.result);
        localStorage.setItem("socialAuthType", "twitter");
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        toastMsg = "Login with Twitter successfully!";
        isSuccessToast = true;
        trigger();
        queryClient?.invalidateQueries(["users-me"]);
        queryClient?.invalidateQueries(["list-address"]);
        queryClient?.invalidateQueries(["link-socials"]);
        window.history.replaceState(null, "", window.location.pathname + `/`);
      } else {
        toastMsg = res?.error;
        isSuccessToast = false;
        trigger();
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const wallets$ = onboard.state.select("wallets");

  const disconnect = (value: any) => {
    if (value && Object.keys(value).length !== 0) {
      onboard.disconnectWallet({ label: value.label });
    }
  };

  const handleSignOut = () => {
    try {
      user.update((n) => (n = {}));
      wallet.update((n) => (n = ""));
      chain.update((n) => (n = ""));
      typeWallet.update((n) => (n = ""));
      userPublicAddress.update((n) => (n = ""));
      selectedPackage.update((n) => (n = "FREE"));

      localStorage.removeItem("public_address");

      localStorage.removeItem("auth_token");

      localStorage.removeItem("evm_token");
      disconnect($wallets$?.[0]);

      localStorage.removeItem("solana_token");
      $walletStore.disconnect();

      localStorage.removeItem("ton_token");
      if ($tonConnector && $tonConnector?.connected) {
        $tonConnector.disconnect();
      }
      tonConnector.update((n) => (n = null));

      localStorage.removeItem("sui_token");
      if (
        ($suiWalletInstance as WalletState) &&
        ($suiWalletInstance as WalletState)?.connected
      ) {
        ($suiWalletInstance as WalletState).disconnect();
      }
      suiWalletInstance.update((n) => (n = null));

      queryClient?.invalidateQueries(["list-address"]);
      queryClient?.invalidateQueries(["users-me"]);
    } catch (error) {
      console.log(error);
    }
  };
</script>

<div class="w-max">
  <Button variant="tertiary" on:click={handleTwitterAuth} className="py-3 px-6">
    <div class="font-semibold text-base flex items-center gap-2">
      Connect with <img
        alt="link X"
        loading="lazy"
        decoding="async"
        data-nimg="1"
        style="color:transparent"
        src="https://getnimbus.io/logoSocialMedia/twitterX1.svg"
        class="w-[26px] h-[26px]"
      />
    </div>
  </Button>
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

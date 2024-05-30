<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { TwitterAuthProvider, signInWithPopup } from "firebase/auth";
  import { auth } from "~/lib/firebase";
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
  import { triggerToast } from "~/utils/functions";

  import Button from "~/components/Button.svelte";

  import User from "~/assets/user.png";

  const queryClient = useQueryClient();
  const twitterProvider = new TwitterAuthProvider();

  const handleTwitterAuth = async () => {
    try {
      const res: any = await signInWithPopup(auth, twitterProvider).then(
        (result) => result.user
      );
      if (res) {
        if ($user && Object.keys($user).length === 0) {
          handleGetTwitterToken(
            res.uid,
            res?.reloadUserInfo?.providerUserInfo[0]?.rawId,
            "twitter",
            res?.reloadUserInfo?.screenName,
            res?.reloadUserInfo?.screenName
          );
          return;
        }

        handleAddTwitter(
          res,
          res.uid,
          res?.reloadUserInfo?.providerUserInfo[0]?.rawId,
          res?.reloadUserInfo?.screenName,
          res?.reloadUserInfo?.screenName
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddTwitter = async (res, id, externalId, info, displayName) => {
    try {
      handleSignOut();

      handleGetTwitterToken(
        res.uid,
        res?.reloadUserInfo?.providerUserInfo[0]?.rawId,
        "twitter",
        res?.reloadUserInfo?.screenName,
        res?.reloadUserInfo?.screenName
      );

      // const params: any = {
      //   kind: "social",
      //   id,
      //   externalId,
      //   type: "twitter",
      //   info,
      //   displayName,
      //   userPublicAddress: $userPublicAddress,
      // };

      // const response: any = await nimbus.post("/accounts/link", params);
      // if (response && response?.error) {
      //   triggerToast(
      //     response?.error ||
      //       "There are some problem when connect X account. Please try again!",
      //     "fail"
      //   );
      // } else {
      //   handleSignOut();

      //   handleGetTwitterToken(
      //     res.uid,
      //     res?.reloadUserInfo?.providerUserInfo[0]?.rawId,
      //     "twitter",
      //     res?.reloadUserInfo?.screenName,
      //     res?.reloadUserInfo?.screenName
      //   );
      // }
    } catch (e) {
      console.log(e);
      triggerToast(
        "There are some problem when connect X account. Please try again!",
        "fail"
      );
    }
  };

  const handleGetTwitterToken = async (
    uid,
    externalId,
    type,
    info,
    displayName
  ) => {
    try {
      const res: any = await nimbus.post("/auth", {
        uid,
        externalId,
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

        triggerToast("Login with Twitter successfully!", "success");

        queryClient?.invalidateQueries(["users-me"]);
        queryClient?.invalidateQueries(["list-address"]);
        queryClient?.invalidateQueries(["link-socials"]);
        window.history.replaceState(null, "", window.location.pathname + `/`);
      } else {
        triggerToast(
          res?.error ||
            "There are some problem when connect X account. Please try again!",
          "fail"
        );
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

<style windi:preflights:global windi:safelist:global>
</style>

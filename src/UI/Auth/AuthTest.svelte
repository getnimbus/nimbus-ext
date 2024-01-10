<script lang="ts">
  import { onMount } from "svelte";
  import jwt_decode from "jwt-decode";
  import bs58 from "bs58";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { user } from "~/store";
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import { handleGetAccessToken } from "~/utils";
  import { useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";

  import AppOverlay from "~/components/Overlay.svelte";
  import GoogleAuth from "~/UI/Auth/GoogleAuth.svelte";
  import SolanaAuth from "~/UI/Auth/SolanaAuth.svelte";

  import User from "~/assets/user.png";

  const MultipleLang = {
    modal_login_title: i18n(
      "newtabPage.modal-login-title",
      "Login to enjoy more features"
    ),
  };

  const signatureString = "Hello Nimbus";
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  const queryClient = useQueryClient();

  let isOpenAuthModal = false;
  let signMessageAddress = "";
  let showPopover = false;
  let addressWallet = "";

  onMount(() => {
    const token = localStorage.getItem("token");
    const solanaToken = localStorage.getItem("solana_token");
    if (token || solanaToken) {
      if (token) {
        const { access_token, id_token } = JSON.parse(token);
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
          .then((response) => {
            if (response.ok) {
              // User is authenticated and access token is still valid
              user.update((n) => (n = jwt_decode(id_token)));
            } else {
              // Access token is invalid or expired, prompt user to sign in again
              user.update((n) => (n = {}));
              showPopover = false;
              localStorage.removeItem("token");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      if (solanaToken) {
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
      }
    } else {
      user.update((n) => (n = {}));
      showPopover = false;
      localStorage.removeItem("token");
      localStorage.removeItem("solana_address");
      localStorage.removeItem("solana_token");
      addressWallet = "";
      signMessageAddress = "";
      $walletStore.disconnect();
    }
  });

  const handleGetGoogleUserInfo = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && APP_TYPE.TYPE !== "EXT") {
      const userData = await handleGetAccessToken(code);
      user.update((n) => (n = userData));
    }
  };

  const handleSignOut = () => {
    try {
      user.update((n) => (n = {}));
      showPopover = false;
      localStorage.removeItem("token");
      localStorage.removeItem("solana_address");
      localStorage.removeItem("solana_token");
      addressWallet = "";
      signMessageAddress = "";
      $walletStore.disconnect();
      queryClient.invalidateQueries(["list-address"]);
      queryClient.invalidateQueries(["users-me"]);
      mixpanel.reset();
    } catch (error) {
      console.log(error);
    }
  };

  $: {
    handleGetGoogleUserInfo();
  }

  const handleSignAddressMessage = async () => {
    if ($walletStore.connected) {
      const res = await $walletStore?.signMessage(
        Uint8Array.from(
          Array.from(signatureString).map((letter) => letter.charCodeAt(0))
        )
      );
      signMessageAddress = bs58.encode(res);
    }
  };

  const handleGetSolanaToken = async (data) => {
    const res = await nimbus
      .post("/auth/solana", data)
      .then((response) => response);
    if (res.data.result) {
      localStorage.setItem("solana_token", res.data.result);
      user.update(
        (n) =>
          (n = {
            picture: User,
          })
      );
    }
  };

  $: addressWallet = $walletStore?.publicKey?.toBase58();

  $: {
    if (addressWallet) {
      const solanaToken = localStorage.getItem("solana_token");
      if (!solanaToken) {
        handleSignAddressMessage();
      }
    }
  }

  $: {
    if (addressWallet && signMessageAddress) {
      const solanaLoginPayload = {
        message: signatureString,
        addressWallet,
        signMessageAddress,
      };
      localStorage.setItem("solana_address", addressWallet);
      handleGetSolanaToken(solanaLoginPayload);
    }
  }

  $: {
    if ($user && Object.keys($user).length !== 0) {
      isOpenAuthModal = false;
    }
  }
</script>

{#if $user && Object.keys($user).length !== 0}
  <div class="relative">
    <div
      class="w-[40px] h-[40px] rounded-full overflow-hidden cursor-pointer"
      on:click={() => (showPopover = !showPopover)}
    >
      <img src={$user.picture} alt="" class="object-cover w-full h-full" />
    </div>
    {#if showPopover}
      <div
        class="bg-white py-2 px-3 text-sm rounded-lg absolute -bottom-17 left-1/2 transform -translate-x-1/2 flex flex-col gap-1 w-[80px] z-50"
        style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
      >
        <a
          class="text-gray-500 cursor-pointer"
          href="/entries/options/index.html?tab=nft"
          target="_blank"
          on:click={() => {
            showPopover = false;
          }}
        >
          My NFT
        </a>
        <div
          class="font-medium text-red-500 cursor-pointer"
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
      isOpenAuthModal = true;
    }}
    class="text-sm font-semibold text-white cursor-pointer xl:text-base"
  >
    Connect Wallet
  </div>
{/if}

<WalletProvider localStorageKey="walletAdapter" {wallets} autoConnect />

<AppOverlay
  clickOutSideToClose
  isOpen={isOpenAuthModal}
  on:close={() => (isOpenAuthModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="xl:title-3 title-1 font-medium">
      Connect wallet to enjoy more features
    </div>
    <div class="flex flex-col items-center justify-center xl:gap-2 gap-4">
      <SolanaAuth text="Login with Solana" />
      <!-- <GoogleAuth /> -->
    </div>
  </div>
</AppOverlay>

<style>
</style>

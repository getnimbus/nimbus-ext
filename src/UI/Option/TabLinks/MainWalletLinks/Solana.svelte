<script lang="ts">
  import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { walletStore } from "@aztemi/svelte-on-solana-wallet-adapter-core";
  import { WalletProvider } from "@aztemi/svelte-on-solana-wallet-adapter-ui";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, userPublicAddress } from "~/store";
  import bs58 from "bs58";
  import { triggerToast } from "~/utils";

  import WalletModal from "~/UI/SolanaCustomWalletBtn/WalletModal.svelte";

  import Solana from "~/assets/chains/solana.png";

  export let data;
  export let isPrimaryLogin;

  const queryClient = useQueryClient();

  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  let modalVisible = false;
  const maxNumberOfWallets = 5;
  const openModal = () => {
    modalVisible = true;
  };

  const closeModal = () => (modalVisible = false);

  const connectWallet = async (event) => {
    closeModal();
    try {
      localStorage.removeItem("walletAdapter");
      await walletStore.resetWallet();
      await walletStore.setConnecting(false);
      await $walletStore.disconnect();
      await $walletStore.select(event.detail);
      await $walletStore.connect();
    } catch (error) {
      console.log(error);
    }
  };

  $: solanaPublicAddress = $walletStore?.publicKey?.toBase58();

  $: {
    if (solanaPublicAddress) {
      handleGetSolanaNonce(solanaPublicAddress);
    }
  }

  const handleSignSolanaAddressMessage = async (signatureString) => {
    if ($walletStore.connected) {
      const res = await $walletStore?.signMessage(
        Uint8Array.from(
          Array.from(`I am signing my one-time nonce: ${signatureString}`).map(
            (letter) => letter.charCodeAt(0)
          )
        )
      );
      if (res) {
        return bs58.encode(res);
      } else {
        return "";
      }
    }
  };

  const handleGetSolanaNonce = async (address) => {
    try {
      const res: any = await nimbus.post("/users/nonce?verified=true", {
        publicAddress: address,
        referrer: undefined,
      });
      if (res && res.data) {
        const signatureString = await handleSignSolanaAddressMessage(
          res?.data?.nonce
        );
        if (signatureString) {
          const payload = {
            signature: signatureString,
            publicAddress: address,
          };
          handleUpdatePublicAddress(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
      $walletStore.disconnect();
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
      const res: any = await nimbus.post("/accounts/link", params);
      if (res && res?.error) {
        triggerToast(res?.error, "fail");
        return;
      }

      queryClient?.invalidateQueries(["link-socials"]);

      triggerToast(
        "Your are successfully connect your Solana wallet!",
        "success"
      );
    } catch (e) {
      console.log(e);
      triggerToast(
        "Something wrong when connect your Solana wallet. Please try again!",
        "fail"
      );
    } finally {
      $walletStore.disconnect();
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] md:w-[310px] w-full ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={() => {
    openModal();
  }}
>
  <img src={Solana} alt="" width="24" height="24" class="rounded-full" />
  <div class="font-semibold text-[15px]">Connect Solana Wallet</div>
</div>

<WalletProvider
  localStorageKey="walletAdapter"
  {wallets}
  autoConnect
  onError={console.log}
/>

{#if modalVisible}
  <WalletModal
    on:close={closeModal}
    on:connect={connectWallet}
    {maxNumberOfWallets}
  />
{/if}

<style windi:preflights:global windi:safelist:global>
</style>

<script lang="ts">
  import {
    BackpackWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { isDarkMode } from "~/store";

  import WalletModal from "~/UI/SolanaCustomWalletBtn/WalletModal.svelte";

  import Solana from "~/assets/chains/solana.png";

  export let data;
  export let reCallAPI = () => {};

  const queryClient = useQueryClient();

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
  ];

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
      handleUpdatePublicAddress(solanaPublicAddress);
    }
  }

  const handleUpdatePublicAddress = async (address) => {
    try {
      let params: any = {
        kind: "wallet",
        id: data?.uid,
        type: "google",
        info: data?.info,
        userPublicAddress: address,
        displayName: data?.name,
      };
      await nimbus.post("/accounts/link", params);
      queryClient.invalidateQueries(["list-bundle"]);
      reCallAPI();
    } catch (e) {
      console.log(e);
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={() => {
    openModal();
  }}
>
  <img src={Solana} alt="" width="24" height="24" class="rounded-full" />
  <div class="font-semibold text-[15px]">Connect Solana</div>
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

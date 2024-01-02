<script lang="ts">
  import {
    BackpackWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import bs58 from "bs58";
  import mixpanel from "mixpanel-browser";
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import onboard from "~/lib/web3-onboard";
  import { chain, typeWallet, user, userPublicAddress, wallet } from "~/store";
  import { clickOutside, shorterAddress } from "~/utils";
  import { inview } from "svelte-inview";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import Airdrop from "~/UI/Recap/Airdrop.svelte";
  import MintNft from "~/UI/Recap/MintNFT.svelte";
  import NftHolding from "~/UI/Recap/NFTHolding.svelte";
  import Promote from "~/UI/Recap/Promote.svelte";
  import TokenHolding from "~/UI/Recap/TokenHolding.svelte";
  import CardNftRecap from "~/components/CardNFTRecap.svelte";
  import Loading from "~/components/Loading.svelte";

  import WalletModal from "~/UI/SolanaCustomWalletBtn/WalletModal.svelte";

  import Logo from "~/assets/logo-1.svg";
  import Arrow from "~/assets/recap/hero/arrow-right.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import SvgTwo from "~/assets/recap/hero/svgTwo.svg";
  import User from "~/assets/user.png";

  const NFTOne = {
    solHolding: 5.5,
    summaryLabel: "Bonk Friend",
    tag: "Top 10",
  };

  const NFTTwo = {
    solHolding: 68.78,
    summaryLabel: "True Holder",
    tag: "Top 8",
  };

  const handleValidateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      userPublicAddressChain = response?.data.type;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
  ];

  const wallets$ = onboard.state.select("wallets");

  const queryClient = useQueryClient();

  let userPublicAddressChain = "EVM";
  let userAddress = $userPublicAddress;
  let invitation = "";

  let showPopover = false;
  let isLoading = false;
  let data;

  $: solanaPublicAddress = $walletStore?.publicKey?.toBase58();

  $: {
    if (solanaPublicAddress) {
      userAddress = solanaPublicAddress;

      const solanaToken = localStorage.getItem("solana_token");
      if (!solanaToken) {
        isLoading = true;
        handleSignOut();
        handleGetSolanaNonce(solanaPublicAddress);
      }
    } else {
      userAddress = $userPublicAddress;
    }
  }

  $: {
    if (userAddress) {
      handleValidateAddress(userAddress);
    }
  }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationParams = urlParams.get("invitation");
    if (invitationParams) {
      invitation = invitationParams;
    }
    const solanaToken = localStorage.getItem("solana_token");

    if (solanaToken) {
      user.update(
        (n) =>
          (n = {
            picture: User,
          })
      );
      userAddress = $userPublicAddress;
    } else {
      handleSignOut();
    }
  });

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

      localStorage.removeItem("public_address");

      localStorage.removeItem("evm_token");
      disconnect($wallets$?.[0]);

      queryClient.invalidateQueries(["list-address"]);
      queryClient.invalidateQueries(["users-me"]);
      mixpanel.reset();
    } catch (error) {
      console.log(error);
    }
  };

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
      const res: any = await nimbus.post("/users/nonce", {
        publicAddress: address,
        referrer: invitation.length !== 0 ? invitation : undefined,
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
          handleGetSolanaToken(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetSolanaToken = async (data) => {
    try {
      const res = await nimbus.post("/auth/solana", data);
      if (res?.data?.result) {
        localStorage.setItem("solana_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        queryClient.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
      }
    } catch (e) {
      console.error("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  // trigger Solana wallet
  const maxNumberOfWallets = 3;
  let modalVisible = false;
  const openModal = () => {
    modalVisible = true;
  };
  const closeModal = () => (modalVisible = false);
  async function connectWallet(event) {
    closeModal();
    await $walletStore.select(event.detail);
    await $walletStore.connect();
  }

  const getRecapData = async (address: string) => {
    const response: any = await nimbus.get(`/recap?address=${address}`);
    return response?.data;
  };

  $: query = createQuery({
    queryKey: ["recap", userAddress],
    queryFn: () => getRecapData(userAddress),
    staleTime: Infinity,
    retry: false,
    enabled:
      $user &&
      Object.keys($user).length !== 0 &&
      userPublicAddressChain === "SOL" &&
      userAddress.length !== 0,
  });

  $: {
    if (
      !$query.isError &&
      $query.data !== undefined &&
      Object.keys($query.data).length !== 0
    ) {
      data = $query.data;
    }
  }
</script>

<svelte:head>
  <title>Your Solana 2023 Recap</title>
  <meta
    name="description"
    content="Recap your journey with Solana in 2023, mint your momemnt"
  />
  <meta property="twitter:image" content="/assets/logo/logoN.png" />
</svelte:head>

<ErrorBoundary>
  <div class="recap-wrapper" id="recap-wrapper">
    <div
      class="recap-container"
      use:inview={{
        threshold: 0.1,
      }}
      on:inview_change={(event) => {
        const { inView, entry, scrollDirection, observer, node } = event.detail;
        if (inView) {
          document
            .getElementById("recap-wrapper")
            ?.classList.add("recap-wrapper");
        }
      }}
    >
      <div class="bg-[#EBFDFF] min-h-screen overflow-hidden py-10 flex">
        <div class="flex 1 flex flex-col gap-20 h-full max-w-[1400px] m-auto">
          <img
            src={Logo}
            alt="logo"
            class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
          />
          <div
            class="flex-1 h-full flex xl:flex-row flex-col items-center item_start xl:justify-between justify-center gap-20 px-[35px]"
          >
            <div class="flex flex-col gap-10">
              <div
                class="text-[#202025] text-[100px] text_title_lg_view font-bold mt-3"
              >
                2023 Solana Recap
              </div>
              <div class="flex flex-col gap-6">
                {#if userPublicAddressChain === "SOL" && userAddress}
                  <div
                    class="relative w-max flex items-center justify-center gap-2 cursor-pointer p-[20px] rounded-[32px] min-w-[250px] bg-[#A7EB50] text-black text-2xl font-semibold"
                    on:click={() => {
                      showPopover = true;
                    }}
                  >
                    {#if isLoading}
                      <Loading />
                    {:else}
                      {shorterAddress(userAddress)}
                    {/if}

                    {#if showPopover && $user && Object.keys($user).length !== 0}
                      <div
                        class="bg-white absolute top-20 right-0 z-50 flex flex-col gap-1 px-3 xl:py-2 py-3 text-sm transform rounded-lg w-full"
                        style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
                        use:clickOutside
                        on:click_outside={() => (showPopover = false)}
                      >
                        <div
                          class="text-2xl font-medium text-red-500 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 text-center"
                          on:click={() => {
                            handleSignOut();
                            localStorage.removeItem("solana_token");
                            $walletStore.disconnect();
                            showPopover = false;
                          }}
                        >
                          Log out
                        </div>
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div
                    class="w-max flex items-center justify-center gap-2 cursor-pointer p-[20px] rounded-[32px] min-w-[250px] bg-[#A7EB50] text-black text-2xl font-semibold"
                    on:click={() => {
                      openModal();
                    }}
                  >
                    Connect My Wallet
                    <img src={Arrow} alt="" />
                  </div>
                {/if}
                <div class="lg:text-base text-2xl mt-[-12px]">
                  1021+ users viewed their Solana Recap 2023
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-black font-normal lg:text-base text-2xl">
                2023 has proven to be a challenging year for every holder, but
                we've managed to weather the storm and emerge from the bottom.
                This resilience is a significant achievement, and now let's
                reflect on the moments we've overcome together.
              </div>

              <div class="flex justify-center gap-10 py-10 px-16">
                <div class="relative">
                  <div class="absolute top-[-80px] left-[-160px]">
                    <img
                      src={SvgOne}
                      alt=""
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <CardNftRecap data={NFTOne} />
                </div>
                <div class="relative">
                  <div class="absolute bottom-[-130px] right-[-150px]">
                    <img
                      src={SvgTwo}
                      alt=""
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <CardNftRecap data={NFTTwo} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {#if userPublicAddressChain === "SOL" && userAddress}
      <div
        class="recap-container"
        use:inview={{
          threshold: 0.1,
        }}
        on:inview_change={(event) => {
          const { inView, entry, scrollDirection, observer, node } =
            event.detail;
          if (inView) {
            document
              .getElementById("recap-wrapper")
              ?.classList.add("recap-wrapper");
          }
        }}
      >
        <TokenHolding
          data={data?.tokens}
          summary={data?.mintNFT}
          loading={$query.isLoading}
        />
      </div>
      <div
        class="recap-container"
        use:inview={{
          threshold: 0.1,
        }}
        on:inview_change={(event) => {
          const { inView, entry, scrollDirection, observer, node } =
            event.detail;
          if (inView) {
            document
              .getElementById("recap-wrapper")
              ?.classList.add("recap-wrapper");
          }
        }}
      >
        <NftHolding data={data?.nfts} loading={$query.isLoading} />
      </div>
      <div
        class="recap-container"
        use:inview={{
          threshold: 0.1,
        }}
        on:inview_change={(event) => {
          const { inView, entry, scrollDirection, observer, node } =
            event.detail;
          if (inView) {
            document
              .getElementById("recap-wrapper")
              ?.classList.add("recap-wrapper");
          }
        }}
      >
        <Airdrop data={data?.airdrops} loading={$query.isLoading} />
      </div>
      <div
        class="recap-container"
        use:inview={{
          threshold: 0.1,
        }}
        on:inview_change={(event) => {
          const { inView, entry, scrollDirection, observer, node } =
            event.detail;
          if (inView) {
            document
              .getElementById("recap-wrapper")
              ?.classList.remove("recap-wrapper");
          }
        }}
      >
        <MintNft data={data?.mintNFT} />
      </div>
    {/if}
    <div
      class="no-snap"
      use:inview={{
        threshold: 0.1,
      }}
      on:inview_change={(event) => {
        const { inView, entry, scrollDirection, observer, node } = event.detail;
        console.log(inView);
        if (inView) {
          document
            .getElementById("recap-wrapper")
            ?.classList.remove("recap-wrapper");
        }
      }}
    >
      <Promote />
    </div>
  </div>
</ErrorBoundary>

<WalletProvider localStorageKey="walletAdapter" {wallets} autoConnect />

{#if modalVisible}
  <WalletModal
    on:close={closeModal}
    on:connect={connectWallet}
    {maxNumberOfWallets}
  />
{/if}

<style windi:preflights:global windi:safelist:global>
  @media (min-width: 1024px) {
    @media not all and (min-width: 1280px) {
      .text_title_lg_view {
        font-size: 60px;
      }
      .item_start {
        -webkit-box-align: start;
        -ms-flex-align: start;
        -webkit-align-items: flex-start;
        align-items: flex-start;
      }
    }
  }

  :global(img) {
    display: inline-block;
  }

  :global(.recap-wrapper) {
    scroll-snap-type: y mandatory;
  }

  :global(#recap-wrapper) {
    position: relative;
    width: 100%;
    min-height: 100vh;
    scroll-behavior: smooth;
    overflow: auto;
  }

  :global(.recap-container) {
    width: 100%;
    min-height: 100vh;
    background-size: cover;
    scroll-snap-align: start;
  }
</style>

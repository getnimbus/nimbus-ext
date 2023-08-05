<script lang="ts">
  import { onMount } from "svelte";
  import onboard from "~/lib/web3-onboard";
  import { ethers } from "ethers";
  import { wallet, chain, typeWallet, user, isShowUpgradeModal } from "~/store";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";

  import User from "~/assets/user.png";

  const wallets$ = onboard.state.select("wallets");

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let showPopover = false;
  let addressWallet = "";
  let showUpgradeModal = false;

  onMount(() => {
    const evmToken = localStorage.getItem("evm_token");
    if (evmToken) {
      user.update(
        (n) =>
          (n = {
            picture: User,
          })
      );
    } else {
      user.update((n) => (n = {}));
      showPopover = false;
      localStorage.removeItem("evm_address");
      localStorage.removeItem("evm_token");
      addressWallet = "";
      disconnect($wallets$?.[0]);
    }
  });

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

  const disconnect = ({ label }) => {
    onboard.disconnectWallet({ label });
  };

  const handleSignOut = () => {
    user.update((n) => (n = {}));
    showPopover = false;
    localStorage.removeItem("evm_address");
    localStorage.removeItem("evm_token");
    addressWallet = "";
    disconnect($wallets$?.[0]);
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
      const res = await nimbus.post("/users/nonce", {
        publicAddress: address,
      });
      if (res && res.data) {
        const signatureString = await handleSignAddressMessage(
          provider,
          res.data.nonce
        );
        if (signatureString) {
          const payload = {
            signature: signatureString,
            publicAddress: address,
          };
          handleGetEVMToken(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetEVMToken = async (data) => {
    try {
      const res = await nimbus.post("/auth/evm", data);
      if (res.data.result) {
        localStorage.setItem("evm_address", data.publicAddress);
        localStorage.setItem("evm_token", res.data.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        getListAddress(data.publicAddress);
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const getListAddress = async (publicAddress) => {
    try {
      const response: any = await nimbus.get("/accounts/list");
      if (response && response?.data) {
        const structWalletData = response?.data.map((item) => {
          return {
            id: item.id,
            type: item.type,
            label: item.label,
            value: item.type === "CEX" ? item.id : item.accountId,
            logo: item.logo,
          };
        });

        if (structWalletData && structWalletData.length === 0) {
          handleAddAccount(publicAddress);
        }
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };

  // Add DEX address account
  const handleAddAccount = async (publicAddress) => {
    try {
      await nimbus.post("/accounts", {
        type: "DEX",
        publicAddress: publicAddress,
        accountId: publicAddress,
        label: "My address",
      });

      chain.update((n) => (n = "ALL"));
      wallet.update((n) => (n = publicAddress));
      typeWallet.update((n) => (n = "DEX"));

      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          `?type=${typeWalletAddress}&chain=${selectedChain}&address=${selectedWallet}`
      );

      mixpanel.track("user_add_address");
    } catch (e) {
      console.error(e);
    }
  };
</script>

{#if Object.keys(userInfo).length !== 0}
  <div class="relative">
    <div
      class="xl:w-[40px] xl:h-[40px] w-16 h-16 rounded-full overflow-hidden cursor-pointer"
      on:click={() => (showPopover = !showPopover)}
    >
      <img src={userInfo.picture} alt="" class="object-cover w-full h-full" />
    </div>
    {#if showPopover}
      <div
        class="bg-white py-2 px-3 text-sm rounded-lg absolute xl:-bottom-24 -bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col gap-1 xl:w-[80px] w-max z-50"
        style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
      >
        {#if APP_TYPE.TYPE === "EXT"}
          <div
            class="text-yellow-400 cursor-pointer xl:text-sm text-2xl"
            on:click={() => {
              isShowUpgradeModal.update((n) => (n = true));
              showPopover = false;
            }}
          >
            Upgrade
          </div>
          <div
            class="text-gray-500 cursor-pointer xl:block hidden"
            on:click={() => {
              browser.tabs.create({
                url: "src/entries/options/index.html?tab=wallets",
              });
            }}
          >
            Settings
          </div>
        {:else}
          <a
            class="text-yellow-400 cursor-pointer xl:text-sm text-2xl"
            on:click={() => {
              isShowUpgradeModal.update((n) => (n = true));
              showPopover = false;
            }}
          >
            Upgrade
          </a>
          <a
            href="entries/options/index.html?tab=wallets"
            target="_blank"
            class="text-gray-500 cursor-pointer xl:block hidden"
          >
            Settings
          </a>
        {/if}
        <div
          class="font-medium text-red-500 cursor-pointer xl:text-sm text-2xl"
          on:click={handleSignOut}
        >
          Logout
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div
    on:click={connect}
    class="font-semibold text-white cursor-pointer xl:text-base text-2xl"
  >
    Connect Wallet
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>

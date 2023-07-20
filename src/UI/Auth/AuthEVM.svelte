<script lang="ts">
  import { onMount } from "svelte";
  import onboard from "~/lib/web3-onboard";
  import { ethers } from "ethers";
  import { user } from "~/store";
  import { nimbus } from "~/lib/network";

  import User from "~/assets/user.png";

  const signatureString = "Hello Nimbus";
  const wallets$ = onboard.state.select("wallets");

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });
  let signMessageAddress = "";
  let showPopover = false;
  let addressWallet = "";

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
      signMessageAddress = "";
      disconnect($wallets$?.[0]);
    }
  });

  const connect = async () => {
    await onboard.connectWallet();
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
    signMessageAddress = "";
    disconnect($wallets$?.[0]);
  };

  const handleSignAddressMessage = async (provider) => {
    try {
      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider, "any");
        const signer = await ethersProvider?.getSigner();
        const signature = await signer.signMessage(signatureString);
        signMessageAddress = signature;
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetEVMToken = async (data) => {
    const res = await nimbus
      .post("/auth/evm", data)
      .then((response) => response);
    if (res.data.result) {
      localStorage.setItem("evm_token", res.data.result);
      user.update(
        (n) =>
          (n = {
            picture: User,
          })
      );
    }
  };

  $: addressWallet = $wallets$?.[0]?.accounts[0]?.address;

  $: {
    if (addressWallet) {
      const evmToken = localStorage.getItem("evm_token");
      if (!evmToken) {
        handleSignAddressMessage($wallets$?.[0]?.provider);
      }
    }
  }

  $: {
    if (addressWallet && signMessageAddress) {
      const evmLoginPayload = {
        message: signatureString,
        addressWallet,
        signMessageAddress,
      };
      localStorage.setItem("evm_address", addressWallet);
      handleGetEVMToken(evmLoginPayload);
    }
  }
</script>

{#if Object.keys(userInfo).length !== 0}
  <div class="relative">
    <div
      class="w-[40px] h-[40px] rounded-full overflow-hidden cursor-pointer"
      on:click={() => (showPopover = !showPopover)}
    >
      <img src={userInfo.picture} alt="" class="object-cover w-full h-full" />
    </div>
    {#if showPopover}
      <div
        class="bg-white py-2 px-3 text-sm rounded-lg absolute -bottom-17 left-1/2 transform -translate-x-1/2 flex flex-col gap-1 w-[80px] z-50"
        style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
      >
        {#if APP_TYPE.TYPE === "EXT"}
          <div
            class="text-black cursor-pointer"
            on:click={() => {
              browser.tabs.create({
                url: "src/entries/options/index.html?tab=nft",
              });
              showPopover = false;
            }}
          >
            Dashboard
          </div>
        {:else}
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
        {/if}
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
    on:click={connect}
    class="text-sm font-semibold text-white cursor-pointer xl:text-base"
  >
    Login
  </div>
{/if}

<style></style>

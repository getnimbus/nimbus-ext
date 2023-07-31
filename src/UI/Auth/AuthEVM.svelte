<script lang="ts">
  import { onMount } from "svelte";
  import onboard from "~/lib/web3-onboard";
  import { ethers } from "ethers";
  import { user } from "~/store";
  import { nimbus } from "~/lib/network";

  import User from "~/assets/user.png";

  const wallets$ = onboard.state.select("wallets");

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let showPopover = false;
  let addressWallet = "";

  onMount(() => {
    const evmToken = localStorage.getItem("evm_token");
    if (evmToken) {
      user.update(
        (n) =>
          (n = {
            picture: User,
          }),
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
          `I am signing my one-time nonce: ${signatureString}`,
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
          res.data.nonce,
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
            }),
        );
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };
</script>

{#if Object.keys(userInfo).length !== 0}
  <div class="relative">
    <div
      class="xl:w-[50px] xl:h-[50px] w-16 h-16 rounded-full overflow-hidden cursor-pointer"
      on:click={() => (showPopover = !showPopover)}
    >
      <img src={userInfo.picture} alt="" class="object-cover w-full h-full" />
    </div>
    {#if showPopover}
      <div
        class="bg-white py-2 px-3 text-sm rounded-lg absolute xl:-bottom-10 -bottom-15 left-1/2 transform -translate-x-1/2 flex flex-col gap-1 xl:w-[80px] w-max z-50"
        style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
      >
        <!-- {#if APP_TYPE.TYPE === "EXT"}
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
        {/if} -->
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
    Login
  </div>
{/if}

<style></style>

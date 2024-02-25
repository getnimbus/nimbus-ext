<script lang="ts">
  import { onMount } from "svelte";
  import jwt_decode from "jwt-decode";
  import { i18n } from "~/lib/i18n";

  import NftCard from "~/components/NFTCard.svelte";
  import Button from "~/components/Button.svelte";

  import User from "~/assets/user.png";
  import { nimbus } from "~/lib/network";

  const MultipleLang = {
    title: i18n("optionsPage.nft-page-title", "My NFT"),
  };

  let userInfo = {};
  let listNft = [];
  let isLoading = false;

  onMount(() => {
    const authToken = localStorage.getItem("auth_token");
    const evmToken = localStorage.getItem("evm_token");
    const solanaToken = localStorage.getItem("solana_token");
    const suiToken = localStorage.getItem("sui_token");
    if (evmToken || solanaToken || suiToken || authToken) {
      if (evmToken) {
        const { access_token, id_token } = JSON.parse(evmToken);
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
          .then((response) => {
            if (response.ok) {
              // User is authenticated and access token is still valid
              userInfo = jwt_decode(id_token);
            } else {
              // Access token is invalid or expired, prompt user to sign in again
              userInfo = {};
              localStorage.removeItem("token");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      if (solanaToken) {
        userInfo = {
          picture: User,
        };
      }
      if (suiToken) {
        userInfo = {
          picture: User,
        };
      }
    } else {
      // Access token not found, prompt user to sign in again
      userInfo = {};
      localStorage.removeItem("auth_token");
      localStorage.removeItem("evm_token");
      localStorage.removeItem("solana_address");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
    }
  });

  const handleGetNft = async () => {
    try {
      isLoading = true;
      const solanaAddress = localStorage.getItem("solana_address");
      const solanaToken = localStorage.getItem("solana_token");
      if (solanaAddress && solanaToken) {
        const res = await nimbus
          .get(`/nft/${solanaAddress}`, {
            headers: {
              Authorization: `${solanaToken}`,
            },
          })
          .then((response) => response);
        if (res) {
          listNft = res?.data?.result;
        }
      }
    } catch (e) {
      console.error("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  const handleBuy = async () => {
    const res = await nimbus
      .get("/payments/create-session")
      .then((response) => response);
    if (res) {
      window.location.replace(res.data.payment_url);
    }
  };

  $: {
    if (Object.keys(userInfo).length !== 0) {
      handleGetNft();
    } else {
      listNft = [];
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex justify-between items-center mb-2">
    <div class="xl:title-3 title-1 text-gray-500 flex flex-col">
      {MultipleLang.title}
    </div>
  </div>

  {#if Object.keys(userInfo).length === 0}
    <div class="xl:title-5 title-3">
      Please {#if APP_TYPE.TYPE === "EXT"}
        <span
          class="text-blue-500 cursor-pointer"
          on:click={() => {
            browser.tabs.create({
              url: "src/entries/newTab/index.html",
            });
          }}
        >
          login
        </span>
      {:else}
        <a href="https://app.getnimbus.io" target="_blank" class="text-blue-500"
          >login</a
        >
      {/if} to see your dashboard
    </div>
  {:else}
    <div>
      {#if listNft && listNft.length !== 0}
        <div class="w-[350px]">
          <NftCard data={{}} marketPrice={0} />
        </div>
      {:else}
        <div class="flex flex-col gap-4">
          <div class="xl:title-5 title-3">
            You need Nimbus NFT to unlock this feature
          </div>
          <Button variant="secondary" on:click={() => handleBuy()}>Buy</Button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global>
</style>

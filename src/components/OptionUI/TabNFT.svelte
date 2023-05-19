<script lang="ts">
  import { onMount } from "svelte";
  import jwt_decode from "jwt-decode";
  import { i18n } from "~/lib/i18n";

  import NftCard from "~/components/NFTCard.svelte";

  const MultipleLang = {
    title: i18n("optionsPage.nft-page-title", "My NFT"),
  };

  let userInfo = {};

  onMount(() => {
    const token = localStorage.getItem("token");
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
    } else {
      // Access token not found, prompt user to sign in again
      userInfo = {};
      localStorage.removeItem("token");
    }
  });
</script>

<div class="flex flex-col gap-2">
  <div class="flex justify-between items-center mb-2">
    <div class="title-3 text-gray-500 flex flex-col">{MultipleLang.title}</div>
  </div>
  {#if Object.keys(userInfo).length !== 0}
    <div class="w-[350px]">
      <NftCard />
    </div>
  {:else}
    <div class="title-5">
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
        <a href="http://localhost:5173" target="_blank" class="text-blue-500"
          >login</a
        >
      {/if} to see your dashboard
    </div>
  {/if}
</div>

<style></style>

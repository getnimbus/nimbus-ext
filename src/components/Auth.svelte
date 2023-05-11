<script lang="ts">
  import { onMount } from "svelte";
  import jwt_decode from "jwt-decode";

  let userInfo = {};
  let showPopover = false;

  const clientID =
    APP_TYPE.TYPE === "EXT"
      ? "520245364327-hqb03lrk5kdml332nl6uqdk1icrh832k.apps.googleusercontent.com"
      : "520245364327-4t6vius9egn2qfdrcj2paeefv5l3hgtg.apps.googleusercontent.com";

  onMount(() => {
    google.accounts.id.initialize({
      client_id: clientID,
      callback: handleCallbackRes,
      auto_select: true,
    });

    google.accounts.id.renderButton(document.getElementById("signInBtn"), {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin",
    });

    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            // User is authenticated and access token is still valid
          } else {
            // Access token is invalid or expired, prompt user to sign in again
            google.accounts.id
              .prompt({
                client_id: clientID,
                response_type: "token",
                scope: "email profile",
              })
              .then((response) => {
                localStorage.setItem("access_token", response.credential);
              })
              .catch((error) => {
                console.error(error);
              });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      // Access token not found, prompt user to sign in again
      google.accounts.id
        .prompt({
          client_id: clientID,
          response_type: "token",
          scope: "email profile",
        })
        .then((response) => {
          localStorage.setItem("access_token", response.credential);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });

  const handleCallbackRes = (res) => {
    userInfo = jwt_decode(res.credential);
    document.getElementById("signInBtn").hidden = true;
  };

  const handleSignOut = () => {
    userInfo = {};
    document.getElementById("signInBtn").hidden = false;
    showPopover = false;
    google.accounts.id.disableAutoSelect();
  };
</script>

<div id="signInBtn" />

{#if Object.keys(userInfo).length !== 0}
  <div class="relative">
    <div
      class="w-[40px] h-[40px] rounded-full overflow-hidden cursor-pointer"
      on:click={() => (showPopover = !showPopover)}
    >
      <img src={userInfo.picture} alt="" class="w-full h-full object-cover" />
    </div>
    {#if showPopover}
      <div
        class="bg-[#1e96fc] py-1 px-3 rounded-lg absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-max"
        on:click={() => handleSignOut()}
      >
        <span class="text-white cursor-pointer">Sign out</span>
      </div>
    {/if}
  </div>
{/if}

<style>
</style>

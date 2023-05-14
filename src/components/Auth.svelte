<script lang="ts">
  import { onMount } from "svelte";
  import jwt_decode from "jwt-decode";

  let userInfo = {};
  let showPopover = false;

  const clientID = encodeURI(
    "520245364327-4t6vius9egn2qfdrcj2paeefv5l3hgtg.apps.googleusercontent.com"
  );
  const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
  const redirectURL = encodeURIComponent(
    APP_TYPE.TYPE === "EXT"
      ? "https://hjlilcigcidfaialcihialehachkldfd.chromiumapp.org"
      : "http://localhost:5173"
  );

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
            showPopover = false;
            localStorage.removeItem("token");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      // Access token not found, prompt user to sign in again
      userInfo = {};
      showPopover = false;
      localStorage.removeItem("token");
    }
  });

  const handleSignOut = () => {
    userInfo = {};
    showPopover = false;
    localStorage.removeItem("token");
  };

  const handleLogin = async () => {
    const url = `${oauth2Endpoint}/oauthchooseaccount?redirect_uri=${redirectURL}&prompt=consent&response_type=code&client_id=${clientID}&scope=email%20profile&access_type=offline&service=lso&o2v=2&flowName=GeneralOAuthFlow`;
    chrome.identity.launchWebAuthFlow(
      {
        url,
        interactive: true,
      },
      function (redirect_url) {
        const codeFromRedirectURL = decodeURIComponent(
          redirect_url
            .substring(url.indexOf("?"))
            .slice(
              0,
              redirect_url.substring(url.indexOf("?")).indexOf("&scope")
            )
        );
        handleGetAccessToken(codeFromRedirectURL);
      }
    );
  };

  const handleGetAccessToken = async (code: string) => {
    const res = await fetch("https://api.getnimbus.io/auth", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        direct_url:
          APP_TYPE.TYPE === "EXT"
            ? "https://hjlilcigcidfaialcihialehachkldfd.chromiumapp.org"
            : "http://localhost:5173",
      }),
    }).then((response) => response.json());
    if (res.data) {
      localStorage.setItem("token", JSON.stringify(res.data));
      userInfo = jwt_decode(res.data.id_token);
      if (APP_TYPE.TYPE !== "EXT") {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  };

  $: {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && APP_TYPE.TYPE !== "EXT") {
      handleGetAccessToken(code);
    }
  }
</script>

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
        <span
          class="text-white font-semibold xl:text-base text-sm cursor-pointer"
          >Logout</span
        >
      </div>
    {/if}
  </div>
{:else}
  <div>
    {#if APP_TYPE.TYPE === "EXT"}
      <div
        class="text-white font-semibold xl:text-base text-sm cursor-pointer"
        on:click={handleLogin}
      >
        Login
      </div>
    {:else}
      <a
        class="text-white font-semibold xl:text-base text-sm cursor-pointer"
        href={`${oauth2Endpoint}/oauthchooseaccount?redirect_uri=${redirectURL}&prompt=consent&response_type=code&client_id=${clientID}&scope=email%20profile&access_type=offline&service=lso&o2v=2&flowName=GeneralOAuthFlow`}
        >Login</a
      >
    {/if}
  </div>
{/if}

<style>
</style>

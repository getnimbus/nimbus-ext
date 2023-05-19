<script lang="ts">
  import { handleGetAccessToken } from "~/utils";

  import Google from "~/assets/google.png";

  export let userInfo;

  const clientID = encodeURI(
    "520245364327-4t6vius9egn2qfdrcj2paeefv5l3hgtg.apps.googleusercontent.com"
  );
  const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
  const redirectURL = encodeURIComponent(
    APP_TYPE.TYPE === "EXT"
      ? "https://hjlilcigcidfaialcihialehachkldfd.chromiumapp.org"
      : "http://localhost:5173"
  );

  const handleLogin = async () => {
    const url = `${oauth2Endpoint}/oauthchooseaccount?redirect_uri=${redirectURL}&prompt=consent&response_type=code&client_id=${clientID}&scope=email%20profile&access_type=offline&service=lso&o2v=2&flowName=GeneralOAuthFlow`;
    chrome.identity.launchWebAuthFlow(
      {
        url,
        interactive: true,
      },
      async function (redirect_url) {
        const codeFromRedirectURL = decodeURIComponent(
          redirect_url
            .substring(url.indexOf("?"))
            .slice(
              0,
              redirect_url.substring(url.indexOf("?")).indexOf("&scope")
            )
        );
        userInfo = await handleGetAccessToken(codeFromRedirectURL);
      }
    );
  };
</script>

{#if APP_TYPE.TYPE === "EXT"}
  <div
    class="text-gray-400 font-semibold xl:text-base text-sm cursor-pointer flex items-center gap-2 border border-gray-200 py-2 px-3 rounded-lg"
    on:click={handleLogin}
  >
    <img src={Google} alt="" width="24" height="24" />
    <div>Login with Google</div>
  </div>
{:else}
  <a
    class="text-gray-400 font-semibold xl:text-base text-sm cursor-pointer flex items-center gap-2 border border-gray-200 py-2 px-3 rounded-lg"
    href={`${oauth2Endpoint}/oauthchooseaccount?redirect_uri=${redirectURL}&prompt=consent&response_type=code&client_id=${clientID}&scope=email%20profile&access_type=offline&service=lso&o2v=2&flowName=GeneralOAuthFlow`}
  >
    <img src={Google} alt="" width="24" height="24" />
    <div>Login with Google</div>
  </a>
{/if}

<style>
</style>

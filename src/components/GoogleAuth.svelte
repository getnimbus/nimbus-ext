<script lang="ts">
  import { user } from "~/store";
  import { handleGetAccessToken } from "~/utils";

  import Google from "~/assets/google.png";

  const clientID = encodeURI(
    "520245364327-4t6vius9egn2qfdrcj2paeefv5l3hgtg.apps.googleusercontent.com"
  );
  const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
  const redirectURL = encodeURIComponent(
    APP_TYPE.TYPE === "EXT"
      ? "https://hjlilcigcidfaialcihialehachkldfd.chromiumapp.org"
      : "https://nimbus-app-pr-52.onrender.com"
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
        const userData = await handleGetAccessToken(codeFromRedirectURL);
        user.update((n) => (n = userData));
      }
    );
  };
</script>

{#if APP_TYPE.TYPE === "EXT"}
  <div
    class="text-[#9ca3af] font-semibold text-base cursor-pointer flex items-center gap-2 border border-gray-200 py-3 px-6 rounded-lg w-[250px]"
    on:click={handleLogin}
  >
    <img src={Google} alt="" width="24" height="24" />
    <div>Login with Google</div>
  </div>
{:else}
  <a
    class="text-[#9ca3af] font-semibold text-base cursor-pointer flex items-center gap-2 border border-gray-200 py-3 px-6 rounded-lg w-[250px]"
    href={`${oauth2Endpoint}/oauthchooseaccount?redirect_uri=${redirectURL}&prompt=consent&response_type=code&client_id=${clientID}&scope=email%20profile&access_type=offline&service=lso&o2v=2&flowName=GeneralOAuthFlow`}
  >
    <img src={Google} alt="" width="24" height="24" />
    <div>Login with Google</div>
  </a>
{/if}

<style>
</style>

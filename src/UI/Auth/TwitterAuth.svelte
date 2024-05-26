<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { user, isDarkMode, triggerConnectWallet } from "~/store";
  import { TwitterAuthProvider, signInWithPopup } from "firebase/auth";
  import { auth } from "~/lib/firebase";
  import { useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";
  import { triggerToast } from "~/utils/functions";

  import User from "~/assets/user.png";

  const queryClient = useQueryClient();
  const twitterProvider = new TwitterAuthProvider();

  const handleTwitterAuth = async () => {
    mixpanel.track("user_login_twitter");
    try {
      const res: any = await signInWithPopup(auth, twitterProvider).then(
        (result) => {
          return result.user;
        }
      );
      if (res) {
        handleGetTwitterToken(
          res?.uid,
          res?.reloadUserInfo?.providerUserInfo[0]?.rawId,
          "twitter",
          res?.reloadUserInfo?.screenName,
          res?.reloadUserInfo?.screenName
        );
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const handleGetTwitterToken = async (
    uid,
    externalId,
    type,
    info,
    displayName
  ) => {
    try {
      const res: any = await nimbus.post("/auth", {
        uid,
        externalId,
        type,
        info,
        displayName: displayName ? displayName : info,
      });
      if (res?.data?.result) {
        triggerConnectWallet.update((n) => (n = false));
        localStorage.setItem("auth_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );

        triggerToast("Login with Twitter successfully!", "success");
        queryClient?.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
        queryClient?.invalidateQueries(["link-socials"]);
      } else {
        triggerToast(res?.error, "fail");
      }
    } catch (e) {
      console.error("error: ", e);
      triggerToast(
        "There are some problem when login Twitter account. Please try again!",
        "fail"
      );
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white cursor-pointer rounded-[12px] bg-black w-[219px] h-[43px] ${$isDarkMode ? "border border-white" : ""}`}
  style="padding: 9px 21px 11px;"
  on:click={handleTwitterAuth}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="24"
    fill="none"
    viewBox="0 0 512 512"
    id="twitter"
    ><script xmlns=""></script>
    <g clip-path="url(#clip0_84_15697)">
      <rect width="512" height="512" fill="#000" rx="60" />
      <path
        fill="#fff"
        d="M355.904 100H408.832L293.2 232.16L429.232 412H322.72L239.296 302.928L143.84 412H90.8805L214.56 270.64L84.0645 100H193.28L268.688 199.696L355.904 100ZM337.328 380.32H366.656L177.344 130.016H145.872L337.328 380.32Z"
      >
      </path>
    </g>
    <defs>
      <clipPath id="clip0_84_15697">
        <rect width="512" height="512" fill="#fff" />
      </clipPath>
    </defs>
    <script xmlns=""></script></svg
  >
  <div class="font-normal text-[15px]">Log in with X</div>
</div>

<style></style>

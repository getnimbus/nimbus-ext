<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { user, isDarkMode, triggerConnectWallet } from "~/store";
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
  import { auth } from "~/lib/firebase";
  import { useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";
  import { triggerToast } from "~/utils";

  import User from "~/assets/user.png";
  import Google from "~/assets/google.png";

  const queryClient = useQueryClient();
  const googleProvider = new GoogleAuthProvider();

  const handleGoogleAuth = async () => {
    mixpanel.track("user_login_google");
    try {
      googleProvider.addScope("email");
      googleProvider.addScope("profile");
      const res: any = await signInWithPopup(auth, googleProvider).then(
        (result) => result.user
      );
      if (res) {
        handleGetGoogleToken(
          res.uid,
          res?.reloadUserInfo?.providerUserInfo[0]?.rawId,
          "google",
          res?.reloadUserInfo?.providerUserInfo[0]?.email,
          res?.reloadUserInfo?.displayName
        );
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const handleGetGoogleToken = async (
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

        triggerToast("Login with Google successfully!", "success");
        queryClient?.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
        queryClient?.invalidateQueries(["link-socials"]);
      } else {
        triggerToast(res?.error, "fail");
      }
    } catch (e) {
      console.error("error: ", e);
      triggerToast(
        "There are some problem when login Google account. Please try again!",
        "fail"
      );
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-3 text-white border cursor-pointer rounded-[12px] w-[219px] h-[44px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  style="padding: 9px 21px 11px;"
  on:click={handleGoogleAuth}
>
  <img src={Google} class="h-[20px] w-[20px]" />
  <div class="font-normal text-[15px]">Log in with Google</div>
</div>

<style windi:preflights:global windi:safelist:global></style>

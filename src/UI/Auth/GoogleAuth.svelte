<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { user, isDarkMode } from "~/store";
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
  import { googleAuth } from "~/lib/firebase";
  import { useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";

  import User from "~/assets/user.png";
  import Google from "~/assets/google.png";

  export let handleCloseAuthModal = () => {};

  const queryClient = useQueryClient();
  const googleProvider = new GoogleAuthProvider();

  const handleGoogleAuth = async () => {
    mixpanel.track("user_login_google");
    try {
      const res = await signInWithPopup(googleAuth, googleProvider).then(
        (result) => {
          return result.user;
        }
      );
      if (res) {
        handleGetGoogleToken(res.uid, "google", res.email, res.displayName);
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const handleGetGoogleToken = async (uid, type, info, displayName) => {
    try {
      const res = await nimbus.post("/auth", {
        uid,
        type,
        info,
        displayName,
      });
      if (res?.data?.result) {
        handleCloseAuthModal();
        localStorage.setItem("auth_token", res?.data?.result);
        localStorage.setItem("socialAuthType", "google");
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        queryClient?.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] min-w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleGoogleAuth}
>
  <img src={Google} class="h-[24px]" />
  <div class="font-semibold text-[15px]">Login with Google</div>
</div>

<style>
</style>

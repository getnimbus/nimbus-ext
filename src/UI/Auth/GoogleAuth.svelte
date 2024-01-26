<script lang="ts">
  import { user, isDarkMode } from "~/store";
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
  import { googleAuth } from "~/lib/firebase";

  import Google from "~/assets/google.png";

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleAuth = async () => {
    await signInWithPopup(googleAuth, googleProvider)
      .then((result) => {
        const user = result.user;
        console.log("user: ", user);
      })
      .catch((error) => {
        console.error(error);
      });
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] min-w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleGoogleAuth}
>
  <img src={Google} alt="" width="22" height="22" />
  <div class="font-semibold text-[15px]">Login with Google</div>
</div>

<style>
</style>

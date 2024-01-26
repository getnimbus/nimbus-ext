<script lang="ts">
  import { isDarkMode } from "~/store";
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

  let checked = false;
  let isLinks = true;

  const handleRemoveGoogle = async () => {};
</script>

<div class="bg_f4f5f8 rounded-[10px] px-4 py-3 flex flex-col gap-2">
  <div class="flex justify-between items-center gap-4">
    <div class="font-medium xl:text-lg text-3xl">Google</div>
    {#if isLinks}
      <div
        class="cursor-pointer text-red-600 font-medium text-2xl xl:text-base"
        on:click={handleRemoveGoogle}
      >
        Remove
      </div>
    {/if}
  </div>

  {#if isLinks}
    <div class="flex items-center gap-2">
      <img src={Google} alt="" width="22" height="22" />
      <div class="xl:text-base text-2xl">binhq6@gmail.com</div>
    </div>
    <div class="mt-2 flex items-center justify-start gap-2">
      <input
        type="checkbox"
        bind:checked
        class="cursor-pointer relative w-5 h-5 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
      />
      <div class="text-lg xl:text-sm">Display Google on Nimbus</div>
    </div>
  {:else}
    <div
      class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] w-[250px] ${
        $isDarkMode
          ? "border-white text-white"
          : "border-[#27326f] text-[#27326f]"
      }`}
      on:click={handleGoogleAuth}
    >
      <img src={Google} alt="" width="22" height="22" />
      <div class="font-semibold text-[15px]">Connect with Google</div>
    </div>
  {/if}
</div>

<style></style>

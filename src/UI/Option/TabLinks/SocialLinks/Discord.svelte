<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { isDarkMode } from "~/store";
  import { triggerToast } from "~/utils/functions";
  import { useQueryClient } from "@tanstack/svelte-query";

  import Button from "~/components/Button.svelte";

  export let data: any;
  export let selectedDisplayName;
  export let handleUpdateSelectedDisplayName = (name) => {};

  const queryClient = useQueryClient();

  let checked = false;

  $: {
    if (selectedDisplayName === data?.name) {
      checked = true;
    } else {
      checked = false;
    }
  }

  const handleRedirectDiscordAuth = () => {
    window.location.assign(
      "https://discord.com/oauth2/authorize?client_id=1236967408204517396&response_type=code&redirect_uri=https%3A%2F%2Fapp.getnimbus.io&scope=identify+guilds+guilds.members.read"
    );
  };

  const handleDisplayName = async () => {
    try {
      checked = !checked;
      handleUpdateSelectedDisplayName(checked ? data?.name : "");
      await nimbus.put(
        `/users/displayName?name=${checked ? data?.name : ""}`,
        {}
      );
      queryClient.invalidateQueries(["users-me"]);
      triggerToast(
        `Successfully ${checked ? "set" : "unset"} display Discord account!`,
        "success"
      );
    } catch (e) {
      console.log(e);
      triggerToast(
        "There are some problem when set display Discord account. Please try again!",
        "fail"
      );
    }
  };
</script>

<div
  id="discord"
  class="max-w-[350px] md:w-[350px] w-full bg_f4f5f8 rounded-[10px] px-4 py-5 flex flex-col"
>
  <div class="flex flex-col gap-3">
    <div
      class={`p-4 rounded-[10px] shadow-sm bg-[#5865F2] w-max ${$isDarkMode ? "border border-white" : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 29 22"
        fill="none"
        ><script xmlns=""></script>
        <path
          d="M24.6361 1.96176C22.8237 1.13014 20.8801 0.517433 18.848 0.166511C18.811 0.159738 18.774 0.176664 18.755 0.210515C18.505 0.65509 18.2281 1.23507 18.0342 1.69094C15.8486 1.36372 13.6741 1.36372 11.5332 1.69094C11.3393 1.22494 11.0524 0.65509 10.8013 0.210515C10.7822 0.177793 10.7453 0.160868 10.7082 0.166511C8.67724 0.516312 6.73367 1.12902 4.9201 1.96176C4.9044 1.96853 4.89095 1.97983 4.88201 1.99449C1.19547 7.50211 0.185568 12.8744 0.68099 18.18C0.683232 18.206 0.697803 18.2308 0.717979 18.2466C3.15026 20.0328 5.50633 21.1172 7.81866 21.8359C7.85567 21.8472 7.89488 21.8337 7.91843 21.8032C8.46541 21.0562 8.95299 20.2686 9.37105 19.4404C9.39572 19.3919 9.37217 19.3343 9.32175 19.3151C8.54835 19.0218 7.81193 18.6641 7.10354 18.2579C7.04751 18.2251 7.04303 18.145 7.09457 18.1066C7.24364 17.9949 7.39275 17.8787 7.5351 17.7613C7.56085 17.7399 7.59673 17.7354 7.62701 17.7489C12.2808 19.8737 17.3191 19.8737 21.918 17.7489C21.9483 17.7343 21.9842 17.7388 22.0111 17.7602C22.1534 17.8776 22.3025 17.9949 22.4527 18.1066C22.5042 18.145 22.5009 18.2251 22.4449 18.2579C21.7365 18.6719 21 19.0218 20.2255 19.314C20.1751 19.3332 20.1527 19.3919 20.1773 19.4404C20.6044 20.2675 21.092 21.0551 21.6288 21.8021C21.6513 21.8337 21.6916 21.8472 21.7286 21.8359C24.0522 21.1172 26.4082 20.0328 28.8405 18.2466C28.8618 18.2308 28.8753 18.2071 28.8775 18.1811C29.4704 12.0472 27.8844 6.71902 24.6731 1.99561C24.6653 1.97983 24.6518 1.96853 24.6361 1.96176ZM10.066 14.9494C8.6649 14.9494 7.51042 13.6631 7.51042 12.0833C7.51042 10.5036 8.64252 9.21727 10.066 9.21727C11.5007 9.21727 12.644 10.5149 12.6216 12.0833C12.6216 13.6631 11.4895 14.9494 10.066 14.9494ZM19.5149 14.9494C18.1138 14.9494 16.9593 13.6631 16.9593 12.0833C16.9593 10.5036 18.0914 9.21727 19.5149 9.21727C20.9496 9.21727 22.0929 10.5149 22.0705 12.0833C22.0705 13.6631 20.9496 14.9494 19.5149 14.9494Z"
          fill="#fff"
        />
        <script xmlns=""></script></svg
      >
    </div>
    <div class="xl:text-lg text-xl">Discord</div>
  </div>

  <div class="flex flex-col gap-3">
    {#if data && Object.keys(data)?.length !== 0}
      <div class="xl:text-base text-lg text-gray-400">{data?.name}</div>
      <div class="flex items-center justify-start gap-2">
        <input
          type="checkbox"
          bind:checked
          on:change={handleDisplayName}
          class="cursor-pointer relative w-5 h-5 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
        />
        <div class="text-lg xl:text-sm">Display on Nimbus</div>
      </div>
    {:else}
      <div class="xl:text-base text-lg text-gray-400">@username</div>
      <Button
        variant="tertiary"
        on:click={handleRedirectDiscordAuth}
        className="py-3 px-6"
      >
        <div class="font-semibold text-[15px]">Connect</div>
      </Button>
    {/if}
  </div>
</div>

<style>
</style>

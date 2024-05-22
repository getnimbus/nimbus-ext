<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { userPublicAddress, user, isDarkMode } from "~/store";
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
  import { auth } from "~/lib/firebase";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { triggerFirework, triggerToast } from "~/utils";
  import { wait } from "~/entries/background/utils";
  import { handleGetDataDailyCheckin } from "~/lib/queryAPI";

  import Button from "~/components/Button.svelte";

  import Google from "~/assets/google.png";
  import goldImg from "~/assets/Gold4.svg";

  export let data: any;
  export let selectedDisplayName;
  export let handleUpdateSelectedDisplayName = (name) => {};

  const queryClient = useQueryClient();
  const googleProvider = new GoogleAuthProvider();

  let checked = false;

  let dataCheckinHistory = [];
  let openScreenBonusScore: boolean = false;
  let bonusScore: number = 0;

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
  };

  $: queryDailyCheckin = createQuery({
    queryKey: [$userPublicAddress, "daily-checkin"],
    queryFn: () => handleGetDataDailyCheckin(),
    staleTime: Infinity,
    enabled:
      $user &&
      Object.keys($user)?.length !== 0 &&
      $userPublicAddress?.length !== 0,
  });

  $: {
    if (!$queryDailyCheckin.isError && $queryDailyCheckin.data !== undefined) {
      dataCheckinHistory = $queryDailyCheckin?.data?.checkinLogs;
    }
  }

  $: {
    if (selectedDisplayName === data?.info) {
      checked = true;
    } else {
      checked = false;
    }
  }

  const handleGoogleAuth = async () => {
    try {
      googleProvider.addScope("email");
      googleProvider.addScope("profile");
      const res: any = await signInWithPopup(auth, googleProvider).then(
        (result) => result.user
      );
      if (res) {
        handleAddGoogle(
          res.uid,
          res?.reloadUserInfo?.providerUserInfo[0]?.rawId,
          res?.reloadUserInfo?.providerUserInfo[0]?.email,
          res?.reloadUserInfo?.displayName
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddGoogle = async (id, externalId, info, displayName) => {
    try {
      let params: any = {
        kind: "social",
        id,
        externalId,
        type: "google",
        info,
        displayName,
      };

      if (data && Object.keys(data)?.length === 0) {
        params = {
          ...params,
          userPublicAddress: $userPublicAddress,
        };
      }

      const response: any = await nimbus.post("/accounts/link", params);
      if (response && response?.error) {
        triggerToast(response?.error, "fail");
      } else {
        const quest = dataCheckinHistory?.find(
          (item) => item.type === "QUEST" && item.note === "link-google"
        );
        if (!quest) {
          handleAddBonusQuest();
        }

        queryClient.invalidateQueries(["link-socials"]);

        triggerToast("Successfully link Google account!", "success");
      }
    } catch (e) {
      console.log(e);
      triggerToast(
        "There are some problem when link Google account. Please try again!",
        "fail"
      );
    }
  };

  const handleAddBonusQuest = async () => {
    try {
      const res: any = await nimbus.post(`/v2/checkin/quest/link-google`, {});
      if (res && res?.data === null) {
        triggerToast("You are already finished this quest", "fail");
      }
      if (res?.data?.bonus !== undefined) {
        triggerBonusScore();
        bonusScore = res?.data?.bonus;
        queryClient?.invalidateQueries([$userPublicAddress, "daily-checkin"]);
        queryClient?.invalidateQueries(["users-me"]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisplayName = async () => {
    try {
      checked = !checked;
      handleUpdateSelectedDisplayName(checked ? data?.info : "");
      await nimbus.put(
        `/users/displayName?name=${checked ? data?.info : ""}`,
        {}
      );
      queryClient.invalidateQueries(["users-me"]);
      triggerToast(
        `Successfully ${checked ? "set" : "unset"} display Google account!`,
        "success"
      );
    } catch (e) {
      console.log(e);
      triggerToast(
        "There are some problem when set display Google account. Please try again!",
        "fail"
      );
    }
  };
</script>

<div
  id="google"
  class="max-w-[350px] md:w-[350px] w-full bg_f4f5f8 rounded-[10px] px-4 py-5 flex flex-col"
>
  <div class="flex flex-col gap-3">
    <div
      class={`p-4 rounded-[10px] shadow-sm bg-white w-max ${
        $isDarkMode ? "border border-white" : ""
      }`}
    >
      <img src={Google} alt="" width="26" height="26" />
    </div>
    <div class="xl:text-lg text-xl">Google</div>
  </div>

  <div class="flex flex-col gap-3">
    {#if data && Object.keys(data)?.length !== 0}
      <div class="xl:text-base text-lg text-gray-400">{data?.info}</div>
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
        on:click={handleGoogleAuth}
        className="py-3 px-6"
      >
        <div class="font-semibold text-[15px]">Connect</div>
      </Button>
    {/if}
  </div>
</div>

{#if openScreenBonusScore}
  <div
    class="fixed h-screen w-screen top-0 left-0 flex items-center justify-center bg-[#000000cc]"
    style="z-index: 2147483648;"
    on:click={() => {
      setTimeout(() => {
        openScreenBonusScore = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Congratulation!!!
      </div>
      <img src={goldImg} alt="" class="w-40 h-40" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have received {bonusScore} Bonus GM Points
      </div>
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>

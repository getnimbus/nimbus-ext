<script lang="ts">
  import { isDarkMode } from "~/store";

  import Button from "~/components/Button.svelte";
  import IconSocialMedia from "~/components/IconSocialMedia.svelte";
  import AppOverlay from "~/components/Overlay.svelte";

  export let isEdit;
  export let typeSocialMedia: "Twitter" | "Telegram";
  export let socialData;
  export let submitSocialData = (data) => {};

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let isOpenModal = false;
  let linkHref = "";
  let userName = socialData.username;
  let label = socialData.label;

  $: {
    if (typeSocialMedia) {
      switch (typeSocialMedia) {
        case "Twitter":
          linkHref = "https://twitter.com/";
          break;
        case "Telegram":
          linkHref = "https://t.me/";
          break;
        default:
          linkHref = "";
      }
    }
  }

  const onSubmitGetSocialInfo = () => {
    submitSocialData({
      label,
      username: userName,
      type: typeSocialMedia,
    });
    isOpenModal = false;
  };

  $: {
    if (Object.keys(socialData).length !== 0) {
      userName = socialData.username;
      label = socialData.label;
    }
  }
</script>

<div
  class="w-full h-full rounded-xl border border_0000001a p-5 flex flex-col gap-2"
>
  <IconSocialMedia type={typeSocialMedia} />

  <div class="flex flex-col mb-2">
    <div class="xl:text-base text-xl">
      {socialData.label || typeSocialMedia}
    </div>
    <div class="xl:text-sm text-lg text-gray-400">
      @{socialData?.username || "username"}
    </div>
  </div>

  {#if socialData?.username?.length !== 0}
    <div class="h-[40px]">
      {#if isEdit}
        <Button variant={typeSocialMedia} on:click={() => (isOpenModal = true)}>
          <div class="xl:text-base text-xl">Edit info</div>
        </Button>
      {:else}
        <Button variant={typeSocialMedia}>
          <a
            target="_blank"
            href={linkHref + socialData?.username}
            class="xl:text-base text-xl">Follow</a
          >
        </Button>
      {/if}
    </div>
  {:else}
    <div class="h-[40px]">
      {#if isEdit}
        <Button variant={typeSocialMedia} on:click={() => (isOpenModal = true)}>
          <div class="xl:text-base text-xl">Add info</div>
        </Button>
      {:else}
        <Button variant={typeSocialMedia} disabled>
          <div class="xl:text-base text-xl">Follow</div>
        </Button>
      {/if}
    </div>
  {/if}
</div>

<!-- Modal get user social info -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModal}
  on:close={() => {
    isOpenModal = false;
  }}
>
  <div class="flex flex-col gap-4">
    <div class="xl:title-3 title-1 font-semibold">
      Add your social information
    </div>
    <form
      on:submit|preventDefault={onSubmitGetSocialInfo}
      class="flex flex-col xl:gap-3 gap-10"
    >
      <div
        class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
          label && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
        }`}
      >
        <div class="xl:text-base text-2xl text-[#666666] font-medium">
          Label
        </div>
        <input
          type="text"
          id="label"
          name="label"
          placeholder="Your label"
          value={label}
          class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
            label && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
          }`}
          on:keyup={({ target: { value } }) => (label = value)}
        />
      </div>

      <div
        class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
          userName && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
        }`}
      >
        <div class="xl:text-base text-2xl text-[#666666] font-medium">
          Username
        </div>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Your username"
          value={userName}
          class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
            userName && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
          }`}
          on:keyup={({ target: { value } }) => (userName = value)}
        />
      </div>

      <div class="flex justify-end lg:gap-2 gap-6">
        <div class="xl:w-[120px] w-full">
          <Button
            variant="secondary"
            on:click={() => {
              isOpenModal = false;
              label = socialData?.label || "";
              userName = socialData?.username || "";
            }}
          >
            Cancel</Button
          >
        </div>
        <div class="xl:w-[120px] w-full">
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </form>
  </div>
</AppOverlay>

<style windi:preflights:global windi:safelist:global>
</style>

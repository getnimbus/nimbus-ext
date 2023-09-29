<script lang="ts">
  import Button from "~/components/Button.svelte";
  import IconSocialMedia from "~/components/IconSocialMedia.svelte";
  import AppOverlay from "~/components/Overlay.svelte";

  export let typeSocialMedia: "Twitter" | "Telegram" = "Twitter";
  let backgroundColor =
    typeSocialMedia == "Twitter" ? "bg-black" : "bg-[#2AABEE]";

  export let isEdit;
  export let socialData = {
    title: "",
    hashtag: "",
  };

  let userTypedUsername = false;
  let editTitle = false;
</script>

<div
  class={`${
    isEdit ? "col-span-2" : "col-span-1"
  } w-full h-full rounded-xl border p-5`}
>
  <div class="flex flex-col gap-3">
    <div>
      <IconSocialMedia type={typeSocialMedia} />
    </div>
    <div class="relative">
      {#if isEdit}
        <div>Add your Username</div>
        <span class="flex items-center pt-2 gap-1">
          @ <input
            type="text"
            name="username"
            id="username"
            value=""
            class="rounded-xl w-full"
            placeholder="Your Username"
            on:keyup={({ target: { value } }) => (socialData.hashtag = value)}
          />
        </span>
      {:else}
        <div
          on:mouseenter={() => (editTitle = true)}
          on:mouseleave={() => (editTitle = false)}
        >
          {#if editTitle}
            <input
              type="text"
              name="title"
              id="title"
              value=""
              class="rounded-xl w-full"
            />
          {:else}
            {typeSocialMedia}
          {/if}
        </div>
        <div>@ {socialData.hashtag}</div>
      {/if}
    </div>
    {#if userTypedUsername}
      <Button variant={typeSocialMedia}>
        <div
          class={`py-[7px] px-4 rounded-full w-32 text-center
        ${isEdit ? "hidden" : "block"}
      `}
        >
          Follow
        </div>
      </Button>
    {/if}
  </div>
</div>

<!-- ${typeSocialMedia == "twitter" ? "bg-black" : "bg-[#2AABEE]"} -->

<style windi:preflights:global windi:safelist:global>
</style>

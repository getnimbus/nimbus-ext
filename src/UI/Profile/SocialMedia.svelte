<script lang="ts">
  import Button from "~/components/Button.svelte";
  import IconSocialMedia from "~/components/IconSocialMedia.svelte";

  export let typeSocialMedia: "Twitter" | "Telegram" = "Twitter";

  let linkHref =
    typeSocialMedia === "Twitter" ? "https://twitter.com/" : "https://t.me/";

  export let newUser: boolean;
  export let isEdit = false;
  export let socialData = {
    title: "",
    username: "",
  };

  let userTypedUsername = false;
  let editTitle = false;

  if (newUser) {
    isEdit = true;
  }

  const handleSubmitSocialMedia = () => {
    socialData = {
      title: document.getElementById("title").value,
      username: document.getElementById("username").value,
    };
    isEdit = false;
  };
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
        <span class="pt-2">
          <form
            on:submit|preventDefault={handleSubmitSocialMedia}
            class="flex flex-col gap-3"
          >
            <input
              type="text"
              name="title"
              id="title"
              value=""
              class="rounded-xl w-full"
              placeholder="Your Username"
              on:keyup={({ target: { value } }) => (socialData.title = value)}
            />
            <span class="flex items-center gap-1">
              @<input
                type="text"
                name="username"
                id="username"
                value=""
                class="rounded-xl w-full"
                placeholder="Your Username"
                on:keyup={({ target: { value } }) =>
                  (socialData.username = value)}
              />
            </span>
            <input type="submit" hidden />
          </form>
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
            {socialData.title == "" ? typeSocialMedia : socialData.title}
          {/if}
        </div>
        <div>@ {socialData.username}</div>
      {/if}
    </div>
    {#if userTypedUsername || !isEdit}
      <Button variant={typeSocialMedia}>
        <a
          target="_blank"
          href={linkHref + socialData.username}
          class={`py-[7px] px-4 rounded-full w-32 text-center
        ${isEdit ? "hidden" : "block"}
      `}
        >
          Follow
        </a>
      </Button>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>

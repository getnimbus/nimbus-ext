<script>
  import AppOverlay from "~/components/Overlay.svelte";

  let socialData = {
    title: "Write your title",
    hashtag: "yourhashtag",
  };

  let openEdit = false;
  let buttonhover = false;

  const handleSubmitSocialMedia = (e) => {
    socialData = {
      title: document.getElementById("title").value,
      hashtag: "@" + document.getElementById("hashtag").value,
    };
    openEdit = false;
  };
</script>

<div class="col-span-1 w-full h-full rounded-xl border p-5">
  <div class="flex flex-col gap-3">
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 448 512"
      >
        <path
          fill="currentColor"
          d="M64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm297.1 84L257.3 234.6L379.4 396h-95.6L209 298.1L123.3 396H75.8l111-126.9L69.7 116h98l67.7 89.5l78.2-89.5h47.5zm-37.8 251.6L153.4 142.9h-28.3l171.8 224.7h26.3z"
        />
      </svg>
    </div>
    <div on:click={() => (openEdit = true)}>
      <div>
        <div>{socialData.title}</div>
        <div>@{socialData.hashtag}</div>
      </div>
    </div>
    <div
      class="bg-black text-white py-[7px] px-4 rounded-full w-32 text-center"
    >
      Follow
    </div>
  </div>
</div>

<AppOverlay
  clickOutSideToClose
  isOpen={openEdit}
  isTableContent
  on:close={() => {
    openEdit = false;
  }}
>
  <div>
    <form on:submit|preventDefault={handleSubmitSocialMedia}>
      <div class="flex gap-5">
        <input
          type="text"
          name="title"
          value={socialData.title}
          class="rounded-xl"
        />
        <span>
          @ <input
            type="text"
            name="hashtag"
            value={socialData.hashtag}
            class="rounded-xl"
          />
        </span>
        <button type="submit">Submit </button>
      </div>
    </form>
  </div>
</AppOverlay>

<style windi:preflights:global windi:safelist:global></style>

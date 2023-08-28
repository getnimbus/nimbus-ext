<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  export let data;
</script>

<div
  style="background: #a795fd1a;"
  class="rounded-[10px] py-5 px-4 flex items-start gap-3"
>
  <img src={data.logo} alt="logo" width={45} height={45} />
  <div class="flex flex-col gap-2">
    <div class="text-sm text_00000099 font-medium">
      <div contenteditable="false" bind:innerHTML={data.content} />
    </div>
    <div class="text-[#00000066] text-xs font-medium">
      {dayjs(data.updatedAt).fromNow()}
    </div>
  </div>
</div>

<style>
</style>

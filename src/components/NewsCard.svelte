<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { add3Dots, handleImgError } from "~/utils";

  export let data;

  import imgDefault from "~/assets/new-default-img.png";
</script>

<div class="flex flex-col gap-6">
  <a
    href={data.link}
    target="_blank"
    class="w-full h-[250px] overflow-hidden rounded-[10px]"
  >
    <img
      on:error={(e) => handleImgError(e, imgDefault)}
      class="w-full h-full object-cover"
      src={data.imgURL}
      alt={data.title}
    />
  </a>
  <div class="flex-1 flex flex-col justify-between">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <a
          href={data.link}
          target="_blank"
          class="xl:text-xl text-3xl font-medium cursor-pointer"
        >
          {data.title}
        </a>
        <div class="flex items-end gap-2">
          <div class="xl:text-sm text-2xl font-medium">
            By
            <span class="font-medium">{data?.source}</span>
          </div>
          <div class="xl:text-sm text-2xl text_00000080">
            {dayjs(new Date((Number(data?.feedDate) / 1000) * 1000)).fromNow()}
          </div>
        </div>
      </div>
      <div class="xl:text-sm text-2xl font-normal text_00000099">
        {add3Dots(data.description || "", 150)}
      </div>
    </div>
  </div>
</div>

<style>
</style>

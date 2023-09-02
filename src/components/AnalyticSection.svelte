<script lang="ts">
  import { isDarkMode } from "~/store";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });
</script>

<div class="flex flex-col gap-5">
  <slot name="title" />
  <div class="grid xl:grid-cols-6 grid-cols-1 gap-6">
    <div
      class={`xl:col-span-2 col-span-1 rounded-[20px] ${
        darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
      }`}
    >
      <slot name="overview" />
    </div>
    <div
      class={`xl:col-span-4 col-span-1 rounded-[20px] ${
        darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
      }`}
    >
      <slot name="chart" />
    </div>
  </div>
</div>

<style></style>

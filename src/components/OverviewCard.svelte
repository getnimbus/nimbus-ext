<script lang="ts">
  export let title;
</script>

<div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-1 bg-white">
  <div class="text-[#00000099] text-base font-medium">
    {title}
  </div>
  <slot />
</div>

<style></style>

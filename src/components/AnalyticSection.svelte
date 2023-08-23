<script lang="ts">
</script>

<div class="flex flex-col gap-5">
  <slot name="title" />
  <div class="grid xl:grid-cols-6 grid-cols-1 gap-6">
    <div
      class="xl:col-span-2 col-span-1 border border_0000001a rounded-[20px] p-6"
    >
      <slot name="overview" />
    </div>
    <div
      class="xl:col-span-4 col-span-1 border border_0000001a rounded-[20px] p-6"
    >
      <slot name="chart" />
    </div>
  </div>
</div>

<style></style>

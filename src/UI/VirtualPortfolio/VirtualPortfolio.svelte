<script lang="ts">
  export let selectedVirtualPortfolio;
</script>

<div class="flex flex-col gap-6">
  {selectedVirtualPortfolio?.name}
  <div class="grid xl:grid-cols-2 grid-cols-1 gap-6">
    <div class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4">
      Allocation
    </div>

    <div class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4">
      Performance
    </div>
  </div>

  <div class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4">
    Holding
  </div>
</div>

<style></style>

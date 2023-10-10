<script>
  import DailyCheckin from "~/UI/DailyCheckin/DailyCheckin.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col gap-2 justify-center">
      <div class="xl:text-5xl text-7xl font-semibold">My Nimbus GM Points</div>
      <div class="xl:text-xl text-3xl">
        Collect Nimbus GM Points and redeem them for exclusive rewards and
        special offers
      </div>
    </div>
    <DailyCheckin />
  </div>
</ErrorBoundary>

<style></style>

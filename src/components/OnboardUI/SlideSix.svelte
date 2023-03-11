<script>
  import Button from "~/components/Button.svelte";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="flex flex-col items-center gap-6">
    <div class="text-center title-1">
      Feedback is welcome (Email to subscribe)
    </div>
    <div>slide six</div>
    <Button width={300} on:click={() => console.log("HELLO WORLD")}>
      Open Nimbus
    </Button>
  </div>
</div>

<style>
</style>

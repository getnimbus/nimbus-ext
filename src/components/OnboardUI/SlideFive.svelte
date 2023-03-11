<script>
  import Button from "~/components/Button.svelte";

  export let skip = () => {};
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="flex flex-col items-center gap-6">
    <div class="text-center title-1">Add an address to watch the portfolio</div>
    <div>slide five</div>
    <div class="flex flex-col gap-2">
      <Button className="next" width={300}>Continue</Button>
      <Button variant="secondary" width={300} on:click={skip}>Skip</Button>
    </div>
  </div>
</div>

<style>
</style>

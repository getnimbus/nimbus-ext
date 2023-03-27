<script>
  import Button from "~/components/Button.svelte";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="flex flex-col items-center gap-6">
    <div class="flex-1">
      <div class="flex flex-col items-center gap-2">
        <div class="text-3xl text-black font-normal">
          You are ready to enjoy
        </div>
        <div class="text-sm text-black font-normal">
          Join us on Discord amd build Nimbus together. WAGMI
        </div>
      </div>
    </div>
    <Button on:click={() => console.log("HELLO WORLD")}>Open Nimbus</Button>
  </div>
</div>

<style>
</style>

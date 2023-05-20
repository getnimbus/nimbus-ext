<script lang="ts">
  import Button from "~/components/Button.svelte";
</script>

<div class="flex justify-center items-center h-screen">
  <div class="p-6 w-2/3 flex flex-col gap-5 justify-center items-center">
    <div class="flex flex-col justify-center items-center">
      <div class="text-lg">Thank you for purchase the Nimbus NFT card</div>
      <div class="text-sm text-gray-500">
        Your card will be added to profile soon
      </div>
    </div>
    <Button
      variant="secondary"
      on:click={() => {
        window.location.replace("http://localhost:5173");
      }}>Continue</Button
    >
  </div>
</div>

<style>
</style>

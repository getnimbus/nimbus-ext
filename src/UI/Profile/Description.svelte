<script>
  export let isEdit;
  export let description;
</script>

<div
  class="col-span-2 p-6 bg-dark-50 text-white xl:text-base text-xl rounded-xl"
>
  {#if isEdit}
    <textarea
      maxlength="300"
      rows="5"
      value={description}
      class="bg-dark-50 text-white xl:text-base text-xl rounded-lg border-0 outline-none w-full"
      on:keyup={({ target: { value } }) => (description = value)}
    />
  {:else}
    <div>{description}</div>
  {/if}
</div>

<style></style>

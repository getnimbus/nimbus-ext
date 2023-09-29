<script>
  export let isEdit;
  export let description;
</script>

<div
  class="col-span-2 py-2 px-3 bg-dark-50 text-white xl:text-base text-xl rounded-xl flex items-center justify-center"
>
  {#if isEdit}
    <textarea
      rows="5"
      value={description}
      class="bg-dark-50 text-white rounded-lg border-0 outline-none w-full text-center"
      on:keyup={({ target: { value } }) => (description = value)}
    />
  {:else}
    <div>{description}</div>
  {/if}
</div>

<style></style>

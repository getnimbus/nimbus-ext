<script>
  let isEdit = false;

  let dataInputText = "I believe blockchain isn't only for money";
</script>

<div
  class="col-span-2 py-2 px-3 h-16 bg-dark-50 text-white rounded-xl flex items-center justify-center"
  on:click={() => {
    isEdit = true;
  }}
>
  {#if !isEdit}
    <div>{dataInputText}</div>
  {:else}
    <form
      on:submit|preventDefault={(e) => {
        dataInputText = e.target[0].value;
        isEdit = false;
      }}
      class="w-full"
    >
      <input
        type="text"
        name="custom text"
        id="custom-text"
        placeholder={dataInputText}
        value={dataInputText}
        class="bg-dark-50 text-white rounded-lg border-0 outline-none w-full text-center"
      />
    </form>
  {/if}
</div>

<style></style>

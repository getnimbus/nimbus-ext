<svelte:options tag="address-spreadtext" />

<script>
  export let address;

  let addressSpreadWordArr = [];

  const groupText = (maxWords, words) => {
    const regexSpreadWord = new RegExp(`.{1,${maxWords}}`, "g");
    const stringArr = words.match(regexSpreadWord);
    return stringArr;
  };

  $: {
    if (address) {
      addressSpreadWordArr = groupText(6, address.toString());
    }
  }
</script>

<reset-style>
  <div
    class="rounded inline bg-white shadow font-sans transition-all overflow-hidden py-1 px-2"
  >
    <div class="address-wrapper font-medium">
      {#each addressSpreadWordArr as word}
        <span class="odd:text-gray-500 even:text-gray-800 text-base"
          >{word}</span
        >
      {/each}
    </div>
  </div>
</reset-style>

<style>
  .address-wrapper {
    display: inline-flex;
    /* gap: 8px; */
    animation-name: wordAnimation;
    animation-duration: 0.6s;
    animation-fill-mode: forwards;
    animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
    animation-delay: 0.2s;
  }

  @keyframes wordAnimation {
    0% {
      gap: 0;
    }
    100% {
      gap: 8px;
    }
  }
</style>

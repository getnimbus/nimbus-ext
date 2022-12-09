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

<div
  class={`rounded-lg bg-white shadow-xl font-sans text-base text-gray-400 transition-all overflow-hidden min-w-[350px] max-h-[600px] py-3 px-4`}
>
  <div class="address-wrapper">
    {#each addressSpreadWordArr as word}
      <span>{word}</span>
    {/each}
  </div>
</div>

<style>
  .address-wrapper {
    display: flex;
    gap: 6px;
  }

  .address-wrapper span {
    opacity: 0;
    display: inline-block;
    animation-name: wordAnimation;
    animation-duration: 3s;
    animation-fill-mode: forwards;
    animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
  }
  .address-wrapper span:nth-child(1) {
    animation-delay: 0.1s;
  }
  .address-wrapper span:nth-child(2) {
    animation-delay: 0.2s;
  }
  .address-wrapper span:nth-child(3) {
    animation-delay: 0.3s;
  }
  .address-wrapper span:nth-child(4) {
    animation-delay: 0.4s;
  }
  .address-wrapper span:nth-child(5) {
    animation-delay: 0.5s;
  }
  .address-wrapper span:nth-child(6) {
    animation-delay: 0.6s;
  }
  .address-wrapper span:nth-child(7) {
    animation-delay: 0.7s;
  }
  .address-wrapper span:nth-child(8) {
    animation-delay: 0.8s;
  }
  @keyframes wordAnimation {
    0% {
      opacity: 0;
      transform: translateX(-100px) skewY(10deg) skewX(10deg) rotateZ(30deg);
      filter: blur(10px);
    }
    100% {
      opacity: 1;
      transform: translateX(0px) skewY(0deg) skewX(0deg) rotateZ(0deg);
      filter: blur(0px);
    }
  }
</style>

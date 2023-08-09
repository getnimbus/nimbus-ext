<script lang="ts">
  import {
    netWorthFilter,
    sharpeRatioFilter,
    volatilityFilter,
    returnsFilter,
  } from "~/utils";

  import Button from "~/components/Button.svelte";

  export let closeModal = () => {};

  let searchValue = "";
  let timerSearchDebounce;

  const debounceSearch = (value) => {
    clearTimeout(timerSearchDebounce);
    timerSearchDebounce = setTimeout(() => {
      searchValue = value;
    }, 300);
  };
</script>

<div class="flex flex-col gap-4">
  <div class="xl:text-2xl text-4xl font-medium text-black">
    Filter whales list
  </div>
  <div class="flex flex-col gap-3">
    <div
      class={`border focus:outline-none w-full py-[6px] px-3 rounded-lg ${
        searchValue ? "bg-[#F0F2F7]" : "bg-white"
      }`}
    >
      <input
        on:keyup={({ target: { value } }) => debounceSearch(value)}
        on:keydown={(event) => {
          if ((event.which == 13 || event.keyCode == 13) && searchValue) {
            console.log("searchValue: ", searchValue);
          }
        }}
        value={searchValue}
        placeholder={"Filter by token name"}
        type="text"
        class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
          searchValue ? "bg-[#F0F2F7]" : ""
        }`}
      />
    </div>
    <div>hello</div>
    <div class="flex justify-end lg:gap-2 gap-6">
      <div class="lg:w-[120px] w-full">
        <Button
          variant="secondary"
          on:click={() => {
            closeModal();
            console.log("reset");
          }}
        >
          Reset
        </Button>
      </div>
      <div class="lg:w-[120px] w-full">
        <Button
          variant="tertiary"
          on:click={() => {
            console.log("submit");
          }}>Submit</Button
        >
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>

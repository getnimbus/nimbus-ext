<script lang="ts">
  import { Icon } from "flowbite-svelte-icons";
  import { isDarkMode } from "~/store";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  const handleSwitchDarkMode = () => {
    darkMode = !darkMode;
    isDarkMode.update((n) => (n = darkMode));
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    darkMode
      ? window.document.body.classList.add("dark")
      : window.document.body.classList.remove("dark");
  };

  $: selectedTypeMode = darkMode ? "dark" : "light";
</script>

<div class="w-max flex items-center gap-2">
  <input
    checked={darkMode}
    on:click={handleSwitchDarkMode}
    type="checkbox"
    id="theme-toggle"
    class="hidden"
  />
  <label for="theme-toggle" class="cursor-pointer">
    <div class="flex items-center justify-between gap-2">
      <div
        class={`${
          selectedTypeMode === "light" ? "text-[#3b82f6]" : "text-gray-300"
        }`}
      >
        <div class="xl:block hidden">
          <Icon
            name="sun-solid"
            role="img"
            class="select-none border-none focus:outline-none focus:ring-0"
            size="lg"
          />
        </div>
        <div class="xl:hidden block">
          <Icon
            name="sun-solid"
            role="img"
            class="select-none border-none focus:outline-none focus:ring-0"
            size="xl"
          />
        </div>
      </div>
      <div class="text-gray-500 mb-1 xl:text-base text-2xl">/</div>
      <div
        class={`${
          selectedTypeMode === "dark" ? "text-[#3b82f6]" : "text-gray-300"
        }`}
      >
        <div class="xl:block hidden">
          <Icon
            name="moon-solid"
            role="img"
            class="select-none border-none focus:outline-none focus:ring-0"
          />
        </div>
        <div class="xl:hidden block">
          <Icon
            name="moon-solid"
            role="img"
            class="select-none border-none focus:outline-none focus:ring-0"
            size="xl"
          />
        </div>
      </div>
    </div>
  </label>
</div>

<style></style>

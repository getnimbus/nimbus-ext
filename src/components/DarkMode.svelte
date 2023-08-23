<script lang="ts">
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { Icon } from "flowbite-svelte-icons";
  import { isDarkMode } from "~/store";

  const typeMode = [
    {
      value: "dark",
      icon: "moon-solid",
    },
    {
      value: "light",
      icon: "sun-solid",
    },
  ];

  let selectedTypeMode: "dark" | "light" = "light";
  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
    if (value) {
      selectedTypeMode = "dark";
    } else {
      selectedTypeMode = "light";
    }
  });

  const handleSwitchDarkMode = () => {
    darkMode = !darkMode;
    isDarkMode.update((n) => (n = darkMode));
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    darkMode
      ? window.document.body.classList.add("dark")
      : window.document.body.classList.remove("dark");
  };
</script>

<div class="w-max flex items-center gap-2">
  {#if darkMode}
    <div class="text-2xl xl:text-base text_00000066">Dark</div>
  {:else}
    <div class="text-2xl xl:text-base text_00000066">Light</div>
  {/if}
  <input
    checked={darkMode}
    on:click={handleSwitchDarkMode}
    type="checkbox"
    id="theme-toggle"
    class="hidden"
  />
  <label for="theme-toggle" class="cursor-pointer">
    <div
      class={`flex flex-row items-center justify-between p-1 gap-3 rounded-3xl ${
        darkMode ? "bg-[#283149]" : "bg-gray-200"
      }`}
    >
      <AnimateSharedLayout>
        {#each typeMode as type}
          <div
            class="relative rounded-full p-1 transition-all"
            on:click={() => (selectedTypeMode = type.value)}
          >
            <div
              class={`relative z-20 ${
                selectedTypeMode === type.value ? "text-white" : "text-gray-400"
              }`}
            >
              <Icon name={type.icon} />
            </div>
            {#if type.value === selectedTypeMode}
              <Motion
                let:motion
                layoutId="active-pill"
                transition={{ type: "spring", duration: 0.6 }}
              >
                <div
                  class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                  use:motion
                />
              </Motion>
            {/if}
          </div>
        {/each}
      </AnimateSharedLayout>
    </div>
  </label>
</div>

<style>
</style>

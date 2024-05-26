<script lang="ts">
  import { MoonSolid, SunSolid } from "flowbite-svelte-icons";
  import { isDarkMode, isAutoDarkMode } from "~/store";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let auto = false;
  isAutoDarkMode.subscribe((value) => {
    auto = value;
  });

  const handleSwitchDarkMode = () => {
    darkMode = !darkMode;
    isDarkMode.update((n) => (n = darkMode));
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    darkMode
      ? window.document.body.classList.add("dark")
      : window.document.body.classList.remove("dark");

    auto = false;
    isAutoDarkMode.update((n) => (n = false));
    localStorage.setItem("auto_theme", "false");
  };

  const handleToggleAuto = () => {
    auto = !auto;
    isAutoDarkMode.update((n) => (n = auto));
    localStorage.setItem("auto_theme", auto ? "true" : "false");
    if (auto) {
      checkSystemTheme();
    }
  };

  const checkSystemTheme = () => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) {
      window.document.body.classList.add("dark");
      isDarkMode.update((n) => (n = true));
      localStorage.setItem("theme", "dark");
      selectedTypeMode = "dark";
    } else {
      window.document.body.classList.remove("dark");
      isDarkMode.update((n) => (n = false));
      localStorage.setItem("theme", "light");
      selectedTypeMode = "light";
    }
  };

  $: selectedTypeMode = darkMode ? "dark" : "light";
</script>

<div class="w-max flex items-center xl:gap-1 gap-2">
  <input
    checked={darkMode}
    on:click={handleSwitchDarkMode}
    type="checkbox"
    id="theme-toggle"
    class="hidden"
  />
  <div
    class={`cursor-pointer font-medium xl:text-base text-xl ${auto ? "text-[#3b82f6]" : "text-gray-300"}`}
    on:click={handleToggleAuto}
  >
    Auto
  </div>
  <div class="text-gray-300 mb-1 xl:text-base text-xl">/</div>
  <label
    for="theme-toggle"
    class={`cursor-pointer ${auto ? "opacity-40" : "opacity-100"}`}
  >
    <div class="flex items-center justify-between xl:gap-1 gap-2">
      <div
        class={`${
          selectedTypeMode === "light" ? "text-[#3b82f6]" : "text-gray-300"
        }`}
      >
        <div class="xl:block hidden">
          <SunSolid
            size="lg"
            class="select-none border-none focus:outline-none focus:ring-0"
          />
        </div>
        <div class="xl:hidden block">
          <SunSolid
            size="xl"
            class="select-none border-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      <div class="text-gray-300 mb-1 xl:text-lg text-xl">/</div>
      <div
        class={`${
          selectedTypeMode === "dark" ? "text-[#3b82f6]" : "text-gray-300"
        }`}
      >
        <div class="xl:block hidden">
          <MoonSolid
            size="md"
            class="select-none border-none focus:outline-none focus:ring-0"
          />
        </div>
        <div class="xl:hidden block">
          <MoonSolid
            size="lg"
            class="select-none border-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  </label>
</div>

<style windi:preflights:global windi:safelist:global></style>

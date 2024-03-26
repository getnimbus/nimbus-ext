<script lang="ts">
  import { Icon } from "flowbite-svelte-icons";
  import { isDarkMode, isAutoDarkMode } from "~/store";
  import dayjs from "dayjs";

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
      checkTimeZone();
    }
  };

  const checkTimeZone = () => {
    const currentHour = dayjs().hour();
    const isDark = currentHour >= 18 || currentHour < 6; // Assuming 6 PM to 6 AM as night
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

<div class="w-max flex items-center gap-2">
  <input
    checked={darkMode}
    on:click={handleSwitchDarkMode}
    type="checkbox"
    id="theme-toggle"
    class="hidden"
  />
  <div
    class={`cursor-pointer font-medium xl:text-lg text-2xl ${auto ? "text-[#3b82f6]" : "text-gray-300"}`}
    on:click={handleToggleAuto}
  >
    Auto
  </div>
  <div class="text-gray-300 mb-1 xl:text-lg text-2xl">/</div>
  <label
    for="theme-toggle"
    class={`cursor-pointer ${auto ? "opacity-40" : "opacity-100"}`}
  >
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
      <div class="text-gray-300 mb-1 xl:text-lg text-2xl">/</div>
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

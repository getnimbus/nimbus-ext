<script lang="ts">
  import { MoonSolid, SunSolid } from "flowbite-svelte-icons";
  import { isDarkMode, isAutoDarkMode } from "~/store";

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
</script>

<div class="w-max flex items-center gap-1">
  <input
    checked={darkMode}
    on:click={handleSwitchDarkMode}
    type="checkbox"
    id="theme-toggle"
    class="hidden"
  />
  <div
    class={`cursor-pointer font-medium text-base ${auto ? "text-[#3b82f6]" : "text-gray-300"}`}
    on:click={handleToggleAuto}
  >
    Auto
  </div>
  <div class="text-gray-300 mb-1 text-base">/</div>
  <label
    for="theme-toggle"
    class={`cursor-pointer ${auto ? "opacity-40" : "opacity-100"}`}
  >
    <div class="flex items-center justify-between gap-1">
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
      <div class="text-gray-300 mb-1 xl:text-lg text-2xl">/</div>
      <div
        class={`${
          selectedTypeMode === "dark" ? "text-[#3b82f6]" : "text-gray-300"
        }`}
      >
        <div class="xl:block hidden">
          <MoonSolid
            class="select-none border-none focus:outline-none focus:ring-0"
          />
        </div>
        <div class="xl:hidden block">
          <MoonSolid
            size="xl"
            class="select-none border-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  </label>
</div>

<style>
  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 34px;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }
  input:checked + .slider {
    background-color: #2196f3;
  }
  input:checked + .slider {
    box-shadow: 0 0 1px #2196f3;
  }
  input:checked + .slider:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
  }
</style>

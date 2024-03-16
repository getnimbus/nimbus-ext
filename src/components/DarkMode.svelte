<script lang="ts">
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { Icon } from "flowbite-svelte-icons";
  import { isDarkMode, isAutoDarkMode } from "~/store";
  import dayjs from "dayjs";

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
</script>

<div class="w-max flex items-center gap-2">
  <div class="text-2xl xl:text-base text_00000066">Auto Theme</div>
  <label class="switch">
    <input type="checkbox" checked={auto} on:change={handleToggleAuto} />
    <span class="slider" />
  </label>
</div>
<div
  class={`w-max flex items-center gap-2 ${auto ? "opacity-50" : "opacity-100"}`}
>
  {#if darkMode}
    <div class="text-2xl xl:text-base text_00000066">Dark</div>
  {:else}
    <div class="text-2xl xl:text-base text_00000066">Light</div>
  {/if}
  <input
    checked={darkMode}
    on:click={handleSwitchDarkMode}
    disabled={auto}
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
            on:click={() => {
              if (!auto) {
                selectedTypeMode = type.value;
              }
            }}
          >
            <div
              class={`relative z-20 ${
                selectedTypeMode === type.value ? "text-white" : "text-gray-400"
              }`}
            >
              <Icon
                name={type.icon}
                role="img"
                class="select-none border-none focus:outline-none focus:ring-0"
              />
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

<script lang="ts">
  import classNames from "classnames";

  export let variant:
    | "primary"
    | "secondary"
    | "no-outlined"
    | "underlined"
    | "" = "primary";
  export let width: number = 200;
  export let className: string = "";
  export let disabled: boolean = false;
  export let isLoading: boolean = false;
  export let size: "small" | "medium" | "large" = "small";
  export let type: "button" | "submit" | "reset" = "button";

  const buttonClassName = classNames(className, "button", "container", {
    ["disabled"]: disabled,
    ["underlined"]: variant === "underlined",
    ["secondary"]: variant === "secondary",
    ["no_outlined"]: variant === "no-outlined",
    ["large"]: size === "large",
    ["small"]: size === "small",
    ["loading"]: isLoading,
  });
</script>

<button
  on:click
  on:mouseover
  on:mouseenter
  on:mouseleave
  {type}
  class={buttonClassName}
  style="width: {width}px;"
  disabled={disabled || isLoading}
>
  {#if isLoading}
    <svg
      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  {:else}
    <slot />
  {/if}
</button>

<style>
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    min-width: 200px;
    width: 100%;
    color: rgb(56 189 248);
    font-weight: 700;
    font-size: 16px;
    border-radius: 8px;
    padding: 8px 12px;
    gap: 6px;
  }

  .button[type="submit"],
  .button[type="button"] {
    background-color: rgb(224 242 254);
  }

  .button:hover {
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  }

  .button .container {
    height: 22px;
    min-width: max-content;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .small {
    height: fit-content;
    font-size: 14px;
    padding: 6px 9px;
  }

  .large {
    height: fit-content;
    min-width: 130px;
    font-size: 18px;
    padding: 14px 22px;
  }

  .secondary {
    color: rgb(56 189 248);
    border: 1px solid rgb(224 242 254);
  }
  .secondary[type="submit"],
  .secondary[type="button"] {
    background-color: white;
  }

  .no_outlined {
    color: rgb(56 189 248);
    border: none;
  }
  .no_outlined[type="submit"],
  .no_outlined[type="button"] {
    background-color: white;
  }

  .disabled {
    color: #7f859f;
    border: 1px solid transparent;
  }
  .disabled[type="submit"],
  .disabled[type="button"] {
    background-color: #e2e4e9;
  }
  .disabled:hover {
    box-shadow: none;
  }

  .loading {
    cursor: wait;
    opacity: 0.5;
  }

  .underlined {
    color: rgb(56 189 248);
    border: none;
    text-decoration: underline;
  }
  .underlined[type="submit"],
  .underlined[type="button"] {
    background-color: white;
  }
  .underlined:hover {
    box-shadow: none;
  }
</style>

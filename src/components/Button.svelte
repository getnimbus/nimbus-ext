<script lang="ts">
  import classNames from "classnames";

  export let variant:
    | "primary"
    | "secondary"
    | "tertiary"
    | "no-outlined"
    | "underlined"
    | "delete"
    | "disabled"
    | "" = "primary";
  export let width: number = 200;
  export let className: string = "";
  export let disabled: boolean = false;
  export let isLoading: boolean = false;
  export let size: "supper-small" | "small" | "medium" | "large" = "small";
  export let type: "button" | "submit" | "reset" = "button";

  const buttonClassName = classNames(className, "button", "container", {
    ["disabled"]: disabled || variant === "disabled",
    ["underlined"]: variant === "underlined",
    ["secondary"]: variant === "secondary",
    ["tertiary"]: variant === "tertiary",
    ["no_outlined"]: variant === "no-outlined",
    ["delete"]: variant === "delete",
    ["large"]: size === "large",
    ["small"]: size === "small",
    ["supper-small"]: size === "supper-small",
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
    height: 44px;
    width: 100%;
    color: #ffffff;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    border-radius: 12px;
    padding: 10px 16px;
    gap: 6px;
    cursor: pointer;
  }

  .button[type="submit"],
  .button[type="button"] {
    background: #27326f;
  }

  .button .container {
    height: 44px;
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

  .supper-small {
    height: fit-content;
    font-size: 12px;
    padding: 4px 7px;
  }

  .large {
    height: fit-content;
    min-width: 130px;
    font-size: 18px;
    padding: 14px 22px;
  }

  .secondary {
    color: #27326f;
    border: 1px solid #27326f;
  }
  .secondary[type="submit"],
  .secondary[type="button"] {
    background: #fff;
  }

  .tertiary {
    color: #fff;
    border: none;
    width: max-content;
    height: max-content;
    padding: 8px 16px;
  }
  .tertiary[type="submit"],
  .tertiary[type="button"] {
    color: #fff;
    background: #1e96fc;
  }

  .delete {
    color: #fff;
    border: none;
  }
  .delete[type="submit"],
  .delete[type="button"] {
    background: red;
  }

  .no_outlined {
    color: #27326f;
    border: none;
  }
  .no_outlined[type="submit"],
  .no_outlined[type="button"] {
    background: #fff;
  }

  .disabled {
    color: #fff;
    border: 1px solid transparent;
  }
  .disabled[type="submit"],
  .disabled[type="button"] {
    background: #dddddd;
  }

  .loading {
    cursor: wait;
    opacity: 0.5;
  }

  .underlined {
    color: #27326f;
    border: none;
    text-decoration: underline;
  }
  .underlined[type="submit"],
  .underlined[type="button"] {
    background: #fff;
  }
</style>

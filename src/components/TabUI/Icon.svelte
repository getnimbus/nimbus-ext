<script>
  export let type;
  export let active;

  $: color = active ? "#0ea5e9" : "#000000";
</script>

{#if type === "Accounts"}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill={color}
    viewBox="0 0 256 256"
    ><rect width="256" height="256" fill="none" /><circle
      cx="88"
      cy="108"
      r="52"
      fill="none"
      stroke={color}
      stroke-miterlimit="10"
      stroke-width="16"
    /><path
      d="M155.4,57.9A54.5,54.5,0,0,1,169.5,56a52,52,0,0,1,0,104"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /><path
      d="M16,197.4a88,88,0,0,1,144,0"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /><path
      d="M169.5,160a87.9,87.9,0,0,1,72,37.4"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /></svg
  >
{:else if type === "Dashboard"}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill={color}
    viewBox="0 0 256 256"
    ><rect width="256" height="256" fill="none" /><rect
      x="48"
      y="48"
      width="64"
      height="64"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /><rect
      x="144"
      y="48"
      width="64"
      height="64"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /><rect
      x="48"
      y="144"
      width="64"
      height="64"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /><rect
      x="144"
      y="144"
      width="64"
      height="64"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /></svg
  >
{:else if type === "Highlight"}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill={color}
    viewBox="0 0 256 256"
    ><rect width="256" height="256" fill="none" /><path
      d="M96,216H48a8,8,0,0,1-8-8V163.3a7.9,7.9,0,0,1,2.3-5.6l120-120a8,8,0,0,1,11.4,0l44.6,44.6a8,8,0,0,1,0,11.4Z"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /><line
      x1="216"
      y1="216"
      x2="96"
      y2="216"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /><line
      x1="136"
      y1="64"
      x2="192"
      y2="120"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /></svg
  >
{:else if type === "Notification"}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill={color}
    viewBox="0 0 256 256"
    ><rect width="256" height="256" fill="none" /><path
      d="M56.2,104a71.9,71.9,0,0,1,72.3-72c39.6.3,71.3,33.2,71.3,72.9V112c0,35.8,7.5,56.6,14.1,68a8,8,0,0,1-6.9,12H49a8,8,0,0,1-6.9-12c6.6-11.4,14.1-32.2,14.1-68Z"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /><path
      d="M96,192v8a32,32,0,0,0,64,0v-8"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /></svg
  >
{:else if type === "Settings"}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill={color}
    viewBox="0 0 256 256"
    ><rect width="256" height="256" fill="none" /><circle
      cx="128"
      cy="128"
      r="48"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /><path
      d="M197.4,80.7a73.6,73.6,0,0,1,6.3,10.9L229.6,106a102,102,0,0,1,.1,44l-26,14.4a73.6,73.6,0,0,1-6.3,10.9l.5,29.7a104,104,0,0,1-38.1,22.1l-25.5-15.3a88.3,88.3,0,0,1-12.6,0L96.3,227a102.6,102.6,0,0,1-38.2-22l.5-29.6a80.1,80.1,0,0,1-6.3-11L26.4,150a102,102,0,0,1-.1-44l26-14.4a73.6,73.6,0,0,1,6.3-10.9L58.1,51A104,104,0,0,1,96.2,28.9l25.5,15.3a88.3,88.3,0,0,1,12.6,0L159.7,29a102.6,102.6,0,0,1,38.2,22Z"
      fill="none"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    /></svg
  >
{/if}

<style>
</style>

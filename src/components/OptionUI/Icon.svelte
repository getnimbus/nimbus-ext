<script>
  export let type;
  export let active;

  $: color = active ? "#3f83f8" : "#000000";
</script>

{#if type === "Wallets"}
  <svg
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    fill={color}
    viewBox="0 0 64.000000 64.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g
      transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)"
      fill={color}
      stroke="none"
    >
      <path
        d="M261 585 c-170 -18 -206 -25 -218 -40 -10 -15 -13 -72 -13 -245 0
-218 1 -228 21 -246 20 -18 39 -19 269 -19 230 0 249 1 269 19 20 18 21 29 21
198 0 165 -1 179 -20 198 -11 11 -29 20 -40 20 -17 0 -20 7 -20 48 0 52 -13
77 -45 85 -11 2 -112 -6 -224 -18z m237 -17 c7 -7 12 -31 12 -55 l0 -43 -214
0 c-118 0 -221 -3 -230 -6 -12 -5 -16 1 -16 24 0 16 6 35 14 41 13 11 291 47
382 50 22 0 45 -4 52 -11z m72 -138 c12 -12 20 -33 20 -55 l0 -35 -75 0 c-112
0 -145 -21 -145 -95 0 -25 8 -40 31 -59 27 -23 39 -26 110 -26 l79 0 0 -28 c0
-15 -7 -38 -16 -50 -15 -22 -18 -22 -254 -22 -236 0 -239 0 -254 22 -13 18
-16 53 -16 175 0 209 -23 193 270 193 217 0 231 -1 250 -20z m20 -180 l0 -60
-79 0 c-58 0 -84 4 -95 15 -25 25 -29 54 -12 80 15 23 22 25 101 25 l85 0 0
-60z"
      />
    </g>
  </svg>
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

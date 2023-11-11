<script>
  export let type;
  export let active;
  export let darkMode;

  $: color = active ? "#3f83f8" : darkMode ? "#d1d5db" : "#9ca3af";
</script>

{#if type === "Accounts"}
  <svg
    width="23"
    height="23"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6V17C3 18.6569 4.34315 20 6 20H20C20.5523 20 21 19.5523 21 19V16M19 8H5C3.89543 8 3 7.10457 3 6V6C3 4.89543 3.89543 4 5 4H18C18.5523 4 19 4.44772 19 5V8ZM19 8H20C20.5523 8 21 8.44772 21 9V12M21 12H18C16.8954 12 16 12.8954 16 14V14C16 15.1046 16.8954 16 18 16H21M21 12V16"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{:else if type === "NFT"}
  <svg
    width="24"
    height="24"
    fill={color}
    viewBox="0 0 32 32"
    id="icon"
    xmlns="http://www.w3.org/2000/svg"
    ><defs
      ><style>
        .cls-1 {
          fill: none;
        }
      </style></defs
    ><title>ticket</title><path
      d="M29,14a1,1,0,0,0,1-1V8a2,2,0,0,0-2-2H4A2,2,0,0,0,2,8v5a1,1,0,0,0,1,1,2,2,0,0,1,0,4,1,1,0,0,0-1,1v5a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V19a1,1,0,0,0-1-1,2,2,0,0,1,0-4Zm-1,5.87V24H21V21H19v3H4V19.87a4,4,0,0,0,0-7.74V8H19v3h2V8h7v4.13a4,4,0,0,0,0,7.74Z"
      transform="translate(0 0)"
    /><rect x="19" y="13" width="2" height="6" /><rect
      id="_Transparent_Rectangle_"
      data-name="&lt;Transparent Rectangle&gt;"
      class="cls-1"
      width="32"
      height="32"
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
{:else if type === "Reports"}
  <svg
    width="22"
    height="28"
    viewBox="0 0 22 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.67717 10.8061C7.86538 10.8061 8.04589 10.8809 8.17897 11.0139C8.31205 11.147 8.38682 11.3275 8.38682 11.5157V20.0315C8.38682 20.2197 8.31205 20.4002 8.17897 20.5333C8.04589 20.6664 7.86538 20.7411 7.67717 20.7411C7.48897 20.7411 7.30846 20.6664 7.17538 20.5333C7.0423 20.4002 6.96753 20.2197 6.96753 20.0315V11.5157C6.96753 11.3275 7.0423 11.147 7.17538 11.0139C7.30846 10.8809 7.48897 10.8061 7.67717 10.8061ZM11.2254 10.8061C11.4136 10.8061 11.5941 10.8809 11.7272 11.0139C11.8603 11.147 11.935 11.3275 11.935 11.5157V20.0315C11.935 20.2197 11.8603 20.4002 11.7272 20.5333C11.5941 20.6664 11.4136 20.7411 11.2254 20.7411C11.0372 20.7411 10.8567 20.6664 10.7236 20.5333C10.5905 20.4002 10.5158 20.2197 10.5158 20.0315V11.5157C10.5158 11.3275 10.5905 11.147 10.7236 11.0139C10.8567 10.8809 11.0372 10.8061 11.2254 10.8061ZM15.4833 11.5157C15.4833 11.3275 15.4085 11.147 15.2754 11.0139C15.1423 10.8809 14.9618 10.8061 14.7736 10.8061C14.5854 10.8061 14.4049 10.8809 14.2718 11.0139C14.1388 11.147 14.064 11.3275 14.064 11.5157V20.0315C14.064 20.2197 14.1388 20.4002 14.2718 20.5333C14.4049 20.6664 14.5854 20.7411 14.7736 20.7411C14.9618 20.7411 15.1423 20.6664 15.2754 20.5333C15.4085 20.4002 15.4833 20.2197 15.4833 20.0315V11.5157Z"
      fill={color}
    />
    <path
      d="M20.4508 7.25787C20.4508 7.63429 20.3013 7.9953 20.0351 8.26146C19.7689 8.52763 19.4079 8.67717 19.0315 8.67717H18.3218V21.4508C18.3218 22.2036 18.0228 22.9256 17.4904 23.458C16.9581 23.9903 16.2361 24.2894 15.4833 24.2894H6.96752C6.21468 24.2894 5.49268 23.9903 4.96034 23.458C4.428 22.9256 4.12894 22.2036 4.12894 21.4508V8.67717H3.41929C3.04287 8.67717 2.68187 8.52763 2.4157 8.26146C2.14953 7.9953 2 7.63429 2 7.25787V5.83858C2 5.46216 2.14953 5.10116 2.4157 4.83499C2.68187 4.56882 3.04287 4.41929 3.41929 4.41929H8.38681C8.38681 4.04287 8.53634 3.68187 8.80251 3.4157C9.06868 3.14953 9.42968 3 9.8061 3H12.6447C13.0211 3 13.3821 3.14953 13.6483 3.4157C13.9144 3.68187 14.064 4.04287 14.064 4.41929H19.0315C19.4079 4.41929 19.7689 4.56882 20.0351 4.83499C20.3013 5.10116 20.4508 5.46216 20.4508 5.83858V7.25787ZM5.7157 8.67717L5.54823 8.7609V21.4508C5.54823 21.8272 5.69776 22.1882 5.96393 22.4544C6.2301 22.7205 6.5911 22.8701 6.96752 22.8701H15.4833C15.8597 22.8701 16.2207 22.7205 16.4869 22.4544C16.753 22.1882 16.9026 21.8272 16.9026 21.4508V8.7609L16.7351 8.67717H5.7157ZM3.41929 7.25787H19.0315V5.83858H3.41929V7.25787Z"
      fill={color}
    />
  </svg>
{:else if type === "Alerts"}
  <svg
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    stroke={color}
  >
    <path
      d="M9.61249 21.9553C9.87859 22.4208 10.2621 22.8084 10.7247 23.0794C11.1873 23.3504 11.7129 23.4954 12.249 23.4999C12.7852 23.5044 13.3131 23.3683 13.7803 23.1051C14.2474 22.8419 14.6373 22.4609 14.9112 21.9999"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M19.7375 11.5V8.425C19.7375 4.45 16.25 1 12.2375 1C10.2622 1.04393 8.37994 1.84821 6.98283 3.24533C5.58571 4.64244 4.78143 6.52467 4.7375 8.5V11.5C4.7375 14.9125 2 15.4375 2 17.35C2 19.075 5.9375 20.425 12.2375 20.425C18.5375 20.425 22.475 19.075 22.475 17.35C22.475 15.4375 19.7375 14.9125 19.7375 11.5Z"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/if}

<style>
</style>

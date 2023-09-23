<script>
  export let type;
  export let active;
  export let darkMode;

  $: color = active ? "#3f83f8" : darkMode ? "#ffffff" : "#000000";
</script>

{#if type === "Wallets"}
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
{:else if type === "Report Tokens"}
  <svg
    width="29"
    height="31"
    viewBox="0 0 29 31"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="29" height="31" fill="none" />
    <path
      d="M0 0L2.18192 24.3789H19.8178L22 0H0ZM1.73505 3.1365H4.97254L5.12796 6.48161H2.03436L1.73505 3.1365ZM2.11578 7.38996H5.17015L5.36946 11.6801H2.49965L2.11578 7.38996ZM2.59317 12.7235H5.41808L5.61744 17.0136H2.97704L2.59317 12.7235ZM3.40581 21.8067L3.05822 17.9219H5.65958L5.84004 21.8067H3.40581ZM10.5457 21.8067H6.74992L6.56951 17.9219H10.5457V21.8067ZM10.5457 17.0136H6.52732L6.32781 12.7235H10.5457V17.0136ZM10.5457 11.6801H6.27934L6.08002 7.38996H10.5457V11.6801ZM10.5457 6.48166H6.03784L5.88242 3.13655H10.5457V6.48166ZM15.2498 21.8067H11.4542V17.9219H15.4305L15.2498 21.8067ZM15.4727 17.0136H11.4542V12.7235H15.672L15.4727 17.0136ZM15.7207 11.6801H11.4542V7.38996H15.9198L15.7207 11.6801ZM15.9622 6.48166H11.4542V3.1365H16.1174L15.9622 6.48166ZM18.5938 21.8067H16.1601L16.3404 17.9219H18.9415L18.5938 21.8067ZM19.023 17.0136H16.3826L16.5819 12.7235H19.4068L19.023 17.0136ZM19.5 11.6801H16.6305L16.8299 7.38996H19.8838L19.5 11.6801ZM16.872 6.48166L17.0273 3.13655H20.2646L19.9652 6.48166H16.872Z"
      fill={color}
    />
    <g clip-path="url(#clip0_0_1)">
      <rect
        x="5"
        y="7"
        width="24"
        height="24"
        rx="12"
        fill={darkMode ? "#374151" : "white"}
      />
      <path
        d="M17 7C10.3726 7 5 12.3726 5 19C5 25.6274 10.3726 31 17 31C23.6249 30.9931 28.9931 25.6249 29 19C29 12.3726 23.6274 7 17 7ZM17 29.2857C11.3197 29.2857 6.71429 24.6803 6.71429 19C6.71429 13.3197 11.3197 8.71429 17 8.71429C22.6777 8.72029 27.2797 13.3223 27.2857 19C27.2857 24.6803 22.6803 29.2857 17 29.2857Z"
        fill={color}
      />
      <path
        d="M17 10.4286C12.266 10.4286 8.42856 14.266 8.42856 19C8.42856 23.734 12.266 27.5714 17 27.5714C21.7314 27.5663 25.5663 23.7314 25.5714 19C25.5714 14.266 21.734 10.4286 17 10.4286ZM17 25.8571C13.2131 25.8571 10.1428 22.7868 10.1428 19C10.1428 15.2131 13.2131 12.1428 17 12.1428C20.7851 12.1471 23.8528 15.2148 23.8571 19C23.8571 22.7868 20.7868 25.8571 17 25.8571Z"
        fill={color}
      />
      <path
        d="M20.6411 17.9097L19.6563 17.374C19.2234 17.1392 18.866 16.7843 18.6277 16.3532L18.0886 15.37C17.9746 15.1635 17.8048 14.9929 17.5983 14.8797C16.9974 14.5497 16.2423 14.7692 15.9114 15.37L15.3714 16.3523C15.134 16.7843 14.7774 17.1383 14.3446 17.3732L13.3588 17.9097C13.148 18.0246 12.9748 18.1977 12.86 18.4077C12.5326 19.0103 12.7563 19.7637 13.3588 20.0912L14.3428 20.6269C14.7766 20.8617 15.1331 21.2157 15.3714 21.6477L15.9114 22.6309C16.13 23.0277 16.5474 23.2746 17 23.2746C17.4534 23.2746 17.87 23.0269 18.0886 22.63L18.6286 21.6477C18.866 21.2166 19.2226 20.8626 19.6554 20.6277L20.6411 20.0912C20.852 19.9763 21.0251 19.8032 21.14 19.5923C21.4666 18.9906 21.2437 18.2372 20.6411 17.9097ZM18.8308 19.1217C18.1108 19.5135 17.5186 20.104 17.1243 20.8223L16.9983 21.052L16.8731 20.8223C16.478 20.1032 15.8857 19.5135 15.1648 19.1217L14.9428 19L15.1674 18.8783C15.8874 18.4866 16.4797 17.896 16.874 17.1777L17 16.948L17.1277 17.1777C17.5228 17.896 18.1151 18.4866 18.8351 18.8783L19.0571 19L18.8308 19.1217Z"
        fill={color}
      />
    </g>
    <defs>
      <clipPath id="clip0_0_1">
        <rect x="5" y="7" width="24" height="24" rx="12" fill="white" />
      </clipPath>
    </defs>
  </svg>
{/if}

<style>
</style>

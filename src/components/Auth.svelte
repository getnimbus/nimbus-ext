<script lang="ts">
  import { onMount } from "svelte";
  import jwt_decode from "jwt-decode";

  let userInfo = {};
  let showPopover = false;

  onMount(() => {
    google.accounts.id.initialize({
      client_id:
        "520245364327-4t6vius9egn2qfdrcj2paeefv5l3hgtg.apps.googleusercontent.com",
      callback: handleCallbackRes,
      auto_select: true,
    });

    google.accounts.id.renderButton(document.getElementById("signInBtn"), {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin",
    });
  });

  function handleCallbackRes(res) {
    console.log("res: ", res);
    userInfo = jwt_decode(res.credential);
    document.getElementById("signInBtn").hidden = true;
  }

  function handleSignOut() {
    userInfo = {};
    document.getElementById("signInBtn").hidden = false;
    showPopover = false;
    google.accounts.id.disableAutoSelect();
  }
</script>

<div id="signInBtn" />

{#if Object.keys(userInfo).length !== 0}
  <div class="relative">
    <div
      class="w-[40px] h-[40px] rounded-full overflow-hidden cursor-pointer"
      on:click={() => (showPopover = !showPopover)}
    >
      <img src={userInfo.picture} alt="" class="w-full h-full object-cover" />
    </div>
    {#if showPopover}
      <div
        class="bg-[#1e96fc] py-1 px-3 rounded-lg absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-max"
        on:click={() => handleSignOut()}
      >
        <span class="text-white cursor-pointer">Sign out</span>
      </div>
    {/if}
  </div>
{/if}

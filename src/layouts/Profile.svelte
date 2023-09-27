<script>
  import CardInfo from "~/UI/Profile/CardInfo.svelte";
  import CardNft from "~/UI/Profile/CardNFT.svelte";
  import CustomText from "~/UI/Profile/CustomText.svelte";
  import SummaryText from "~/UI/Profile/SummaryText.svelte";
  import { shorterAddress } from "~/utils";
</script>

<div class="header header-container">
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col xl:gap-10 gap-6"
  >
    <div class="flex flex-col mb-5 gap-14">
      <div class="font-medium xl:text-5xl text-7xl">My Profile</div>
      <div
        class="w-full flex border-2 rounded-xl shadow-light-600 shadow-xl h-screen py-10 px-10 gap-10"
      >
        <!-- {#if Object.keys(userInfo).length !== 0} -->
        <div
          class="w-1/3 h-[300px] flex items-center justify-center rounded-xl"
        >
          <div
            class="flex flex-col gap-3 items-center justify-center text-2xl xl:text-base"
          >
            <div class=" xl:w-[80px] xl:h-[80px] w-32 h-32">
              <img
                src={`/assets/user.png`}
                alt=""
                class="object-cover w-full h-full"
              />
            </div>
            {shorterAddress(localStorage.getItem("evm_address") || "")}
          </div>
        </div>
        <div class="w-2/3 h-full">
          <div class="text-xl xl:3xl font-medium mb-4">My Story</div>
          <div class="grid grid-cols-4 gap-10">
            <SummaryText />
            <CardNft />
            <CardNft />
            <CustomText />
            <CardInfo />
          </div>
        </div>
        <!-- {:else}
          <div
            on:click={() => {
              connect();
              mixpanel.track("user_connect_wallet");
              isShowHeaderMobile.update((n) => (n = false));
            }}
            class="text-3xl font-semibold text-white cursor-pointer xl:text-base"
          >
            Connect Wallet
          </div>
        {/if} -->
      </div>
    </div>
  </div>
</div>

<style></style>

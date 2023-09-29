<script lang="ts">
  import { shorterAddress } from "~/utils";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import Summary from "~/UI/Profile/Summary.svelte";
  import Description from "~/UI/Profile/Description.svelte";
  import NFTInfo from "~/UI/Profile/NFTInfo.svelte";
  import SocialMedia from "~/UI/Profile/SocialMedia.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import Button from "~/components/Button.svelte";

  let isEdit = false;

  let selectProfileNFT = {};

  let description =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus odio perferendis dolorum repellat ex, dignissimos nisi velit ipsa tenetur nihil magnam earum corporis amet reiciendis est doloribus sint officia tempora impedit numquam ratione aliquid. Eligendi fuga sint repudiandae dicta necessitatibus pariatur minima similique, ipsa facilis esse mollitia ex sapiente inventore!";

  const handleSubmitProfile = async () => {
    console.log("description: ", description);
    console.log("selectProfileNFT: ", selectProfileNFT);
  };
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col justify-center gap-2">
      <div class="xl:text-5xl text-7xl font-semibold">My Profile</div>
      <div class="xl:text-xl text-3xl">
        One place that aggregates all your personal information
      </div>
    </div>
    <form
      on:submit|preventDefault={handleSubmitProfile}
      class="flex flex-col gap-4"
    >
      <div class="flex items-center justify-end lg:gap-2 gap-6">
        {#if isEdit}
          <div class="w-[120px]">
            <Button variant="secondary" on:click={() => (isEdit = false)}
              >Cancel</Button
            >
          </div>
          <div class="w-[120px]">
            <Button type="submit">Save</Button>
          </div>
        {:else}
          <div class="xl:w-[160px] w-[220px]">
            <Button on:click={() => (isEdit = true)}>Edit your profile</Button>
          </div>
        {/if}
      </div>
      <div
        class="w-full flex xl:flex-row flex-col rounded-xl py-10 px-10 gap-9 border-2 border_0000001a"
      >
        <div
          class="xl:w-1/4 w-full flex flex-col gap-3 items-center justify-start"
        >
          <div class="xl:w-[80px] xl:h-[80px] w-32 h-32">
            <img
              src={`/assets/user.png`}
              alt=""
              class="object-cover w-full h-full"
            />
          </div>
          <div class="text-2xl xl:text-base font-medium">
            {shorterAddress(localStorage.getItem("evm_address") || "")}
          </div>
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div class="xl:text-3xl text-4xl font-medium">My Story</div>
          <div class="grid xl:grid-cols-4 grid-cols-2 gap-10">
            <Summary />
            <Description {isEdit} bind:description />
            <NFTInfo {isEdit} bind:selectProfileNFT />
            <SocialMedia />
            <ClosedPositionChart />
          </div>
        </div>
      </div>
    </form>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>

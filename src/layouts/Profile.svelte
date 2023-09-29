<script lang="ts">
  import { shorterAddress, clickOutside } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { wallet, user, isDarkMode } from "~/store";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import Summary from "~/UI/Profile/Summary.svelte";
  import Description from "~/UI/Profile/Description.svelte";
  import NFTInfo from "~/UI/Profile/NFTInfo.svelte";
  import SocialMedia from "~/UI/Profile/SocialMedia.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import Button from "~/components/Button.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let listAddress = [];

  let selectedAddress = localStorage.getItem("evm_address") || "";
  let isEdit = false;
  let showPopover = false;

  let selectProfileNFT = {};

  let socialDataTwitter = {
    title: "",
    hashtag: "",
  };
  let socialDataTelegram = {
    title: "",
    hashtag: "",
  };

  let description =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus odio perferendis dolorum repellat ex, dignissimos nisi velit ipsa tenetur nihil magnam earum corporis amet reiciendis est doloribus sint officia tempora impedit numquam ratione aliquid. Eligendi fuga sint repudiandae dicta necessitatibus pariatur minima similique, ipsa facilis esse mollitia ex sapiente inventore!";

  const handleSubmitProfile = async () => {
    console.log("selectedAddress: ", selectedAddress);
    console.log("description: ", description);
    console.log("selectProfileNFT: ", selectProfileNFT);
    console.log("socialDataTwitter: ", socialDataTwitter);
    console.log("socialDataTelegram: ", socialDataTelegram);
  };

  const handleCancelEdit = () => {
    isEdit = false;
    selectedAddress = localStorage.getItem("evm_address");
  };

  const getListAddress = async () => {
    const response: any = await nimbus.get("/accounts/list");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  $: query = createQuery({
    queryKey: ["list-address"],
    queryFn: () => getListAddress(),
    staleTime: Infinity,
    retry: false,
    enabled:
      Object.keys(userInfo).length !== 0 &&
      selectedWallet !== "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0",
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (
      !$query.isError &&
      $query.data !== undefined &&
      $query.data.length !== 0
    ) {
      formatDataListAddress($query.data);
    }
  }

  const formatDataListAddress = async (data) => {
    listAddress = data.map((item) => {
      return {
        id: item.id,
        type: item.type,
        label: item.label,
        value: item.type === "CEX" ? item.id : item.accountId,
      };
    });
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
            <Button variant="secondary" on:click={handleCancelEdit}
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

          <div class="relative">
            <div
              class={`text-2xl xl:text-base font-medium ${
                isEdit ? "cursor-pointer" : ""
              }`}
              on:click={() => {
                if (isEdit) {
                  showPopover = !showPopover;
                }
              }}
            >
              {shorterAddress(selectedAddress)}
            </div>
            {#if showPopover}
              <div
                class="select_content absolute left-1/2 transform -translate-x-1/2 z-50 flex flex-col xl:gap-3 gap-6 px-3 xl:py-2 py-3 text-sm transform rounded-lg top-8 w-max xl:max-h-[300px] xl:max-h-[310px] max-h-[380px]"
                style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15); overflow-y: overlay;"
                use:clickOutside
                on:click_outside={() => (showPopover = false)}
              >
                {#each listAddress as item}
                  <div
                    class="flex flex-col cursor-pointer"
                    on:click={() => {
                      selectedAddress = item.value;
                      showPopover = false;
                    }}
                  >
                    <div class="text-2xl xl:text-xs font-medium text_00000099">
                      {item.label}
                    </div>
                    <div class="text-3xl xl:text-sm">
                      {shorterAddress(item?.value)}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div class="xl:text-3xl text-4xl font-medium">My Story</div>
          <div class="grid xl:grid-cols-4 grid-cols-2 gap-10">
            <Summary {selectedAddress} />
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

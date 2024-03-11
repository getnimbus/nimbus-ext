<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import mixpanel from "mixpanel-browser";
  import dayjs from "dayjs";
  import isBetween from "dayjs/plugin/isBetween";
  dayjs.extend(isBetween);
  import { nimbus } from "~/lib/network";
  import { wallet, isDarkMode, selectedPackage } from "~/store";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Analytic from "~/UI/Analytic/Analytic.svelte";
  import Button from "~/components/Button.svelte";

  const currentDate = dayjs();
  const next7Days = currentDate.add(7, "day");

  let allowScroll = false;
  let isOpenModal = false;
  let isLoadingSendMail = false;
  let email = "";

  const onSubmit = async (e) => {
    isLoadingSendMail = true;
    const formData = new FormData(e.target);

    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    try {
      await nimbus.post(
        "/subscription/analysis",
        {
          email: data.email,
          address: $wallet,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      isLoadingSendMail = false;
    } catch (e) {
      isLoadingSendMail = false;
    } finally {
      localStorage.setItem("isShowFormAnalytic", "true");
      isOpenModal = false;
    }
  };

  const handleScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    if (!allowScroll) {
      window.scrollTo(0, 0);
    }

    isOpenModal = scrollY > 1500;

    if (allowScroll && isOpenModal) {
      window.removeEventListener("scroll", handleScroll);
    }
  };

  onMount(() => {
    mixpanel.track("analytic_page");
    const isSubmitStorage = localStorage.getItem("isShowFormAnalytic");

    if ($selectedPackage === "FREE") {
      if (isSubmitStorage === null) {
        allowScroll = true;
        window.addEventListener("scroll", handleScroll);
      }
    }
  });

  onDestroy(() => {
    window.removeEventListener("scroll", handleScroll);
  });
</script>

<ErrorBoundary>
  <Analytic />

  <AppOverlay
    clickOutSideToClose
    isOpen={isOpenModal}
    on:close={() => {
      localStorage.setItem("currentDay", currentDate.format("YYYY-MM-DD"));
      localStorage.setItem("next7Days", next7Days.format("YYYY-MM-DD"));
      isOpenModal = false;
    }}
  >
    <div class="flex flex-col gap-4 xl:mt-0 mt-4">
      <div class="flex flex-col">
        <div class="title-3 font-semibold">Let's us know your email.</div>
        <div class="text-sm text-gray-500">
          Add your email to get updates from us and receive exclusive benefits
          in the future.
        </div>
      </div>
      <form
        on:submit|preventDefault={onSubmit}
        class="flex flex-col xl:gap-3 gap-6"
      >
        <div class="flex flex-col gap-1">
          <div class="flex flex-col gap-1">
            <div
              class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
                email && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
              }`}
            >
              <div
                class={`xl:text-base text-lg text-[#666666] font-medium ${
                  $isDarkMode ? "text-gray-400" : "text-[#666666]"
                }`}
              >
                Email
              </div>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your email"
                value=""
                class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-base font-normal ${
                  email && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
                } ${
                  $isDarkMode
                    ? "text-white"
                    : "text-[#5E656B] placeholder-[#5E656B]"
                }
              `}
                on:keyup={({ target: { value } }) => (email = value)}
              />
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <div class="w-[120px]">
            <Button
              variant="secondary"
              on:click={() => {
                localStorage.setItem(
                  "currentDay",
                  currentDate.format("YYYY-MM-DD")
                );
                localStorage.setItem(
                  "next7Days",
                  next7Days.format("YYYY-MM-DD")
                );
                isOpenModal = false;
              }}
            >
              Cancel
            </Button>
          </div>
          <div class="w-[120px]">
            <Button
              type="submit"
              isLoading={isLoadingSendMail}
              disabled={isLoadingSendMail}
            >
              <div class="text-white">Submit</div>
            </Button>
          </div>
        </div>
      </form>
    </div>
  </AppOverlay>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }

  .input-border {
    border: 1px solid rgb(229, 231, 235);
  }
</style>

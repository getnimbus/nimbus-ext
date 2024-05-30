<script lang="ts">
  import "flowbite/dist/flowbite.css";
  import { isDarkMode } from "~/store";
  import { nimbus } from "~/lib/network";
  import { triggerToast } from "~/utils/functions";

  import Button from "~/components/Button.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  let email = "";
  let isLoadingSendMail = false;

  const onSubmitGetEmail = async (e) => {
    isLoadingSendMail = true;
    const formData = new FormData(e.target);
    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    try {
      await nimbus.post("/subscription/failure-email", {
        email: data.email,
      });
      email = "";
      isLoadingSendMail = false;
      triggerToast(
        "We have received you email. Let's us check you payment and email to you soon!",
        "success"
      );
    } catch (e) {
      isLoadingSendMail = false;
      triggerToast(
        "Something wrong when sending email. Please try again!",
        "fail"
      );
    }
  };
</script>

<ErrorBoundary>
  <div class="xl:min-h-screen flex justify-center items-center">
    <div class="p-6 w-2/3 flex flex-col gap-5 justify-center items-center">
      <div class="text-lg text-center">
        There are some problem while upgrading your plan. <br /> Add your email to
        get updates from us and receive exclusive benefits!
      </div>
      <form on:submit|preventDefault={onSubmitGetEmail} class="flex gap-2">
        <div class="flex flex-col gap-1 xl:min-w-md min-w-xl">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              email && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
            }`}
          >
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your email"
              required
              bind:value={email}
              class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-base font-normal ${
                email && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
              } ${
                $isDarkMode
                  ? "text-white"
                  : "text-[#5E656B] placeholder-[#5E656B]"
              }
              `}
              on:change={(event) => {
                email = event?.target?.value;
              }}
            />
          </div>
        </div>
        <div class="w-[120px]">
          <Button
            type="submit"
            isLoading={isLoadingSendMail}
            disabled={isLoadingSendMail}
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }
</style>

<script lang="ts">
  import { Toast } from "flowbite-svelte";
  import { nimbus } from "~/lib/network";
  import "flowbite/dist/flowbite.css";

  import Button from "~/components/Button.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  let email = "";
  let isLoadingSendMail = false;

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

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
      isLoadingSendMail = false;
      toastMsg = "Ready to receive exclusive benefits soon!";
      isSuccessToast = true;
      trigger();
    } catch (e) {
      isLoadingSendMail = false;
      toastMsg = "Something wrong when sending email. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };
</script>

<ErrorBoundary>
  <div class="flex justify-center items-center h-screen">
    <div class="p-6 w-2/3 flex flex-col gap-5 justify-center items-center">
      <div class="text-lg text-center">
        There are some problem while upgrading your plan. <br /> Add your email to
        get updates from us and receive exclusive benefits!
      </div>
      <form on:submit|preventDefault={onSubmitGetEmail} class="flex gap-2">
        <div class="flex flex-col gap-1 xl:min-w-md min-w-xl">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              email ? "bg-[#F0F2F7]" : ""
            }`}
          >
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your email"
              required
              value=""
              class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
                email ? "bg-[#F0F2F7]" : ""
              }
              `}
              on:keyup={({ target: { value } }) => (email = value)}
            />
          </div>
        </div>
        <div class="w-[120px]">
          <Button
            type="submit"
            isLoading={isLoadingSendMail}
            disabled={isLoadingSendMail}>Submit</Button
          >
        </div>
      </form>
    </div>
  </div>
</ErrorBoundary>

{#if showToast}
  <div class="fixed top-3 right-3 w-full z-10">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global></style>

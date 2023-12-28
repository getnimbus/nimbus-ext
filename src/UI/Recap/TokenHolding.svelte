<script>
  import html2canvas from "html2canvas";

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

  const downloadPage = async () => {
    const targetElement = document.getElementById("target-slide-1");
    if (targetElement) {
      try {
        const canvas = await html2canvas(targetElement);
        const img = canvas.toDataURL("image/png");
        // handle download image
        const a = document.createElement("a");
        a.href = img;
        a.download = "TokenHolding.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toastMsg = "Successfully downloaded!";
        isSuccessToast = true;
        trigger();
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toastMsg = "Something wrong when download. Please try again!";
        isSuccessToast = false;
        trigger();
      }
    }
  };
</script>

<div
  class="h-screen flex flex-col gap-4 justify-center items-center"
  id="target-slide-1"
>
  Token holding
  <div
    class={`flex items-center gap-1 transition-all ease-in py-1 px-2 rounded-[10px] cursor-pointer border`}
    on:click={downloadPage}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={"#00000099"}
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="tabler-icon tabler-icon-download"
      ><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path
        d="M7 11l5 5l5 -5"
      /><path d="M12 4l0 12" /></svg
    >
    <div class="xl:text-base text-lg">Save</div>
  </div>
</div>

<style></style>

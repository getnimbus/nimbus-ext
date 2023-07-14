<script>
  import { getLocalImg } from "~/utils";
  import Button from "~/components/Button.svelte";
  import Logo from "../../assets/logo-2.png";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="flex flex-col items-center gap-10">
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <img
        src={getLocalImg(Logo)}
        alt="logo"
        width="180"
        height="100"
        class="mr-[10px]"
      />
      <div class="flex flex-col items-center gap-4">
        <div class="text-5xl text-black font-normal">Welcome</div>
        <div class="text-lg text-[#00000099] font-normal">
          Nimbus is a personalized portfolio that makes you investment more
          efficiency
        </div>
      </div>
    </div>
    <div class="w-[140px]">
      <Button className="next">Get Started</Button>
    </div>
  </div>
</div>

<style>
</style>

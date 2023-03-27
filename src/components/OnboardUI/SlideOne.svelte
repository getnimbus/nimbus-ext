<script>
  import { getLocalImg } from "~/utils";
  import Button from "~/components/Button.svelte";
  import Logo from "../../assets/logo-2.png";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-[85%] flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <img src={getLocalImg(Logo)} alt="logo" width="217" height="100" />
      <div class="flex flex-col items-center gap-2">
        <div class="text-4xl text-black font-normal">Welcome</div>
        <div class="text-base text-[#00000099] font-normal">
          Nimbus is a personalized portfolio that makes you investment more
          efficiency
        </div>
      </div>
    </div>
    <Button className="next">Get Started</Button>
  </div>
</div>

<style>
</style>

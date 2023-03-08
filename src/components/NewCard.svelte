<script>
  import newImage from "../assets/news.png";
</script>

<div class="rounded-lg border p-3 shadow flex gap-6 justify-between">
  <div class="w-[250px] h-[140px] overflow-hidden">
    <img class="w-full h-full object-cover" src={newImage} alt="new" />
  </div>
  <div class="flex-1 flex flex-col justify-between">
    <div class="flex flex-col">
      <div class="title-4 cursor-pointer">Product title</div>
      <div class="text-sm text-gray-400 -mt-1">Lorem ipsum dolor sit amet.</div>
    </div>
    <div class="text-xs mt-2">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere quis nihil
      deserunt, recusandae praesentium architecto minima maxime illo esse quam!
    </div>
    <div class="flex gap-2 flex-wrap mt-2">
      <div
        class="flex items-center text-xs justyfy-center px-2 py-1 text-sky-500 bg-sky-100 rounded"
      >
        Bitcoin
      </div>
      <div
        class="flex items-center text-xs justyfy-center px-2 py-1 text-sky-500 bg-sky-100 rounded"
      >
        Solana
      </div>
    </div>
  </div>
</div>

<style>
  .border {
    border: 0.2px solid rgb(229, 231, 235);
  }
</style>

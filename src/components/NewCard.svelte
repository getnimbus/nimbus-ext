<svelte:options tag="app-new-card" />

<script>
  import newImage from "../assets/news.png";
</script>

<div class="rounded-lg border p-3 shadow flex gap-6 justify-between">
  <div class="w-[250px] h-[140px] overflow-hidden">
    <img class="w-full h-full object-cover" src={newImage} alt="new" />
  </div>
  <div class="flex-1 flex flex-col justify-between gap-1">
    <div class="font-bold text-xl">Product title</div>
    <div class="font-semibold text-base text-gray-400">Subtitle</div>
    <div class="text-xs">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam ab,
      deserunt perferendis sunt esse adipisci numquam sint corporis, aut a sequi
      saepe, voluptatibus eius? Dolore porro assumenda enim quas neque sed
      officia vitae ea consequuntur error mollitia tenetur rem, accusantium
      maxime! Fuga impedit, doloribus iusto quidem iure dolores placeat dicta!
    </div>
    <div class="flex gap-2 flex-wrap">
      <div
        class="flex items-center text-xs justyfy-center px-2 py-1 text-sky-500 bg-sky-100 rounded"
      >
        label
      </div>
    </div>
  </div>
</div>

<style>
  .border {
    border: 0.2px solid rgb(229, 231, 235);
  }
</style>

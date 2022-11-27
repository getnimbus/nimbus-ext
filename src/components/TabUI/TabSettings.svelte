<svelte:options tag="tab-settings" />

<script>
  import { Select, Label } from "flowbite-svelte";
  import { setLang, currentLang } from "~/lib/i18n";

  let selectedLang = currentLang;
  let langs = [
    { value: "vi", name: "Vietnamese" },
    { value: "en", name: "English" },
  ];

  $: setLang(selectedLang);
</script>

<div class="flex flex-col gap-2">
  <div class="title-3 text-gray-500 mb-2">Settings</div>
  <Label
    >Select languages
    <Select class="mt-2" items={langs} bind:value={selectedLang} />
  </Label>
</div>

<style>
</style>

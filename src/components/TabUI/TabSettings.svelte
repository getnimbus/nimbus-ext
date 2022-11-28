<svelte:options tag="tab-settings" />

<script>
  import { Select, Label } from "flowbite-svelte";
  import { setLang, currentLang, i18n } from "~/lib/i18n";

  let selectedLang = currentLang;
  let langs = [
    { value: "vi", name: "Vietnamese" },
    { value: "en", name: "English" },
  ];

  let MultipleLang = {
    title: i18n("optionsPage.settings-page-title", "Settings"),
    content: {
      change_lang_label: i18n(
        "optionsPage.settings-page-content.change-lang-label",
        "Select languages"
      ),
    },
  };

  $: setLang(selectedLang);
</script>

<div class="flex flex-col gap-2">
  <div class="title-3 text-gray-500 mb-2">{MultipleLang.title}</div>
  <Label
    >{MultipleLang.content.change_lang_label}
    <Select class="mt-2" items={langs} bind:value={selectedLang} />
  </Label>
</div>

<style>
</style>

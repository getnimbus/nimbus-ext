<svelte:options tag="tab-settings" />

<script lang="ts">
  import { onMount } from "svelte";
  import { setLang, currentLang, i18n } from "~/lib/i18n";

  import Select from "~/components/Select.svelte";

  import English from "~/assets/english.svg";
  import Vietnam from "~/assets/vietnam.svg";

  const langs = [
    { logo: Vietnam, value: "vi", label: "Vietnamese" },
    { logo: English, value: "en", label: "English" },
  ];

  const MultipleLang = {
    title: i18n("optionsPage.settings-page-title", "Settings"),
    change_lang_label: i18n(
      "optionsPage.settings-page-content.change-lang-label",
      "Select languages"
    ),
  };

  let selectedLang;

  onMount(() => {
    selectedLang = langs.filter((item) => item.value === currentLang)[0];
  });

  $: {
    if (selectedLang && selectedLang.value !== currentLang) {
      setLang(selectedLang.value);
    }
  }
</script>

<div class="flex flex-col gap-2 h-screen">
  <div class="xl:title-3 title-1 mb-2">{MultipleLang.title}</div>
  <div class="flex items-center gap-2">
    <div class="xl:title-5 title-3">
      {MultipleLang.change_lang_label}
    </div>
    <Select
      type="lang"
      positionSelectList="left-0"
      listSelect={langs}
      bind:selected={selectedLang}
    />
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>

<svelte:options tag="tab-settings" />

<script lang="ts">
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

  let selectedLang: any = langs.filter((item) => item.value === currentLang)[0];

  $: {
    if (selectedLang && selectedLang.value !== currentLang) {
      setLang(selectedLang.value);
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div class="title-3 text-gray-500 mb-2">{MultipleLang.title}</div>
  <div class="flex items-center gap-2">
    <div class="title-5">
      {MultipleLang.change_lang_label}
    </div>
    <Select
      isWalletSelect={false}
      isOptionsPage={true}
      isSelectWallet={false}
      listSelect={langs}
      bind:selected={selectedLang}
    />
  </div>
</div>

<style>
</style>

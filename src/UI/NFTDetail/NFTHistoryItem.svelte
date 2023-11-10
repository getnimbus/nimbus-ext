<script lang="ts">
  import { isDarkMode, typeWallet } from "~/store";
  import { detectedChain } from "~/utils";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import TooltipNumber from "~/components/TooltipNumber.svelte";
</script>

<div>hello world</div>

<style></style>

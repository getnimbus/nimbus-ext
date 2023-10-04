<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import QRCode from "qrcode-generator";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, wallet, chain, typeWallet } from "~/store";

  let qrImageDataUrl = undefined;
  let userAddress = "";
  let link = "";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  const queryClient = useQueryClient();
  const qrcode = QRCode(0, "L");

  const getUserInfo = async () => {
    const response: any = await nimbus.get("/users/me");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    userAddress = response?.data;
  };

  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
    enabled: Object.keys(userInfo).length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
      wallet.update((n) => (n = ""));
      chain.update((n) => (n = ""));
      typeWallet.update((n) => (n = ""));
      queryClient.invalidateQueries(["list-address"]);
    },
  });

  $: {
    if (!$queryUserInfo.isError && $queryUserInfo.data !== undefined) {
      userAddress = $queryUserInfo.data?.publicAddress;
      link = `https://app.getnimbus.io/?invitation=${$queryUserInfo?.data.id}`;
      qrcode.addData(link);
      qrcode.make();
      qrImageDataUrl = qrcode.createDataURL(6, 0);
    }
  }
</script>

<div class="flex flex-col justify-center items-center gap-3">
  <div class="xl:text-lg text-xl">Check your profit at Nimbus</div>
  <div class="xl:w-32 xl:h-32 w-42 h-42">
    <img src={qrImageDataUrl} alt="QR Code" class="w-full h-full" />
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import QRCode from "qrcode-generator";
  import { nimbus } from "~/lib/network";

  let qrImageDataUrl = undefined;
  let userAddress = "";
  let link = "";

  const queryClient = useQueryClient();
  const qrcode = QRCode(0, "L");

  const getUserInfo = async () => {
    const response: any = await nimbus.get("/users/me");
    return response?.data;
  };

  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
      localStorage.removeItem("evm_token");
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
  <div class="text-base text-center">
    Track your portfolio and make wise decision at Nimbus
  </div>
  <div class="w-32 h-32">
    <img src={qrImageDataUrl} alt="Invite QR Code" class="w-full h-full" />
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>

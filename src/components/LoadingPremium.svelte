<script lang="ts">
  import player from "lottie-web";
  import loading from "../assets/LoadingPremium.json";
  let el;

  $: {
    if (el) {
      player.loadAnimation({
        container: el, // the dom element that will contain the animation
        renderer: "svg",
        loop: true,
        autoplay: true,
        // path: "/LoadingPremium.json", // the path to the animation json
        animationData: loading,
      });
    }
  }
</script>

<div bind:this={el} class="w-56 h-56" />

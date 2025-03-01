<script lang="ts">
import { PUBLIC_CONTENT_MODERATION_API } from "$env/static/public";
import { ClerkLoaded, SignedIn } from "svelte-clerk";
const p = $props();
console.log({ p });
import SampleComponent from "./sampleComponent.svelte";
async function fetchWhoami() {
  console.log("call who am i");
  console.log("TEST");
  try {
    const w = await fetch(`${PUBLIC_CONTENT_MODERATION_API}/whoami`);
    console.log(w);
  } catch (error) {
    console.error("Error:", error);
  }
}
</script>

<h1>About this site</h1>
<p>TODO...</p>
<a href="/">Home</a>
<ClerkLoaded>Loaded!</ClerkLoaded>
<button on:click={() => fetchWhoami()}>who am i</button>

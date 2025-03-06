<script lang="ts">
import { PUBLIC_CONTENT_MODERATION_API } from '$env/static/public';
import { ClerkLoaded, SignedIn } from 'svelte-clerk';
async function fetchWhoami() {
  try {
    const w = await fetch(`${PUBLIC_CONTENT_MODERATION_API}/whoami`);
  } catch (error) {
    console.error('Error:', error);
  }
}
</script>

<h1>About this site</h1>
<p>TODO...</p>
<a href="/">Home</a>
<ClerkLoaded>Loaded!</ClerkLoaded>

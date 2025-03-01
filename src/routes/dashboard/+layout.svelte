<script lang="ts">
<!-- import { PUBLIC_CLERK_PUBLISHABLE_KEY, PUBLIC_CONTENT_MODERATION_API } from "$env/static/public"; -->
import { SignIn, SignedIn, useClerkContext } from "svelte-clerk";
import { ClerkProvider } from "svelte-clerk";

const { data, children }: LayoutProps = $props();
// Do not destructure context or you'll lose reactivity!
const ctx = useClerkContext();
const userId = $derived(ctx.auth.userId);
$inspect(ctx, userId);
const fetchDataFromExternalResource = async () => {
  const token = await ctx.session.getToken();
  const response = await fetch(`${PUBLIC_CONTENT_MODERATION_API}/whoami`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
$effect(async () => {
  console.log(userId);
  if (userId && ctx?.session) {
    await fetchDataFromExternalResource();
    console.log("has userid");
  }
});
</script>

<SignedIn>
  <div>teste</div>
</SignedIn>

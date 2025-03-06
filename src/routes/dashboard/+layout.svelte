<script lang="ts">
import { SignedIn } from 'svelte-clerk';
type LayoutProps = {};

const { children, whoami, data, ...p }: LayoutProps = $props();
</script>

<SignedIn>
  <div>teste</div>
  {#if data?.whoami?.instagram_usernames?.length}
    Found IG handles:
    {#each data.whoami.instagram_usernames as username}
      <a href={`https://www.instagram.com/${username}`} target="_blank">@{username}</a>
    {/each}
  {/if}
  {#if data?.instagram_login_href !== null}
    <a href={data?.instagram_login_href} target="_blank">Add an Instagram account</a>
  {/if}
  {@render children()}
</SignedIn>

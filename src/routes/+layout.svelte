<script lang="ts">
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/dynamic/public';
import type { Snippet } from '@svelte';
import {
  ClerkProvider,
  SignOutButton,
  SignedIn,
  SignedOut,
  UserButton,
} from 'svelte-clerk';

const { children }: { children: Snippet } = $props();
</script>

<ClerkProvider publishableKey={PUBLIC_CLERK_PUBLISHABLE_KEY}>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/settings">Settings</a>
    <a href="/dashboard">Dashboard</a>
    <h1>Index Route</h1>
    <SignedIn>
      <p>You are signed in!</p>
      <div>
        <p>View your profile here 👇</p>
        <UserButton />
      </div>
      <div>
        <SignOutButton />
      </div>
    </SignedIn>
    <SignedOut>
      <p>You are signed out</p>
      <div>
        <a href="/signin">Go to Sign in</a>
      </div>
      <div>
        indent_size
        <a href="/signup">Go to Sign up</a>
      </div>
    </SignedOut>
  </nav>
  {@render children()}
</ClerkProvider>

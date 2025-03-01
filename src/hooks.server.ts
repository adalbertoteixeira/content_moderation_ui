// import type { Handle } from '@sveltejs/kit';
// import { sequence } from '@sveltejs/kit/hooks';
// import { handleClerk } from 'clerk-sveltekit/server';
// import { CLERK_SECRET_KEY } from '$env/static/private';
import { withClerkHandler } from 'svelte-clerk/server';

export const handle = withClerkHandler();
// export const handle: Handle = sequence(
// 	handleClerk(CLERK_SECRET_KEY, {
// 		debug: true,
// 		protectedPaths: ['/admin', '/dashboard'],
// 		signInUrl: '/sign-in'
// 	})
// );

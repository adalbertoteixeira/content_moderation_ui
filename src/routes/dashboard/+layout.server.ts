import { env as publicEnv } from '$env/dynamic/public';
import { buildClerkProps } from 'svelte-clerk/server';
const {
  PUBLIC_CONTENT_MODERATION_API,
  PUBLIC_INSTAGRAM_AUTH_REDIRECT_URI,
  PUBLIC_INSTAGRAM_CLIENT_ID
} = publicEnv;
// To enable Clerk SSR support, add initial state props to the load function
export const load = async ({ locals }) => {
  const clerkProps = buildClerkProps(locals.auth);
  const clerkToken = await locals.auth.getToken();

  const response = await fetch(`${PUBLIC_CONTENT_MODERATION_API}/whoami`, {
    headers: {
      Authorization: `Bearer ${clerkToken}`
    }
  });

  let instagram_login_href = 'https://www.instagram.com/oauth/authorize?enable_fb_login=0';
  instagram_login_href += '&force_authentication=1';
  instagram_login_href += `&client_id=${PUBLIC_INSTAGRAM_CLIENT_ID}`;
  instagram_login_href += `&redirect_uri=${PUBLIC_INSTAGRAM_AUTH_REDIRECT_URI}`;
  instagram_login_href += `&response_type=code`;
  instagram_login_href += `&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
  instagram_login_href += `&state=${btoa(clerkProps.initialState.userId)}`;
  const whoami = await response.json();
  return {
    ...buildClerkProps(locals.auth),
    whoami,
    instagram_login_href
  };
};

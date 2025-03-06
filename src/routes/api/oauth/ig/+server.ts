import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
const { PRIVATE_INSTAGRAM_CLIENT_SECRET } = privateEnv;
const {
  PUBLIC_CONTENT_MODERATION_API,
  PUBLIC_INSTAGRAM_AUTH_REDIRECT_URI,
  PUBLIC_INSTAGRAM_CLIENT_ID
} = publicEnv;

import { error, redirect } from '@sveltejs/kit';
import { buildClerkProps } from 'svelte-clerk/server';
import type { RequestHandler } from './$types';

async function exchangeTheTokenForCode(url: URL, clerkUserId: string, locals) {
  /**
 Exchange the Code For a Token

To get the access token, send a POST request to the https://api.instagram.com/oauth/access_token endpoint with the following parameters:

    client_id set to your app's Instagram app ID from the App Dashboard
    client_secret set to your app's Instagram App Secret from the App Dashboard
    grant_type set to authorization_code
    redirect_uri set to your redirect URI
    code set to the code value from the redirect URI response
  */
  const instagramState = url.searchParams.get('state');
  if (instagramState !== btoa(clerkUserId)) {
    return error(401, 'Unauthorized');
  }
  console.log({ instagramState });
  const body = new FormData();
  body.append('client_id', PUBLIC_INSTAGRAM_CLIENT_ID);
  body.append('client_secret', PRIVATE_INSTAGRAM_CLIENT_SECRET);
  body.append('grant_type', 'authorization_code');
  // @TODO: replace with the PROD redirect URI
  body.append('redirect_uri', PUBLIC_INSTAGRAM_AUTH_REDIRECT_URI);
  body.append('code', url.searchParams.get('code'));

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    // headers: {
    //   'Content-Type': 'application/json'
    // },
    body
  });

  console.log('RESPONSE FROM p', { response });
  const responseBody = await response.json();
  console.log(responseBody);
  const accessToken = responseBody.access_token;

  const accessTokenResult = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${PRIVATE_INSTAGRAM_CLIENT_SECRET}&access_token=${accessToken}`
  );
  const accessTokenResultJson = await accessTokenResult.json();

  console.log({ accessTokenResultJson });
  /**
   * Save in the "API"
   */
  const api_upsert = {
    access_token: accessTokenResultJson.access_token,
    token_type: accessTokenResultJson.token_type,
    expires_in: accessTokenResultJson.expires_in,
    instagram_user_id: responseBody.user_id,
    clerk_user_id: clerkUserId
  };

  console.log('API UPSERT', api_upsert);

  const clerKToken = await locals.auth.getToken();
  console.log('CLERK TOKEN', clerKToken);
  try {
    const u = await fetch(
      `${PUBLIC_CONTENT_MODERATION_API}/instagram/upsert_instagram_access_token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${clerKToken}`,

          'Content-Type': 'application/json'
        },
        body: JSON.stringify(api_upsert)
      }
    );
    console.log(u);
    const uJson = await u.text();
    console.log(uJson);
  } catch (error) {
    console.error('Error:', error?.message);
  }
  return redirect(307, '/dashboard');
}

export const GET: RequestHandler = async ({ url, request, locals, ...other }, ...a) => {
  console.log({ url, request, other, a });

  const clerkProps = buildClerkProps(locals.auth);
  const clerkUserId = clerkProps?.initialState?.userId;
  if (!clerkUserId) {
    return error(401, 'Unauthorized');
  }
  // @TODO: implement failures gracefully: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login#canceled-authorization
  // @TODO: implement long lived token, like a cacheable token, with a refresh token for renewal
  if (url?.searchParams.get('code')?.length) {
    return await exchangeTheTokenForCode(url, clerkUserId, locals);
  }
};

import { PRIVATE_META_API_VERIFY_TOKEN, PRIVATE_SIGNING_SECRET } from '$env/static/private';

import { error, json, text } from '@sveltejs/kit';
import type { Webhook } from 'svix';
import type { RequestHandler } from './$types';

type Evt = {
  error?: Error | { message: string };
  type?: string;
  data: {
    id?: string;
    email_addresses: { linked_to: string }[];
  };
};
export const GET: RequestHandler = async ({ url }) => {
  if (!url?.searchParams.size) {
    console.log('no searchParams(');
    return error(404);
  }
  const hubMode = url.searchParams.get('hub.mode');
  const hubChallenge = url.searchParams.get('hub.challenge');
  const hubVerifyToken = url.searchParams.get('hub.verify_token');
  if (
    hubMode !== 'subscribe' ||
    hubVerifyToken !== PRIVATE_META_API_VERIFY_TOKEN ||
    !hubChallenge
  ) {
    return error(404);
  }

  return text(hubChallenge);
};

export const POST: RequestHandler = async ({ request }) => {
  console.log(PRIVATE_SIGNING_SECRET, request);
  const body = await request.json();
  console.log({ body }, JSON.stringify(body));

  return json({
    success: true,
    message: 'Webhook received'
  });
};

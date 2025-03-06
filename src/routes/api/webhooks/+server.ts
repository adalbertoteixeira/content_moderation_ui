import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
const { PRIVATE_META_API_VERIFY_TOKEN, PRIVATE_SIGNING_SECRET } = privateEnv;
const { PUBLIC_CONTENT_MODERATION_API } = publicEnv;

import { error, json, text } from '@sveltejs/kit';
import { Webhook } from 'svix';
import type { RequestHandler } from './$types';

function getSvixHeaders(headers: Headers) {
  // Get Svix headers for verification
  const svix_id = headers.get('svix-id');
  console.log(svix_id);
  const svix_timestamp = headers.get('svix-timestamp');
  const svix_signature = headers.get('svix-signature');
  return {
    svix_id,
    svix_signature,
    svix_timestamp
  };
}

function getEvt(wh, payload, svix_id, svix_signature, svix_timestamp) {
  let evt;
  // Attempt to verify the incoming webhook
  // If successful, the payload will be available from 'evt'
  // If verification fails, error out and return error code
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id as string,
      'svix-timestamp': svix_timestamp as string,
      'svix-signature': svix_signature as string
    });
    return evt;
  } catch (err) {
    console.log(err);
    console.log('Error: Could not verify webhook:', err.message);
    return { error: err?.message };
  }
}

const handlers = new Map([
  ['created', 'upsert'],
  ['updated', 'upsert'],
  ['deleted', 'delete']
]);

export const GET: RequestHandler = async ({ url, request, other }) => {
  console.log(url, request, other);
  console.log(url.searchParams);
  if (!url?.searchParams.size) {
    console.log('no searchParams(');
    return error(404);
  }
  const hubMode = url.searchParams.get('hub.mode');
  const hubChallenge = url.searchParams.get('hub.challenge');
  const hubVerifyToken = url.searchParams.get('hub.verify_token');
  if (hubMode !== 'subscribe' || hubVerifyToken !== PRIVATE_META_API_VERIFY_TOKEN) {
    return error(404);
  }

  return text(hubChallenge);

  console.log('searchParams(');
};

export const POST: RequestHandler = async ({ request }) => {
  console.log(PRIVATE_SIGNING_SECRET, request);
  if (!PRIVATE_SIGNING_SECRET) {
    throw new Error('Error: Please add PRIVATE_SIGNING_SECRET from Clerk Dashboard to .env');
  } else {
    console.log(PRIVATE_SIGNING_SECRET);
  }
  const wh = new Webhook(PRIVATE_SIGNING_SECRET);
  const headers = request.headers as Headers;
  let payload = '';
  for await (const chunk of request.body) {
    payload += chunk.toString();
  }

  const { svix_id, svix_signature, svix_timestamp } = getSvixHeaders(headers);

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return error(400, { message: 'Error: Missing svix headers' });
  }

  const evt = getEvt(wh, payload, svix_id, svix_signature, svix_timestamp);
  if (evt?.error) {
    return error(400, { message: error.message });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log('Webhook payload:', evt.data);

  try {
    const [entity, type] = (evt.type ?? '').split('.');
    const handler = handlers.get(type);

    if (entity !== 'user') {
      return error(400, { message: 'Invalid entity' });
    }
    if (!handler) {
      return error(400, { message: 'Invalid type' });
    }

    if (handler === 'delete') {
      console.log('will try deleting user');
      console.log(`${PUBLIC_CONTENT_MODERATION_API}/webhooks/${entity}/${handler}`);
      const deleteResult = await fetch(
        `${PUBLIC_CONTENT_MODERATION_API}/webhooks/${entity}/${evt.data.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (deleteResult.status !== 204) {
        return error(500, { message: 'An error occurred' });
      }
      console.log({ deleteResult });
      const body = await deleteResult.text();
      console.log({ body });
      return json({ success: true, message: 'Webhook deleted' });
    }

    console.log(`will try upserting  user to ${PUBLIC_CONTENT_MODERATION_API}/webhooks/${entity}`);
    const response = await fetch(`${PUBLIC_CONTENT_MODERATION_API}/webhooks/${entity}`, {
      method: 'POST',
      body: JSON.stringify(evt.data),
      headers: {
        'Content-Type': 'application/json'
        // Authorization: `Bearer ${token}`
      }
    });
    console.log('upsert response:', response);
    const r = await response.text();
    console.log({ r });
  } catch (e) {
    console.log(e);
    return error(500, { message: 'An error occurred' });
  }

  return json({
    success: true,
    message: 'Webhook received'
  });
  // return new Response(String(random));
};

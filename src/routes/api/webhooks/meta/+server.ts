import crypto from 'node:crypto';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

import { error, json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
const { PUBLIC_CONTENT_MODERATION_API } = publicEnv;

const { PRIVATE_META_API_VERIFY_TOKEN, PRIVATE_SIGNING_SECRET, PRIVATE_INSTAGRAM_CLIENT_SECRET } =
  privateEnv;

export const GET: RequestHandler = async ({ url }) => {
  if (!url?.searchParams.size) {
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

export const POST: RequestHandler = async ({ request, locals }) => {
  const sha256Sig = request.headers.get('X-Hub-Signature-256');
  if (!sha256Sig) {
    return error(404);
  }
  const signatureParts = sha256Sig.split('=');
  if (!signatureParts[1]?.length) {
    return error(404);
  }
  const body = await request.text();

  const hmac = crypto.createHmac('sha256', PRIVATE_INSTAGRAM_CLIENT_SECRET);
  const signature = hmac.update(body).digest('hex');

  const isValidSignature = signature === signatureParts[1];
  if (!isValidSignature) {
    return error(404);
  }

  const clerkToken = await locals.auth.getToken();
  const j = JSON.parse(body);
  console.log({ body });
  console.log(j);
  console.log(j.entry[0].changes);
  console.log(j.entry[0].changes[0].value.from);
  console.log(j.entry[0].changes[0].value.media);

  try {
    const webhookUpsert = await fetch(`${PUBLIC_CONTENT_MODERATION_API}/instagram/webhook_upsert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clerkToken}`,

        'Content-Type': 'application/json'
      },
      body
    });
    console.log(webhookUpsert);
    const t = await webhookUpsert.text();
    console.log(t);
  } catch (error) {
    console.log('Error:', error);
  }
  return json({
    success: true,
    message: 'Webhook received'
  });
};

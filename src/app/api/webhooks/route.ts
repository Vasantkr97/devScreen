import { createUser } from '@/db/user';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Role } from '@prisma/client';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req: Request) {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;

    if (!SIGNING_SECRET) {
        throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local');
    }

    const wh = new Webhook(SIGNING_SECRET);

    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing Svix headers', { status: 400 });
    }

    const payload = await req.json(); // Use text() instead of json()
    const body = JSON.stringify(payload);
    
    let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const clerkId = id;
    const name = `${first_name || ""} ${last_name || ""}`.trim();
    const image = image_url;

    try {
      const user = await createUser({ clerkId, email, name, image, role: Role.interviewer});
      console.log(`User Created: ${user.id}`)
    } catch (error) {
      console.log("Error saving user to database in webHook: ", error)
      return new Response("Error saving user to DB", { status: 500 })
    }
  }

  return new Response('Webhook received', { status: 200 })
}

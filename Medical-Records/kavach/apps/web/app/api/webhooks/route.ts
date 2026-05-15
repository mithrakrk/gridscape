import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, parseWebhookMessages } from "@kavach/whatsapp";

const APP_SECRET = process.env.WHATSAPP_APP_SECRET ?? "";
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "";

// GET — Meta webhook verification challenge
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// POST — Incoming WhatsApp messages
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-hub-signature-256") ?? "";
  const body = await req.text();

  if (!verifyWebhookSignature(body, signature, APP_SECRET)) {
    // Log invalid signature attempt (non-PHI)
    console.warn("[webhook] invalid signature rejected");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const messages = parseWebhookMessages(payload);

  for (const msg of messages) {
    // TODO: Route to conversation state handler based on message type
    // - image/document → ingestion handler (upload to S3, queue job)
    // - text → conversation state handler (patient attribution, correction reply)
    // - interactive_reply → conversation state handler (record type selection)
    console.log("[webhook] received message type:", msg.type, "from:", msg.from.slice(0, 5) + "..."); // No full phone in logs
  }

  // Respond 200 immediately — processing is async via queue
  return new NextResponse("OK", { status: 200 });
}

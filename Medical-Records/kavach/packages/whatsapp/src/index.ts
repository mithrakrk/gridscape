/**
 * WhatsApp webhook handler stub.
 * Receives messages and attachments from Meta Cloud API.
 * Routes to ingestion pipeline or conversation state handler.
 */

export type MessageType = "text" | "image" | "document" | "interactive_reply" | "unknown";

export interface WhatsAppMessage {
  messageId: string;
  from: string; // sender phone number
  type: MessageType;
  text?: string;
  mediaId?: string;
  mimeType?: string;
  filename?: string;
  interactiveReply?: { buttonId: string; title: string };
  timestamp: number;
}

/**
 * Verify the X-Hub-Signature-256 webhook signature from Meta.
 * MUST be called before processing any webhook payload.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  const crypto = require("crypto");
  const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Parse a raw WhatsApp Cloud API webhook body into structured messages.
 */
export function parseWebhookMessages(body: Record<string, unknown>): WhatsAppMessage[] {
  // TODO: Parse Meta Cloud API webhook format
  // See: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
  return [];
}

/**
 * Send a text message to a WhatsApp number.
 */
export async function sendTextMessage(to: string, text: string): Promise<void> {
  // TODO: Implement using Meta Cloud API
  // POST https://graph.facebook.com/v18.0/{phoneNumberId}/messages
  throw new Error("sendTextMessage not yet implemented");
}

/**
 * Send an interactive button message.
 * Max 3 buttons per WhatsApp API limitation; use list message for 4+.
 */
export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<void> {
  // TODO: Implement WhatsApp interactive button message
  throw new Error("sendButtonMessage not yet implemented");
}

/**
 * Send a document (PDF) via WhatsApp.
 */
export async function sendDocument(to: string, mediaUrl: string, filename: string): Promise<void> {
  // TODO: Implement WhatsApp document message
  throw new Error("sendDocument not yet implemented");
}

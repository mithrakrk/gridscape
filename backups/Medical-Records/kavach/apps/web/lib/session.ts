/**
 * apps/web/lib/session.ts
 * Iron-session configuration for caregiver authentication.
 * Session is stored in an encrypted, httpOnly cookie.
 *
 * Usage in Route Handlers:
 *   import { getIronSession } from "iron-session";
 *   import { sessionOptions, type KavachSession } from "@/lib/session";
 *   const session = await getIronSession<KavachSession>(req, res, sessionOptions);
 */

import type { SessionOptions } from "iron-session";

export type KavachSession = {
  /** Authenticated caregiver account ID. Undefined if not logged in. */
  accountId?: string;
  /** Normalised phone number (+91XXXXXXXXXX). Stored for display only. */
  phoneNumber?: string;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "test") {
      // Use a deterministic dev secret in tests — never in production
      return "test_only_secret_minimum_32_chars_xxxx";
    }
    throw new Error(
      "[kavach/session] SESSION_SECRET environment variable is not set. " +
        "Set it to a random string of at least 32 characters."
    );
  }
  return secret;
}

export const sessionOptions: SessionOptions = {
  cookieName: process.env.SESSION_COOKIE_NAME ?? "kavach_session",
  password: getSessionSecret(),
  cookieOptions: {
    // Always secure in production; allow http in development
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    // 7 days — caregivers should stay logged in between sessions
    maxAge: 60 * 60 * 24 * 7,
  },
};

/**
 * Type guard — returns true if the session contains a valid caregiver accountId.
 */
export function isAuthenticated(session: KavachSession): session is Required<KavachSession> {
  return typeof session.accountId === "string" && session.accountId.length > 0;
}

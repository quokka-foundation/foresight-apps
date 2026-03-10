// ========================================
// Foresight Mini App — Notification Token Store
// ========================================
// Simple in-memory store for Farcaster notification tokens.
// NOTE: In-memory storage is NOT persistent across serverless cold starts.
// For production persistence, replace this module with a persistent KV store
// (e.g., Vercel KV, Upstash Redis, or an endpoint on the self-hosted API).

interface NotificationDetails {
  url: string;
  token: string;
}

const store = new Map<number, NotificationDetails>();

function getUserKey(fid: number): string {
  return `foresight:notif:${fid}`;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
void getUserKey; // exported for traceability only

export async function getUserNotificationDetails(fid: number): Promise<NotificationDetails | null> {
  return store.get(fid) ?? null;
}

export async function setUserNotificationDetails(
  fid: number,
  details: NotificationDetails,
): Promise<void> {
  store.set(fid, details);
}

export async function deleteUserNotificationDetails(fid: number): Promise<void> {
  store.delete(fid);
}

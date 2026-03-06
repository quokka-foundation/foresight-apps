// ========================================
// Foresight Mini App — Notification KV Store
// ========================================
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
    }

    redis = new Redis({ url, token });
  }
  return redis;
}

interface NotificationDetails {
  url: string;
  token: string;
}

function getUserKey(fid: number): string {
  return `foresight:notif:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<NotificationDetails | null> {
  try {
    return await getRedis().get<NotificationDetails>(getUserKey(fid));
  } catch {
    console.error(`Failed to get notification details for fid ${fid}`);
    return null;
  }
}

export async function setUserNotificationDetails(
  fid: number,
  details: NotificationDetails
): Promise<void> {
  try {
    await getRedis().set(getUserKey(fid), details);
  } catch {
    console.error(`Failed to set notification details for fid ${fid}`);
  }
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  try {
    await getRedis().del(getUserKey(fid));
  } catch {
    console.error(`Failed to delete notification details for fid ${fid}`);
  }
}

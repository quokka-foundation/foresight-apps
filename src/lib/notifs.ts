// ========================================
// Foresight Mini App — Notification Sender
// ========================================
import { APP_URL } from '@/lib/constants';
import { getUserNotificationDetails } from './kv';

type SendResult =
  | { state: 'success' }
  | { state: 'no_token' }
  | { state: 'rate_limit' }
  | { state: 'error'; error: unknown };

export async function sendFrameNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<SendResult> {
  const details = await getUserNotificationDetails(fid);

  if (!details) {
    return { state: 'no_token' };
  }

  try {
    const response = await fetch(details.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title,
        body,
        targetUrl: APP_URL,
        tokens: [details.token],
      }),
    });

    if (response.status === 200) {
      const data = await response.json();
      if (data?.result?.rateLimitedTokens?.length) {
        return { state: 'rate_limit' };
      }
      return { state: 'success' };
    }

    return { state: 'error', error: await response.text() };
  } catch (error) {
    return { state: 'error', error };
  }
}

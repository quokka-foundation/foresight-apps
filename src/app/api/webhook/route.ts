import { NextRequest, NextResponse } from 'next/server';
import { setUserNotificationDetails, deleteUserNotificationDetails } from '@/lib/kv';

export const runtime = 'edge';

/**
 * Farcaster Mini App webhook handler.
 * Receives frame_added / frame_removed / notifications_enabled / notifications_disabled events.
 * Stores/removes notification tokens for push notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, fid, notificationDetails } = body;

    if (!event || !fid) {
      return NextResponse.json(
        { error: 'Missing event or fid' },
        { status: 400 }
      );
    }

    switch (event) {
      case 'frame_added':
      case 'notifications_enabled': {
        if (notificationDetails?.token && notificationDetails?.url) {
          await setUserNotificationDetails(Number(fid), {
            token: notificationDetails.token,
            url: notificationDetails.url,
          });
        }
        break;
      }

      case 'frame_removed':
      case 'notifications_disabled': {
        await deleteUserNotificationDetails(Number(fid));
        break;
      }

      default:
        // Unknown event type — acknowledge silently
        break;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

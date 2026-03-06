import { NextRequest, NextResponse } from 'next/server';
import { sendFrameNotification } from '@/lib/notifs';

export const runtime = 'edge';

/**
 * Send a notification to a Farcaster user who has opted in.
 * Body: { fid: string, title: string, body: string, targetUrl?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { fid, title, body, targetUrl } = await req.json();

    if (!fid || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: fid, title, body' },
        { status: 400 }
      );
    }

    const result = await sendFrameNotification({
      fid: Number(fid),
      title,
      body,
    });

    if (result.state !== 'success') {
      return NextResponse.json(
        { error: result.state === 'no_token' ? 'User has not enabled notifications' : 'Notification failed' },
        { status: result.state === 'no_token' ? 404 : 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

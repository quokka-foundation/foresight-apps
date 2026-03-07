import { NextResponse } from 'next/server';
import { APP_URL } from '@/lib/constants';

export async function GET() {
  const manifest = {
    accountAssociation: {
      // TODO: Sign manifest at https://www.base.dev/preview?tab=account
      header: '',
      payload: '',
      signature: '',
    },
    frame: {
      version: '1',
      name: 'Foresight',
      subtitle: 'Continuous Outcome Markets',
      description: 'Trade continuous outcome curves with 1-click leverage on Base.',
      iconUrl: `${APP_URL}/icon.png`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/og-image.png`,
      screenshotUrls: [],
      tags: ['prediction-markets', 'defi', 'trading', 'base'],
      primaryCategory: 'finance',
      buttonTitle: 'Trade Curves',
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: '#FFFFFF',
      webhookUrl: `${APP_URL}/api/webhook`,
      heroImageUrl: `${APP_URL}/og-image.png`,
      tagline: 'Trade outcome curves',
      ogTitle: 'Foresight - Outcome Markets',
      ogDescription: 'Trade continuous outcome curves with leverage on Base.',
      ogImageUrl: `${APP_URL}/og-image.png`,
    },
  };

  return NextResponse.json(manifest);
}

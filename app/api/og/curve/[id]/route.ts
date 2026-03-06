import { NextRequest } from 'next/server';
import { getMarketById } from '@/lib/mock-data';

export const runtime = 'edge';

/**
 * Dynamic OG image for a curve market.
 * Returns a 1200x630 SVG rendered as PNG-compatible image.
 * Farcaster + OpenGraph + Twitter use this for link previews.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const market = getMarketById(id);

  if (!market) {
    return new Response('Market not found', { status: 404 });
  }

  const noProb = 100 - market.probability;
  const yesPayout = Math.round(100 / (market.probability / 100));
  const noPayout = Math.round(100 / (noProb / 100));

  // Generate SVG OG image
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#F5F5F7"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0052FF" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#0052FF" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>

      <!-- Accent stripe -->
      <rect x="0" y="0" width="1200" height="4" fill="#0052FF"/>

      <!-- Brand -->
      <text x="60" y="70" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#0052FF">
        FORESIGHT
      </text>

      <!-- LIVE badge -->
      <circle cx="60" cy="120" r="6" fill="#00D26A"/>
      <text x="76" y="126" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#00D26A">
        LIVE
      </text>

      <!-- Market title -->
      <text x="60" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#1A1B1E">
        ${escapeXml(market.title)}
      </text>

      <!-- Description -->
      <text x="60" y="280" font-family="system-ui, sans-serif" font-size="22" fill="#6B7280">
        ${escapeXml(market.description.slice(0, 80))}${market.description.length > 80 ? '...' : ''}
      </text>

      <!-- Probability display -->
      <text x="60" y="380" font-family="ui-monospace, monospace" font-size="96" font-weight="700" fill="#1A1B1E">
        ${market.probability.toFixed(1)}%
      </text>
      <text x="60" y="415" font-family="system-ui, sans-serif" font-size="22" fill="#9CA3AF">
        Current probability
      </text>

      <!-- Outcome boxes (kept dark for contrast, matching MarketCard style) -->
      <rect x="60" y="460" width="260" height="80" rx="16" fill="#0A0B0D" stroke="#1E2028" stroke-width="1"/>
      <text x="190" y="495" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF" text-anchor="middle">
        YES · ${market.probability.toFixed(0)}%
      </text>
      <text x="190" y="525" font-family="system-ui, sans-serif" font-size="16" fill="#00D26A" text-anchor="middle">
        $100 → $${yesPayout}
      </text>

      <rect x="340" y="460" width="260" height="80" rx="16" fill="#0A0B0D" stroke="#1E2028" stroke-width="1"/>
      <text x="470" y="495" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF" text-anchor="middle">
        NO · ${noProb.toFixed(0)}%
      </text>
      <text x="470" y="525" font-family="system-ui, sans-serif" font-size="16" fill="#00D26A" text-anchor="middle">
        $100 → $${noPayout}
      </text>

      <!-- Volume info -->
      <text x="60" y="590" font-family="system-ui, sans-serif" font-size="18" fill="#9CA3AF">
        24h Volume: $${(market.volume24h / 1000).toFixed(0)}K · Liquidity: $${(market.liquidity / 1000).toFixed(0)}K
      </text>

      <!-- Branding -->
      <text x="1140" y="600" font-family="system-ui, sans-serif" font-size="16" fill="#D1D5DB" text-anchor="end">
        foresight-apps.vercel.app
      </text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

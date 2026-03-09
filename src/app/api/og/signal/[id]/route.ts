import { NextRequest } from "next/server";
import { getSignalById } from "@/lib/mock-data";
import type { AlphaSignal } from "@/lib/types";

export const runtime = "edge";

/**
 * Dynamic OG image for an alpha signal.
 * Returns a 1200x630 SVG for link previews.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let signal: AlphaSignal | undefined;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/alpha/feed?limit=100`);
      if (res.ok) {
        const signals = (await res.json()) as AlphaSignal[];
        signal = signals.find((s) => s.id === id);
      }
    } catch {
      // fall through to mock
    }
  }

  if (!signal) signal = getSignalById(id);

  if (!signal) {
    return new Response("Signal not found", { status: 404 });
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#F5F5F7"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>

      <!-- Accent stripe -->
      <rect x="0" y="0" width="1200" height="4" fill="#0052FF"/>

      <!-- Brand -->
      <text x="60" y="70" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#0052FF">
        FORESIGHT ALPHA
      </text>

      <!-- Signal type -->
      <text x="60" y="130" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#6B7280">
        ${escapeXml(signal.type.replace("_", " ").toUpperCase())}
      </text>

      <!-- Description -->
      <text x="60" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" fill="#1A1B1E">
        ${escapeXml(signal.description.slice(0, 50))}${signal.description.length > 50 ? "..." : ""}
      </text>

      <!-- Token -->
      <text x="60" y="280" font-family="system-ui, sans-serif" font-size="22" fill="#6B7280">
        ${escapeXml(signal.tokenSymbol ?? signal.tokenAddress.slice(0, 10))}
      </text>

      <!-- Confidence -->
      <text x="60" y="380" font-family="ui-monospace, monospace" font-size="96" font-weight="700" fill="#1A1B1E">
        ${signal.confidenceScore}%
      </text>
      <text x="60" y="415" font-family="system-ui, sans-serif" font-size="22" fill="#9CA3AF">
        Confidence score
      </text>

      <!-- Value -->
      <text x="60" y="500" font-family="ui-monospace, monospace" font-size="36" font-weight="600" fill="#1A1B1E">
        ${signal.valueUSD ? `$${signal.valueUSD.toLocaleString()}` : "N/A"}
      </text>

      <!-- Branding -->
      <text x="1140" y="600" font-family="system-ui, sans-serif" font-size="16" fill="#D1D5DB" text-anchor="end">
        foresight-apps.vercel.app
      </text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

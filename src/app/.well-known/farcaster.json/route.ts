import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/constants";

export async function GET() {
  const manifest = {
    accountAssociation: {
      // TODO: Sign manifest at https://www.base.dev/preview?tab=account
      header: "",
      payload: "",
      signature: "",
    },
    frame: {
      version: "1",
      name: "Foresight",
      subtitle: "Alpha Intelligence on Base",
      description:
        "Real-time on-chain alpha signals, smart wallet tracking, and AI-powered insights on Base L2.",
      iconUrl: `${APP_URL}/icon.png`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/og-image.png`,
      screenshotUrls: [],
      tags: ["alpha", "defi", "analytics", "base", "on-chain"],
      primaryCategory: "finance",
      buttonTitle: "View Alpha",
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#FFFFFF",
      webhookUrl: `${APP_URL}/api/webhook`,
      heroImageUrl: `${APP_URL}/og-image.png`,
      tagline: "On-chain alpha intelligence",
      ogTitle: "Foresight — Alpha Intelligence on Base",
      ogDescription: "Real-time on-chain alpha signals and smart wallet tracking on Base L2.",
      ogImageUrl: `${APP_URL}/og-image.png`,
    },
  };

  return NextResponse.json(manifest);
}

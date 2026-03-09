import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { APP_ID, APP_URL } from "@/lib/constants";
import "./globals.css";

const coinbaseDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/CoinbaseDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/CoinbaseDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-coinbase-display",
  display: "swap",
});

const coinbaseSans = localFont({
  src: [
    {
      path: "../../public/fonts/CoinbaseSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/CoinbaseSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-coinbase-sans",
  display: "swap",
});

const coinbaseMono = localFont({
  src: [
    {
      path: "../../public/fonts/CoinbaseMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/CoinbaseMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-coinbase-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Foresight — Alpha Intelligence on Base",
    template: "%s | Foresight",
  },
  description:
    "Real-time on-chain alpha signals from Base L2. Smart wallet tracking, token analytics, and AI-powered insights.",
  keywords: ["Farcaster", "alpha", "Base", "DeFi", "smart wallets", "on-chain analytics"],
  authors: [{ name: "Foresight" }],
  openGraph: {
    type: "website",
    siteName: "Foresight",
    title: "Foresight — Alpha Intelligence on Base",
    description:
      "Real-time on-chain alpha signals from Base L2. Smart wallet tracking and AI insights.",
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Foresight - Alpha Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Foresight",
    description: "Alpha intelligence on Base L2",
    images: [`${APP_URL}/og-image.png`],
    site: "@foresight",
  },
  // other: {
  //   "fc:frame": JSON.stringify(frame),
  // },
  other: {
    "base:app_id": APP_ID || "",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${coinbaseDisplay.variable} ${coinbaseSans.variable} ${coinbaseMono.variable} font-sans antialiased bg-ios-bg text-ios-text`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

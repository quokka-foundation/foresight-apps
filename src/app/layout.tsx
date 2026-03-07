import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { APP_ID, APP_URL } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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

// const frame = {
//   version: "next",
//   imageUrl: `${APP_URL}/og-image.png`,
//   button: {
//     title: "Trade Curves",
//     action: {
//       type: "launch_frame",
//       name: "Foresight",
//       url: APP_URL,
//       splashImageUrl: `${APP_URL}/splash.png`,
//       splashBackgroundColor: "#0052FF",
//     },
//   },
// };

export const metadata: Metadata = {
  title: {
    default: "Foresight — Continuous Outcome Markets",
    template: "%s | Foresight",
  },
  description:
    "Trade continuous outcome curves with 1-click leverage on Base. Prediction markets evolved.",
  keywords: ["Farcaster", "prediction markets", "Base", "DeFi", "curves", "leverage"],
  authors: [{ name: "Foresight" }],
  openGraph: {
    type: "website",
    siteName: "Foresight",
    title: "Foresight — Trade Outcome Curves on Base",
    description: "Trade continuous outcome curves with 1-click leverage. Live P&L in Farcaster.",
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Foresight - Continuous Outcome Markets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Foresight",
    description: "Trade continuous outcome curves on Base",
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
        className={`${inter.variable} ${coinbaseDisplay.variable} ${coinbaseSans.variable} ${coinbaseMono.variable} font-sans antialiased bg-ios-bg text-ios-text`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

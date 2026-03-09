"use client";

import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
import { WalletRow } from "@/components/WalletRow";
import { MOCK_WALLETS } from "@/lib/mock-data";

export default function WalletsPage() {
  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Smart Wallets" />

      <div className="flex-1 pb-24">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[0.75rem] text-ios-text-secondary">
            {MOCK_WALLETS.length} tracked wallets on Base
          </p>
        </div>

        <div className="divide-y divide-ios-separator">
          {MOCK_WALLETS.map((wallet) => (
            <WalletRow key={wallet.id} wallet={wallet} />
          ))}
        </div>
      </div>

      <TabBar />
    </div>
  );
}

"use client";

import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
import { WalletRow } from "@/components/WalletRow";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";
import { MOCK_WALLETS } from "@/lib/mock-data";

export default function WalletsPage() {
  const { data: wallets, loading } = useApiData(() => api.wallets(), MOCK_WALLETS);

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Smart Wallets" />

      <div className="flex-1 pb-24">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[0.75rem] text-ios-text-secondary">
            {loading ? "—" : wallets.length} tracked wallets on Base
          </p>
        </div>

        <div className="divide-y divide-ios-separator">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={i} className="px-4 py-3 h-[68px] animate-pulse bg-ios-bg-secondary/50" />
              ))
            : wallets.map((wallet) => <WalletRow key={wallet.id} wallet={wallet} />)}
        </div>
      </div>

      <TabBar />
    </div>
  );
}

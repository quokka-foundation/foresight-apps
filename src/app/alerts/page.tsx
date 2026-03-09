"use client";

import { AlertCard } from "@/components/AlertCard";
import { AnimatedButton } from "@/components/AnimatedButton";
import { Section } from "@/components/Section";
import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
import { MOCK_ALERT_HISTORY } from "@/lib/mock-data";

export default function AlertsPage() {
  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Alerts" />

      <div className="flex-1 pb-24">
        {/* Subscribe CTA */}
        <div className="px-4 pt-4 pb-2">
          <div className="bg-ios-bg-secondary rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[0.875rem] font-medium text-ios-text">Get notified</p>
              <p className="text-[0.75rem] text-ios-text-secondary mt-0.5">
                Set up signal alerts for real-time notifications
              </p>
            </div>
            <AnimatedButton variant="primary" size="sm">
              Setup
            </AnimatedButton>
          </div>
        </div>

        {/* Alert history */}
        <Section title="Recent Alerts">
          {MOCK_ALERT_HISTORY.length > 0 ? (
            <div className="space-y-1">
              {MOCK_ALERT_HISTORY.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-ios-text-secondary text-[0.875rem]">No alerts yet</p>
              <p className="text-ios-text-tertiary text-[0.75rem] mt-1">
                Subscribe to signal types to receive alerts
              </p>
            </div>
          )}
        </Section>
      </div>

      <TabBar />
    </div>
  );
}

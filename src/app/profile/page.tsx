"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout";
import { useApp } from "@/contexts/AppContext";
import { ProfileSection, DataTable, SummaryCard, SectionChart } from "@/components/profile";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Personal: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Family: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Financial: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Assets: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Liabilities: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Insurance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Retirement: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Goals: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
};

export default function ProfilePage() {
  const { sessionId, status, collectedData } = useApp();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = useMemo(() => Object.keys(collectedData), [collectedData]);
  const currentSection = activeSection || sections[0] || null;

  // Calculate summary stats
  const stats = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    // Try to extract values from different nodes
    Object.entries(collectedData).forEach(([nodeName, data]) => {
      const name = nodeName.toLowerCase();
      if (name.includes("asset")) {
        Object.values(data).forEach((v) => {
          if (typeof v === "number") totalAssets += v;
          if (typeof v === "object" && v !== null) {
            Object.values(v).forEach((n) => {
              if (typeof n === "number") totalAssets += n;
            });
          }
        });
      }
      if (name.includes("liabilit")) {
        Object.values(data).forEach((v) => {
          if (typeof v === "number") totalLiabilities += v;
          if (typeof v === "object" && v !== null) {
            Object.values(v).forEach((n) => {
              if (typeof n === "number") totalLiabilities += n;
            });
          }
        });
      }
      if (name.includes("financial") || name.includes("income")) {
        if (data.monthly_income) monthlyIncome = Number(data.monthly_income) || 0;
        if (data.annual_income) monthlyIncome = (Number(data.annual_income) || 0) / 12;
      }
      if (data.monthly_expenses && typeof data.monthly_expenses === "object") {
        Object.values(data.monthly_expenses).forEach((v) => {
          if (typeof v === "number") monthlyExpenses += v;
        });
      }
    });

    return { totalAssets, totalLiabilities, monthlyIncome, monthlyExpenses, netWorth: totalAssets - totalLiabilities };
  }, [collectedData]);

  return (
    <DashboardLayout sessionId={sessionId} status={status}>
      <div className="p-6 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Financial Profile</h1>
          <p className="text-slate-500 mt-1">Your comprehensive financial overview</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <SummaryCard
            label="Net Worth"
            value={stats.netWorth}
            type="currency"
            trend={stats.netWorth > 0 ? "up" : stats.netWorth < 0 ? "down" : "neutral"}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <SummaryCard
            label="Total Assets"
            value={stats.totalAssets}
            type="currency"
            color="emerald"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <SummaryCard
            label="Total Liabilities"
            value={stats.totalLiabilities}
            type="currency"
            color="rose"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
          />
          <SummaryCard
            label="Monthly Income"
            value={stats.monthlyIncome}
            type="currency"
            color="indigo"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          />
          <SummaryCard
            label="Monthly Expenses"
            value={stats.monthlyExpenses}
            type="currency"
            color="amber"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            }
          />
        </div>

        {sections.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No profile data yet</h3>
            <p className="text-slate-500 max-w-md">
              Start chatting with Vecta on the main page. Your financial profile will build up as you share information.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Section Tabs */}
            <div className="w-48 flex-shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      currentSection === section
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className={currentSection === section ? "text-indigo-500" : "text-slate-400"}>
                      {SECTION_ICONS[section] || SECTION_ICONS.Financial}
                    </span>
                    {formatSectionName(section)}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Content */}
            <div className="flex-1 overflow-y-auto">
              {currentSection && collectedData[currentSection] && (
                <ProfileSection
                  name={currentSection}
                  data={collectedData[currentSection]}
                  icon={SECTION_ICONS[currentSection]}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function formatSectionName(name: string): string {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


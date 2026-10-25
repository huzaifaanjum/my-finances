"use client";

import { useEffect, useState } from "react";
import SeeAlso from "@/components/ui/SeeAlso";
import { SectionHeading } from "@/components/ui/text";
import GuidelinesSection from "./GuidelinesSection";
import HealthCheck from "./HealthCheck";
import IncomeStreamsCard from "./IncomeStreamsCard";
import IncomeTargetCard from "./IncomeTargetCard";
import KeyInsights from "./KeyInsights";
import PayNeededCard from "./PayNeededCard";
import { MilestonesCard, MoneyMixCard, QuickFacts } from "./SpendingCards";
import WaffleCard from "./WaffleCard";

type Tab = "key" | "budget" | "income" | "facts";
const TABS: { id: Tab; label: string; note: string }[] = [
  { id: "key", label: "Key insights", note: "tax, job, pay, insurance" },
  { id: "budget", label: "Budget health", note: "checks and guidelines" },
  { id: "income", label: "Income target", note: "pay that fits the guidelines" },
  { id: "facts", label: "Milestones", note: "and quick facts" },
];

/** Every insight in the app, one subject per tab so nothing is buried in a long page. */
export default function InsightsView() {
  const [tab, setTabState] = useState<Tab>("key");
  useEffect(() => {
    try {
      const t = localStorage.getItem("iv_tab");
      if (TABS.some((x) => x.id === t)) setTabState(t as Tab);
    } catch {}
  }, []);
  const setTab = (t: Tab) => {
    setTabState(t);
    try {
      localStorage.setItem("iv_tab", t);
    } catch {}
  };

  return (
    <div className="iv">
      <div className="ps-tabs" role="tablist" aria-label="Insights sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
            <small>{t.note}</small>
          </button>
        ))}
      </div>

      <div role="tabpanel" className="iv-panel">
        {tab === "key" && <KeyInsights />}
        {tab === "budget" && (
          <>
            <HealthCheck />
            <section className="iv-sec">
              <SectionHeading title="Your budget">How your take-home is split, and where the spending goes.</SectionHeading>
              <div className="iv-pair">
                <WaffleCard />
                <MoneyMixCard />
              </div>
            </section>
            <GuidelinesSection />
          </>
        )}
        {tab === "income" && (
          <>
            <section className="iv-sec">
              <SectionHeading title="Income target">
                How much take-home pay would make today&apos;s budget fit the guidelines, and which extra income streams could get you there.
              </SectionHeading>
              <div className="iv-pair">
                <IncomeTargetCard />
                <IncomeStreamsCard />
              </div>
            </section>
            <PayNeededCard />
          </>
        )}
        {tab === "facts" && (
          <section className="iv-facts">
            <MilestonesCard />
            <QuickFacts />
          </section>
        )}
      </div>

      <SeeAlso href="/recommendations" label="Action plan">
        What to do about all this: next steps ranked by what they are worth, where to put your money, and your checklist
      </SeeAlso>
    </div>
  );
}

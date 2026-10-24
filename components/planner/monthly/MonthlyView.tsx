"use client";

import { useState } from "react";
import CashFlowSummary from "./CashFlowSummary";
import MonthTable from "./MonthTable";
import YearAtAGlance from "./YearAtAGlance";

/**
 * Three parts, each with one job: the headline numbers, the shape of the year, and every month in detail.
 * Picking a month on the calendar opens it in the ledger, so there is one place for month details.
 */
export default function MonthlyView() {
  // n changes on every pick, so picking the same month again still scrolls to it
  const [focus, setFocus] = useState<{ i: number; n: number } | null>(null);
  return (
    <div className="mm">
      <CashFlowSummary />
      <YearAtAGlance selected={focus?.i ?? null} onPick={(i) => setFocus((f) => ({ i, n: (f?.n ?? 0) + 1 }))} />
      <MonthTable focus={focus} />
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { HorizonSelect } from "@/components/planner/shared/controls";
import { usePlan } from "@/components/providers/PlannerProvider";
import { money, percent } from "@/lib/format";
import { monthlyLedger } from "@/lib/planner/cashflow";

/** Ranges that make sense month by month. */
const MONTHLY_HORIZONS = [3, 6, 12, 24, 36, 60] as const;
const TIGHT = 500;

/** The page's one set of headline numbers, for the range you pick. */
export default function CashFlowSummary() {
  const plan = usePlan();
  const ledger = useMemo(() => monthlyLedger(plan), [plan]);
  const flows = ledger.filter((r) => !r.start);
  const pay = flows.reduce((t, r) => t + r.pay, 0);
  const extra = flows.reduce((t, r) => t + r.extraIn, 0);
  const out = flows.reduce((t, r) => t + r.spending, 0);
  const saved = ledger.reduce((t, r) => t + r.saved, 0);
  const income = pay + extra;
  const last = ledger[ledger.length - 1];
  const tight = ledger.filter((r) => r.lowest < TIGHT).length;

  return (
    <section className="cs">
      <div className="cs-h">
        <h2>
          {ledger[0].label} to {last.label}
        </h2>
        <label>
          Show
          <HorizonSelect className="mhz" values={MONTHLY_HORIZONS} />
        </label>
      </div>
      <div className="cf-sum">
        <div>
          <span>Money in</span>
          <b>{money(income)}</b>
          <small>
            {money(pay)} pay{extra ? ` + ${money(extra)} bonuses and one-time` : ""}
          </small>
        </div>
        <div>
          <span>Money out</span>
          <b>{money(out)}</b>
          <small>{money(plan.exp.total)} a month of expenses, plus one-time costs</small>
        </div>
        <div className="pos">
          <span>Saved</span>
          <b>{money(saved)}</b>
          <small>{income ? `${percent(saved / income)} of what came in · guideline 20%` : ""}</small>
        </div>
        <div>
          <span>Balance by {last.label}</span>
          <b>{money(last.balance)}</b>
          <small>covers {Math.max(0, last.cover).toFixed(1)} months of expenses</small>
        </div>
        <div className={plan.low.bal < 0 ? "neg" : plan.low.bal < TIGHT ? "warn" : "pos"}>
          <span>Tightest day</span>
          <b>{money(plan.low.bal)}</b>
          <small>{tight ? `${tight} month${tight === 1 ? "" : "s"} with under ${money(TIGHT)} in chequing` : `never under ${money(TIGHT)}`}</small>
        </div>
      </div>
    </section>
  );
}

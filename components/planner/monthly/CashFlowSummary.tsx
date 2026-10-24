"use client";

import { useMemo, useState } from "react";
import { useReferencePayslip } from "@/components/payslips/useReferencePayslip";
import { HorizonSelect } from "@/components/planner/shared/controls";
import { usePlan } from "@/components/providers/PlannerProvider";
import { money, percent } from "@/lib/format";
import { basePayFor } from "@/lib/payslips/basePay";
import { dayLabel, monthDate } from "@/lib/planner/calendar";
import { PAY } from "@/lib/pay";
import { monthlyLedger } from "@/lib/planner/cashflow";
import { taggedAt, yearlyAt } from "@/lib/planner/projection";
import { COLOR } from "@/lib/colors";

/** Ranges that make sense month by month. */
const MONTHLY_HORIZONS = [3, 6, 12, 24, 36, 60] as const;
const TIGHT = 500;
const GUIDE = 0.2;

interface Part {
  key: string;
  label: string;
  value: number;
  color: string;
  detail?: string;
}

function Bar({ parts, total, guide }: { parts: Part[]; total: number; guide?: boolean }) {
  const shown = parts.filter((p) => p.value > 0.5);
  return (
    <>
      <div className="cs-bar" role="img" aria-label={shown.map((p) => `${p.label} ${money(p.value)}`).join(", ")}>
        {shown.map((p) => (
          <i key={p.key} style={{ width: `${(p.value / (total || 1)) * 100}%`, background: p.color }} />
        ))}
        {guide && <s style={{ left: `${(1 - GUIDE) * 100}%` }} title="Saving 20% starts here" />}
      </div>
      <div className="cs-keys">
        {shown.map((p) => (
          <span key={p.key}>
            <i style={{ background: p.color }} />
            {p.label} <b>{money(p.value)}</b> <em>{percent(p.value / (total || 1))}</em>
            {p.detail && <small>{p.detail}</small>}
          </span>
        ))}
        {guide && (
          <span className="cs-guide">
            <i />
            20% guideline
          </span>
        )}
      </div>
    </>
  );
}

/** Headline for the range you pick: every payday's gross pay and where it goes, then what the budget does with it. */
export default function CashFlowSummary() {
  const plan = usePlan();
  const ledger = useMemo(() => monthlyLedger(plan), [plan]);
  const flows = useMemo(() => ledger.filter((r) => !r.start), [ledger]);
  const { state } = plan;
  const ref = useReferencePayslip();

  // bonuses on switches, starting from what your plan includes
  const planSigning = state.oneTime.income.some((o) => o.tag === "signing" && o.amount > 0);
  const planIncentive = state.income.some((o) => o.tag === "incentive" && o.amount > 0);
  const [signingOn, setSigningOn] = useState(planSigning);
  const [incentiveOn, setIncentiveOn] = useState(planIncentive);

  // every payday in the range: one per month, the starting month included
  const paydays = useMemo(() => ledger.map((r) => ({ year: monthDate(r.i).getFullYear(), month: monthDate(r.i).getMonth() })), [ledger]);
  const pay = useMemo(() => basePayFor(ref.data, paydays, { signing: signingOn, incentive: incentiveOn }), [ref.data, paydays, signingOn, incentiveOn]);

  // the budget's months (the starting month holds what you have now)
  const takeHome = flows.reduce((t, r) => t + r.pay, 0);
  const signingNet = flows.reduce((t, r) => t + taggedAt(state, r.i, "signing"), 0);
  // not in the plan: what the first incentive would add each March
  const incentiveNet = planIncentive
    ? flows.reduce((t, r) => t + yearlyAt(state, r.i, "incentive"), 0)
    : flows.filter((r) => monthDate(r.i).getMonth() === 2).length * PAY.firstAipNet;
  // one-time and yearly income other than the bonuses
  const oneTimeIn = flows.reduce((t, r) => t + r.extraIn, 0) - signingNet - (planIncentive ? incentiveNet : 0);
  const expenses = flows.reduce((t, r) => t + r.expenses, 0);
  const oneOff = flows.reduce((t, r) => t + r.extraOut, 0);
  const bonusIn = (signingOn ? signingNet : 0) + (incentiveOn ? incentiveNet : 0);
  const income = takeHome + oneTimeIn + bonusIn;
  const savedFromPay = takeHome + oneTimeIn - expenses - oneOff;
  const saved = savedFromPay + bonusIn;
  const rate = income ? saved / income : 0;

  // the ledger follows your plan; adjust its end for any bonus switched differently here
  const planBonus = signingNet + (planIncentive ? incentiveNet : 0);
  const shift = bonusIn - planBonus;
  const first = ledger[0];
  const last = ledger[ledger.length - 1];
  const endBalance = last.balance + shift;
  const cover = plan.exp.total ? endBalance / plan.exp.total : 0;
  const tight = ledger.filter((r) => r.lowest < TIGHT).length;
  const typical = flows.length ? saved / flows.length : 0;

  const bonusText = [signingOn && pay.signing > 0 && `${money(pay.signing)} signing bonus`, incentiveOn && pay.incentive > 0 && `${money(pay.incentive)} incentive`].filter(Boolean);

  const grossParts: Part[] = [
    { key: "tax", label: "Income tax", value: pay.incomeTax, color: COLOR.tax, detail: `federal ${money(pay.federalTax)}, Quebec ${money(pay.quebecTax)}` },
    { key: "plans", label: "Government plans", value: pay.govPlans, color: COLOR.gov, detail: `QPP ${money(pay.qpp)}, EI ${money(pay.ei)}, QPIP ${money(pay.qpip)}` },
    { key: "pension", label: "Your pension", value: pay.pension, color: COLOR.pension, detail: `+ ${money(pay.match)} from Air Canada` },
    { key: "ins", label: "Insurance", value: pay.insurance, color: COLOR.insurance, detail: "disability, life, dental, AD&D" },
    { key: "net", label: "Take-home", value: pay.net, color: COLOR.keep },
  ];
  const budgetParts: Part[] = [
    { key: "exp", label: "Expenses", value: expenses, color: COLOR.subs },
    { key: "one", label: "One-time costs", value: oneOff, color: COLOR.wants },
    { key: "pay", label: "Saved from pay", value: Math.max(0, savedFromPay), color: COLOR.keep },
    { key: "bonus", label: "Saved from bonuses", value: bonusIn, color: COLOR.extra },
  ];

  return (
    <section className="cs">
      <div className="cs-h">
        <h2>
          {first.label} to {last.label}
        </h2>
        <div className="cs-ctl">
          <label className="ps-switch">
            <input type="checkbox" role="switch" checked={signingOn} onChange={(e) => setSigningOn(e.target.checked)} />
            <span aria-hidden="true" />
            Signing bonus
          </label>
          <label className="ps-switch">
            <input type="checkbox" role="switch" checked={incentiveOn} onChange={(e) => setIncentiveOn(e.target.checked)} />
            <span aria-hidden="true" />
            Incentive
          </label>
          <label>
            Show
            <HorizonSelect className="mhz" values={MONTHLY_HORIZONS} />
          </label>
        </div>
      </div>

      <div className="cs-card">
        <p className="cs-lead">
          Over <b>{pay.months} paydays</b> you earn <b>{money(pay.gross)}</b> gross
          {bonusText.length > 0 && (
            <span>
              {" "}
              ({money(pay.salary)} salary + {bonusText.join(" + ")})
            </span>
          )}
          . After <b>{money(pay.incomeTax)}</b> income tax, <b>{money(pay.govPlans)}</b> government plans, <b>{money(pay.pension)}</b> pension and{" "}
          <b>{money(pay.insurance)}</b> insurance, <b className="pos">{money(pay.net)}</b> reaches your account.
        </p>

        <div className="cs-row">
          <div className="cs-rh">
            <span>
              Gross pay · {pay.months} payslips, {first.label} to {last.label}
              <em> · from {ref.source}</em>
            </span>
            <b>{money(pay.gross)}</b>
          </div>
          <Bar parts={grossParts} total={pay.gross} />
        </div>

        <div className="cs-row">
          <div className="cs-rh">
            <span>
              Your budget · {flows[0]?.label ?? last.label} to {last.label}
              <em> · {first.label} is your starting point, so its pay funds the month after</em>
            </span>
            <b>{money(income)}</b>
          </div>
          <Bar parts={budgetParts} total={income} guide />
          <p className="cs-note">
            Money in: {money(takeHome)} take-home
            {oneTimeIn > 0 && ` + ${money(oneTimeIn)} other income`}
            {bonusIn > 0 && ` + ${money(bonusIn)} bonuses after tax`}. You keep{" "}
            <b className={rate >= GUIDE ? "pos" : "warn"}>
              {money(saved)} ({percent(rate)})
            </b>
            {rate >= GUIDE ? ", above the 20% guideline." : ", below the 20% guideline."}
            {!planIncentive && incentiveOn && " The incentive is on here only; add it to your recurring income in Budget to plan with it."}
          </p>
        </div>

        <dl className="cs-figs">
          <div>
            <dt>Balance</dt>
            <dd>
              <span className={first.balance < 0 ? "neg" : undefined}>{money(first.balance)}</span> → {money(endBalance)}
            </dd>
            <small>
              {endBalance - first.balance >= 0 ? "+" : ""}
              {money(endBalance - first.balance)} over the range
            </small>
          </div>
          <div>
            <dt>Emergency cover</dt>
            <dd className={cover >= 3 ? "pos" : cover >= 1 ? undefined : "warn"}>{Math.max(0, cover).toFixed(1)} months</dd>
            <small>of expenses by {last.label}; aim for 3</small>
          </div>
          <div>
            <dt>Typical month</dt>
            <dd>{money(typical)}</dd>
            <small>saved{bonusIn > 0 ? ", bonuses included" : ""}</small>
          </div>
          <div>
            <dt>Tightest day</dt>
            <dd className={plan.low.bal < 0 ? "neg" : plan.low.bal < TIGHT ? "warn" : undefined}>{money(plan.low.bal)}</dd>
            <small>
              {dayLabel(plan.lowDate)}
              {tight ? ` · ${tight} tight month${tight === 1 ? "" : "s"}` : ""}
            </small>
          </div>
        </dl>
      </div>
    </section>
  );
}

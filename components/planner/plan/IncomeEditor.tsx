"use client";

import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { useReferencePayslip } from "@/components/payslips/useReferencePayslip";
import { usePlanner } from "@/components/providers/PlannerProvider";
import MoneyInput from "@/components/ui/MoneyInput";
import { money } from "@/lib/format";
import { usualNet } from "@/lib/payslips/analysis";
import { PAY } from "@/lib/pay";
import { MONTH_NAMES } from "@/lib/planner/calendar";
import { INCENTIVE_MONTH } from "@/lib/planner/defaults";
import { SLIDERS } from "@/lib/planner/config";
import type { RecurringIncome } from "@/lib/planner/types";
import OneTimeList, { RemoveButton } from "./OneTimeList";

/** A labelled amount you type. */
export function AmountRow({ label, hint, value, max, step, onChange }: { label: string; hint?: React.ReactNode; value: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="bd-row">
      <div className="bd-l">
        <b>
          <G>{label}</G>
        </b>
        {hint && <small>{hint}</small>}
      </div>
      <MoneyInput label={label} value={value} max={max} step={step} onChange={onChange} />
    </div>
  );
}

/** Heading for a recurring or one-time block, with its total. */
export function SubHead({ title, total }: { title: string; total: string }) {
  return (
    <div className="bd-sub">
      <h3>{title}</h3>
      <span>{total}</span>
    </div>
  );
}

/** "Every month", or the month a yearly payment lands. Stored as -1 for monthly, else the calendar month. */
const WHEN = [{ value: -1, label: "Every month" }, ...MONTH_NAMES.map((m, k) => ({ value: k, label: `Each ${m}` }))];

function IncomeRow({ item }: { item: RecurringIncome }) {
  const { updateIncome, removeIncome } = usePlanner();
  return (
    <div className="bd-row ot">
      <input className="ot-name" type="text" value={item.name} placeholder="Title, e.g. rental income" aria-label="Title" onChange={(e) => updateIncome(item.id, { name: e.target.value })} />
      <select
        className="ot-month"
        value={item.every === 1 ? -1 : item.month}
        aria-label={`How often ${item.name || "this income"} arrives`}
        onChange={(e) => {
          const v = Number(e.target.value);
          updateIncome(item.id, v < 0 ? { every: 1 } : { every: 12, month: v });
        }}
      >
        {WHEN.map((w) => (
          <option key={w.value} value={w.value}>
            {w.label}
          </option>
        ))}
      </select>
      <MoneyInput label={`Amount of ${item.name || "this income"}`} value={item.amount} step={50} onChange={(amount) => updateIncome(item.id, { amount })} />
      <RemoveButton name={item.name} onClick={() => removeIncome(item.id)} />
    </div>
  );
}

/** Income: what arrives every month or year, and what arrives once, each on its date. */
export default function IncomeEditor() {
  const { state, setNumber, setNumbers, addIncome } = usePlanner();
  const { numbers, income, oneTime } = state;
  const ref = useReferencePayslip();
  const payslipNet = usualNet(ref.data);
  const suggested = Math.round(payslipNet / SLIDERS.net.step) * SLIDERS.net.step;
  const monthly = numbers.net + income.reduce((t, o) => t + (o.every === 1 ? o.amount : 0), 0);
  const yearly = income.reduce((t, o) => t + (o.every === 12 ? o.amount : 0), 0);
  const oneTimeTotal = numbers.start + numbers.lump + oneTime.income.reduce((t, o) => t + o.amount, 0);

  return (
    <GlossaryScope>
      <div className="bd">
        <div className="bd-g">
          <SubHead title="Recurring" total={`${money(monthly)} a month${yearly ? ` + ${money(yearly)} a year` : ""}`} />
          <AmountRow
            label="Take-home pay"
            hint={
              Math.abs(numbers.net - payslipNet) >= SLIDERS.net.step ? (
                <>
                  every month · {ref.source} says {money(payslipNet, 2)} ·{" "}
                  <button type="button" className="bd-link" onClick={() => setNumber("net", suggested)}>
                    use {money(suggested)}
                  </button>
                </>
              ) : (
                <>every month · matches {ref.source}</>
              )
            }
            value={numbers.net}
            max={SLIDERS.net.max}
            step={SLIDERS.net.step}
            onChange={(v) => setNumber("net", v)}
          />
          {income.map((o) => (
            <IncomeRow key={o.id} item={o} />
          ))}
          <button className="ot-add" type="button" onClick={() => addIncome()}>
            + Add income that repeats
          </button>
          <p className="bd-note">
            Enter amounts after tax. Yearly income lands on that month&rsquo;s payday.
            {!income.some((o) => o.tag === "incentive") && (
              <>
                {" "}
                The annual incentive isn&rsquo;t guaranteed, so it&rsquo;s left out ·{" "}
                <button type="button" className="bd-link" onClick={() => addIncome({ name: "Annual incentive", amount: PAY.firstAipNet, every: 12, month: INCENTIVE_MONTH, tag: "incentive" })}>
                  add {money(PAY.firstAipNet)} each March
                </button>
              </>
            )}
          </p>
        </div>

        <div className="bd-g">
          <SubHead title="One-time" total={money(oneTimeTotal)} />
          <AmountRow
            label="Savings you have today"
            hint="already in your account"
            value={numbers.start + numbers.lump}
            max={SLIDERS.start.max + SLIDERS.lump.max}
            step={SLIDERS.start.step}
            onChange={(v) => setNumbers({ start: Math.min(v, SLIDERS.start.max), lump: Math.max(0, v - SLIDERS.start.max) })}
          />
          <OneTimeList kind="income" />
        </div>
      </div>
    </GlossaryScope>
  );
}

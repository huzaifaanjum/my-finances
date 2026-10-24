"use client";

import { GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlanner } from "@/components/providers/PlannerProvider";
import MoneyInput from "@/components/ui/MoneyInput";
import { money, percent } from "@/lib/format";
import { EXPENSE_GROUPS } from "@/lib/planner/config";
import type { RecurringExpense } from "@/lib/planner/types";
import { SubHead } from "./IncomeEditor";
import OneTimeList, { RemoveButton } from "./OneTimeList";

/** Same colours as the budget bar above. */
const GROUP_COLORS = ["var(--scotia)", "var(--mix)", "var(--promo)"];
const GROUP_TITLES = ["Fixed bills", "Subscriptions", "Day-to-day spending"];
const ADD = ["+ Add a bill", "+ Add a subscription", "+ Add a spending category"];
const PLACEHOLDER = ["Title, e.g. insurance", "Title, e.g. Netflix", "Title, e.g. gym"];
const EVERY = [
  { value: 1, label: "Monthly" },
  { value: 2, label: "Every 2 months" },
  { value: 3, label: "Every 3 months" },
  { value: 6, label: "Every 6 months" },
  { value: 12, label: "Yearly" },
];

function ExpenseRow({ item, color, biggest, net }: { item: RecurringExpense; color: string; biggest: number; net: number }) {
  const { updateExpense, removeExpense } = usePlanner();
  const monthly = item.amount / item.every;
  const update = (patch: Partial<Omit<RecurringExpense, "id">>) => updateExpense(item.id, patch);
  return (
    <div className={`bd-row ex ot${item.amount === 0 ? " zero" : ""}`}>
      <input className="ot-name" type="text" value={item.name} placeholder={PLACEHOLDER[item.group]} aria-label="Title" onChange={(e) => update({ name: e.target.value })} />
      <button
        type="button"
        className={`bd-need${item.need ? " on" : ""}`}
        aria-pressed={item.need}
        title={item.need ? "A need: counts toward the 50% in the 50/30/20 check. Click to make it a want." : "A want: counts toward the 30%. Click to make it a need."}
        onClick={() => update({ need: !item.need })}
      >
        {item.need ? "need" : "want"}
      </button>
      <select className="ot-month ot-every" value={item.every} aria-label={`How often ${item.name || "this"} is billed`} onChange={(e) => update({ every: Number(e.target.value) })}>
        {EVERY.some((o) => o.value === item.every) ? null : <option value={item.every}>Every {item.every} months</option>}
        {EVERY.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <MoneyInput label={`Amount of ${item.name || "this expense"}`} value={item.amount} step={item.group === 1 ? 1 : 5} onChange={(amount) => update({ amount })} />
      <RemoveButton name={item.name} onClick={() => removeExpense(item.id)} />
      <span className="bd-size" aria-hidden="true" title={`${money(monthly, 2)}/mo · ${percent(monthly / net)} of take-home`}>
        <i style={{ width: `${(monthly / biggest) * 100}%`, background: color }} />
      </span>
    </div>
  );
}

/** Expenses: what you pay every month (grouped and foldable), then one-time costs. */
export default function ExpensesEditor() {
  const { state, plan, addExpense } = usePlanner();
  const net = plan.net || 1;
  const biggest = Math.max(1, ...state.expenses.map((e) => e.amount / e.every));

  return (
    <GlossaryScope>
      <div className="bd">
        <div className="bd-g">
          <SubHead title="Recurring" total={`${money(plan.exp.total)} a month · ${percent(plan.exp.total / net)} of take-home`} />
          {GROUP_TITLES.map((title, gi) => {
            const total = plan.exp.groups[gi] ?? 0;
            const color = GROUP_COLORS[gi];
            const items = state.expenses.filter((e) => e.group === gi);
            const note = EXPENSE_GROUPS[gi]?.note;
            const spread = items.filter((e) => e.every > 1 && e.amount > 0);
            return (
              <details key={title} className="bd-grp" open>
                <summary>
                  <i style={{ background: color }} />
                  <h3>{title}</h3>
                  <span>
                    <b>{money(total)}</b> <em>{percent(total / net)}</em>
                  </span>
                </summary>
                {note && <p className="bd-note">{note}</p>}
                <div className="bd-cols">
                  {items.map((e) => (
                    <ExpenseRow key={e.id} item={e} color={color} biggest={biggest} net={net} />
                  ))}
                </div>
                {spread.length > 0 && (
                  <p className="bd-note">
                    Spread over the months: {spread.map((e) => `${e.name || "untitled"} ${money(e.amount / e.every, 2)}/mo`).join(" · ")}.
                  </p>
                )}
                <button className="ot-add" type="button" onClick={() => addExpense(gi)}>
                  {ADD[gi]}
                </button>
              </details>
            );
          })}
        </div>

        <div className="bd-g">
          <SubHead title="One-time" total={money(state.oneTime.expense.reduce((t, o) => t + o.amount, 0))} />
          <OneTimeList kind="expense" />
        </div>
      </div>
    </GlossaryScope>
  );
}

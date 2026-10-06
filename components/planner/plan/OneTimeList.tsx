"use client";

import { usePlanner } from "@/components/providers/PlannerProvider";
import NumberField from "@/components/ui/NumberField";
import { GroupHeader, Note } from "@/components/ui/text";
import { money } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { ONE_TIME_MONTHS } from "@/lib/planner/defaults";
import type { OneTimeItem, OneTimeKind } from "@/lib/planner/types";

const COPY: Record<OneTimeKind, { title: string; add: string; note: string }> = {
  income: {
    title: "Other one-time payments",
    add: "+ Add a one-time payment",
    note: 'Tick the box to include a payment in the projection. "Now" is money you have today. Other months count as a deposit that month and arrive on payday (the last banking day) in the chart.',
  },
  expense: {
    title: "One-time expenses",
    add: "+ Add a one-time expense",
    note: 'These come out of your savings once, in the month you pick. "Now" is paid today. Change the amount of the credit card balance to what you still owe.',
  },
};

const MONTH_OPTIONS = Array.from({ length: ONE_TIME_MONTHS }, (_, i) => ({ value: i, label: i ? monthLabel(i) : "Now (Oct 2026)" }));

function OneTimeRow({ kind, item }: { kind: OneTimeKind; item: OneTimeItem }) {
  const { updateOneTime, removeOneTime } = usePlanner();
  const update = (patch: Partial<OneTimeItem>) => updateOneTime(kind, item.id, patch);
  return (
    <div className={`oo${item.on ? "" : " off"}`}>
      <input type="checkbox" checked={item.on} aria-label="Include in projection" onChange={(e) => update({ on: e.target.checked })} />
      <input type="text" value={item.name} aria-label="Name" onChange={(e) => update({ name: e.target.value })} />
      <NumberField min={0} step={50} value={item.amount} aria-label="Amount" onChange={(amount) => update({ amount })} />
      <select className="om" value={item.month} aria-label="Month" onChange={(e) => update({ month: Number(e.target.value) })}>
        {MONTH_OPTIONS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <button className="ox" type="button" aria-label="Remove" onClick={() => removeOneTime(kind, item.id)}>
        ×
      </button>
    </div>
  );
}

/** Editable list of one-off payments or expenses, each tied to a month. */
export default function OneTimeList({ kind }: { kind: OneTimeKind }) {
  const { state, addOneTime } = usePlanner();
  const items = state.oneTime[kind];
  const copy = COPY[kind];
  const total = items.reduce((t, o) => t + (o.on ? o.amount : 0), 0);
  return (
    <div>
      <GroupHeader label={copy.title} value={money(total)} />
      {items.map((o) => (
        <OneTimeRow key={o.id} kind={kind} item={o} />
      ))}
      <button className="add" type="button" onClick={() => addOneTime(kind)}>
        {copy.add}
      </button>
      <Note style={{ marginTop: 10 }}>{copy.note}</Note>
    </div>
  );
}

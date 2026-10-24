"use client";

import { usePlanner } from "@/components/providers/PlannerProvider";
import MoneyInput from "@/components/ui/MoneyInput";
import { isoDate } from "@/lib/planner/calendar";
import { ONE_TIME_MONTHS } from "@/lib/planner/defaults";
import type { OneTimeItem, OneTimeKind } from "@/lib/planner/types";

const ADD: Record<OneTimeKind, string> = {
  income: "+ Add money that arrives once",
  expense: "+ Add a one-time cost",
};

const PLACEHOLDER: Record<OneTimeKind, string> = {
  income: "Title, e.g. tax refund",
  expense: "Title, e.g. trip, laptop",
};

/** Dates the plan covers: from its first day to five years out. */
const MIN_DATE = isoDate(0, 1);
const MAX_DATE = isoDate(ONE_TIME_MONTHS - 1);

/** Remove button shared by every editable row. */
export function RemoveButton({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button className="ot-x" type="button" aria-label={`Remove ${name || "this item"}`} title="Remove" onClick={onClick}>
      ×
    </button>
  );
}

function OneTimeRow({ kind, item }: { kind: OneTimeKind; item: OneTimeItem }) {
  const { updateOneTime, removeOneTime } = usePlanner();
  const update = (patch: Partial<Omit<OneTimeItem, "id" | "month">>) => updateOneTime(kind, item.id, patch);
  return (
    <div className="bd-row ot">
      <input className="ot-name" type="text" value={item.name} placeholder={PLACEHOLDER[kind]} aria-label="Title" onChange={(e) => update({ name: e.target.value })} />
      <input
        className="ot-date"
        type="date"
        value={item.date}
        min={MIN_DATE}
        max={MAX_DATE}
        aria-label={`Date of ${item.name || "this item"}`}
        onChange={(e) => e.target.value && update({ date: e.target.value })}
      />
      <MoneyInput label={`Amount of ${item.name || "this item"}`} value={item.amount} step={50} onChange={(amount) => update({ amount })} />
      <RemoveButton name={item.name} onClick={() => removeOneTime(kind, item.id)} />
    </div>
  );
}

/** One-off money in or out, each on the date you pick. Every item listed counts; remove it to leave it out. */
export default function OneTimeList({ kind }: { kind: OneTimeKind }) {
  const { state, addOneTime } = usePlanner();
  const items = [...state.oneTime[kind]].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  return (
    <>
      {items.map((o) => (
        <OneTimeRow key={o.id} kind={kind} item={o} />
      ))}
      <button className="ot-add" type="button" onClick={() => addOneTime(kind)}>
        {ADD[kind]}
      </button>
    </>
  );
}

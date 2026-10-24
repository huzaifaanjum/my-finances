import type { ReactNode } from "react";
import { money } from "@/lib/format";
import type { MonthRow } from "@/lib/planner/types";
import { COLOR } from "@/lib/colors";

/** Rows inside a chart tooltip: swatch, label, value. */
export function TipRow({ label, value, color, total }: { label: string; value: number; color?: string; total?: boolean }) {
  return (
    <div className={total ? "tt" : undefined}>
      {color && <i style={{ background: color }} />}
      {label}
      <span>{money(value)}</span>
    </div>
  );
}

export function TipTitle({ children }: { children: ReactNode }) {
  return <b>{children}</b>;
}

/** What one month added and where it came from. */
export function MonthTip({ row }: { row: MonthRow }) {
  return (
    <>
      <TipTitle>{row.label}</TipTitle>
      <TipRow label="From pay" value={row.base} color={COLOR.keep} />
      {row.extra !== 0 && <TipRow label="Bonuses and one-time" value={row.extra} color={COLOR.extra} />}
      <TipRow label="Saved" value={row.deposit} total />
      <TipRow label="Balance" value={row.balance} />
    </>
  );
}

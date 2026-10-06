"use client";

import { Fragment, useState } from "react";
import { MonthTip } from "@/components/charts/TooltipRows";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import FloatingTip from "@/components/ui/FloatingTip";
import { compactMoney } from "@/lib/format";
import { MONTH_NAMES, monthDate, planIndex } from "@/lib/planner/calendar";

/** Calendar heatmap: one square per month, darker green for more saved. */
export default function YearAtAGlance() {
  const { rows } = usePlan();
  const [tip, setTip] = useState<{ k: number; x: number; y: number } | null>(null);
  const max = Math.max(1, ...rows.map((r) => r.deposit));
  const years = [...new Set(rows.map((r) => monthDate(r.i).getFullYear()))];

  return (
    <Card
      wide
      title="Year at a glance"
      description="Each square is a month. Darker green means more saved; the amber dot marks a bonus or one-time payment."
    >
      <div className="mcal" onPointerLeave={() => setTip(null)}>
        <span />
        {MONTH_NAMES.map((m) => (
          <span key={m} className="mh">
            {m[0]}
            <em>{m.slice(1)}</em>
          </span>
        ))}
        {years.map((y) => (
          <Fragment key={y}>
            <span className="my">{y}</span>
            {MONTH_NAMES.map((m, mi) => {
              const k = planIndex(y, mi);
              const r = rows[k];
              if (k < 0 || !r) return <span key={m} className="mc off" />;
              const strength = r.deposit <= 0 ? 0 : Math.round(18 + (82 * r.deposit) / max);
              const background =
                r.deposit < 0 ? "color-mix(in srgb,var(--neg) 55%,#18181b)" : `color-mix(in srgb,var(--std) ${strength}%,#18181b)`;
              return (
                <span
                  key={m}
                  className={`mc${strength > 55 ? " lt" : ""}`}
                  tabIndex={0}
                  style={{ background }}
                  onPointerMove={(e) => setTip({ k, x: e.clientX, y: e.clientY })}
                  onFocus={(e) => {
                    const b = e.currentTarget.getBoundingClientRect();
                    setTip({ k, x: b.left, y: b.bottom });
                  }}
                  onBlur={() => setTip(null)}
                >
                  {r.extra !== 0 && <b />}
                  {compactMoney(r.deposit)}
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>
      <div className="mscale">
        <span>Less</span>
        <i />
        <span>More</span>
        <span className="mdot">
          <b />
          Bonus or one-time
        </span>
      </div>
      {tip && rows[tip.k] && (
        <FloatingTip point={tip}>
          <MonthTip row={rows[tip.k]} />
        </FloatingTip>
      )}
    </Card>
  );
}

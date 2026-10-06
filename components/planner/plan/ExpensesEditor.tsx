"use client";

import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlanner } from "@/components/providers/PlannerProvider";
import RangeControl from "@/components/ui/RangeControl";
import { GroupHeader, Note } from "@/components/ui/text";
import { money, percent, signedMoney } from "@/lib/format";
import { EXPENSE_GROUPS } from "@/lib/planner/config";

function Totals() {
  const { plan } = usePlanner();
  const { exp, left, net, rate } = plan;
  return (
    <GlossaryScope>
      <div className="duo">
        <div className="m tot">
          <div className="k">Total expenses</div>
          <div className="v">{money(exp.total)}</div>
          <div className="n">
            Fixed {money(exp.fixed)} · Variable {money(exp.variable)}
          </div>
        </div>
        <div className={`m tot ${left < 0 ? "neg" : "pos"}`}>
          <div className="k">Left over each month</div>
          <div className="v">{signedMoney(left)}</div>
          <div className="n">
            <G>
              {left < 0
                ? `Over budget. Your ${money(net)} take-home does not cover it.`
                : `${percent(rate)} of your ${money(net)} take-home`}
            </G>
          </div>
        </div>
      </div>
    </GlossaryScope>
  );
}

/** Every expense slider, grouped, with group totals. */
export default function ExpensesEditor() {
  const { state, plan, setExpense } = usePlanner();
  return (
    <>
      <Totals />
      {EXPENSE_GROUPS.map((group, gi) => (
        <div key={group.title}>
          <GroupHeader label={group.title} value={money(plan.exp.groups[gi])} />
          {group.note && <Note>{group.note}</Note>}
          {group.items.map((it, ii) => {
            const amount = state.expenses[gi][ii];
            return (
              <RangeControl
                key={it.id}
                label={
                  <span>
                    <G>{it.label}</G>
                    {it.every > 1 && <small> = {money(amount / it.every, 2)} a month</small>}
                  </span>
                }
                value={amount}
                min={0}
                max={it.max}
                step={it.step}
                format={(v) => money(v)}
                onChange={(v) => setExpense(gi, ii, v)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

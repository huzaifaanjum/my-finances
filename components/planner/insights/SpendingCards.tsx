"use client";

import { G } from "@/components/glossary/GlossaryText";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { ProgressBar, SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { LegendRow } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { EXPENSE_GROUPS } from "@/lib/planner/config";
import { savingsMilestones } from "@/lib/planner/milestones";

/** Spending by group, and the five biggest categories. */
export function MoneyMixCard() {
  const { exp } = usePlanner().plan;
  const total = exp.total || 1;
  const top = [...exp.categories].sort((a, b) => b.monthly - a.monthly).slice(0, 5);
  const topMax = top[0]?.monthly || 1;
  return (
    <Card title="Where your money goes" description={`${money(exp.total)} a month in total`}>
      <SegmentBar segments={exp.groups.map((v, i) => ({ width: (v / total) * 100, color: EXPENSE_GROUPS[i].color }))} />
      <div>
        {exp.groups.map((v, i) => (
          <LegendRow
            key={EXPENSE_GROUPS[i].title}
            style={{ margin: "4px 0" }}
            color={EXPENSE_GROUPS[i].color}
            label={EXPENSE_GROUPS[i].title}
            value={`${money(v)} · ${percent(v / total)}`}
          />
        ))}
      </div>
      <div>
        <LegendRow style={{ marginTop: 16 }} label={<em>Biggest categories</em>} value="" />
        {top.map((c) => (
          <div key={c.id}>
            <LegendRow style={{ margin: "8px 0 4px" }} label={c.name} value={money(c.monthly)} />
            <ProgressBar value={c.monthly / topMax} color={EXPENSE_GROUPS[c.group].color} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function MilestonesCard() {
  const { plan } = usePlanner();
  return (
    <Card title="Milestones" description="When your savings reach each level. Bars show the balance at the end of the chosen period.">
      {savingsMilestones(plan).map((m) => {
        const eta = plan.eta(m.amount);
        const done = eta === "Reached";
        return (
          <div key={m.name} className={`ms${done ? " done" : ""}`}>
            <b>
              <G>{m.name}</G>
              {!m.name.startsWith("$") && <em style={{ color: "var(--mute)", fontStyle: "normal" }}> ({money(m.amount)})</em>}
            </b>
            <span>{eta}</span>
            <ProgressBar value={plan.last.balance / m.amount} color={done ? "var(--std)" : "var(--scotia)"} />
          </div>
        );
      })}
    </Card>
  );
}

/** Your budget in everyday units. */
export function QuickFacts() {
  const { net, left, exp, rent } = usePlanner().plan;
  const DAYS = 30.4;
  const WORK_DAYS = 21.7;
  const facts: [value: string, what: string, detail: string][] = [
    [money(Math.max(0, left) / DAYS, 2), "saved per day", "from your monthly surplus"],
    [money(exp.variable / DAYS, 2), "day-to-day spending per day", "groceries, eating out, shopping"],
    [rent ? `${((rent / net) * WORK_DAYS).toFixed(1)} days` : "–", "of work each month pays rent", "out of about 22 working days"],
    [money(exp.total * 12), "spent in a year", "at today's budget"],
    [money(Math.max(0, left) * 12), "saved from pay in a year", "before bonuses"],
    [money(exp.groups[1] * 12), "on subscriptions a year", `${money(exp.groups[1])} a month`],
  ];
  return (
    <div>
      <h2 className="ih">Quick facts</h2>
      <div className="facts">
        {facts.map(([value, what, detail]) => (
          <div key={what} className="fact">
            <b>{value}</b>
            <span>
              <G>{what}</G>
            </span>
            <em>{detail}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

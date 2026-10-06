"use client";

import { G } from "@/components/glossary/GlossaryText";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { ProgressBar, SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import { LegendRow } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { EXPENSE_GROUPS } from "@/lib/planner/config";
import { savingsMilestones } from "@/lib/planner/milestones";
import { project } from "@/lib/planner/projection";

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

/** TFSA and FHSA room, and how much of it your savings would fill. */
export function TaxRoomCard() {
  const { plan, setNumber } = usePlanner();
  const { tfsa, fhsa } = plan.state.numbers;
  const saved = plan.last.balance;
  // savings by Dec 31, 2026 (plan month 2)
  const dec = Math.max(0, project(plan.state, 3, plan.left)[2].balance);
  const fhsaContribution = Math.min(dec, fhsa);
  const refund = fhsaContribution <= 4000 ? fhsaContribution * 0.36 : 1450 + (fhsaContribution - 4000) * 0.3;

  return (
    <Card title="Tax-sheltered room" description="TFSA and FHSA room. Edit the amounts to match your own records.">
      <div className="row">
        <label htmlFor="tfsa">
          <G>TFSA room</G>
        </label>
        <NumberField id="tfsa" min={0} step={500} value={tfsa} onChange={(v) => setNumber("tfsa", v)} />
      </div>
      <ProgressBar style={{ marginTop: 8 }} value={tfsa ? saved / tfsa : 0} color="var(--std)" />
      <p className="s">
        {tfsa ? (
          <>
            Your savings by <b>{plan.last.label}</b> would use <b>{percent(Math.min(1, saved / tfsa))}</b> of this room. Room fills up: <b>{plan.eta(tfsa)}</b>.
          </>
        ) : (
          "Enter your TFSA room."
        )}
      </p>
      <div className="row">
        <label htmlFor="fhsa">
          <G>FHSA room, 2026</G>
        </label>
        <NumberField id="fhsa" min={0} step={500} value={fhsa} onChange={(v) => setNumber("fhsa", v)} />
      </div>
      <ProgressBar style={{ marginTop: 8 }} value={fhsa ? dec / fhsa : 0} color="var(--scotia)" />
      <p className="s">
        {fhsa ? (
          <>
            By Dec 31 your savings would be about <b>{money(dec)}</b>. Contributing that to an FHSA by Dec 31 could add roughly <b>{money(refund)}</b> to your
            2026 refund (estimate). Cover your 1-month fund first.
          </>
        ) : (
          "Enter your FHSA room."
        )}
      </p>
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

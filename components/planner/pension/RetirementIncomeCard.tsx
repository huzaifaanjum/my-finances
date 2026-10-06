"use client";

import { PlannerSlider } from "@/components/planner/shared/controls";
import { SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { CompareRow, GroupHeader, Legend, LegendRow, Note } from "@/components/ui/text";
import { duration, money } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { PENSION_MONTHLY } from "@/lib/planner/config";
import { RETIREMENT_MONTH } from "@/lib/planner/finance";
import type { Retirement } from "@/lib/planner/retirement";

const AGES = [35, 45, 55, 65];
/** Age at the start of the plan, October 2026 (born July 1997). */
const AGE_AT_START = 29;

export default function RetirementIncomeCard({ r, net, numbers }: { r: Retirement; net: number; numbers: { ret_sg: number; ret_wr: number } }) {
  const scale = Math.max(r.total, net) * 1.05;
  const { pots, deflator, finalSalary } = r.pension;
  const ages = AGES.map((age) => {
    const m = Math.min(RETIREMENT_MONTH, (age - AGE_AT_START) * 12 - 3);
    return { age, value: pots[m] / deflator(m), when: monthLabel(m) };
  });
  const maxAge = ages[ages.length - 1].value || 1;

  return (
    <Card
      title="Income when you retire"
      description={`You turn 65 on July 2, 2062, ${duration(RETIREMENT_MONTH)} from now. Amounts are monthly and shown in today's dollars, so you can compare them with what you live on now.`}
    >
      <div className="rtg">
        <div>
          <PlannerSlider k="ret_sg" />
          <PlannerSlider k="ret_pr" />
          <PlannerSlider k="ret_wr" />
          <PlannerSlider k="ret_inf" />
        </div>
        <div>
          <LegendRow
            style={{ margin: "18px 0 6px" }}
            label="Monthly income at 65"
            value={
              <>
                <b style={{ color: "var(--text)" }}>{money(r.total)}</b> vs {money(net)} today
              </>
            }
          />
          <SegmentBar
            variant="thick"
            segments={r.sources.map((s) => ({ width: (s.today / scale) * 100, color: s.color, title: s.name }))}
            marker={(net / scale) * 100}
          />
          <Legend
            style={{ margin: "8px 0 14px" }}
            items={[
              ...r.sources.map((s) => ({ label: s.name.replace(/ \(.*\)/, ""), color: s.color })),
              { label: "Take-home today", kind: "tick" as const },
            ]}
          />
        </div>
      </div>

      <GroupHeader
        style={{ marginTop: 24 }}
        label="Your pension pot as you age"
        value={<em style={{ fontWeight: 400, color: "var(--mute)" }}>today&apos;s dollars</em>}
      />
      {ages.map((a) => (
        <CompareRow
          key={a.age}
          label={
            <>
              Age {a.age} <em style={{ fontStyle: "normal", color: "var(--mute)" }}>· {a.when}</em>
            </>
          }
          value={money(a.value)}
          bar={{ value: a.value / maxAge, color: "var(--scotia)" }}
        />
      ))}
      <Note style={{ marginTop: 12 }}>
        Assumes the Air Canada plan works like a defined-contribution account: your 6% plus the 6% employer match ({money(PENSION_MONTHLY)} a month today) on a
        salary rising {numbers.ret_sg}% a year to about {money(finalSalary)} by 2062. If your plan is defined-benefit, the pension follows a formula instead;
        check your plan booklet on HR Connex. QPP ($1,450) and OAS ($740) are rough 2026 estimates; OAS is reduced if your retirement income is high, and both
        can start earlier or later. Withdrawing {numbers.ret_wr}% a year is a common rule of thumb for making savings last about 30 years.
      </Note>
    </Card>
  );
}

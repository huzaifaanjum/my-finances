"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { PlannerSlider } from "@/components/planner/shared/controls";
import { ProgressBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { GroupHeader, KeyValue, Note } from "@/components/ui/text";
import { money } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { simulateInvesting } from "@/lib/planner/finance";

const PATH_MONTHS = 720;

const reachLabel = (m: number | null) =>
  m === null ? "Not within 60 years" : `${Math.floor(m / 12)} yrs ${m % 12} mo · ${monthLabel(m)}`;

/** House and millionaire targets, and when your savings reach them. */
export default function GoalsCard() {
  const plan = usePlan();
  const { home, dpp, target, ret, rais } = plan.state.numbers;
  const homeNeed = (home * dpp) / 100 + home * 0.03;
  const monthly = Math.max(0, plan.left);
  const invested = simulateInvesting(plan.startBalance, monthly, ret, rais, target, PATH_MONTHS);
  const cash = simulateInvesting(plan.startBalance, monthly, 0, rais, target, PATH_MONTHS);

  return (
    <Card title="Goals" description="Pick a target and see when your savings reach it. Each goal assumes all your savings go to that goal alone.">
      <PlannerSlider k="home" />
      <PlannerSlider k="dpp" />
      <PlannerSlider k="target" />
      <PlannerSlider k="ret" />
      <PlannerSlider k="rais" />

      <div className="lrow" style={{ margin: "12px 0 4px" }}>
        <span>
          House <em>· {money(homeNeed)} cash</em>
        </span>
        <span>{plan.eta(homeNeed)}</span>
      </div>
      <ProgressBar value={plan.last.balance / homeNeed} color="var(--std)" />
      <Note style={{ margin: "4px 0 0" }}>
        Down payment plus about 3% for closing costs (welcome tax, notary, inspection). An FHSA can hold up to $40,000 of it tax-free.
      </Note>

      <GroupHeader label="Millionaire path" value={money(target)} style={{ marginTop: 20 }} />
      <KeyValue label={`At ${ret}% a year`} value={reachLabel(invested.hit)} />
      <KeyValue label="With no investment return" value={reachLabel(cash.hit)} />
      <KeyValue
        label={<em>Balance after 5 / 10 / 20 years</em>}
        value={[60, 120, 240].map((m) => `$${Math.round(invested.bal[m] / 1000)}k`).join(" / ")}
      />
      <Note style={{ marginTop: 8 }}>
        Uses only your monthly surplus, growing {rais}% a year. Bonuses and one-time money are left out, and returns are not guaranteed.
      </Note>
    </Card>
  );
}

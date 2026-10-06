"use client";

import type { ReactNode } from "react";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { ActionList } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { dayLabel } from "@/lib/planner/calendar";
import { safetyNet } from "@/lib/planner/insights";
import type { Plan } from "@/lib/planner/projection";

interface Action {
  /** roughly what the step is worth a month; higher comes first */
  worth: number;
  title: string;
  body: ReactNode;
}

function nextActions(plan: Plan): Action[] {
  const { low, lowDate, rent, net, left, exp, far, bonusTotal, last, months } = plan;
  const nt = net || 1;
  const { threeMonthIndex: mo3 } = safetyNet(plan);
  const topWant = exp.categories.filter((c) => !c.need && c.monthly > 0).sort((a, b) => b.monthly - a.monthly)[0];
  const subs = exp.groups[1];
  const acts: Action[] = [];

  if (low.bal < 0)
    acts.push({
      worth: 1e9,
      title: "Keep a buffer in chequing",
      body: (
        <>
          Your balance dips to <b>{money(low.bal)}</b> on {dayLabel(lowDate)}. Leave <b>{money(-low.bal)}</b> extra in chequing or move a bill after payday.
        </>
      ),
    });
  if (rent / nt > 0.3)
    acts.push({
      worth: rent - 0.3 * net,
      title: "Lower your housing cost",
      body: (
        <>
          Rent is <b>{money(rent)}</b>, {percent(rent / nt)} of take-home. Getting to 30% would free <b>{money(rent - 0.3 * net)}</b> a month. A roommate or a
          cheaper place at renewal is your biggest lever.
        </>
      ),
    });
  if (topWant)
    acts.push({
      worth: topWant.monthly / 2,
      title: "Trim your biggest want",
      body: (
        <>
          <b>{topWant.name}</b> costs {money(topWant.monthly)} a month. Halving it saves <b>{money(topWant.monthly / 2)}</b> a month,{" "}
          <b>{money(topWant.monthly * 6)}</b> a year.
        </>
      ),
    });
  if (subs > 0)
    acts.push({
      worth: subs / 3,
      title: "Review subscriptions",
      body: (
        <>
          They add up to <b>{money(subs * 12)}</b> a year. Cancel anything you have not used this month.
        </>
      ),
    });
  if (left > 0)
    acts.push({
      worth: left,
      title: "Automate your savings",
      body: (
        <>
          Set a <b>{money(left)}</b> transfer for payday so it leaves chequing before you can spend it.
        </>
      ),
    });
  if (mo3 > 0)
    acts.push({
      worth: exp.total / 12,
      title: "Build your safety net first",
      body: (
        <>
          Park savings in a high-interest account until you hold <b>{money(exp.total * 3)}</b> (three months of costs), expected <b>{far[mo3].label}</b>.
        </>
      ),
    });
  if (bonusTotal > 0)
    acts.push({
      worth: bonusTotal / Math.max(1, months),
      title: "Bank bonuses on arrival",
      body: (
        <>
          <b>{money(bonusTotal)}</b> in bonuses and one-time money lands by {last.label}. Send it straight to savings; do not plan bills around it.
        </>
      ),
    });

  return acts.sort((a, b) => b.worth - a.worth).slice(0, 5);
}

export default function NextActionsCard() {
  const actions = nextActions(usePlan());
  return (
    <Card title="What to do next" description="Ranked by how much each step is worth to you a month.">
      <ActionList items={actions} />
    </Card>
  );
}

"use client";

import { ProgressBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { compactMoney, duration, percent } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import type { InvestmentPlan } from "@/lib/planner/finance";
import type { Plan } from "@/lib/planner/projection";

const ROAD_STOPS = [0.1, 0.25, 0.5, 0.75, 1];

export default function RoadCard({ plan, invest }: { plan: Plan; invest: InvestmentPlan }) {
  const { bal, inn } = invest.sim;
  return (
    <Card title="Milestones along the way" description="Each stop on the road, when you reach it, and how much of it came from returns rather than your own money.">
      <div className="road">
        {ROAD_STOPS.map((x, i) => {
          const v = x * plan.state.numbers.target;
          const m = bal.findIndex((b) => b >= v);
          const reached = m >= 0;
          const fromReturns = reached ? Math.max(0, bal[m] - inn[m]) / bal[m] : 0;
          return (
            <div key={x} className={`stop${i === ROAD_STOPS.length - 1 ? " end" : ""}`}>
              <div className="dotw">
                <i />
              </div>
              <b>{compactMoney(v)}</b>
              <span>{reached ? monthLabel(m) : "Not reached"}</span>
              <em>{reached ? (m === 0 ? "already there" : `in ${duration(m)}`) : ""}</em>
              {reached && (
                <div className="gs">
                  <ProgressBar value={fromReturns} color="var(--std)" />
                  <small>{percent(fromReturns)} from returns</small>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

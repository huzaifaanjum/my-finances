"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { money } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { carPlan } from "@/lib/planner/car";
import { savingsWithPurchase } from "@/lib/planner/projection";
import CarControls from "./CarControls";
import { CarKpis, LoanComparisons } from "./CarResults";
import GoalTimelineChart from "./GoalTimelineChart";

/** Stats on top, sliders beside the timeline, then the three loan comparisons in a row. */
export default function CarGoal() {
  const plan = usePlan();
  const car = carPlan(plan);
  const faster = car.extra > 0 ? car.withExtra : null;
  const loan = faster ?? car.regular;
  const paidOff = car.buy + loan.months;
  const { without, withLoan } = savingsWithPurchase(plan, Math.max(paidOff + 24, 36) + 1, car.buy, car.down, loan.payments);
  const gap = without[paidOff] - withLoan[paidOff];
  return (
    <div className="goal-page">
      <CarKpis />
      <div className="carlay">
        <CarControls />
        <Card
          title="From saving to paid off"
          description={`Save the ${money(car.down)} down payment, buy ${car.buy === 0 ? "now" : `in ${monthLabel(car.buy)}`}, and the loan is paid off by ${monthLabel(paidOff)}.${
            faster ? ` Paying ${money(car.extra)} extra a month saves ${money(car.regular.interest - faster.interest)} in interest.` : ""
          } By then your savings are ${money(gap)} lower than if you had not bought it. Assumes all your savings go to this goal.`}
        >
          <GoalTimelineChart
            without={without}
            withLoan={withLoan}
            target={car.down}
            targetLabel="Down payment"
            buy={car.buy}
            balances={car.regular.balances}
            faster={faster?.balances}
          />
        </Card>
      </div>
      <LoanComparisons />
    </div>
  );
}

"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { deltaMoney, money, percent, signedMoney } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { carPlan, yearsLabel } from "@/lib/planner/car";
import { amortize } from "@/lib/planner/finance";

const TERMS = [24, 36, 48, 60, 72, 84];
const RATE_STEPS = [-2, -1, 0, 1, 2];

/** Headline loan numbers for the car goal. */
export function CarKpis() {
  const plan = usePlan();
  const { net, left } = plan;
  const car = carPlan(plan);
  const nt = net || 1;
  const share = car.regular.payment / nt;
  const after = left - car.regular.payment;
  return (
    <KpiGrid>
      <Kpi label="Monthly payment" value={money(car.regular.payment)} note={`${percent(share)} of take-home · guideline 10-15%`} tone={share > 0.15 ? "warn" : "pos"} />
      <Kpi
        label="Extra you pay in interest"
        value={money(car.regular.interest)}
        note={`over ${car.term} months at ${car.apr.toFixed(1)}%`}
        tone={car.regular.interest > 0 ? "warn" : "pos"}
      />
      <Kpi
        label="Total cost of the car"
        value={money(car.price + car.tax + car.regular.interest)}
        note={`${money(car.price)} price + ${money(car.tax)} tax + ${money(car.regular.interest)} interest`}
      />
      <Kpi label="You borrow" value={money(car.principal)} note={`${money(car.down)} down payment`} />
      <Kpi
        label="Paid off by"
        value={monthLabel(car.buy + car.regular.months)}
        note={`buying in ${car.buy === 0 ? "now" : monthLabel(car.buy)} · ${yearsLabel(car.term)} loan`}
      />
      <Kpi
        label="Left over after the payment"
        value={signedMoney(after)}
        note={after < 0 ? "The payment is more than your monthly surplus" : `${percent(after / nt)} of take-home still saved`}
      />
    </KpiGrid>
  );
}

/** Three side-by-side tables: loan length, paying extra, and a different rate. */
export function LoanComparisons() {
  const plan = usePlan();
  const car = carPlan(plan);
  const nt = plan.net || 1;
  const extras = [...new Set([0, 100, 200, 300, 500, car.extra])].sort((a, b) => a - b);

  return (
    <div className="goal-row3">
      <Card title="Compare loan lengths" description="Same car and down payment. A longer loan lowers the payment but costs more in interest.">
        <div className="scroll">
          <table className="t2">
            <tbody>
              <tr>
                <th>Length</th>
                <th>Monthly</th>
                <th>Extra (interest)</th>
                <th>Total you pay</th>
                <th>% of pay</th>
              </tr>
              {TERMS.map((t) => {
                const l = amortize(car.principal, car.apr, t);
                return (
                  <tr key={t} className={t === car.term ? "sel" : undefined}>
                    <td>
                      {t} months ({yearsLabel(t)})
                    </td>
                    <td>{money(l.payment)}</td>
                    <td>{money(l.interest)}</td>
                    <td>{money(car.down + car.principal + l.interest)}</td>
                    <td>{percent(l.payment / nt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Pay it off faster" description={`Adding to the ${car.term}-month loan. Your slider is highlighted.`}>
        <div className="scroll">
          <table className="t2">
            <tbody>
              <tr>
                <th>Extra a month</th>
                <th>Paid off</th>
                <th>Interest</th>
                <th>Saved</th>
              </tr>
              {extras.map((x) => {
                const l = amortize(car.principal, car.apr, car.term, x);
                return (
                  <tr key={x} className={x === car.extra ? "sel" : undefined}>
                    <td>{money(x)}</td>
                    <td>
                      {monthLabel(car.buy + l.months)} <small style={{ color: "var(--mute)" }}>({l.months} mo)</small>
                    </td>
                    <td>{money(l.interest)}</td>
                    <td>{money(car.regular.interest - l.interest)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="If the rate is different" description="Same loan at different rates. A better rate is worth asking for.">
        <div className="scroll">
          <table className="t2">
            <tbody>
              <tr>
                <th>Rate</th>
                <th>Monthly</th>
                <th>Interest</th>
                <th>Vs now</th>
              </tr>
              {RATE_STEPS.map((d) => {
                const apr = Math.max(0, car.apr + d);
                const l = amortize(car.principal, apr, car.term);
                return (
                  <tr key={d} className={d === 0 ? "sel" : undefined}>
                    <td>{apr.toFixed(1)}%</td>
                    <td>{money(l.payment)}</td>
                    <td>{money(l.interest)}</td>
                    <td>{d === 0 ? "–" : deltaMoney(l.interest - car.regular.interest)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlan } from "@/components/providers/PlannerProvider";
import { PlannerSlider } from "@/components/planner/shared/controls";
import Card from "@/components/ui/Card";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { KeyValue, Note } from "@/components/ui/text";
import { deltaMoney, money, percent } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { amortize } from "@/lib/planner/finance";
import { housePlan, monthlyEquivalent, type HousePlan } from "@/lib/planner/house";
import { savingsWithPurchase, type Plan } from "@/lib/planner/projection";
import GoalTimelineChart from "./GoalTimelineChart";

const DOWN_OPTIONS = [5, 10, 15, 20, 25];
const AMORTIZATIONS = [15, 20, 25, 30];
const RATE_STEPS = [-1, -0.5, 0, 0.5, 1];
const when = (m: number) => (m < 0 ? "Not within 20 years" : m === 0 ? "now" : monthLabel(m));
const yearsMonths = (m: number) => `${Math.floor(m / 12)} yr${m % 12 ? ` ${m % 12} mo` : ""}`;

/** Same mortgage, different terms. */
const mortgageLoan = (h: HousePlan, ratePct = h.rate, years = h.years, extra = 0) => amortize(h.mortgage, monthlyEquivalent(ratePct), years * 12, extra);

/** Whether savings cover the cash needed in the month you plan to buy. */
function BuyCheck({ h }: { h: HousePlan }) {
  const ok = h.savedAtBuy >= h.cash;
  return (
    <GlossaryScope>
      <div className={`msg ${ok ? "ok" : "no"}`}>
        <G>
          By <b>{when(h.buy)}</b> your savings are projected at <b>{money(h.savedAtBuy)}</b>
          {ok ? (
            <>
              , enough for the <b>{money(h.cash)}</b> you need. You would have <b>{money(h.savedAtBuy - h.cash)}</b> left as a cushion.
            </>
          ) : (
            <>
              , <b>{money(h.cash - h.savedAtBuy)}</b> short of the <b>{money(h.cash)}</b> you need.{" "}
              {h.ready >= 0 ? (
                <>
                  You would have it by <b>{when(h.ready)}</b>.
                </>
              ) : (
                "Save more, pick a cheaper home or a smaller down payment."
              )}
            </>
          )}
        </G>
      </div>
      {h.belowMin && (
        <div className="msg no">
          The legal minimum down payment on a {money(h.price)} home is <b>{money(h.minDown)}</b> (5% of the first $500,000 and 10% of the rest). Raise the down
          payment.
        </div>
      )}
    </GlossaryScope>
  );
}

function HouseKpis({ plan, h }: { plan: Plan; h: HousePlan }) {
  const share = plan.net ? h.loan.payment / plan.net : 0;
  const after = plan.left - h.loan.payment;
  return (
    <KpiGrid>
      <Kpi label="Cash you need" value={money(h.cash)} note={`${money(h.down)} down + ${money(h.closing + h.premiumTax)} closing costs`} tone="hero" />
      <Kpi label="Savings ready" value={when(h.ready)} note={`planning to buy ${when(h.buy)}`} tone={h.savedAtBuy >= h.cash ? "pos" : "warn"} />
      <Kpi label="Mortgage payment" value={money(h.loan.payment)} note={`${percent(share)} of take-home · ${h.years}-year amortization`} tone={share > 0.35 ? "warn" : ""} />
      <Kpi label="You borrow" value={money(h.mortgage)} note={h.premium ? `includes ${money(h.premium)} mortgage insurance` : "no mortgage insurance at 20% down"} />
      <Kpi label="Interest over the loan" value={money(h.loan.interest)} note={`at ${h.rate.toFixed(2)}%, if the rate never changes`} />
      <Kpi label="Left over after the payment" value={money(after)} note="if the mortgage replaced nothing else" tone={after < 0 ? "neg" : ""} />
    </KpiGrid>
  );
}

/** Sliders and the buy-date check. */
function HouseControls({ plan, h }: { plan: Plan; h: HousePlan }) {
  return (
    <div className="stack">
      <div>
        <h3 className="sec">House</h3>
        <div className="stack">
          <PlannerSlider k="home" />
          <PlannerSlider k="dpp" />
          <PlannerSlider k="hrate" />
          <PlannerSlider k="hamort" />
          <PlannerSlider k="hextra" />
          <PlannerSlider k="hbuy" />
        </div>
        <BuyCheck h={h} />
      </div>
      <Note>
        An FHSA can hold up to $40,000 of the down payment tax-free, and first-time buyers can also borrow up to $60,000 from an RRSP. Property tax, home
        insurance, utilities and condo fees are not included, so add them to your expenses.
      </Note>
    </div>
  );
}

/** Cash and down payment details, then amortization length, paying extra, and a different rate. */
function MortgageComparisons({ plan, h }: { plan: Plan; h: HousePlan }) {
  const nt = plan.net || 1;
  const extras = [...new Set([0, 100, 250, 500, 1000, h.extra])].sort((a, b) => a - b);
  return (
    <div className="goal-row3">
      <Card title="Cash needed, line by line" description={`For a ${money(h.price)} home with ${h.dppPct}% down.`}>
        <KeyValue label={`Down payment (${h.dppPct}%)`} value={money(h.down)} />
        <KeyValue label="Closing costs, about 3%" value={money(h.closing)} />
        <KeyValue label={<>Quebec tax on mortgage insurance <em>· 9%</em></>} value={money(h.premiumTax)} />
        <KeyValue label="Cash at closing" value={money(h.cash)} total />
        <Note style={{ marginTop: 8 }}>
          Under 20% down, CMHC mortgage insurance is required. The premium is added to the mortgage; Quebec&apos;s 9% tax on it is paid in cash.
        </Note>
      </Card>

      <Card title="Compare down payments" description="Same home and rate. Yours is highlighted.">
        <div className="scroll">
          <table className="t2">
            <tbody>
              <tr>
                <th>Down</th>
                <th>Cash</th>
                <th>Ready</th>
                <th>Monthly</th>
              </tr>
              {DOWN_OPTIONS.map((d) => {
                const o = housePlan(plan, d);
                return (
                  <tr key={d} className={d === h.dppPct ? "sel" : undefined}>
                    <td>
                      {d}%{o.belowMin && <small style={{ color: "var(--neg)" }}> min</small>}
                    </td>
                    <td>{money(o.cash)}</td>
                    <td>{o.ready < 0 ? "20+ yrs" : o.ready === 0 ? "now" : monthLabel(o.ready)}</td>
                    <td>{money(o.loan.payment)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Compare amortizations" description="Same home and down payment. A longer amortization lowers the payment but costs more in interest.">
        <div className="scroll">
          <table className="t2">
            <tbody>
              <tr>
                <th>Length</th>
                <th>Monthly</th>
                <th>Interest</th>
                <th>% of pay</th>
              </tr>
              {AMORTIZATIONS.map((y) => {
                const l = mortgageLoan(h, h.rate, y);
                return (
                  <tr key={y} className={y === h.years ? "sel" : undefined}>
                    <td>{y} years</td>
                    <td>{money(l.payment)}</td>
                    <td>{money(l.interest)}</td>
                    <td>{percent(l.payment / nt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Note style={{ marginTop: 8 }}>30 years is only open to first-time buyers and new builds when the mortgage is insured.</Note>
      </Card>

      <Card title="Pay it off faster" description={`Adding to the ${h.years}-year mortgage. Your slider is highlighted.`}>
        <div className="scroll">
          <table className="t2">
            <tbody>
              <tr>
                <th>Extra a month</th>
                <th>Paid off in</th>
                <th>Interest</th>
                <th>Saved</th>
              </tr>
              {extras.map((x) => {
                const l = mortgageLoan(h, h.rate, h.years, x);
                return (
                  <tr key={x} className={x === h.extra ? "sel" : undefined}>
                    <td>{money(x)}</td>
                    <td>{yearsMonths(l.months)}</td>
                    <td>{money(l.interest)}</td>
                    <td>{money(h.loan.interest - l.interest)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Note style={{ marginTop: 8 }}>Most lenders let you prepay 10 to 20% a year without a penalty. Check your mortgage terms.</Note>
      </Card>

      <Card title="If the rate is different" description="Same mortgage. Rates are reset at each renewal, usually every 5 years.">
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
                const rate = Math.max(0, h.rate + d);
                const l = mortgageLoan(h, rate);
                return (
                  <tr key={d} className={d === 0 ? "sel" : undefined}>
                    <td>{rate.toFixed(2)}%</td>
                    <td>{money(l.payment)}</td>
                    <td>{money(l.interest)}</td>
                    <td>{d === 0 ? "–" : deltaMoney(l.interest - h.loan.interest)}</td>
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

/** Stats on top, sliders beside the two charts, then the three mortgage comparisons in a row. */
export default function HouseGoal() {
  const plan = usePlan();
  const h = housePlan(plan);
  const sooner = h.loan.months - h.withExtra.months;
  const paid = h.extra > 0 ? h.withExtra : h.loan;
  const paidOff = h.buy + paid.months;
  const { without, withLoan } = savingsWithPurchase(plan, paidOff + 25, h.buy, h.cash, paid.payments, plan.rent);
  const monthlyHit = paid.payment + h.extra - plan.rent;

  return (
    <div className="goal-page">
      <HouseKpis plan={plan} h={h} />
      <div className="carlay">
        <HouseControls plan={plan} h={h} />
        <Card
          title="From saving to paid off"
          description={`Save the ${money(h.cash)} you need, buy ${h.buy === 0 ? "now" : `in ${monthLabel(h.buy)}`}, and the mortgage is paid off by ${monthLabel(h.buy + paid.months)}.${
            h.extra > 0 ? ` Paying ${money(h.extra)} extra a month clears it ${yearsMonths(sooner)} sooner and saves ${money(h.loan.interest - h.withExtra.interest)} in interest.` : ""
          } Once you own, your ${money(plan.rent)} rent stops, so you save ${money(Math.abs(monthlyHit))} a month ${monthlyHit > 0 ? "less" : "more"} than now. Assumes all your savings go to this goal; property tax, insurance and upkeep are not included.`}
        >
          <GoalTimelineChart
            without={without}
            withLoan={withLoan}
            target={h.cash}
            targetLabel="Cash needed"
            buy={h.buy}
            balances={h.loan.balances}
            faster={h.extra > 0 ? h.withExtra.balances : undefined}
          />
        </Card>
      </div>
      <MortgageComparisons plan={plan} h={h} />
    </div>
  );
}

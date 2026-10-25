"use client";

// Calculators for the travel, fun and subscriptions rules.

import { useState, type ReactElement } from "react";
import { AEROPLAN, centsPerPoint } from "@/lib/aeroplan";
import type { DemoKey } from "@/lib/knowledge/rules";
import { C, Bar, Demo, Note, Slider, Stat, Stats, Verdict, fvMonthly, money, num } from "./ui";

function FunBudget() {
  const [net, setNet] = useState(4700);
  const [needs, setNeeds] = useState(3065);
  const [save, setSave] = useState(20);
  const saved = (net * save) / 100;
  const fun = net - needs - saved;
  return (
    <Demo>
      <Slider label="Monthly take-home" value={net} onChange={setNet} min={2000} max={10000} step={50} format={money} />
      <Slider label="Needs (rent, bills, groceries, transit)" value={needs} onChange={setNeeds} min={1000} max={8000} step={25} format={money} />
      <Slider label="Saved first" value={save} onChange={setSave} min={0} max={40} format={(v) => `${v}%`} />
      <Bar
        parts={[
          { w: needs, color: C.needs, label: `Needs ${money(needs)}` },
          { w: saved, color: C.std, label: `Savings ${money(saved)}` },
          { w: Math.max(0, fun), color: C.wants, label: `Fun ${money(Math.max(0, fun))}` },
        ]}
      />
      {fun > 0 ? (
        <Verdict tone="good">
          Guilt-free: {money(fun)} a month, about {money(fun / 4.33)} a week.
        </Verdict>
      ) : (
        <Verdict tone="bad">Needs and savings already use all your pay. Lower the savings rate a little or find room in needs.</Verdict>
      )}
    </Demo>
  );
}

function SinkingFund() {
  const [cost, setCost] = useState(3000);
  const [months, setMonths] = useState(10);
  const [late, setLate] = useState(2);
  const now = cost / months;
  const later = months - late > 0 ? cost / (months - late) : Infinity;
  return (
    <Demo>
      <Slider label="Trip or event cost" value={cost} onChange={setCost} min={200} max={15000} step={100} format={money} />
      <Slider label="Months until it happens" value={months} onChange={setMonths} min={1} max={24} format={(v) => `${v} months`} />
      <Slider label="If you start this many months late" value={late} onChange={setLate} min={0} max={Math.max(0, months - 1)} format={(v) => (v ? `${v} months` : "start now")} />
      <Stats>
        <Stat label="Starting now" value={`${money(now)} / month`} tone="good" />
        <Stat label={late ? `Starting ${late} months late` : "Starting late"} value={Number.isFinite(later) ? `${money(later)} / month` : "–"} tone={late ? "warn" : undefined} />
        <Stat label="On a card at 20.99% for a year" value={`+${money(cost * 0.2099 * 0.55)}`} tone="bad" />
      </Stats>
      <Note>The card figure assumes you pay it off evenly over 12 months, so on average about half the balance carries interest.</Note>
    </Demo>
  );
}

function Points() {
  const [points, setPoints] = useState(15000);
  const [cents, setCents] = useState(1.8);
  return (
    <Demo>
      <Slider label="Points" value={points} onChange={setPoints} min={1000} max={200000} step={1000} format={(v) => v.toLocaleString("en-CA")} />
      <Slider label="Value per point on flights" value={cents} onChange={setCents} min={1} max={3} step={0.1} format={(v) => `${num(v, 1)}¢`} />
      <Stats>
        <Stat label="On merchandise (≈0.7¢)" value={money(points * 0.007)} tone="warn" />
        <Stat label="On gift cards (≈0.8¢)" value={money(points * 0.008)} tone="warn" />
        <Stat label={`On flights (${num(cents, 1)}¢)`} value={money((points * cents) / 100)} tone="good" />
      </Stats>
      <Note>Point values vary by route, date and redemption; these are typical ranges, not fixed prices.</Note>
    </Demo>
  );
}

/** Is this redemption a good use of points? Cents per point against the typical and merchandise values. */
function AeroCpp() {
  const [cash, setCash] = useState(450);
  const [points, setPoints] = useState(18000);
  const [fees, setFees] = useState(90);
  const cpp = centsPerPoint(cash, fees, points);
  const tone = cpp >= 2 ? "good" : cpp >= AEROPLAN.centsTypical ? "good" : cpp >= 1 ? "warn" : "bad";
  return (
    <Demo>
      <Slider label="Cash price of the same ticket" value={cash} onChange={setCash} min={100} max={6000} step={25} format={money} />
      <Slider label="Points it costs" value={points} onChange={setPoints} min={6000} max={150000} step={500} format={(v) => v.toLocaleString("en-CA")} />
      <Slider label="Taxes and fees you still pay" value={fees} onChange={setFees} min={0} max={800} step={5} format={money} />
      <Stats>
        <Stat label="You get" value={`${num(cpp, 2)}¢ a point`} tone={tone} />
        <Stat label="Points saved you" value={money(Math.max(0, cash - fees))} />
        <Stat label="Same points on merchandise" value={money((points * AEROPLAN.centsMerch) / 100)} tone="warn" />
      </Stats>
      {cpp >= AEROPLAN.centsTypical ? (
        <Verdict tone="good">Good use: at or above the typical {AEROPLAN.centsTypical}¢ a point.</Verdict>
      ) : cpp >= 1 ? (
        <Verdict tone="warn">Below the typical {AEROPLAN.centsTypical}¢. Fine if you need the seat, but a partner flight or other dates may stretch points further.</Verdict>
      ) : (
        <Verdict tone="bad">Poor value: paying cash and keeping the points is likely better.</Verdict>
      )}
    </Demo>
  );
}

/** How long until you can afford an award, from the yearly grant plus everyday earning. */
function AeroGoal() {
  const [goal, setGoal] = useState<number>(AEROPLAN.europeBusiness);
  const [monthly, setMonthly] = useState(300);
  const [pool, setPool] = useState(0);
  const yearly = 15000 + monthly * 12;
  const need = Math.max(0, goal - pool);
  const months = yearly > 0 ? Math.ceil((need / yearly) * 12) : Infinity;
  return (
    <Demo>
      <Slider label="Award you want (one way)" value={goal} onChange={setGoal} min={6000} max={110000} step={500} format={(v) => v.toLocaleString("en-CA")} />
      <Slider label="Points from everyday earning a month" value={monthly} onChange={setMonthly} min={0} max={3000} step={50} format={(v) => v.toLocaleString("en-CA")} />
      <Slider label="Points pooled from family" value={pool} onChange={setPool} min={0} max={100000} step={1000} format={(v) => v.toLocaleString("en-CA")} />
      <Stats>
        <Stat label="You earn a year" value={yearly.toLocaleString("en-CA")} />
        <Stat label="Time to the award" value={Number.isFinite(months) ? (months <= 1 ? "now" : months < 24 ? `${months} months` : `${num(months / 12, 1)} years`) : "–"} tone={months <= 24 ? "good" : "warn"} />
        <Stat label="Worth at the typical value" value={money((goal * AEROPLAN.centsTypical) / 100)} />
      </Stats>
      <Note>
        Uses your 15,000-point yearly grant. Short North American flights start at {AEROPLAN.shortHaulFrom.toLocaleString("en-CA")}; partner business class to Europe is about{" "}
        {AEROPLAN.europeBusiness.toLocaleString("en-CA")}. Prices follow the chart that changed on {AEROPLAN.chartChange}.
      </Note>
    </Demo>
  );
}

function FxFees() {
  const [spend, setSpend] = useState(3000);
  const [trips, setTrips] = useState(2);
  const [fee, setFee] = useState(2.5);
  const perTrip = (spend * fee) / 100;
  return (
    <Demo>
      <Slider label="Spent in foreign currency per trip" value={spend} onChange={setSpend} min={200} max={10000} step={100} format={money} />
      <Slider label="Trips a year" value={trips} onChange={setTrips} min={1} max={10} />
      <Slider label="Card's foreign transaction fee" value={fee} onChange={setFee} min={0} max={3} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Stats>
        <Stat label="Fees per trip" value={money(perTrip)} tone={perTrip ? "warn" : "good"} />
        <Stat label="Fees a year" value={money(perTrip * trips)} tone={perTrip ? "bad" : "good"} />
        <Stat label="Over 10 years" value={money(perTrip * trips * 10)} />
      </Stats>
    </Demo>
  );
}

function Subscriptions() {
  const [count, setCount] = useState(6);
  const [price, setPrice] = useState(16);
  const [cut, setCut] = useState(2);
  const monthly = count * price;
  const saved = Math.min(cut, count) * price;
  return (
    <Demo>
      <Slider label="Subscriptions" value={count} onChange={setCount} min={1} max={20} />
      <Slider label="Average price" value={price} onChange={setPrice} min={3} max={60} format={(v) => `${money(v)} / month`} />
      <Slider label="Cancel this many" value={cut} onChange={setCut} min={0} max={count} />
      <Stats>
        <Stat label="You pay a year" value={money(monthly * 12)} />
        <Stat label="Cancelling saves a year" value={money(saved * 12)} tone="good" />
        <Stat label="Saved and invested, 10 years at 6%" value={money(fvMonthly(saved, 10, 6))} tone="good" />
      </Stats>
    </Demo>
  );
}

function SmallSpends() {
  const [price, setPrice] = useState(6);
  const [perWeek, setPerWeek] = useState(5);
  const yearly = price * perWeek * 52;
  return (
    <Demo>
      <Slider label="Price each time" value={price} onChange={setPrice} min={2} max={40} step={0.5} format={(v) => money(v)} />
      <Slider label="Times a week" value={perWeek} onChange={setPerWeek} min={1} max={14} />
      <Stats>
        <Stat label="A month" value={money(yearly / 12)} />
        <Stat label="A year" value={money(yearly)} tone="warn" />
        <Stat label="Halved and invested, 10 years at 6%" value={money(fvMonthly(yearly / 24, 10, 6))} tone="good" />
      </Stats>
    </Demo>
  );
}

function Rewards() {
  const [spend, setSpend] = useState(1500);
  const [back, setBack] = useState(1.5);
  const [fee, setFee] = useState(0);
  const [carry, setCarry] = useState(0);
  const reward = spend * 12 * (back / 100) - fee;
  const interest = carry * 0.2099;
  const net = reward - interest;
  return (
    <Demo>
      <Slider label="Card spending a month" value={spend} onChange={setSpend} min={200} max={6000} step={100} format={money} />
      <Slider label="Cash back or points value" value={back} onChange={setBack} min={0.5} max={4} step={0.25} format={(v) => `${num(v, 2)}%`} />
      <Slider label="Annual fee" value={fee} onChange={setFee} min={0} max={200} step={10} format={money} />
      <Slider label="Balance you carry" value={carry} onChange={setCarry} min={0} max={10000} step={100} format={money} />
      <Stats>
        <Stat label="Rewards a year, after fee" value={money(reward)} tone="good" />
        <Stat label="Interest a year (20.99%)" value={money(interest)} tone={interest ? "bad" : "good"} />
        <Stat label="Net" value={money(net)} tone={net >= 0 ? "good" : "bad"} />
      </Stats>
      {interest > reward && <Verdict tone="bad">Interest wipes out the rewards. Pay the balance in full before chasing points.</Verdict>}
    </Demo>
  );
}

function Bills() {
  const [now, setNow] = useState(95);
  const [deal, setDeal] = useState(65);
  const saved = Math.max(0, now - deal);
  return (
    <Demo>
      <Slider label="What you pay now a month" value={now} onChange={setNow} min={20} max={250} step={5} format={money} />
      <Slider label="Competitor or promo price" value={deal} onChange={setDeal} min={10} max={250} step={5} format={money} />
      <Stats>
        <Stat label="Saved a month" value={money(saved)} tone="good" />
        <Stat label="Saved a year" value={money(saved * 12)} tone="good" />
        <Stat label="Per minute of a 20-minute call" value={money((saved * 12) / 20)} />
      </Stats>
    </Demo>
  );
}

export const LIFESTYLE_DEMOS: Partial<Record<DemoKey, () => ReactElement>> = {
  funBudget: FunBudget,
  sinkingFund: SinkingFund,
  points: Points,
  aeroCpp: AeroCpp,
  aeroGoal: AeroGoal,
  fxFees: FxFees,
  subscriptions: Subscriptions,
  smallSpends: SmallSpends,
  rewards: Rewards,
  bills: Bills,
};

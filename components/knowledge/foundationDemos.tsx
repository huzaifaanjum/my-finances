"use client";

// Calculators for the foundation rules and the Education lessons.

import { useState, type ReactElement } from "react";
import { avalanche, fixedPayoff, minimumPayoff, mixOutlook, snowball, tfsaVsRrsp, yearsToIndependence, type Debt } from "@/lib/knowledge/calc";
import type { DemoKey } from "@/lib/knowledge/rules";
import { C, Bar, Demo, Note, Slider, Stat, Stats, Verdict, fvMonthly, loanPayment, money, num } from "./ui";

const pct = (v: number) => `${v}%`;
const years = (months: number) => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (months >= 1200) return "Never";
  return y === 0 ? `${m} mo` : m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
};

function NetWorth() {
  const [cash, setCash] = useState(10000);
  const [invested, setInvested] = useState(15000);
  const [home, setHome] = useState(0);
  const [owed, setOwed] = useState(5000);
  const assets = cash + invested + home;
  const worth = assets - owed;
  return (
    <Demo>
      <Slider label="Cash and savings" value={cash} onChange={setCash} min={0} max={100000} step={500} format={money} />
      <Slider label="Investments and pension" value={invested} onChange={setInvested} min={0} max={300000} step={1000} format={money} />
      <Slider label="Home and other property" value={home} onChange={setHome} min={0} max={800000} step={5000} format={money} />
      <Slider label="Everything you owe" value={owed} onChange={setOwed} min={0} max={600000} step={500} format={money} />
      <Stats>
        <Stat label="You own" value={money(assets)} />
        <Stat label="You owe" value={money(owed)} tone={owed > 0 ? "warn" : undefined} />
        <Stat label="Net worth" value={money(worth)} tone={worth >= 0 ? "good" : "bad"} />
      </Stats>
      <Note>A car is left out on purpose: it loses value and you could not live off it.</Note>
    </Demo>
  );
}

function MinPayment() {
  const [balance, setBalance] = useState(3000);
  const [rate, setRate] = useState(20.99);
  const [min, setMin] = useState(5);
  const low = minimumPayoff(balance, rate, min / 100);
  // a steady payment has to at least beat the first month's interest
  const fixed = Math.max(Math.round(balance * (min / 100)), Math.ceil((balance * rate) / 1200) + 1);
  const steady = fixedPayoff(balance, rate, fixed);
  return (
    <Demo>
      <Slider label="Card balance" value={balance} onChange={setBalance} min={500} max={20000} step={100} format={money} />
      <Slider label="Interest rate" value={rate} onChange={setRate} min={8} max={30} step={0.01} format={(v) => `${v.toFixed(2)}%`} />
      <Slider label="Minimum payment" value={min} onChange={setMin} min={2} max={5} step={0.5} format={(v) => `${v}% of balance`} />
      <Stats>
        <Stat label="Minimum only: time" value={years(low.months)} tone="bad" />
        <Stat label="Minimum only: interest" value={money(low.interest)} tone="bad" />
        <Stat label={`Keep paying ${money(fixed)}: time`} value={years(steady.months)} tone="good" />
        <Stat label={`Keep paying ${money(fixed)}: interest`} value={money(steady.interest)} tone="good" />
      </Stats>
      <Note>The minimum shrinks as the balance shrinks, which is what stretches it out. Holding your payment steady is the easy fix.</Note>
    </Demo>
  );
}

const SAMPLE_DEBTS: Debt[] = [
  { name: "Credit card", balance: 6000, rate: 21, min: 180 },
  { name: "Personal loan", balance: 9000, rate: 9, min: 200 },
  { name: "Phone financing", balance: 1200, rate: 12, min: 50 },
];

function DebtOrder() {
  const [extra, setExtra] = useState(200);
  const high = avalanche(SAMPLE_DEBTS, extra);
  const small = snowball(SAMPLE_DEBTS, extra);
  const none = avalanche(SAMPLE_DEBTS, 0);
  return (
    <Demo>
      <Slider label="Extra each month" value={extra} onChange={setExtra} min={0} max={1000} step={25} format={money} />
      <Stats>
        <Stat label="Highest rate first: interest" value={money(high.interest)} tone="good" />
        <Stat label="Smallest debt first: interest" value={money(small.interest)} tone="warn" />
        <Stat label="No extra at all: interest" value={money(none.interest)} tone="bad" />
        <Stat label="Debt-free in" value={years(high.months)} />
      </Stats>
      <Verdict tone="good">
        Paying the highest rate first saves {money(small.interest - high.interest)} compared with smallest first. The extra payment itself saves {money(none.interest - high.interest)}.
      </Verdict>
      <Note>Sample debts: {SAMPLE_DEBTS.map((d) => `${d.name} ${money(d.balance)} at ${d.rate}%`).join(", ")}.</Note>
    </Demo>
  );
}

function Allocation() {
  const [stocks, setStocks] = useState(80);
  const [monthly, setMonthly] = useState(500);
  const [time, setTime] = useState(30);
  const { yearly, badYear } = mixOutlook(stocks);
  return (
    <Demo>
      <Slider label="Share in stocks" value={stocks} onChange={setStocks} min={0} max={100} step={5} format={pct} />
      <Slider label="Invested each month" value={monthly} onChange={setMonthly} min={100} max={3000} step={50} format={money} />
      <Slider label="Years" value={time} onChange={setTime} min={3} max={40} format={(v) => `${v} yr`} />
      <Bar
        parts={[
          { w: stocks, color: C.std, label: `Stocks ${stocks}%` },
          { w: 100 - stocks, color: C.scotia, label: `Bonds ${100 - stocks}%` },
        ]}
      />
      <Stats>
        <Stat label="Long-run return, estimated" value={`${num(yearly, 1)}%`} />
        <Stat label="A very bad year could be" value={`${num(badYear, 0)}%`} tone="bad" />
        <Stat label="On $100,000 that is" value={money(1000 * badYear)} tone="bad" />
        <Stat label={`After ${time} years`} value={money(fvMonthly(monthly, time, yearly))} tone="good" />
      </Stats>
      <Note>Assumes 7% for stocks and 3.5% for bonds, with bad-year falls of 35% and 5%. These are planning guesses, not promises.</Note>
    </Demo>
  );
}

function TfsaRrsp() {
  const [now, setNow] = useState(36);
  const [later, setLater] = useState(28);
  const [time, setTime] = useState(35);
  const { tfsa, rrsp } = tfsaVsRrsp(1000, now, later, time, 6);
  const gap = Math.abs(tfsa - rrsp);
  return (
    <Demo>
      <Slider label="Tax rate now" value={now} onChange={setNow} min={15} max={53} format={pct} />
      <Slider label="Tax rate when you withdraw" value={later} onChange={setLater} min={15} max={53} format={pct} />
      <Slider label="Years invested" value={time} onChange={setTime} min={5} max={40} format={(v) => `${v} yr`} />
      <Stats>
        <Stat label="TFSA, after tax" value={money(tfsa)} tone={tfsa > rrsp + 1 ? "good" : undefined} />
        <Stat label="RRSP, after tax" value={money(rrsp)} tone={rrsp > tfsa + 1 ? "good" : undefined} />
      </Stats>
      {gap < 1 ? (
        <Verdict tone="good">Same rate now and later means the same result. The two accounts only differ when your tax rate changes.</Verdict>
      ) : (
        <Verdict tone="good">
          The {rrsp > tfsa ? "RRSP" : "TFSA"} wins by {money(gap)}, because your tax rate is {rrsp > tfsa ? "lower" : "higher"} when you withdraw.
        </Verdict>
      )}
      <Note>Each starts from $1,000 of pre-tax income at 6% a year. The RRSP invests all of it, because the refund is reinvested. The TFSA invests what is left after tax.</Note>
    </Demo>
  );
}

function RentBuy() {
  const [price, setPrice] = useState(450000);
  const [rent, setRent] = useState(2075);
  const cost = (price * 0.05) / 12;
  const renting = rent <= cost;
  return (
    <Demo>
      <Slider label="Home price" value={price} onChange={setPrice} min={200000} max={1200000} step={10000} format={money} />
      <Slider label="Rent for a similar home" value={rent} onChange={setRent} min={800} max={5000} step={25} format={money} />
      <Stats>
        <Stat label="Owning's lost costs a month" value={money(cost)} />
        <Stat label="Rent a month" value={money(rent)} />
      </Stats>
      <Verdict tone={renting ? "good" : "warn"}>
        {renting ? "Rent is below that line, so renting and investing the difference is competitive." : "Rent is above that line, so buying starts to look better on cost alone."}
      </Verdict>
      <Note>The 5% rule of thumb: about 1% property tax, 1% upkeep and 3% for the cost of the money. Rent is lost too, but so are these costs.</Note>
    </Demo>
  );
}

function LoanSplit() {
  const [amount, setAmount] = useState(360000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(25);
  const months = time * 12;
  const payment = loanPayment(amount, rate, months);
  const interest = (amount * rate) / 1200;
  const total = payment * months - amount;
  return (
    <Demo>
      <Slider label="Amount borrowed" value={amount} onChange={setAmount} min={10000} max={800000} step={5000} format={money} />
      <Slider label="Interest rate" value={rate} onChange={setRate} min={1} max={12} step={0.05} format={(v) => `${v.toFixed(2)}%`} />
      <Slider label="Amortization" value={time} onChange={setTime} min={3} max={30} format={(v) => `${v} yr`} />
      <Bar
        parts={[
          { w: payment - interest, color: C.std, label: `First payment to principal ${money(payment - interest)}` },
          { w: interest, color: C.neg, label: `First payment to interest ${money(interest)}` },
        ]}
      />
      <Stats>
        <Stat label="Monthly payment" value={money(payment)} />
        <Stat label="Total interest" value={money(total)} tone="bad" />
        <Stat label="Total paid" value={money(amount + total)} />
      </Stats>
      <Note>Canadian mortgages compound twice a year, so a real payment comes in slightly lower. Payments shift toward principal over time.</Note>
    </Demo>
  );
}

function SavingsFi() {
  const [rate, setRate] = useState(20);
  const [net, setNet] = useState(4680);
  const yrs = yearsToIndependence(rate / 100, 4);
  return (
    <Demo>
      <Slider label="Share of take-home you save" value={rate} onChange={setRate} min={5} max={70} step={5} format={pct} />
      <Slider label="Monthly take-home pay" value={net} onChange={setNet} min={2000} max={12000} step={50} format={money} />
      <Stats>
        <Stat label="Years to financial independence" value={num(yrs, 1)} tone={yrs <= 25 ? "good" : "warn"} />
        <Stat label="Monthly spending" value={money((net * (100 - rate)) / 100)} />
        <Stat label="Target (25 times yearly spending)" value={money(((net * (100 - rate)) / 100) * 300)} />
      </Stats>
      <Note>Starts from zero at a 4% return after inflation. Notice the years depend on your savings rate, not on your pay: spending less also lowers the target.</Note>
    </Demo>
  );
}

export const FOUNDATION_DEMOS: Partial<Record<DemoKey, () => ReactElement>> = {
  netWorth: NetWorth,
  minPayment: MinPayment,
  debtOrder: DebtOrder,
  allocation: Allocation,
  tfsaRrsp: TfsaRrsp,
  rentBuy: RentBuy,
  loanSplit: LoanSplit,
  savingsFi: SavingsFi,
};

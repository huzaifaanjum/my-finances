"use client";

import { useState, type ReactElement } from "react";
import type { DemoKey } from "@/lib/rules";
import { C, Bar, Demo, Note, Slider, Stat, Stats, Verdict, fvMonthly, loanPayment, money, neededMonthly, num, s } from "./ui";

function PayFirst() {
  const [net, setNet] = useState(4680);
  const [pct, setPct] = useState(20);
  const m = (net * pct) / 100;
  return (
    <Demo>
      <Slider label="Monthly take-home pay" value={net} onChange={setNet} min={2000} max={10000} step={50} format={money} />
      <Slider label="Share moved to savings on payday" value={pct} onChange={setPct} min={0} max={50} format={(v) => `${v}%`} />
      <Stats>
        <Stat label="Moved each month" value={money(m)} tone="good" />
        <Stat label="After 1 year" value={money(m * 12)} />
        <Stat label="After 5 years (no growth)" value={money(m * 60)} />
      </Stats>
      <Note>Left to spend each month: {money(net - m)}.</Note>
    </Demo>
  );
}

function Budget() {
  const [net, setNet] = useState(4680);
  const [needs, setNeeds] = useState(50);
  const [wants, setWants] = useState(30);
  const save = Math.max(0, 100 - needs - wants);
  const over = needs + wants > 100;
  return (
    <Demo>
      <Slider label="Monthly take-home pay" value={net} onChange={setNet} min={2000} max={10000} step={50} format={money} />
      <Slider label="Needs" value={needs} onChange={setNeeds} min={20} max={80} format={(v) => `${v}%`} />
      <Slider label="Wants" value={wants} onChange={setWants} min={0} max={60} format={(v) => `${v}%`} />
      <Bar
        parts={[
          { w: needs, color: C.scotia, label: `Needs ${money((net * needs) / 100)}` },
          { w: wants, color: C.promo, label: `Wants ${money((net * wants) / 100)}` },
          { w: save, color: C.std, label: `Savings ${money((net * save) / 100)}` },
        ]}
      />
      {over ? (
        <Verdict tone="bad">Needs and wants add up to more than 100%. Something has to shrink.</Verdict>
      ) : save >= 20 ? (
        <Verdict tone="good">Savings are {save}%. You are on or above the 20% target.</Verdict>
      ) : (
        <Verdict tone="warn">Savings are only {save}%. Trim wants first to get back to 20%.</Verdict>
      )}
    </Demo>
  );
}

function Emergency() {
  const [exp, setExp] = useState(2600);
  const [months, setMonths] = useState(3);
  const [save, setSave] = useState(500);
  const target = exp * months;
  const need = save > 0 ? Math.ceil(target / save) : Infinity;
  return (
    <Demo>
      <Slider label="Basic monthly expenses" value={exp} onChange={setExp} min={1000} max={6000} step={50} format={money} />
      <Slider label="Months to cover" value={months} onChange={setMonths} min={1} max={12} format={(v) => `${v} months`} />
      <Slider label="You save each month" value={save} onChange={setSave} min={0} max={2000} step={25} format={money} />
      <Stats>
        <Stat label="Your target" value={money(target)} tone="good" />
        <Stat label="Time to reach it" value={Number.isFinite(need) ? `${need} months` : "Never"} />
      </Stats>
      <Note>{months < 3 ? "Under 3 months is a start, but aim higher." : months > 6 ? "More than 6 months is very safe. After that, extra cash may work harder invested." : "That is inside the 3 to 6 month range."}</Note>
    </Demo>
  );
}

function monthsToPayOff(balance: number, apr: number, pay: number): number {
  const r = apr / 100 / 12;
  if (pay <= balance * r) return Infinity;
  return -Math.log(1 - (balance * r) / pay) / Math.log(1 + r);
}

function Debt() {
  const [bal, setBal] = useState(3000);
  const [apr, setApr] = useState(20);
  const [pay, setPay] = useState(150);
  const [extra, setExtra] = useState(50);
  const a = monthsToPayOff(bal, apr, pay);
  const b = monthsToPayOff(bal, apr, pay + extra);
  const ia = Number.isFinite(a) ? a * pay - bal : Infinity;
  const ib = Number.isFinite(b) ? b * (pay + extra) - bal : Infinity;
  const fmtM = (m: number) => (Number.isFinite(m) ? `${Math.ceil(m)} months` : "Never");
  const fmtI = (v: number) => (Number.isFinite(v) ? money(v) : "Grows forever");
  return (
    <Demo>
      <Slider label="Card balance" value={bal} onChange={setBal} min={500} max={15000} step={100} format={money} />
      <Slider label="Interest rate (APR)" value={apr} onChange={setApr} min={5} max={30} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Slider label="Monthly payment" value={pay} onChange={setPay} min={25} max={1000} step={5} format={money} />
      <Slider label="Try paying this much extra" value={extra} onChange={setExtra} min={0} max={500} step={5} format={money} />
      <Stats>
        <Stat label="Paying only the payment" value={fmtM(a)} />
        <Stat label="Interest you pay" value={fmtI(ia)} tone="bad" />
        <Stat label="With the extra" value={fmtM(b)} tone="good" />
        <Stat label="Interest with extra" value={fmtI(ib)} tone="good" />
      </Stats>
      {Number.isFinite(ia) && Number.isFinite(ib) && <Note>The extra payment saves {money(ia - ib)} in interest.</Note>}
    </Demo>
  );
}

function Credit() {
  const [limit, setLimit] = useState(3000);
  const [bal, setBal] = useState(600);
  const use = limit > 0 ? Math.min(100, (bal / limit) * 100) : 0;
  const tone = use < 10 ? "good" : use <= 30 ? "good" : use <= 50 ? "warn" : "bad";
  return (
    <Demo>
      <Slider label="Credit limit" value={limit} onChange={setLimit} min={500} max={20000} step={100} format={money} />
      <Slider label="Balance on your statement" value={bal} onChange={setBal} min={0} max={20000} step={50} format={money} />
      <Bar
        parts={[
          { w: use, color: tone === "bad" ? C.neg : tone === "warn" ? C.promo : C.std, label: `Used ${num(use)}%` },
          { w: 100 - use, color: "#27272a", label: "Free" },
        ]}
      />
      <Verdict tone={tone}>
        {use < 10
          ? "Excellent. Under 10% used."
          : use <= 30
            ? "Healthy. Staying under 30% helps your score."
            : use <= 50
              ? "Getting high. Pay the balance down before the statement closes."
              : "Too high. This can pull your score down even if you pay on time."}
      </Verdict>
      <Note>Card companies usually report the balance on your statement date. Paying down before that date lowers what gets reported.</Note>
    </Demo>
  );
}

function Accounts() {
  const [amt, setAmt] = useState(8000);
  const [rate, setRate] = useState(36);
  const refund = (amt * rate) / 100;
  return (
    <Demo>
      <Slider label="Amount you contribute" value={amt} onChange={setAmt} min={0} max={35000} step={500} format={money} />
      <Slider label="Your combined tax rate on the next dollar" value={rate} onChange={setRate} min={15} max={50} format={(v) => `${v}%`} />
      <div className={s.stats}>
        <Stat label="TFSA refund" value={money(0)} />
        <Stat label="RRSP refund" value={money(refund)} tone="good" />
        <Stat label="FHSA refund (up to $8,000)" value={money((Math.min(amt, 8000) * rate) / 100)} tone="good" />
      </div>
      <Note>
        A TFSA gives no refund, but growth and withdrawals are tax-free and you can take money out any time. The refund from an RRSP or FHSA is real money you can add back to your savings. Limits for 2026: TFSA $7,000, FHSA $8,000 ($40,000 lifetime), RRSP up to $33,810 or 18% of last year's earned income.
      </Note>
    </Demo>
  );
}

function Compound() {
  const [m, setM] = useState(500);
  const [y, setY] = useState(25);
  const [r, setR] = useState(6);
  const total = fvMonthly(m, y, r);
  const paid = m * y * 12;
  const late = fvMonthly(m, Math.max(0, y - 5), r);
  return (
    <Demo>
      <Slider label="Monthly deposit" value={m} onChange={setM} min={50} max={3000} step={25} format={money} />
      <Slider label="Years" value={y} onChange={setY} min={5} max={40} format={(v) => `${v} years`} />
      <Slider label="Yearly return" value={r} onChange={setR} min={0} max={10} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Bar
        parts={[
          { w: paid, color: C.scotia, label: `You paid in ${money(paid)}` },
          { w: total - paid, color: C.std, label: `Growth ${money(total - paid)}` },
        ]}
      />
      <Stats>
        <Stat label={`After ${y} years`} value={money(total)} tone="good" />
        <Stat label="If you wait 5 years to start" value={money(late)} tone="warn" />
        <Stat label="Cost of waiting" value={money(total - late)} tone="bad" />
      </Stats>
      <Note>Returns are not guaranteed. Real returns go up and down from year to year.</Note>
    </Demo>
  );
}

function Rule72() {
  const [r, setR] = useState(6);
  const quick = 72 / r;
  const exact = Math.log(2) / Math.log(1 + r / 100);
  return (
    <Demo>
      <Slider label="Yearly return" value={r} onChange={setR} min={1} max={25} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Stats>
        <Stat label="Rule of 72 says" value={`${num(quick, 1)} years`} tone="good" />
        <Stat label="Exact answer" value={`${num(exact, 1)} years`} />
      </Stats>
      <Note>For card debt at 20%, your balance would double in about {num(72 / 20, 1)} years if you never paid it down.</Note>
    </Demo>
  );
}

function Fees() {
  const [m, setM] = useState(500);
  const [y, setY] = useState(25);
  const [gross, setGross] = useState(6);
  const [fee, setFee] = useState(2.2);
  const low = fvMonthly(m, y, gross - 0.2);
  const high = fvMonthly(m, y, gross - fee);
  return (
    <Demo>
      <Slider label="Monthly deposit" value={m} onChange={setM} min={50} max={3000} step={25} format={money} />
      <Slider label="Years" value={y} onChange={setY} min={5} max={40} format={(v) => `${v} years`} />
      <Slider label="Return before fees" value={gross} onChange={setGross} min={3} max={10} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Slider label="Fee on the expensive fund" value={fee} onChange={setFee} min={0.5} max={3} step={0.1} format={(v) => `${num(v, 1)}%`} />
      <Stats>
        <Stat label="Low-cost fund (0.2%)" value={money(low)} tone="good" />
        <Stat label={`Expensive fund (${num(fee, 1)}%)`} value={money(high)} tone="warn" />
        <Stat label="Lost to fees" value={money(low - high)} tone="bad" />
      </Stats>
    </Demo>
  );
}

function Million() {
  const [target, setTarget] = useState(1000000);
  const [start, setStart] = useState(0);
  const [y, setY] = useState(20);
  const [r, setR] = useState(6);
  const need = neededMonthly(target, y, r, start);
  return (
    <Demo>
      <Slider label="Goal" value={target} onChange={setTarget} min={100000} max={3000000} step={50000} format={money} />
      <Slider label="Savings you already have" value={start} onChange={setStart} min={0} max={200000} step={1000} format={money} />
      <Slider label="Years to get there" value={y} onChange={setY} min={5} max={40} format={(v) => `${v} years`} />
      <Slider label="Yearly return" value={r} onChange={setR} min={0} max={10} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Stats>
        <Stat label="Save each month" value={money(need)} tone="good" />
        <Stat label="Total you pay in" value={money(need * y * 12 + start)} />
      </Stats>
      <Stats>
        {[10, 15, 20, 25, 30].map((yr) => (
          <Stat key={yr} label={`In ${yr} years`} value={`${money(neededMonthly(target, yr, r, start))} / month`} />
        ))}
      </Stats>
      <Note>This is nominal money, not adjusted for inflation. A million in 20 years buys less than a million today.</Note>
    </Demo>
  );
}

function Car() {
  const [price, setPrice] = useState(30000);
  const [income, setIncome] = useState(7917);
  const [run, setRun] = useState(250);
  const [rate, setRate] = useState(7.5);
  const [term, setTerm] = useState(48);
  const down = price * 0.2;
  const pay = loanPayment(price - down, rate, term);
  const total = pay + run;
  const share = income > 0 ? (total / income) * 100 : 0;
  const interest = pay * term - (price - down);
  const ok = share <= 10 && term <= 48;
  return (
    <Demo>
      <Slider label="Car price" value={price} onChange={setPrice} min={5000} max={80000} step={500} format={money} />
      <Slider label="Gross monthly income" value={income} onChange={setIncome} min={2000} max={20000} step={50} format={money} />
      <Slider label="Insurance and gas per month" value={run} onChange={setRun} min={0} max={800} step={10} format={money} />
      <Slider label="Loan rate" value={rate} onChange={setRate} min={0} max={15} step={0.25} format={(v) => `${num(v, 2)}%`} />
      <Slider label="Loan length" value={term} onChange={setTerm} min={24} max={96} step={12} format={(v) => `${v / 12} years`} />
      <Stats>
        <Stat label="Down payment (20%)" value={money(down)} />
        <Stat label="Loan payment" value={money(pay)} />
        <Stat label="All car costs" value={money(total)} />
        <Stat label="Share of gross pay" value={`${num(share, 1)}%`} tone={share <= 10 ? "good" : share <= 15 ? "warn" : "bad"} />
        <Stat label="Interest over the loan" value={money(interest)} tone="warn" />
      </Stats>
      <Verdict tone={ok ? "good" : "warn"}>
        {ok ? "This passes the 20/4/10 rule." : term > 48 ? "The loan is longer than 4 years. A longer loan lowers the payment but costs more interest." : "Car costs are above 10% of gross pay. Consider a cheaper car or more down."}
      </Verdict>
    </Demo>
  );
}

function Home() {
  const [price, setPrice] = useState(450000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(5);
  const [other, setOther] = useState(450);
  const minDown = price <= 500000 ? price * 0.05 : price <= 1500000 ? 25000 + (price - 500000) * 0.1 : price * 0.2;
  const down = (price * downPct) / 100;
  const loan = Math.max(0, price - down);
  const pay = loanPayment(loan, rate, 300);
  const cost = pay + other;
  const income39 = ((cost / 0.39) * 12);
  const income30 = ((cost / 0.3) * 12);
  const short = down < minDown;
  return (
    <Demo>
      <Slider label="Home price" value={price} onChange={setPrice} min={150000} max={1000000} step={10000} format={money} />
      <Slider label="Down payment" value={downPct} onChange={setDownPct} min={5} max={30} format={(v) => `${v}% (${money((price * v) / 100)})`} />
      <Slider label="Mortgage rate" value={rate} onChange={setRate} min={2} max={9} step={0.25} format={(v) => `${num(v, 2)}%`} />
      <Slider label="Property tax, heat and fees per month" value={other} onChange={setOther} min={0} max={1500} step={10} format={money} />
      <Stats>
        <Stat label="Mortgage payment (25 years)" value={money(pay)} />
        <Stat label="Total housing cost" value={money(cost)} />
        <Stat label="Income needed at 30%" value={money(income30)} tone="good" />
        <Stat label="Income needed at 39% (cap)" value={money(income39)} tone="warn" />
      </Stats>
      {short ? (
        <Verdict tone="bad">Below the legal minimum down payment of {money(minDown)} for this price.</Verdict>
      ) : downPct < 20 ? (
        <Verdict tone="warn">Under 20% down, you must also pay mortgage default insurance, which adds to the loan.</Verdict>
      ) : (
        <Verdict tone="good">20% or more down: no mortgage default insurance needed.</Verdict>
      )}
      <Note>This is an estimate. Canadian lenders compound mortgage interest differently and qualify you at a higher stress test rate, so real numbers differ a little.</Note>
    </Demo>
  );
}

function Lifestyle() {
  const [raise, setRaise] = useState(400);
  const [share, setShare] = useState(50);
  const [y, setY] = useState(10);
  const [r, setR] = useState(6);
  const saved = (raise * share) / 100;
  const fv = fvMonthly(saved, y, r);
  return (
    <Demo>
      <Slider label="Raise, per month after tax" value={raise} onChange={setRaise} min={100} max={2000} step={50} format={money} />
      <Slider label="Share of the raise you save" value={share} onChange={setShare} min={0} max={100} format={(v) => `${v}%`} />
      <Slider label="Years" value={y} onChange={setY} min={1} max={30} format={(v) => `${v} years`} />
      <Slider label="Yearly return" value={r} onChange={setR} min={0} max={10} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Stats>
        <Stat label="Saved each month" value={money(saved)} />
        <Stat label="Spent each month" value={money(raise - saved)} />
        <Stat label={`Saved after ${y} years`} value={money(fv)} tone="good" />
      </Stats>
      <Note>Spending the whole raise ({money(raise)} a month) leaves you with {money(0)} extra after {y} years.</Note>
    </Demo>
  );
}

function Taxes() {
  const [filed, setFiled] = useState(2);
  const need = 3;
  const left = Math.max(0, need - filed);
  return (
    <Demo>
      <Slider label="Years you filed in the last 5" value={filed} onChange={setFiled} min={0} max={5} format={(v) => `${v} of 5`} />
      {left === 0 ? (
        <Verdict tone="good">That meets the 3 of 5 years of tax filing that citizenship asks for (if you were required to file).</Verdict>
      ) : (
        <Verdict tone="warn">You still need {left} more year{left > 1 ? "s" : ""} of filed returns to reach 3 of 5.</Verdict>
      )}
      <Note>Key dates: file and pay by April 30 for the CRA and for Revenu Québec. Filing late can mean penalties and interest, and delays refunds.</Note>
    </Demo>
  );
}

const DEMOS: Record<DemoKey, () => ReactElement> = {
  payFirst: PayFirst,
  budget: Budget,
  emergency: Emergency,
  debt: Debt,
  credit: Credit,
  accounts: Accounts,
  compound: Compound,
  rule72: Rule72,
  fees: Fees,
  million: Million,
  car: Car,
  home: Home,
  lifestyle: Lifestyle,
  taxes: Taxes,
};

export function DemoFor({ name }: { name: DemoKey }) {
  const D = DEMOS[name];
  return <D />;
}

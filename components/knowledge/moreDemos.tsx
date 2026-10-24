"use client";

// Calculators for the pay, retirement and insurance rules. Tax uses the same 2026 federal and
// Quebec model as the payslip forecast, worked out on a full year.

import { useState, type ReactElement } from "react";
import { EMPLOYER_HEALTH } from "@/lib/offer";
import { COSTS, LSA_YEARLY, benefit } from "@/lib/benefits";
import type { DemoKey } from "@/lib/knowledge/rules";
import { federalTax, payrollMax, quebecTax, taxYear } from "@/lib/payslips/tax";
import { RRSP_MAX } from "@/lib/recommendations";
import { C, Bar, Demo, Note, Slider, Stat, Stats, Verdict, fvMonthly, money, num } from "./ui";

const YEAR = 2026;
const BENEFITS_YEAR = EMPLOYER_HEALTH * 12;
const INSURANCE_YEAR = COSTS.youTotal * 12;
const pct = (v: number) => `${num(v, 0)}%`;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** A full year of pay at this salary: tax, plans, pension, insurance and what is left. */
function yearOfPay(salary: number, dc = 0.06) {
  const p = taxYear(YEAR);
  const max = payrollMax(p);
  const pension = salary * dc;
  const income = { gross: salary, fedTaxable: salary - pension, qcTaxable: salary - pension + BENEFITS_YEAR };
  const fed = federalTax(income, p);
  const qc = quebecTax(income, p);
  const pensionable = salary + BENEFITS_YEAR;
  const qpp =
    Math.min(p.qpp.rate * Math.max(0, pensionable - p.qpp.exemption), max.qpp1) + p.qpp.rate2 * clamp(pensionable - p.qpp.ympe, 0, p.qpp.yampe - p.qpp.ympe);
  const ei = Math.min(salary * p.ei.rate, max.ei);
  const qpip = Math.min(salary * p.qpip.rate, max.qpip);
  const tax = fed + qc;
  const plans = qpp + ei + qpip;
  return { salary, pension, tax, plans, insurance: INSURANCE_YEAR, net: salary - pension - tax - plans - INSURANCE_YEAR, qpp, ei, qpip };
}

const taxOnly = (salary: number) => {
  const p = taxYear(YEAR);
  const pension = salary * 0.06;
  const i = { gross: salary, fedTaxable: salary - pension, qcTaxable: salary - pension + BENEFITS_YEAR };
  return federalTax(i, p) + quebecTax(i, p);
};

function Payslip() {
  const [salary, setSalary] = useState(95000);
  const y = yearOfPay(salary);
  const m = (v: number) => v / 12;
  return (
    <Demo>
      <Slider label="Yearly salary" value={salary} onChange={setSalary} min={40000} max={200000} step={1000} format={money} />
      <Bar
        parts={[
          { w: y.net, color: C.std, label: `Take-home ${money(m(y.net))}` },
          { w: y.tax, color: C.tax, label: `Income tax ${money(m(y.tax))}` },
          { w: y.pension, color: C.pension, label: `Pension ${money(m(y.pension))}` },
          { w: y.plans, color: C.gov, label: `QPP, EI, QPIP ${money(m(y.plans))}` },
          { w: y.insurance, color: C.ins, label: `Insurance ${money(m(y.insurance))}` },
        ]}
      />
      <Stats>
        <Stat label="Gross a month" value={money(m(salary))} />
        <Stat label="Deposit a month" value={money(m(y.net))} tone="good" />
        <Stat label="Share you keep" value={pct((y.net / salary) * 100)} />
      </Stats>
      <Note>A full-year average. Real payslips vary a little month to month, mainly because QPP and EI stop late in the year.</Note>
    </Demo>
  );
}

function Marginal() {
  const [salary, setSalary] = useState(95000);
  const tax = taxOnly(salary);
  const marginal = (taxOnly(salary + 1000) - tax) / 1000;
  return (
    <Demo>
      <Slider label="Yearly salary" value={salary} onChange={setSalary} min={30000} max={250000} step={1000} format={money} />
      <Stats>
        <Stat label="Average income tax rate" value={pct((tax / salary) * 100)} />
        <Stat label="Marginal rate (next dollar)" value={pct(marginal * 100)} tone="warn" />
        <Stat label="You keep of the next $1,000" value={money(1000 * (1 - marginal))} tone="good" />
      </Stats>
      <Verdict tone="good">A $1,000 RRSP or FHSA contribution at this salary cuts tax by about {money(1000 * marginal)}.</Verdict>
    </Demo>
  );
}

function PayrollMax() {
  const [salary, setSalary] = useState(95000);
  const p = taxYear(YEAR + 1);
  const max = payrollMax(p);
  const monthly = salary / 12;
  const eiMonth = monthly * p.ei.rate;
  const qppMonth = p.qpp.rate * Math.max(0, (salary + BENEFITS_YEAR) / 12 - p.qpp.exemption / 12);
  const eiStops = Math.ceil(max.ei / eiMonth);
  const qppStops = Math.ceil(max.qpp1 / qppMonth);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const when = (n: number) => (n > 12 ? "never" : `after ${MONTHS[n - 1]}`);
  return (
    <Demo>
      <Slider label="Yearly salary" value={salary} onChange={setSalary} min={40000} max={200000} step={1000} format={money} />
      <Stats>
        <Stat label="EI stops" value={when(eiStops)} />
        <Stat label="QPP stops" value={when(qppStops)} />
        <Stat label="Extra a month once both stop" value={eiStops <= 12 && qppStops <= 12 ? money(eiMonth + qppMonth) : "–"} tone="good" />
      </Stats>
      <Note>
        Yearly maximums for {YEAR + 1}: EI {money(max.ei)}, QPP about {money(max.qpp1 + max.qpp2)}. Below about {money(p.ei.maxInsurable)} EI never maxes out.
      </Note>
    </Demo>
  );
}

function Raise() {
  const [salary, setSalary] = useState(95000);
  const [raise, setRaise] = useState(3);
  const now = yearOfPay(salary);
  const next = yearOfPay(salary * (1 + raise / 100));
  const extra = (next.net - now.net) / 12;
  return (
    <Demo>
      <Slider label="Salary now" value={salary} onChange={setSalary} min={40000} max={200000} step={1000} format={money} />
      <Slider label="Raise" value={raise} onChange={setRaise} min={1} max={20} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Stats>
        <Stat label="More gross a year" value={money(salary * (raise / 100))} />
        <Stat label="More in your account a month" value={money(extra)} tone="good" />
        <Stat label="Save half: extra transfer" value={`${money(extra / 2)} / month`} />
      </Stats>
      <Note>Of each extra dollar of salary, about {pct(((extra * 12) / (salary * (raise / 100))) * 100)} reaches your account; the rest is tax, plans and a bigger pension contribution.</Note>
    </Demo>
  );
}

function Disability() {
  const [gross, setGross] = useState(7917);
  const [cover, setCover] = useState(60);
  const [youPay, setYouPay] = useState(true);
  const benefitMonth = (gross * cover) / 100;
  const p = taxYear(YEAR);
  const taxed = youPay ? 0 : (federalTax({ gross: benefitMonth * 12, fedTaxable: benefitMonth * 12, qcTaxable: benefitMonth * 12 }, p) + quebecTax({ gross: benefitMonth * 12, fedTaxable: benefitMonth * 12, qcTaxable: benefitMonth * 12 }, p)) / 12;
  const takeHome = yearOfPay(gross * 12).net / 12;
  const after = benefitMonth - taxed;
  return (
    <Demo>
      <Slider label="Monthly gross pay" value={gross} onChange={setGross} min={3000} max={15000} step={50} format={money} />
      <Slider label="Plan covers" value={cover} onChange={setCover} min={50} max={80} step={5} format={(v) => `${v}% of gross`} />
      <label className="chk" style={{ marginTop: 4 }}>
        <input type="checkbox" checked={youPay} onChange={(e) => setYouPay(e.target.checked)} /> You pay the premiums (benefit is tax-free)
      </label>
      <Stats>
        <Stat label="Benefit a month" value={money(benefitMonth)} />
        <Stat label="After tax" value={money(after)} tone="good" />
        <Stat label="Your take-home today" value={money(takeHome)} />
      </Stats>
      <Verdict tone={after >= takeHome * 0.9 ? "good" : "warn"}>
        That replaces {pct((after / takeHome) * 100)} of your take-home{youPay ? "." : ". If your employer paid the premiums, the benefit would be taxed."}
      </Verdict>
    </Demo>
  );
}

function LifeNeed() {
  const [years, setYears] = useState(0);
  const [income, setIncome] = useState(60000);
  const [debts, setDebts] = useState(10000);
  const [savings, setSavings] = useState(0);
  const have = benefit("life").pays!.amount;
  const need = Math.max(0, years * income + debts - savings);
  const gap = need - have;
  return (
    <Demo>
      <Slider label="Years of income someone would need" value={years} onChange={setYears} min={0} max={20} format={(v) => (v ? `${v} years` : "nobody depends on you")} />
      <Slider label="Their yearly income need" value={income} onChange={setIncome} min={20000} max={150000} step={5000} format={money} />
      <Slider label="Debts and final costs" value={debts} onChange={setDebts} min={0} max={800000} step={5000} format={money} />
      <Slider label="Savings and investments" value={savings} onChange={setSavings} min={0} max={500000} step={5000} format={money} />
      <Stats>
        <Stat label="Cover you need" value={money(need)} />
        <Stat label="Group life you have" value={money(have)} tone="good" />
        <Stat label={gap > 0 ? "Gap to cover" : "More than enough by"} value={money(Math.abs(gap))} tone={gap > 0 ? "bad" : "good"} />
      </Stats>
      <Note>Accidental death cover pays only for accidents, so it is left out. Group cover usually ends when you leave the job.</Note>
    </Demo>
  );
}

function Lsa() {
  const [amount, setAmount] = useState(LSA_YEARLY);
  const [claimed, setClaimed] = useState(0);
  const [rate, setRate] = useState(36);
  const left = Math.max(0, amount - claimed);
  return (
    <Demo>
      <Slider label="Yearly spending account" value={amount} onChange={setAmount} min={0} max={2000} step={50} format={money} />
      <Slider label="Claimed so far this year" value={claimed} onChange={setClaimed} min={0} max={amount} step={10} format={money} />
      <Slider label="Your marginal tax rate" value={rate} onChange={setRate} min={20} max={53} format={(v) => `${v}%`} />
      <Stats>
        <Stat label="Left to claim" value={money(left)} tone={left ? "warn" : "good"} />
        <Stat label="Worth after tax" value={money(left * (1 - rate / 100))} />
        <Stat label="A month, if spent evenly" value={money(left / 12)} />
      </Stats>
      <Note>Claims are a taxable benefit. Even after tax, unclaimed dollars are pay you never collect.</Note>
    </Demo>
  );
}

function Match() {
  const [mine, setMine] = useState(6);
  const [salary, setSalary] = useState(95000);
  const [ret, setRet] = useState(5);
  const years = 36;
  const theirs = Math.min(mine, 6);
  const full = fvMonthly((salary * 0.12) / 12, years, ret);
  const yours = fvMonthly((salary * (mine + theirs)) / 100 / 12, years, ret);
  return (
    <Demo>
      <Slider label="You contribute" value={mine} onChange={setMine} min={0} max={6} step={1} format={(v) => `${v}% of salary`} />
      <Slider label="Salary" value={salary} onChange={setSalary} min={40000} max={200000} step={1000} format={money} />
      <Slider label="Fund return" value={ret} onChange={setRet} min={2} max={9} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Stats>
        <Stat label="Air Canada adds a year" value={money((salary * theirs) / 100)} tone="good" />
        <Stat label={`Pot in ${years} years`} value={money(yours)} />
        <Stat label="Lost vs the full 6%" value={money(full - yours)} tone={full - yours > 1 ? "bad" : "good"} />
      </Stats>
      <Note>No raises included, so this understates the real pot. The match is free money only if you contribute.</Note>
    </Demo>
  );
}

function RrspRoom() {
  const [salary, setSalary] = useState(95000);
  const [dc, setDc] = useState(12);
  const gross = Math.min(salary * 0.18, RRSP_MAX);
  const pa = (salary * dc) / 100;
  const room = Math.max(0, gross - pa);
  return (
    <Demo>
      <Slider label="Last year's earnings" value={salary} onChange={setSalary} min={30000} max={250000} step={1000} format={money} />
      <Slider label="Pension contributions, you + employer" value={dc} onChange={setDc} min={0} max={18} format={(v) => `${v}% of salary`} />
      <Bar
        parts={[
          { w: pa, color: C.pension, label: `Pension adjustment ${money(pa)}` },
          { w: room, color: C.std, label: `RRSP room left ${money(room)}` },
        ]}
      />
      <Stats>
        <Stat label="18% of earnings (capped)" value={money(gross)} />
        <Stat label="New RRSP room" value={money(room)} tone="good" />
      </Stats>
      <Note>The 2026 limit is {money(RRSP_MAX)}. Unused room carries forward forever; your Notice of Assessment has the exact number.</Note>
    </Demo>
  );
}

function QppAge() {
  const [qppAge, setQppAge] = useState(65);
  const [oasAge, setOasAge] = useState(65);
  const QPP65 = 1450;
  const OAS65 = 740;
  const months = (qppAge - 65) * 12;
  const qpp = QPP65 * (1 + (months < 0 ? months * 0.006 : months * 0.007));
  const oas = OAS65 * (1 + (oasAge - 65) * 12 * 0.006);
  return (
    <Demo>
      <Slider label="Start QPP at" value={qppAge} onChange={setQppAge} min={60} max={72} format={(v) => `age ${v}`} />
      <Slider label="Start OAS at" value={oasAge} onChange={setOasAge} min={65} max={70} format={(v) => `age ${v}`} />
      <Stats>
        <Stat label="QPP a month" value={money(qpp)} tone={qppAge >= 65 ? "good" : "warn"} />
        <Stat label="OAS a month" value={money(oas)} tone="good" />
        <Stat label="Together" value={money(qpp + oas)} />
      </Stats>
      <Note>Today's dollars, from rough 2026 amounts of {money(QPP65)} (QPP) and {money(OAS65)} (OAS) at 65. Both rise with inflation for life.</Note>
    </Demo>
  );
}

function FourPercent() {
  const [pot, setPot] = useState(1000000);
  const [rate, setRate] = useState(4);
  const [spend, setSpend] = useState(60000);
  return (
    <Demo>
      <Slider label="Savings at retirement" value={pot} onChange={setPot} min={100000} max={3000000} step={50000} format={money} />
      <Slider label="Yearly withdrawal" value={rate} onChange={setRate} min={3} max={6} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Stats>
        <Stat label="A year" value={money((pot * rate) / 100)} />
        <Stat label="A month" value={money((pot * rate) / 100 / 12)} tone="good" />
      </Stats>
      <Slider label="Or: what you want to spend a year" value={spend} onChange={setSpend} min={20000} max={150000} step={5000} format={money} />
      <Verdict tone="good">
        At {num(rate, 1)}% you would need about {money(spend / (rate / 100))} saved.
      </Verdict>
    </Demo>
  );
}

function Fhsa() {
  const [buy, setBuy] = useState(5);
  const [wait, setWait] = useState(0);
  const [rate, setRate] = useState(36);
  const room = (delay: number) => Math.min(40000, 8000 * Math.max(0, buy - delay));
  const now = room(0);
  const later = room(wait);
  return (
    <Demo>
      <Slider label="Years until you buy" value={buy} onChange={setBuy} min={1} max={10} format={(v) => `${v} years`} />
      <Slider label="Years you wait to open it" value={wait} onChange={setWait} min={0} max={5} format={(v) => (v ? `${v} years` : "open now")} />
      <Slider label="Your marginal tax rate" value={rate} onChange={setRate} min={20} max={53} format={(v) => `${v}%`} />
      <Stats>
        <Stat label="Room by then, opening now" value={money(now)} tone="good" />
        <Stat label={wait ? `Opening in ${wait} years` : "Room by then"} value={money(later)} tone={later < now ? "bad" : "good"} />
        <Stat label="Tax refunds on a full FHSA" value={money((later * rate) / 100)} />
      </Stats>
      {later < now && <Verdict tone="bad">Waiting costs {money(now - later)} of room, about {money(((now - later) * rate) / 100)} in tax refunds.</Verdict>}
    </Demo>
  );
}

function Inflation() {
  const [amount, setAmount] = useState(1000000);
  const [years, setYears] = useState(36);
  const [rate, setRate] = useState(2);
  const f = Math.pow(1 + rate / 100, years);
  return (
    <Demo>
      <Slider label="Amount in the future" value={amount} onChange={setAmount} min={10000} max={3000000} step={10000} format={money} />
      <Slider label="Years from now" value={years} onChange={setYears} min={1} max={50} format={(v) => `${v} years`} />
      <Slider label="Inflation" value={rate} onChange={setRate} min={1} max={5} step={0.5} format={(v) => `${num(v, 1)}%`} />
      <Stats>
        <Stat label="Worth in today's dollars" value={money(amount / f)} tone="warn" />
        <Stat label="Prices multiply by" value={`${num(f, 2)}×`} />
        <Stat label="Prices double every" value={`${num(72 / rate, 0)} years`} />
      </Stats>
    </Demo>
  );
}

export const MORE_DEMOS: Partial<Record<DemoKey, () => ReactElement>> = {
  payslip: Payslip,
  marginal: Marginal,
  payrollMax: PayrollMax,
  raise: Raise,
  disability: Disability,
  lifeNeed: LifeNeed,
  lsa: Lsa,
  match: Match,
  rrspRoom: RrspRoom,
  qppAge: QppAge,
  fourPercent: FourPercent,
  fhsa: Fhsa,
  inflation: Inflation,
};

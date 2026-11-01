"use client";

// Calculators for the side income and business rules.

import { useState, type ReactElement } from "react";
import FeeCalculator from "@/components/income/FeeCalculator";
import { freelanceRate, sideIncomeTax, subscribersAfter } from "@/lib/knowledge/calc";
import type { DemoKey } from "@/lib/knowledge/rules";
import { C, Bar, Demo, Note, Slider, Stat, Stats, Verdict, money, num } from "./ui";

function SideIncome() {
  const [profit, setProfit] = useState(10000);
  const tax = sideIncomeTax(profit);
  const keep = profit - tax;
  return (
    <Demo>
      <Slider label="Yearly side profit" value={profit} onChange={setProfit} min={1000} max={100000} step={1000} format={money} />
      <Bar
        parts={[
          { w: keep, color: C.std, label: `You keep ${money(keep)}` },
          { w: tax, color: C.tax, label: `Income tax ${money(tax)}` },
        ]}
      />
      <Stats>
        <Stat label="Tax on this profit" value={money(tax)} tone="warn" />
        <Stat label="Share taken" value={`${num((tax / profit) * 100, 0)}%`} />
        <Stat label="Safe share to set aside" value={profit > 40000 ? "45%" : "40%"} tone="good" />
      </Stats>
      <Note>Added on top of your $95,000 salary with the 2026 tax model. It leaves out small amounts for QPIP and the health services fund, so the set-aside is a little above the share taken.</Note>
    </Demo>
  );
}

function FreelanceRate() {
  const [profit, setProfit] = useState(20000);
  const [costs, setCosts] = useState(1500);
  const [hours, setHours] = useState(8);
  const [weeks, setWeeks] = useState(44);
  const rate = freelanceRate(profit, costs, hours, weeks);
  return (
    <Demo>
      <Slider label="Yearly profit you want" value={profit} onChange={setProfit} min={1000} max={100000} step={1000} format={money} />
      <Slider label="Yearly business costs" value={costs} onChange={setCosts} min={0} max={10000} step={100} format={money} />
      <Slider label="Billable hours a week" value={hours} onChange={setHours} min={1} max={40} format={(v) => `${v} hr`} />
      <Slider label="Working weeks a year" value={weeks} onChange={setWeeks} min={10} max={48} format={(v) => `${v} wk`} />
      <Stats>
        <Stat label="Hourly rate you need" value={money(rate)} tone="good" />
        <Stat label="Billable hours a year" value={num(hours * weeks)} />
        <Stat label="After tax you keep" value={money(profit - sideIncomeTax(profit))} />
      </Stats>
      <Note>Billable means paid hours. Emails, sales and admin aren&apos;t billable, so don&apos;t count them.</Note>
    </Demo>
  );
}

function SubscriptionGrowth() {
  const [monthlyNew, setMonthlyNew] = useState(10);
  const [price, setPrice] = useState(20);
  const [churn, setChurn] = useState(5);
  const after = (m: number) => subscribersAfter(monthlyNew, churn, m);
  const ceiling = (monthlyNew / churn) * 100;
  return (
    <Demo>
      <Slider label="New subscribers a month" value={monthlyNew} onChange={setMonthlyNew} min={1} max={100} format={(v) => `${v}`} />
      <Slider label="Monthly price" value={price} onChange={setPrice} min={5} max={100} format={money} />
      <Slider label="Monthly churn" value={churn} onChange={setChurn} min={1} max={15} step={0.5} format={(v) => `${v}%`} />
      <Stats>
        <Stat label="Monthly income at 1 year" value={money(after(12) * price)} />
        <Stat label="Monthly income at 3 years" value={money(after(36) * price)} />
        <Stat label="Ceiling" value={`${money(ceiling * price)} a month`} tone="warn" />
      </Stats>
      <Verdict tone="good">Growth stops near {num(ceiling)} subscribers, when cancellations match new sign-ups.</Verdict>
      <Note>Before fees and tax. Halving churn doubles the ceiling, which is why keeping customers matters so much.</Note>
    </Demo>
  );
}

export const BUSINESS_DEMOS: Partial<Record<DemoKey, () => ReactElement>> = {
  sideIncome: SideIncome,
  freelanceRate: FreelanceRate,
  subscriptionGrowth: SubscriptionGrowth,
  paymentFees: FeeCalculator,
};

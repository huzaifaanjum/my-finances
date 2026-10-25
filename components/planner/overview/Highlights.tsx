"use client";

import Link from "next/link";
import { usePensionStart } from "@/components/payslips/usePensionStart";
import { usePlan } from "@/components/providers/PlannerProvider";
import { money, percent } from "@/lib/format";
import { AIRCANADA, FLEXSPRING } from "@/lib/jobs";
import { retirement } from "@/lib/planner/retirement";
import { taxSummary } from "@/lib/taxSummary";

interface Item {
  href: string;
  label: string;
  value: string;
  note: string;
  tone?: "pos" | "warn";
}

/** Four headline numbers from the newest work: tax, the job change, retirement and the next deadline. */
export default function Highlights() {
  const plan = usePlan();
  const tax = taxSummary(plan.state);
  const r = retirement(plan, usePensionStart());
  const now = new Date();
  const dec31 = new Date(now.getFullYear(), 11, 31);
  const daysToDec31 = Math.ceil((dec31.getTime() - now.getTime()) / 864e5);

  const deadline: Item = !tax.hasFhsa
    ? { href: "/tax", label: "Next deadline", value: `${daysToDec31} days`, note: `to open an FHSA (Dec 31) and keep $8,000 of room; worth up to ${money(tax.fhsaValue)}`, tone: "warn" }
    : { href: "/tax", label: "Next deadline", value: "Mar 1, 2027", note: `RRSP contributions that count for 2026; ${money(tax.rrspRoom)} of room` };

  const items: Item[] = [
    {
      href: "/tax",
      label: "2026 tax refund",
      value: money(tax.refund),
      note: tax.unclaimed > 0.5 ? `estimated · ${money(tax.unclaimed)} of it you can claim now on 2025` : `estimated · up to ${money(tax.best)} with FHSA and RRSP`,
      tone: "pos",
    },
    {
      href: "/offer",
      label: "Since leaving FlexSpring",
      value: `+${money(AIRCANADA.netMonthly - FLEXSPRING.netMonthly)}/mo`,
      note: `more take-home, plus ${money(AIRCANADA.pension * 2 / 12)} a month into a pension`,
      tone: "pos",
    },
    {
      href: "/pension",
      label: "Income at 65",
      value: `${money(r.total)}/mo`,
      note: `today's dollars · ${percent(r.replacement)} of your take-home now`,
    },
    deadline,
  ];

  return (
    <section className="ov-hl" aria-label="Highlights">
      <h3>Highlights</h3>
      <div>
        {items.map((i) => (
          <Link key={i.label} href={i.href} className="ov-hl-i">
            <span>{i.label}</span>
            <b className={i.tone}>{i.value}</b>
            <em>{i.note}</em>
          </Link>
        ))}
      </div>
    </section>
  );
}

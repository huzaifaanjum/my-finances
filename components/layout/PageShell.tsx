"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { healthOf } from "@/lib/planner/projection";
import InfoTip from "@/components/ui/InfoTip";
import DashboardSkeleton from "./DashboardSkeleton";

const NOTES = [
  "Estimates only, not financial advice. Bonuses are net amounts.",
  "Per your offer letter, the two $2,500 (gross) signing payments arrive once each, in February 2027 and August 2027 (6 and 12 months after your Aug 17 start), and the annual incentive arrives each March.",
  "Pay lands on the last banking day of the month, shown as the last day of the month in the chart.",
  "Pay is assumed flat. In practice EI and QPP stop being withheld late each year once their annual maximums are reached, so real take-home should rise in the last months of each year; that is not modelled.",
  "The FHSA refund effect is a rough estimate based on about $65,000 of 2026 income.",
];

const NOTES_TIP = (
  <ul>
    {NOTES.map((n) => (
      <li key={n}>{n}</li>
    ))}
  </ul>
);

interface Props {
  title: string;
  subtitle: string;
  /** parent page, shown before the title as a breadcrumb */
  back?: { href: string; label: string };
  /** extra header content under the subtitle, e.g. live facts */
  facts?: ReactNode;
  /** show the planner assumptions in a header tooltip */
  assumptions?: boolean;
  children: ReactNode;
}

/** Frame for every planner page: header with the budget health badge, then the content. */
export default function PageShell({ title, subtitle, back, facts, assumptions, children }: Props) {
  const { plan, ready } = usePlanner();
  if (!ready) return <DashboardSkeleton />;

  const health = healthOf(plan);
  return (
    <main>
      <GlossaryScope>
        <header className="top">
          <div>
            <h1>
              {back && (
                <>
                  <Link href={back.href} className="top-back">
                    {back.label}
                  </Link>
                  <span className="top-sep" aria-hidden="true">
                    /
                  </span>
                </>
              )}
              {title}
            </h1>
            <p className="sub">
              <G>{subtitle}</G>
            </p>
          </div>
          <div className="top-side">
            {assumptions && <InfoTip label="Assumptions" text={NOTES_TIP} wide />}
            <div className={`badge ${health.tone}`}>
              <i />
              {health.label}
            </div>
          </div>
          {facts && <div className="top-facts">{facts}</div>}
        </header>
      </GlossaryScope>
      {children}
    </main>
  );
}

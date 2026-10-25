"use client";

import Link from "next/link";
import { G } from "@/components/glossary/GlossaryText";
import { upcomingDates } from "@/lib/planner/keyDates";
import Card from "@/components/ui/Card";

/** The next three money dates; the full list is on Recommendations. */
export default function ComingUp() {
  const next = upcomingDates().slice(0, 4);
  if (!next.length) return null;
  return (
    <Card className="ov-split" title="Coming up">
      {next.map((k) => (
        <div key={k.date} className="ev">
          <b>{k.label}</b>
          <span>
            <G>{k.what}</G>
          </span>
          <em>{k.days === 0 ? "today" : `in ${k.days} days`}</em>
        </div>
      ))}
      <Link href="/recommendations" className="ov-more">
        All dates →
      </Link>
    </Card>
  );
}

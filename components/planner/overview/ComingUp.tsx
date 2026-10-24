"use client";

import Link from "next/link";
import { G } from "@/components/glossary/GlossaryText";
import { KEY_DATES } from "@/components/planner/plan/KeyDatesCard";
import Card from "@/components/ui/Card";

const DAY = 864e5;

/** The next three money dates; the full list is on Recommendations. */
export default function ComingUp() {
  const now = Date.now();
  const next = KEY_DATES.map((k) => ({ ...k, days: Math.ceil((new Date(`${k.date}T23:59:59`).getTime() - now) / DAY) }))
    .filter((k) => k.days >= 0)
    .slice(0, 3);
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

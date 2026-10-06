"use client";

import { G } from "@/components/glossary/GlossaryText";
import Card from "@/components/ui/Card";

const KEY_DATES: { date: string; label: string; what: string }[] = [
  { date: "2026-12-31", label: "Dec 31, 2026", what: "Last day to contribute to an FHSA and claim it on your 2026 return (open the account first)" },
  { date: "2027-01-31", label: "Jan 2027", what: "Air Canada's yearly 15,000 Aeroplan points are granted" },
  { date: "2027-02-17", label: "Feb 17, 2027", what: "Probation ends. First $2,500 signing payment (gross), if still employed" },
  { date: "2027-02-28", label: "End Feb 2027", what: "T4 and RL-1 tax slips arrive. Then you can file" },
  { date: "2027-03-01", label: "Mar 1, 2027", what: "RRSP deadline for your 2026 return. Travel privileges start (28 weeks)" },
  { date: "2027-04-30", label: "Apr 30, 2027", what: "File your federal and Quebec returns" },
  { date: "2027-05-31", label: "May 2027", what: "Expected refund of about $1,400 (estimate)" },
  { date: "2027-08-17", label: "Aug 17, 2027", what: "Second $2,500 signing payment (gross)" },
];

const DAY = 864e5;

function countdown(days: number): string {
  if (days < 0) return "passed";
  return days === 0 ? "today" : `in ${days} days`;
}

export default function KeyDatesCard() {
  const now = Date.now();
  return (
    <Card title="Key dates" description="Money and tax dates from your offer letter and Canadian tax rules.">
      {KEY_DATES.map((k) => {
        const days = Math.ceil((new Date(`${k.date}T23:59:59`).getTime() - now) / DAY);
        return (
          <div key={k.date} className={`ev${days < 0 ? " past" : ""}`}>
            <b>{k.label}</b>
            <span>
              <G>{k.what}</G>
            </span>
            <em>{countdown(days)}</em>
          </div>
        );
      })}
    </Card>
  );
}

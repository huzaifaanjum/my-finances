"use client";

import { SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { GroupHeader, Legend } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { PENSION_MONTHLY } from "@/lib/planner/config";
import { RETIREMENT_MONTH } from "@/lib/planner/finance";
import type { Retirement } from "@/lib/planner/retirement";
import BreakdownRow, { EffortTag } from "./BreakdownRow";

/** How the pension pot and the retirement income add up, and which parts need you to act. */
export default function BreakdownCard({ r, net, fundReturn }: { r: Retirement; net: number; fundReturn: number }) {
  const { pot, real, mine, match, growth } = r.pension;
  const nt = net || 1;
  const effortless = r.sources.filter((s) => s.effort !== "act").reduce((t, s) => t + s.today, 0);
  const share = effortless / nt;

  return (
    <Card
      title="How we get to the total"
      description="Your pension pot at 65 is three pieces added together. Two arrive through payroll with no effort, and the biggest one is growth on that money."
    >
      <div className="bkey">
        <EffortTag effort="auto" /> happens through payroll, nothing to do <EffortTag effort="org" /> investment returns, no effort needed{" "}
        <EffortTag effort="act" /> only happens if you do it
      </div>

      <GroupHeader label="Air Canada pension pot at 65" />
      <SegmentBar
        variant="thick"
        style={{ margin: "12px 0 4px" }}
        segments={[
          { width: (mine / pot) * 100, color: "var(--scotia)" },
          { width: (match / pot) * 100, color: "var(--mix)" },
          { width: (growth / pot) * 100, color: "var(--std)" },
        ]}
      />
      <Legend
        style={{ margin: "6px 0 8px" }}
        items={[
          { label: `You ${percent(mine / pot)}`, color: "var(--scotia)" },
          { label: `Air Canada ${percent(match / pot)}`, color: "var(--mix)" },
          { label: `Growth ${percent(growth / pot)}`, color: "var(--std)" },
        ]}
      />
      <BreakdownRow
        op=""
        name="Your contributions"
        value={money(mine)}
        effort="auto"
        why={`6% of every paycheque goes in before you see it, ${money(PENSION_MONTHLY / 2)} a month today and rising with your salary. Nothing to do; just do not opt out or lower it.`}
      />
      <BreakdownRow
        op="+"
        name="Air Canada's match"
        value={money(match)}
        effort="auto"
        why="Air Canada adds the same 6% as long as you contribute 6% and stay employed. Check the vesting rules: leaving very early can forfeit part of the match."
      />
      <BreakdownRow
        op="+"
        name="Investment growth"
        value={money(growth)}
        effort="org"
        why={`The fund earns about ${fundReturn}% a year on everything above, and the earnings compound for ${Math.round(RETIREMENT_MONTH / 12)} years. Your only job is to pick a growth fund once, not leave it in cash.`}
      />
      <BreakdownRow
        op="="
        total
        name="Total pension at 65"
        value={money(pot)}
        why={`${money(real)} in today's dollars. Everything here happens without extra effort beyond picking the fund.`}
      />

      <GroupHeader label="Monthly income at 65, today's dollars" style={{ marginTop: 28 }} />
      {r.sources.map((s, i) => (
        <BreakdownRow key={s.name} op={i ? "+" : ""} name={s.name} value={money(s.today)} effort={s.effort} why={s.why} />
      ))}
      <BreakdownRow op="=" total name="Total a month" value={money(r.total)} why={`${money(r.totalNominal)} in 2062 dollars.`} />
      <div className={`isum ${share >= 0.7 ? "good" : share >= 0.5 ? "ok" : "bad"}`}>
        If you do nothing extra: <b>{money(effortless)}</b> a month, <b>{percent(share)}</b> of today&apos;s take-home. Investing on your own adds{" "}
        <b>{money(r.total - effortless)}</b> on top.
      </div>
    </Card>
  );
}

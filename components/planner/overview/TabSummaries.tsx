"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useVault } from "@/components/payslips/PayslipVault";
import { usePensionStart } from "@/components/payslips/usePensionStart";
import { summarize } from "@/components/planner/goals/GoalsView";
import { monthlyStats } from "@/components/planner/monthly/stats";
import { usePlan } from "@/components/providers/PlannerProvider";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { money } from "@/lib/format";
import { COMP } from "@/lib/offer";
import { periodLabel } from "@/lib/payslips/analysis";
import { monthLabel } from "@/lib/planner/calendar";
import { investmentPlan } from "@/lib/planner/finance";
import { GOALS } from "@/lib/planner/goals";
import { healthTiles } from "@/lib/planner/insights";
import { retirement } from "@/lib/planner/retirement";
import { checklist, isDone, recContext } from "@/lib/recommendations";

interface Tile {
  href: string;
  tab: string;
  value: string;
  note: string;
  tone?: "pos" | "neg" | "warn";
}

/** One headline from every other tab, each linking to it. */
export default function TabSummaries() {
  const plan = usePlan();
  const { read } = useKnowledgeProgress();
  const vault = useVault();
  const steps = useMemo(() => checklist(recContext(plan)), [plan]);

  const health = healthTiles(plan);
  const acts = health.filter((t) => t.level === "act");
  const watch = health.filter((t) => t.level === "watch");
  const goals = GOALS.map((g) => ({ g, s: summarize(g.id, plan) }));
  const onTrack = goals.filter((x) => x.s.onTrack).length;
  const hit = investmentPlan(plan).sim.hit;
  const r = retirement(plan, usePensionStart());
  const done = steps.filter((s) => isDone(s, read)).length;
  const month = monthlyStats(plan.rows);
  const slips = vault.payslips.filter((p) => !p.excluded);
  const latest = slips[slips.length - 1];

  const tiles: Tile[] = [
    {
      href: "/insights",
      tab: "Insights",
      value: acts.length ? `${acts.length} to act on` : watch.length ? `${watch.length} to watch` : "All good",
      note: acts.length ? acts.map((t) => t.title).join(", ") : `${health.length - watch.length} of ${health.length} checks are fine`,
      tone: acts.length ? "neg" : watch.length ? "warn" : "pos",
    },
    {
      href: "/recommendations",
      tab: "Action plan",
      value: `${done} of ${steps.length} done`,
      note: "on your checklist",
    },
    {
      href: "/goals",
      tab: "Home & car",
      value: `${onTrack} of ${goals.length} on track`,
      note: goals.map((x) => `${x.g.name}: ${x.s.facts.find(([k]) => k === "Savings ready")?.[1] ?? "—"}`).join(" · "),
      tone: onTrack === goals.length ? "pos" : "warn",
    },
    {
      href: "/millionaire",
      tab: "Investing",
      value: hit === null ? "50+ years" : monthLabel(hit),
      note: `to reach ${money(plan.state.numbers.target)} investing`,
    },
    {
      href: "/pension",
      tab: "Retirement",
      value: money(r.pension.pot),
      note: `DC pension at 65 · pays about ${money(r.sources[0].today)} a month in today's dollars`,
      tone: "pos",
    },
    {
      href: "/offer",
      tab: "Job offer",
      value: money(COMP.yearOne),
      note: "total pay in year one, at target bonus",
    },
    {
      href: "/payslips",
      tab: "Payslips",
      value: latest ? money(latest.data.current.net, 2) : vault.status === "unlocked" ? "None yet" : "Locked",
      note: latest ? `deposited for ${periodLabel(latest.data, true)}` : vault.status === "unlocked" ? "upload your first payslip" : "unlock to see your latest deposit",
    },
    {
      href: "/monthly",
      tab: "Cash flow",
      value: `${money(month.average)} a month`,
      note: `average saved, bonuses included · best ${money(month.best.deposit)} in ${month.best.label}`,
      tone: month.average < 0 ? "neg" : undefined,
    },
  ];

  return (
    <section>
      <h2 className="ih">Across your tabs</h2>
      <div className="ov-tiles">
        {tiles.map((t) => (
          <Link key={t.tab} href={t.href} className={`ov-tile ${t.tone ?? ""}`}>
            <span>{t.tab}</span>
            <b>{t.value}</b>
            <em>{t.note}</em>
          </Link>
        ))}
      </div>
    </section>
  );
}

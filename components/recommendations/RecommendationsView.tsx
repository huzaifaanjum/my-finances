"use client";

import { useMemo } from "react";
import { usePlan } from "@/components/providers/PlannerProvider";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { checklist, recContext } from "@/lib/recommendations";
import SeeAlso from "@/components/ui/SeeAlso";
import Checklist from "./Checklist";
import DatesTimeline from "./DatesTimeline";
import DoNext from "./DoNext";
import MoneyLadder from "./MoneyLadder";
import RecSummary from "./RecSummary";

/** Every recommendation in the app, in one place. */
export default function RecommendationsView() {
  const plan = usePlan();
  const { read, loading, error, toggle } = useKnowledgeProgress();
  const ctx = recContext(plan);
  const steps = useMemo(() => checklist(ctx), [ctx.cardDebt, ctx.rent, ctx.net, ctx.safetyNet, ctx.subs, ctx.year]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rec">
      <RecSummary steps={steps} read={read} loading={loading} />
      <DoNext />
      <MoneyLadder />
      <DatesTimeline />
      <SeeAlso href="/benefits" label="Benefits">
        Using your Air Canada benefits (pension match, health and dental, spending account, travel and perks) has its own checklist
      </SeeAlso>
      <Checklist steps={steps} read={read} toggle={toggle} error={error} />
    </div>
  );
}

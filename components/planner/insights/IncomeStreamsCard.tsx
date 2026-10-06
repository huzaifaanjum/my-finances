"use client";

import { G } from "@/components/glossary/GlossaryText";
import { usePlan } from "@/components/providers/PlannerProvider";
import { PlannerSlider } from "@/components/planner/shared/controls";
import { SegmentBar, type Segment } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { GroupHeader, KeyValue, Legend, Note } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { INCOME_STREAMS, SLIDERS, STREAM_COLORS } from "@/lib/planner/config";
import { automaticIncome, incomeTarget } from "@/lib/planner/insights";

const NOW_COLOR = "#52525b";

/** Sliders for extra income, stacked against the income target. */
export default function IncomeStreamsCard() {
  const plan = usePlan();
  const { net, rent, state } = plan;
  const { target } = incomeTarget(plan);
  const auto = automaticIncome(plan);

  const parts = [
    ...INCOME_STREAMS.map((s) => ({ title: SLIDERS[s.key].label, amount: state.numbers[s.key], color: STREAM_COLORS[s.kind] })),
    ...auto.map((a) => ({ title: a.name, amount: a.monthly, color: "var(--std)" })),
  ].filter((p) => p.amount > 0);
  const total = net + parts.reduce((t, p) => t + p.amount, 0);
  const max = Math.max(target, total) * 1.02;
  const reach = target ? total / target : 1;
  const tone = reach >= 1 ? "good" : reach >= 0.9 ? "ok" : "bad";
  const segments: Segment[] = [
    { width: (net / max) * 100, color: NOW_COLOR, title: "Take-home now" },
    ...parts.map((p) => ({ width: (p.amount / max) * 100, color: p.color, title: p.title })),
  ];

  return (
    <Card title="Ways to close the gap" description="Move a slider to add a stream. All amounts are monthly, after tax.">
      <SegmentBar variant="thick" segments={segments} marker={(target / max) * 100} />
      <Legend
        style={{ margin: "8px 0 0" }}
        items={[
          { label: "Take-home now", color: NOW_COLOR },
          { label: "Work", color: STREAM_COLORS.work },
          { label: "Side income", color: STREAM_COLORS.side },
          { label: "Housing", color: STREAM_COLORS.housing },
          { label: "Automatic", color: "var(--std)" },
          { label: "Target", kind: "tick" },
        ]}
      />
      <div className={`isum ${tone}`}>
        <b>{money(total)}</b> a month with these streams, <b>{percent(reach)}</b> of the {money(target)} target.{" "}
        {reach >= 1 ? "Rent, needs and savings would all fit the guidelines." : `Still ${money(target - total)} a month to go.`}
      </div>

      {INCOME_STREAMS.map((s) => {
        const hint = s.key === "rs_room" ? (rent ? `Splitting rent with one roommate frees about ${money(rent / 2)} a month.` : "") : s.hint;
        return (
          <div key={s.key}>
            <PlannerSlider
              k={s.key}
              label={
                <span>
                  <i className="sw" style={{ background: STREAM_COLORS[s.kind] }} />
                  <G>{SLIDERS[s.key].label}</G>
                </span>
              }
            />
            <Note className="rsn">{hint}</Note>
          </div>
        );
      })}

      <GroupHeader label="Already counted, no extra work" value={money(auto.reduce((t, a) => t + a.monthly, 0))} style={{ marginTop: 20 }} />
      {auto.map((a) => (
        <KeyValue
          key={a.name}
          label={
            <>
              <i className="sw" style={{ background: "var(--std)" }} />
              {a.name} <em>· {a.detail}</em>
            </>
          }
          value={money(a.monthly)}
        />
      ))}
      <Note style={{ marginTop: 10 }}>
        Side income is taxed at your marginal rate, roughly 37% in Quebec at $95,000, so the slider amounts are after that. Check your employment contract
        before taking outside work.
      </Note>
    </Card>
  );
}

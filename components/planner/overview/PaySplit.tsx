"use client";

import Link from "next/link";
import { usePlan } from "@/components/providers/PlannerProvider";
import { SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { LegendRow } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { COLOR } from "@/lib/colors";

/** Where each month's take-home goes, against the 50/30/20 guideline. */
export default function PaySplit() {
  const { net, needs, wants, left, exp } = usePlan();
  const base = left < 0 ? exp.total : net || 1;
  const parts = [
    { label: "Needs", value: needs, color: COLOR.needs, guide: "50%" },
    { label: "Wants", value: wants, color: COLOR.wants, guide: "30%" },
    { label: "Savings", value: Math.max(0, left), color: COLOR.keep, guide: "20%" },
  ];
  return (
    <Card className="ov-split" title="Each month" description={`${money(net)} take-home, ${money(exp.total)} of expenses.`}>
      <SegmentBar variant="thick" segments={parts.map((p) => ({ width: (p.value / base) * 100, color: p.color, title: p.label }))} />
      {parts.map((p) => (
        <LegendRow
          key={p.label}
          label={
            <>
              {p.label} <em>· guideline {p.guide}</em>
            </>
          }
          value={`${money(p.value)} · ${percent(p.value / (net || 1))}`}
          color={p.color}
          style={{ margin: "10px 0 0" }}
        />
      ))}
      <Link href="/insights" className="ov-more">
        Health check and guidelines →
      </Link>
    </Card>
  );
}

"use client";

import { G } from "@/components/glossary/GlossaryText";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { money, percent } from "@/lib/format";

interface Part {
  name: "Needs" | "Wants" | "Savings";
  amount: number;
  color: string;
  guideline: number;
  covers: string;
}

/** Splits 100 squares in proportion, giving leftovers to the largest remainders. */
function squareCounts(values: number[], base: number): number[] {
  const raw = values.map((v) => (v / base) * 100);
  const counts = raw.map(Math.floor);
  let rest = 100 - counts.reduce((t, c) => t + c, 0);
  raw
    .map((r, i) => [r - Math.floor(r), i] as const)
    .sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => {
      if (rest > 0) {
        counts[i]++;
        rest--;
      }
    });
  return counts;
}

/** Take-home pay as 100 squares, against the 50/30/20 guideline. */
export default function WaffleCard() {
  const { net, needs, wants, left, exp } = usePlan();
  const over = left < 0;
  const nt = net || 1;
  const parts: Part[] = [
    { name: "Needs", amount: needs, color: "var(--scotia)", guideline: 0.5, covers: "rent, bills, groceries, transit, health" },
    { name: "Wants", amount: wants, color: "var(--promo)", guideline: 0.3, covers: "subscriptions, eating out, shopping, other" },
    { name: "Savings", amount: Math.max(0, left), color: "var(--std)", guideline: 0.2, covers: "what is left over" },
  ];
  const counts = squareCounts(parts.map((p) => p.amount), over ? exp.total : nt);
  const description = over
    ? "You spend more than you earn, so each square here is 1% of your spending."
    : `Each square is 1% of your ${money(net)} take-home, about ${money(net / 100)}. The 50/30/20 guideline is 50 needs, 30 wants, 20 savings.`;

  return (
    <Card title="Your pay as 100 squares" description={description}>
      <div className="wafwrap">
        <div className="waf" role="img" aria-label={parts.map((p, i) => `${p.name} ${counts[i]}%`).join(", ")}>
          {parts.flatMap((p, i) => Array.from({ length: counts[i] }, (_, k) => <i key={`${p.name}${k}`} style={{ background: p.color }} />))}
        </div>
        <div className="wafleg">
          {parts.map((p) => {
            const share = p.amount / nt;
            const diff = Math.round((share - p.guideline) * 100);
            const good = p.name === "Savings" ? diff >= 0 : diff <= 0;
            return (
              <div key={p.name}>
                <div className="wlh">
                  <span>
                    <i style={{ background: p.color }} />
                    {p.name}
                  </span>
                  <b>{percent(share)}</b>
                </div>
                <div className="wls">
                  {money(p.amount)} · {p.covers}
                </div>
                <div className={`wlv ${good ? "ok" : "bad"}`}>
                  <G>
                    {diff === 0
                      ? `Right on the ${percent(p.guideline)} guideline`
                      : `${Math.abs(diff)} points ${diff > 0 ? "above" : "below"} the ${percent(p.guideline)} guideline`}
                  </G>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

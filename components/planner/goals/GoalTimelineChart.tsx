"use client";

import { useState } from "react";
import { Crosshair, fiveTicks, linePath, plotHeight, plotWidth, viewBoxX, XLabel, YGrid, type Frame } from "@/components/charts/axes";
import { Legend } from "@/components/ui/text";
import { compactMoney, money } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";

const FRAME: Frame = { width: 760, height: 320, left: 56, right: 14, top: 14, bottom: 28 };

interface Props {
  /** savings by plan month if you never buy */
  without: number[];
  /** savings by plan month after the upfront cash and each loan payment */
  withLoan: number[];
  /** cash your savings need to reach before buying */
  target: number;
  targetLabel: string;
  /** plan month you buy; the loan starts here */
  buy: number;
  /** loan balance by month after buying, starting at the amount borrowed */
  balances: number[];
  /** the same loan with extra payments, when there are any */
  faster?: number[];
}

const at = (a: number[], i: number) => a[Math.max(0, Math.min(i, a.length - 1))];

/** One timeline: savings with and without the purchase, and the loan being paid down from the month you buy. */
export default function GoalTimelineChart({ without, withLoan, target, targetLabel, buy, balances, faster }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const n = without.length - 1;

  const values = [target, ...without, ...withLoan, ...balances];
  let max = Math.max(...values) * 1.05;
  const min = Math.min(0, ...withLoan);
  if (max <= min) max = min + 1;

  const pw = plotWidth(FRAME);
  const ph = plotHeight(FRAME);
  const X = (m: number) => FRAME.left + (m / n) * pw;
  const Y = (v: number) => FRAME.top + ph - ((v - min) / (max - min)) * ph;

  const yearStep = Math.max(1, Math.ceil(n / 12 / 7));
  const ticks: number[] = [];
  for (let m = 0; m <= n; m += 12 * yearStep) ticks.push(m);

  const series = (a: number[], from = 0) => linePath(a.slice(from).map((v, i) => [X(from + i), Y(v)]));
  const loan = (b: number[]) => linePath(b.slice(0, n - buy + 1).map((v, k) => [X(buy + k), Y(v)]));

  const m = hover ?? buy;
  const owed = m < buy ? 0 : at(faster ?? balances, m - buy);

  return (
    <div>
      <div className="pj-read">
        <span>{m === 0 ? "Now" : monthLabel(m)}</span>
        <span>Savings</span>
        <b>{money(at(withLoan, m))}</b>
        {m >= buy && <em>vs {money(at(without, m))} without buying</em>}
        {owed > 0 && <em>· still owed {money(owed)}</em>}
      </div>
      <svg
        viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
        role="img"
        aria-label="Savings with and without the purchase, and the loan balance"
        onPointerMove={(e) => {
          const x = viewBoxX(e, FRAME.width);
          setHover(Math.max(0, Math.min(n, Math.round(((x - FRAME.left) / pw) * n))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <YGrid frame={FRAME} values={fiveTicks(min, max)} y={Y} format={compactMoney} />
        {min < 0 && <line x1={FRAME.left} x2={FRAME.width - FRAME.right} y1={Y(0)} y2={Y(0)} stroke="#f87171" strokeDasharray="4 4" />}
        {ticks.map((t) => (
          <XLabel key={t} x={X(t)} frame={FRAME}>
            {t === 0 ? "Now" : `+${t / 12} yr`}
          </XLabel>
        ))}
        <line x1={FRAME.left} x2={X(buy)} y1={Y(target)} y2={Y(target)} stroke="#fafafa" strokeDasharray="5 4" opacity="0.7" />
        <line x1={X(buy)} x2={X(buy)} y1={FRAME.top} y2={FRAME.top + ph} stroke="var(--promo)" strokeDasharray="3 3" />
        <path d={loan(balances)} fill="none" stroke="#fafafa" strokeWidth="1.75" strokeLinejoin="round" opacity="0.85" />
        {faster && <path d={loan(faster)} fill="none" stroke="var(--scotia)" strokeWidth="2" strokeLinejoin="round" />}
        <path d={series(without, buy)} fill="none" stroke="var(--std)" strokeWidth="1.75" strokeDasharray="5 4" opacity="0.6" />
        <path d={series(withLoan)} fill="none" stroke="var(--std)" strokeWidth="2.5" strokeLinejoin="round" />
        {hover !== null && <Crosshair x={X(m)} y={Y(at(withLoan, m))} top={FRAME.top} bottom={FRAME.top + ph} />}
      </svg>
      <Legend
        items={[
          { label: "Savings with this purchase", color: "var(--std)" },
          { label: "Savings if you don't buy", kind: "dash", color: "var(--std)" },
          { label: targetLabel, kind: "dash" },
          { label: "You buy", kind: "tick", color: "var(--promo)" },
          { label: "Loan balance", color: "var(--text)" },
          ...(faster ? [{ label: "Loan with your extra payment", color: "var(--scotia)" }] : []),
        ]}
      />
    </div>
  );
}

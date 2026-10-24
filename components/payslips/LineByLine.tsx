"use client";

import Link from "next/link";
import { useState } from "react";
import Card from "@/components/ui/Card";
import { Legend } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { BUCKET_ORDER, BUCKETS, mergedDeductions, periodLabel, type Bucket } from "@/lib/payslips/analysis";
import type { PayslipData } from "@/lib/payslips/types";

interface Props {
  /** payslips picked with Latest / Average / All together */
  chosen: PayslipData[];
  /** divide by this for the average */
  div: number;
  latest: PayslipData;
  /** "your October 2026 payslip", "the average of 2 payslips", ... */
  scope: string;
}

interface Row {
  label: string;
  value: number;
  /** what the latest payslip added, shown as the solid part of a year-to-date bar */
  recent: number;
  retro?: boolean;
}

/** Share of gross; small but real amounts read "<1%" instead of "0%". */
const share = (v: number, of: number) => (v > 0 && v / (of || 1) < 0.005 ? "<1%" : percent(v / (of || 1)));

/** Bar for one row. Widths are shares of the largest row (take-home), so every bar in the card shares one scale. */
function RowBar({ row, color, max, cumulative }: { row: Row; color: string; max: number; cumulative: boolean }) {
  const w = (v: number) => `${Math.max(0, (v / (max || 1)) * 100)}%`;
  const earlier = cumulative ? row.value - row.recent : 0;
  return (
    <span className="ps-lbar" aria-hidden="true">
      {cumulative && earlier > 0.005 && <i style={{ width: w(earlier), background: color, opacity: 0.4 }} />}
      <i style={{ width: w(cumulative ? row.recent : row.value), background: color }} />
    </span>
  );
}

/** Every deduction grouped by where it goes, for one period or added up over the year. */
export default function LineByLine({ chosen, div, latest, scope }: Props) {
  const [cumulative, setCumulative] = useState(false);

  const k = cumulative ? "ytd" : "current";
  const source = cumulative ? [latest] : chosen;
  const d = cumulative ? 1 : div;
  const lines = mergedDeductions(source, k);
  const gross = source.reduce((t, s) => t + s[k].gross, 0) / d;
  const takeHome: Row = {
    label: "Take-home",
    value: source.reduce((t, s) => t + s[k].net, 0) / d,
    recent: latest.current.net,
  };
  const groups = BUCKET_ORDER.filter((b) => b !== "takeHome")
    .map((b: Bucket) => {
      const ls = lines.filter((l) => l.bucket === b);
      const rows: Row[] = ls.map((l) => ({ label: l.label, value: l.total / d, recent: l.latest, retro: l.retro }));
      return { b, rows, value: rows.reduce((t, r) => t + r.value, 0), recent: rows.reduce((t, r) => t + r.recent, 0) };
    })
    .filter((g) => g.rows.length);
  const max = Math.max(takeHome.value, ...groups.map((g) => g.value));
  const year = latest.periodEnd.slice(0, 4);

  return (
    <Card
      header={
        <div className="ps-head">
          <div>
            <h3>Line by line</h3>
            <p className="d">
              {cumulative
                ? `Added up from January 1 to ${periodLabel(latest, true)}, from the year-to-date column on that payslip. ${money(gross)} of gross pay so far in ${year}.`
                : `Every deduction on ${scope}, grouped by where it goes.`}
            </p>
          </div>
          <label className="ps-switch">
            <input type="checkbox" role="switch" checked={cumulative} onChange={(e) => setCumulative(e.target.checked)} />
            <span aria-hidden="true" />
            Cumulative
          </label>
        </div>
      }
    >
      <div className="off-line off-head">
        <span />
        <span>{cumulative ? "Year to date" : "Amount"}</span>
        <span>Of gross</span>
      </div>
      {groups.map((g) => (
        <div key={g.b} className="off-grp">
          <div className="off-line off-gt">
            <span>
              <i style={{ background: BUCKETS[g.b].color }} />
              {BUCKETS[g.b].label}
            </span>
            <span>{money(g.value, 2)}</span>
            <span>{share(g.value, gross)}</span>
          </div>
          <RowBar row={{ label: g.b, value: g.value, recent: g.recent }} color={BUCKETS[g.b].color} max={max} cumulative={cumulative} />
          {g.b === "insurance" && (
            <Link href="/insurance" className="ps-more">
              What each insurance line covers →
            </Link>
          )}
          {g.b === "pension" && (
            <Link href="/pension" className="ps-more">
              Where your pension is heading →
            </Link>
          )}
          {g.rows.map((r) => (
            <div key={r.label} className="off-line ps-lrowbar">
              <div>
                <span>{r.label}</span>
                {r.retro && <em>one-time catch-up for an earlier month</em>}
                <RowBar row={r} color={BUCKETS[g.b].color} max={max} cumulative={cumulative} />
              </div>
              <span>{money(r.value, 2)}</span>
              <span>{share(r.value, gross)}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="off-line off-gt off-total">
        <span>Take-home</span>
        <span>{money(takeHome.value, 2)}</span>
        <span>{share(takeHome.value, gross)}</span>
      </div>
      <RowBar row={takeHome} color={BUCKETS.takeHome.color} max={max} cumulative={cumulative} />
      {cumulative && (
        <Legend
          style={{ marginTop: 14 }}
          items={[
            { label: `Earlier in ${year}`, color: "color-mix(in srgb, var(--mute) 45%, transparent)" },
            { label: `Added by ${periodLabel(latest)}`, color: "var(--mute)" },
          ]}
        />
      )}
    </Card>
  );
}

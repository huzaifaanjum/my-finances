"use client";

import { useRef } from "react";
import { money, percent } from "@/lib/format";
import { BUCKET_ORDER, BUCKETS, employerBenefits, employerPension, periodLabel, retroDeductions, shortDate, slipBuckets, usualNet, type Bucket } from "@/lib/payslips/analysis";
import type { Payslip, PayslipData } from "@/lib/payslips/types";

export type Mode = "latest" | "average" | "total";

const MODES: { id: Mode; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "average", label: "Average" },
  { id: "total", label: "All together" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Pay lands on the last weekday of the month; the next one after `iso`. */
function nextPayday(iso: string): Date {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m + 1, 0);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d;
}

function addBuckets(slips: PayslipData[]): Record<Bucket, number> {
  const out = { takeHome: 0, incomeTax: 0, govPlans: 0, pension: 0, insurance: 0, other: 0 };
  for (const d of slips) {
    const b = slipBuckets(d);
    for (const k of BUCKET_ORDER) out[k] += b[k];
  }
  return out;
}

interface Props {
  used: Payslip[];
  all: Payslip[];
  mode: Mode;
  onMode: (m: Mode) => void;
  onView: (id: string) => void;
  onFiles: (files: File[]) => void;
  busy: boolean;
}

/** The latest deposit, three facts worth knowing, and where every $100 of gross pay goes. */
export default function PayHero({ used, all, mode, onMode, onView, onFiles, busy }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const slips = used.map((p) => p.data);
  const latest = slips[slips.length - 1];
  const c = latest.current;
  const retro = retroDeductions(latest);
  const usual = usualNet(latest);
  const employer = employerPension(latest) + employerBenefits(latest);
  const next = nextPayday(latest.payDate || latest.periodEnd);
  const left = all.length - used.length;

  const chosen = mode === "latest" ? [latest] : slips;
  const div = mode === "average" ? slips.length : 1;
  const buckets = addBuckets(chosen);
  const gross = chosen.reduce((t, d) => t + d.current.gross, 0) / div;
  const shown = BUCKET_ORDER.filter((k) => Math.abs(buckets[k]) >= 0.005);
  const scope = mode === "latest" ? periodLabel(latest, true) : mode === "average" ? `average of ${slips.length} payslips` : `${slips.length} payslips together`;

  return (
    <section className="ph2">
      <div className="ph2-top">
        <div className="ph2-chips" aria-label="Payslips used on this page">
          {used.map((p, k) => (
            <button key={p.id} type="button" className={`ps-chip${k === used.length - 1 ? " last" : ""}`} onClick={() => onView(p.id)} title="Open this payslip">
              {periodLabel(p.data)}
              {k === used.length - 1 && <em>latest</em>}
            </button>
          ))}
          {left > 0 && <span className="ps-src-x">{left} left out</span>}
        </div>
        <button type="button" className="ps-btn primary" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Reading…" : "Upload payslip"}
        </button>
        <input
          ref={input}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          hidden
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            if (files.length) onFiles(files);
          }}
        />
      </div>

      <div className="ph2-main">
        <div className="ph2-lead">
          <span>
            {periodLabel(latest, true)} · paid {shortDate(latest.payDate)}
          </span>
          <b>{money(c.net, 2)}</b>
          <p>
            reached your account: <strong>{percent(c.net / (c.gross || 1))}</strong> of {money(c.gross, 2)} gross.
            {retro > 0.5 && <> A normal month is {money(usual, 2)}; this one had {money(retro, 2)} of one-time catch-ups.</>}
          </p>
        </div>
        <dl className="ph2-facts">
          <div>
            <dt>Next payday</dt>
            <dd>
              {MONTHS[next.getMonth()]} {next.getDate()}
            </dd>
            <small>about {money(usual)} if nothing changes</small>
          </div>
          <div>
            <dt>Air Canada adds</dt>
            <dd>{money(employer, 2)}</dd>
            <small>a month on top of gross: pension match, health, dental</small>
          </div>
          <div>
            <dt>So far this year</dt>
            <dd>{money(latest.ytd.net)}</dd>
            <small>take-home, of {money(latest.ytd.gross)} gross</small>
          </div>
        </dl>
      </div>

      <div className="ph2-split">
        <div className="ph2-sh">
          <h2>Where each $100 goes</h2>
          <span>{scope}</span>
          {slips.length > 1 && (
            <div className="ps-seg sm" role="group" aria-label="Which payslips">
              {MODES.map((m) => (
                <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => onMode(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="stackbar" role="img" aria-label={shown.map((k) => `${BUCKETS[k].label} ${percent(buckets[k] / div / (gross || 1))}`).join(", ")}>
          {shown.map((k) => (
            <i key={k} style={{ width: `${(buckets[k] / div / (gross || 1)) * 100}%`, background: BUCKETS[k].color }} title={BUCKETS[k].label} />
          ))}
        </div>
        <ul className="ph2-rows">
          {shown.map((k) => {
            const v = buckets[k] / div;
            return (
              <li key={k} className={k === "takeHome" ? "keep" : undefined}>
                <i style={{ background: BUCKETS[k].color }} />
                <span>
                  {BUCKETS[k].label}
                  <small>{BUCKETS[k].who}</small>
                </span>
                <b>{money((v / (gross || 1)) * 100, 2)}</b>
                <em>
                  {money(v, 2)}
                  {mode !== "total" && <small>{money(v * 12)} a year</small>}
                </em>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

"use client";

import Card from "@/components/ui/Card";
import { KeyValue, Note } from "@/components/ui/text";
import { deltaMoney, money, percent } from "@/lib/format";
import {
  BUCKET_ORDER,
  BUCKETS,
  employerPension,
  friendly,
  isRetro,
  netDrivers,
  pensionLine,
  periodLabel,
  slipBuckets,
} from "@/lib/payslips/analysis";
import type { Payslip } from "@/lib/payslips/types";
import Link from "next/link";
import { LSA_MONTHLY } from "@/lib/benefits";
import LineByLine from "./LineByLine";
import type { Mode } from "./PayHero";


const TAX_NOTE: Record<string, string> = {
  N: "not taxable",
  P: "taxable in Quebec",
  F: "taxable federally",
  FP: "taxable federally and in Quebec",
};

/** Line by line, what Air Canada pays on top, the year so far, and how payslips compare. The summary is in PayHero. */
export default function PayBreakdown({ used, mode }: { used: Payslip[]; mode: Mode }) {
  const slips = used.map((p) => p.data);
  const latest = slips[slips.length - 1];
  const chosen = mode === "latest" ? [latest] : slips;
  const div = mode === "average" ? slips.length : 1;
  const scope =
    mode === "latest" ? `your ${periodLabel(latest, true)} payslip` : mode === "average" ? `the average of ${slips.length} payslips` : `${slips.length} payslips added up`;

  const prev = slips[slips.length - 2];
  const drivers = prev ? netDrivers(prev, latest) : [];
  const netDiff = prev ? latest.current.net - prev.current.net : 0;

  return (
    <section className="ps-sec">
      <div className="irow">
        <LineByLine chosen={chosen} div={div} latest={latest} scope={scope} />

        <div className="stack">
          <Card title="Paid by Air Canada on top" description={`On ${periodLabel(latest, true)}'s payslip. Not part of gross pay, but part of what you earn.`}>
            {latest.employerPaid
              .filter((l) => l.current || !isRetro(l))
              .map((l) => (
                <KeyValue
                  key={l.label}
                  label={
                    <>
                      {friendly(l.label.replace(/ Mgmt &$/, ""))} {l.taxable && <em>· {TAX_NOTE[l.taxable]}</em>}
                    </>
                  }
                  value={money(l.current, 2)}
                />
              ))}
            <KeyValue
              label={
                <>
                  Lifestyle Spending Account <em>· not on payslips</em>
                </>
              }
              value={money(LSA_MONTHLY, 2)}
            />
            <KeyValue label="Total this month" value={money(latest.employerPaid.reduce((t, l) => t + l.current, 0) + LSA_MONTHLY, 2)} total />
            <KeyValue
              label={<em>Gross plus employer-paid</em>}
              value={money(latest.current.gross + latest.employerPaid.reduce((t, l) => t + l.current, 0) + LSA_MONTHLY, 2)}
            />
            <Link href="/insurance" className="ps-more">
              What the health, dental and spending account cover →
            </Link>
          </Card>

          <Card title="So far this year" description={`Year-to-date column on ${periodLabel(latest, true)}'s payslip.`}>
            <KeyValue label="Gross pay" value={money(latest.ytd.gross, 2)} />
            {latest.taxes.map((l) => (
              <KeyValue key={l.label} label={friendly(l.label)} value={money(l.ytd, 2)} />
            ))}
            <KeyValue label="Into your DC pension (you + employer)" value={money(pensionLine(latest, "ytd") + employerPension(latest, "ytd"), 2)} />
            <KeyValue label="Take-home" value={money(latest.ytd.net, 2)} total />
            <KeyValue label={<em>Income tax and plans as a share of gross</em>} value={percent(latest.ytd.taxes / (latest.ytd.gross || 1))} />
          </Card>
        </div>
      </div>

      {prev && (
        <div className="irow">
          <Card title="Payslip by payslip" description="Each payslip side by side. The last column is the change from the one before.">
            <div className="ps-tablewrap">
              <table className="ps-table">
                <thead>
                  <tr>
                    <th />
                    {slips.map((d, k) => (
                      <th key={k}>{periodLabel(d)}</th>
                    ))}
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Gross</td>
                    {slips.map((d, k) => (
                      <td key={k}>{money(d.current.gross)}</td>
                    ))}
                    <td>{deltaOrDash(latest.current.gross - prev.current.gross)}</td>
                  </tr>
                  {BUCKET_ORDER.filter((b) => b !== "takeHome").map((b) => {
                    const vals = slips.map((d) => slipBuckets(d)[b]);
                    if (vals.every((v) => Math.abs(v) < 0.005)) return null;
                    return (
                      <tr key={b}>
                        <td>
                          <i style={{ background: BUCKETS[b].color }} />
                          {BUCKETS[b].label}
                        </td>
                        {vals.map((v, k) => (
                          <td key={k}>{money(v)}</td>
                        ))}
                        <td>{deltaOrDash(-(vals[vals.length - 1] - vals[vals.length - 2]))}</td>
                      </tr>
                    );
                  })}
                  <tr className="tt">
                    <td>Deposit</td>
                    {slips.map((d, k) => (
                      <td key={k}>{money(d.current.net)}</td>
                    ))}
                    <td>{deltaOrDash(netDiff)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Note style={{ marginTop: 8 }}>In the change column, + means more money reached your account.</Note>
          </Card>

          <Card
            title={`Why ${periodLabel(latest)} differs from ${periodLabel(prev)}`}
            description={`The deposit went ${netDiff >= 0 ? "up" : "down"} by ${money(Math.abs(netDiff), 2)}. These lines explain it.`}
          >
            {drivers.slice(0, 6).map((c) => (
              <KeyValue key={c.label} label={c.label} value={deltaMoney(c.diff)} className={c.diff > 0 ? "ps-pos" : "ps-neg"} />
            ))}
            {!drivers.length && <Note>Nothing changed between these two payslips.</Note>}
            {drivers.some((c) => /retro/i.test(c.label)) && (
              <Note style={{ marginTop: 8 }}>
                Retro lines are one-time catch-ups: insurance that started on day one but wasn&apos;t deducted until a later payslip. They don&apos;t repeat.
              </Note>
            )}
          </Card>
        </div>
      )}
    </section>
  );
}

function deltaOrDash(v: number) {
  if (Math.abs(v) < 0.5) return <span className="ps-mute">—</span>;
  return <span className={v > 0 ? "ps-pos" : "ps-neg"}>{deltaMoney(v)}</span>;
}

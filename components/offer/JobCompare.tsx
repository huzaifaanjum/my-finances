"use client";

import { COLOR } from "@/lib/colors";
import { money, percent } from "@/lib/format";
import { AIRCANADA, FLEXSPRING, yearlyTotal, type JobSide } from "@/lib/jobs";
import { bonusNet, PAY } from "@/lib/pay";

const PARTS: { key: keyof JobSide; label: string; color: string }[] = [
  { key: "salary", label: "Base salary", color: COLOR.keep },
  { key: "bonus", label: "Bonus or incentive", color: COLOR.extra },
  { key: "pension", label: "Pension match", color: COLOR.pension },
  { key: "health", label: "Health and dental", color: COLOR.insurance },
  { key: "lsa", label: "Spending account", color: COLOR.employer },
];

/** Air Canada next to your previous job: total pay, take-home, and what each one gives you beyond salary. */
export default function JobCompare() {
  const f = FLEXSPRING;
  const a = AIRCANADA;
  const fTotal = yearlyTotal(f);
  const aTotal = yearlyTotal(a);
  const more = aTotal - fTotal;
  const scale = Math.max(fTotal, aTotal);
  const netMore = a.netMonthly - f.netMonthly;
  const pensionMonthly = (PAY.monthlyBase * PAY.pensionRate * 2);

  const bar = (j: JobSide, total: number) => (
    <div className="jc-row">
      <span className="jc-who">
        <b>{j.name}</b>
        <small>{money(total)} a year</small>
      </span>
      <div className="stackbar" style={{ width: `${(total / scale) * 100}%` }} role="img" aria-label={`${j.name}: ${PARTS.map((p) => `${p.label} ${money(j[p.key] as number)}`).join(", ")}`}>
        {PARTS.filter((p) => (j[p.key] as number) > 0).map((p) => (
          <i key={p.key} style={{ width: `${((j[p.key] as number) / total) * 100}%`, background: p.color }} title={`${p.label} ${money(j[p.key] as number)}`} />
        ))}
      </div>
    </div>
  );

  const rows: [string, string, string, string?][] = [
    ["Base salary", `about ${money(Math.round(f.salary / 1000) * 1000)}`, money(a.salary), `+${money(a.salary - f.salary)}`],
    ["Before taxes in a normal month", `${money(f.grossMonthly)} (2 cheques)`, money(a.grossMonthly), `+${money(a.grossMonthly - f.grossMonthly)}`],
    ["Take-home in a normal month", `${money(f.netMonthly)} (2 cheques)`, money(a.netMonthly), `+${money(netMore)}`],
    ["Net usable income a year", `${money(f.usableYearly)} (${f.usableNote})`, `${money(a.usableYearly)} (${a.usableNote})`, `+${money(a.usableYearly - f.usableYearly)}`],
    [
      "Bonus or incentive",
      f.bonus ? money(f.bonus) : "None",
      `${money(a.bonus)} at target a full year; the first one (Mar 2027) is prorated, about ${money(PAY.firstAipNet)} after tax`,
      `+${money(a.bonus - f.bonus)}`,
    ],
    ["Pension match", "None", `${money(a.pension)} a year`, `+${money(a.pension)}`],
    ["Health and dental paid for you", "None", `${money(a.health)} a year`, `+${money(a.health)}`],
    ["Lifestyle Spending Account", "None", `${money(a.lsa)} a year`, `+${money(a.lsa)}`],
    ["Signing bonus", "None", "$5,000 in year one", "+$5,000 once"],
    ["Vacation", f.vacation, a.vacation],
    ["Insurance", f.insurance, a.insurance],
    ["Perks", f.perks, a.perks],
  ];

  return (
    <section className="jo-card jc">
      <div className="jo-card-h">
        <div>
          <h2>Air Canada vs FlexSpring</h2>
          <p>
            Your previous job at its last pay rate, from your FlexSpring payslips, next to this offer. A normal year, without the signing bonus.
          </p>
        </div>
      </div>

      <div className="jc-head">
        <div>
          <span>More a year, all in</span>
          <b className="pos">+{money(more)}</b>
          <small>
            {percent(more / fTotal)} more than FlexSpring ({money(fTotal)} → {money(aTotal)})
          </small>
        </div>
        <div>
          <span>More take-home a month</span>
          <b className="pos">+{money(netMore)}</b>
          <small>even after 6% to your pension and your insurance premiums</small>
        </div>
        <div>
          <span>Into your retirement a month</span>
          <b>{money(pensionMonthly)}</b>
          <small>you 6% + Air Canada 6%; FlexSpring had no pension</small>
        </div>
      </div>

      <div className="jc-bars">
        {bar(f, fTotal)}
        {bar(a, aTotal)}
        <div className="bf-keys">
          {PARTS.map((p) => (
            <span key={p.key}>
              <i style={{ background: p.color }} />
              {p.label}
            </span>
          ))}
        </div>
      </div>

      <div className="jc-t" role="table">
        <div className="h" role="row">
          <span role="columnheader" />
          <span role="columnheader">FlexSpring</span>
          <span role="columnheader">Air Canada</span>
          <span role="columnheader">Difference</span>
        </div>
        {rows.map(([k, fv, av, d]) => (
          <div key={k} role="row">
            <span role="rowheader">{k}</span>
            <span role="cell" className="f">
              {fv}
            </span>
            <span role="cell">{av}</span>
            <span role="cell" className={d ? "pos" : "mute"}>
              {d ?? "better"}
            </span>
          </div>
        ))}
      </div>

      <p className="jo-note">
        FlexSpring&rsquo;s salary is worked out from your net pay ({f.netNote}), using the same deductions as your FlexSpring payslips. The incentive isn&rsquo;t
        guaranteed: at 0% Air Canada is still {money(aTotal - a.bonus - fTotal)} a year ahead. Net usable income uses your first, prorated incentive; from the second year a full
        one adds about {money(bonusNet(a.bonus) - PAY.firstAipNet)} more. Net usable income is what you can actually spend: it leaves out the pension (yours
        until retirement), the health and dental Air Canada pays for, and insurance cover.
      </p>
    </section>
  );
}

"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { Legend, LegendRow, Note } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { SALARY } from "@/lib/planner/config";
import { incomeTarget, payPackage, yearsOfRaises, type PackageLine } from "@/lib/planner/insights";

const COLORS = ["var(--text)", "var(--promo)", "var(--scotia)", "var(--mix)"];
const sum = (lines: PackageLine[]) => lines.reduce((t, l) => t + l.amount, 0);
const shortName = (name: string) => name.replace(/ \(.*\)/, "");

/** The salary that would reach the income target from pay alone. */
export default function PayNeededCard() {
  const plan = usePlan();
  const t = incomeTarget(plan);
  const base = Math.ceil(t.grossFor(t.target) / 1000) * 1000;
  const now = payPackage(SALARY);
  const needed = payPackage(base);
  const totalNow = sum(now);
  const totalNeeded = sum(needed);
  const scale = totalNeeded * 1.02;
  const raise = base > SALARY;

  const row = (label: string, lines: PackageLine[], total: number) => (
    <div className="pkr">
      <LegendRow
        style={{ margin: "0 0 6px" }}
        label={label}
        value={
          <>
            <b style={{ color: "var(--text)" }}>{money(total)}</b> a year
          </>
        }
      />
      <SegmentBar
        variant="thick"
        segments={lines.map((l, i) => ({ width: (l.amount / scale) * 100, color: COLORS[i], title: l.name }))}
      />
    </div>
  );

  return (
    <Card
      className="pkg"
      title="Pay package you would need"
      description={
        raise
          ? `To take home ${money(t.target)} a month from salary alone, your base pay would need to be about ${money(base)}, ${percent(base / SALARY - 1)} more than today. Here is the full package at that salary, using your Air Canada offer terms.`
          : "Your current salary already reaches the target."
      }
    >
      {row("Today", now, totalNow)}
      {row("Needed", needed, totalNeeded)}
      <Legend style={{ margin: "6px 0 16px" }} items={now.map((l, i) => ({ label: shortName(l.name), color: COLORS[i] }))} />
      <div className="scroll">
        <table className="t2 pkt">
          <tbody>
            <tr>
              <th />
              <th>Today</th>
              <th>Needed</th>
              <th>Change</th>
            </tr>
            {now.map((l, i) => {
              const up = needed[i].amount > l.amount;
              return (
                <tr key={l.name}>
                  <td>{l.name}</td>
                  <td>{money(l.amount)}</td>
                  <td>{money(needed[i].amount)}</td>
                  <td className={up ? "up" : undefined}>{up ? `+${money(needed[i].amount - l.amount)}` : "–"}</td>
                </tr>
              );
            })}
            <tr className="tt">
              <td>Total yearly package</td>
              <td>{money(totalNow)}</td>
              <td>{money(totalNeeded)}</td>
              <td className="up">+{money(totalNeeded - totalNow)}</td>
            </tr>
            <tr>
              <td>Monthly take-home</td>
              <td>{money(plan.net)}</td>
              <td>{money(t.target)}</td>
              <td className="up">+{money(t.gap)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {raise && (
        <>
          <div className="pkf">
            <div>
              <b>{percent(base / SALARY - 1)}</b>
              <span>raise needed on base pay</span>
            </div>
            <div>
              <b>{yearsOfRaises(base, 0.03)} years</b>
              <span>with 3% yearly raises</span>
            </div>
            <div>
              <b>{yearsOfRaises(base, 0.05)} years</b>
              <span>with 5% yearly raises</span>
            </div>
            <div>
              <b>{money(base - SALARY)}</b>
              <span>more base pay a year</span>
            </div>
          </div>
          <Note style={{ marginTop: 12 }}>
            The incentive pays once a year in March, so it does not raise your monthly take-home and is not counted toward the target. The one-time $5,000
            signing bonus, Aeroplan points, profit sharing and ESOP are left out. A promotion, a job change or a mix with the side income above can get there
            faster than raises alone.
          </Note>
        </>
      )}
    </Card>
  );
}

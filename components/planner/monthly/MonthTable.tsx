"use client";

import { Fragment } from "react";
import { usePlan } from "@/components/providers/PlannerProvider";
import { MiniBar } from "@/components/ui/bars";
import { Panel } from "@/components/ui/text";
import { money } from "@/lib/format";
import { monthDate } from "@/lib/planner/calendar";

/** Every month in a table, with a tag in the month each milestone is crossed. */
export default function MonthTable() {
  const { rows, exp } = usePlan();
  const milestones: [string, number][] = (
    [
      ["1 month of expenses", exp.total],
      ["3 months of expenses", exp.total * 3],
      ["$10k", 10000],
      ["$25k", 25000],
      ["$50k", 50000],
      ["$100k", 100000],
    ] as [string, number][]
  ).filter(([, v]) => v > 0);
  const depositMax = Math.max(1, ...rows.map((r) => r.deposit));
  const balanceMax = Math.max(1, ...rows.map((r) => r.balance));

  return (
    <Panel title="Every month">
      <div className="scroll">
        <table className="mt">
          <thead>
            <tr>
              <th>Month</th>
              <th>From pay</th>
              <th>Bonuses and one-time</th>
              <th>Saved</th>
              <th className="bc">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, k) => {
              const year = monthDate(r.i).getFullYear();
              const newYear = k === 0 || monthDate(rows[k - 1].i).getFullYear() !== year;
              const prev = k === 0 ? r.balance - r.deposit : rows[k - 1].balance;
              const crossed = milestones.filter(([, v]) => prev < v && r.balance >= v).map(([name]) => name);
              return (
                <Fragment key={r.i}>
                  {newYear && (
                    <tr className="yr">
                      <td colSpan={5}>{year}</td>
                    </tr>
                  )}
                  <tr className={r.extra ? "bn" : undefined}>
                    <td>
                      {r.label}
                      {crossed.map((h) => (
                        <span key={h} className="tag">
                          {h}
                        </span>
                      ))}
                    </td>
                    <td className={r.base < 0 ? "n" : undefined}>{money(r.base)}</td>
                    <td className="p">{r.extra ? money(r.extra) : "–"}</td>
                    <td>
                      <div className="sv">
                        <span>{money(r.deposit)}</span>
                        <MiniBar
                          parts={[
                            { value: Math.max(0, r.base) / depositMax, color: "var(--std)" },
                            ...(r.extra ? [{ value: r.extra / depositMax, color: "var(--promo)" }] : []),
                          ]}
                        />
                      </div>
                    </td>
                    <td className="bc">
                      <div className="sv">
                        <span className="s">{money(r.balance)}</span>
                        <MiniBar parts={[{ value: Math.max(0, r.balance) / balanceMax, color: "var(--std)" }]} />
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

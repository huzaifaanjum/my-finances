"use client";

import { Fragment, useMemo, useState } from "react";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { money, percent } from "@/lib/format";
import { groupLedger, ledgerCsv, monthlyLedger, type Grouping, type LedgerRow } from "@/lib/planner/cashflow";
import { monthDate } from "@/lib/planner/calendar";

type Filter = "all" | "bonus" | "tight";

/** Cash under this is a tight month: one surprise bill away from overdraft. */
const TIGHT = 500;

const GROUPINGS: { id: Grouping; label: string }[] = [
  { id: "month", label: "Monthly" },
  { id: "quarter", label: "Quarterly" },
  { id: "year", label: "Yearly" },
];

function signed(v: number) {
  if (Math.abs(v) < 0.5) return "–";
  return `${v > 0 ? "+" : "−"}${money(Math.abs(v))}`;
}

function Bar({ value, max, color, neg }: { value: number; max: number; color: string; neg?: boolean }) {
  return (
    <span className="cf-bar" aria-hidden="true">
      <i style={{ width: `${Math.min(100, (Math.abs(value) / (max || 1)) * 100)}%`, background: neg ? "var(--neg)" : color }} />
    </span>
  );
}

/** Every month (or quarter or year): money in, money out, what was saved, the tightest day and the balance. */
export default function MonthTable() {
  const plan = usePlan();
  const [by, setBy] = useState<Grouping>("month");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);

  const monthly = useMemo(() => monthlyLedger(plan), [plan]);
  const rows = useMemo(() => groupLedger(monthly, by, plan.exp.total), [monthly, by, plan.exp.total]);
  const shown = rows.filter((r) => filter === "all" || (filter === "bonus" ? r.extraIn > 0 || r.extraOut > 0 : r.lowest < TIGHT));
  const flows = monthly.filter((r) => !r.start);
  const totals = {
    pay: flows.reduce((t, r) => t + r.pay, 0),
    extraIn: flows.reduce((t, r) => t + r.extraIn, 0),
    spending: flows.reduce((t, r) => t + r.spending, 0),
    saved: monthly.reduce((t, r) => t + r.saved, 0),
  };
  const income = totals.pay + totals.extraIn;
  const savedMax = Math.max(1, ...rows.map((r) => Math.abs(r.saved)));
  const balMax = Math.max(1, ...rows.map((r) => Math.abs(r.balance)));
  const tightCount = rows.filter((r) => r.lowest < TIGHT).length;
  const bonusCount = rows.filter((r) => r.extraIn > 0 || r.extraOut > 0).length;
  const last = monthly[monthly.length - 1];

  function download() {
    const blob = new Blob([ledgerCsv(rows)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cash-flow-${by}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  return (
    <Card
      className="cf"
      header={
        <div className="ps-head">
          <div>
            <h3>Cash flow ledger</h3>
            <p className="d">
              Money in, money out and what is left, {by === "month" ? "month by month" : by === "quarter" ? "by quarter" : "by year"}. Tap a row for the details.
            </p>
          </div>
          <div className="ps-row">
            <div className="ps-seg sm" role="group" aria-label="Group by">
              {GROUPINGS.map((g) => (
                <button key={g.id} type="button" aria-pressed={by === g.id} onClick={() => setBy(g.id)}>
                  {g.label}
                </button>
              ))}
            </div>
            <button type="button" className="ps-btn sm" onClick={download}>
              Download CSV
            </button>
          </div>
        </div>
      }
    >
      <div className="cf-sum">
        <div>
          <span>Money in</span>
          <b>{money(income)}</b>
          <small>
            {money(totals.pay)} pay + {money(totals.extraIn)} bonuses and one-time
          </small>
        </div>
        <div>
          <span>Money out</span>
          <b>{money(totals.spending)}</b>
          <small>expenses and one-time costs</small>
        </div>
        <div className="pos">
          <span>Saved</span>
          <b>{money(totals.saved)}</b>
          <small>{income ? `${percent(totals.saved / income)} of what came in` : ""}</small>
        </div>
        <div className={plan.low.bal < 0 ? "neg" : plan.low.bal < TIGHT ? "warn" : "pos"}>
          <span>Tightest day</span>
          <b>{money(plan.low.bal)}</b>
          <small>{tightCount ? `${tightCount} ${by === "month" ? "month" : by}${tightCount === 1 ? "" : "s"} under ${money(TIGHT)}` : "never under $500"}</small>
        </div>
        <div>
          <span>Ending balance</span>
          <b>{money(last.balance)}</b>
          <small>{last.cover.toFixed(1)} months of expenses covered</small>
        </div>
      </div>

      <div className="cf-filters" role="group" aria-label="Show">
        {(
          [
            ["all", `All ${rows.length}`],
            ["bonus", `Bonus and one-time ${bonusCount}`],
            ["tight", `Tight ${tightCount}`],
          ] as [Filter, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="cf-scroll">
        <table className="cf-t">
          <thead>
            <tr>
              <th>{by === "month" ? "Month" : by === "quarter" ? "Quarter" : "Year"}</th>
              <th>In</th>
              <th>Out</th>
              <th>Saved</th>
              <th>Rate</th>
              <th>Balance</th>
              <th>Covers</th>
              <th>Next milestone</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, k) => {
              const year = monthDate(r.i).getFullYear();
              const newYear = by !== "year" && (k === 0 || monthDate(shown[k - 1].i).getFullYear() !== year);
              const yearRows = by === "month" ? monthly.filter((m) => monthDate(m.i).getFullYear() === year && !m.start) : [];
              const isOpen = open === r.i;
              return (
                <Fragment key={`${by}-${r.i}`}>
                  {newYear && (
                    <tr className="cf-yr">
                      <td colSpan={8}>
                        <span>{year}</span>
                        {by === "month" && yearRows.length > 0 && (
                          <em>
                            saved {money(yearRows.reduce((t, m) => t + m.saved, 0))} of {money(yearRows.reduce((t, m) => t + m.income, 0))} in ·{" "}
                            {percent(yearRows.reduce((t, m) => t + m.saved, 0) / Math.max(1, yearRows.reduce((t, m) => t + m.income, 0)))}
                          </em>
                        )}
                      </td>
                    </tr>
                  )}
                  <tr
                    className={`cf-r${r.start ? " start" : ""}${r.extraIn > 0 ? " bonus" : ""}${r.lowest < 0 ? " over" : r.lowest < TIGHT ? " tight" : ""}${isOpen ? " open" : ""}`}
                    onClick={() => setOpen(isOpen ? null : r.i)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(isOpen ? null : r.i))}
                    aria-expanded={isOpen}
                  >
                    <td className="cf-m">
                      <b>{r.label}</b>
                      <span className="cf-ev">
                        {r.start && <i className="ev-start">Starting point</i>}
                        {r.events.slice(0, 3).map((e, j) => (
                          <i key={j} className={`ev-${e.kind}`}>
                            {e.label}
                          </i>
                        ))}
                        {r.events.length > 3 && <i className="ev-more">+{r.events.length - 3}</i>}
                      </span>
                    </td>
                    <td>{r.start ? "–" : money(r.income)}</td>
                    <td>{r.start ? "–" : money(r.spending)}</td>
                    <td className="cf-num">
                      <span className={r.saved < 0 ? "neg" : "pos"}>{r.start ? "–" : money(r.saved)}</span>
                      {!r.start && <Bar value={r.saved} max={savedMax} color={r.extraIn > 0 ? "var(--promo)" : "var(--std)"} neg={r.saved < 0} />}
                    </td>
                    <td className={r.start ? undefined : r.rate >= 0.2 ? "pos" : r.rate < 0 ? "neg" : "warn"}>{r.start ? "–" : percent(r.rate)}</td>
                    <td className="cf-num">
                      <span className={r.balance < 0 ? "neg" : undefined}>{money(r.balance)}</span>
                      <Bar value={r.balance} max={balMax} color="var(--scotia)" neg={r.balance < 0} />
                    </td>
                    <td className={r.cover >= 3 ? "pos" : r.cover >= 1 ? undefined : "warn"}>{Math.max(0, r.cover).toFixed(1)} mo</td>
                    <td className="cf-next">
                      {r.next ? (
                        <>
                          <span>
                            {r.next.name} <em>{percent(r.next.progress)}</em>
                          </span>
                          <Bar value={r.next.progress} max={1} color="var(--mix)" />
                        </>
                      ) : (
                        <span className="pos">All reached</span>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="cf-detail">
                      <td colSpan={8}>
                        <Detail r={r} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {!shown.length && (
              <tr>
                <td colSpan={8} className="cf-empty">
                  Nothing matches this filter.
                </td>
              </tr>
            )}
          </tbody>
          {filter === "all" && (
            <tfoot>
              <tr>
                <td>Total</td>
                <td>{money(income)}</td>
                <td>{money(totals.spending)}</td>
                <td className="pos">{money(totals.saved)}</td>
                <td>{income ? percent(totals.saved / income) : "–"}</td>
                <td>{money(last.balance)}</td>
                <td>{Math.max(0, last.cover).toFixed(1)} mo</td>
                <td>{last.next ? `${last.next.name} next` : "All reached"}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className="note cf-legend">
        <i className="ev-bonus" /> bonus month · <i className="ev-milestone" /> milestone reached · <span className="warn">amber</span> lowest cash under {money(TIGHT)} ·{" "}
        <span className="neg">red</span> overdrawn. Rate is saved ÷ money in; covers is the balance in months of expenses. Your lowest cash each month is the day before payday, shown when you open a row.
      </p>
    </Card>
  );
}

/** The breakdown under a row: where the money came from and went, and what happened. */
function Detail({ r }: { r: LedgerRow }) {
  if (r.start) {
    return (
      <div className="cf-d">
        <p>
          The plan starts here: {money(r.balance)} of savings{r.extraOut ? ` after ${money(r.extraOut)} of one-time costs` : ""}. This month&apos;s bills are
          assumed paid already, and pay starts counting from next month.
        </p>
      </div>
    );
  }
  return (
    <div className="cf-d">
      <dl>
        <div>
          <dt>Take-home pay</dt>
          <dd>{money(r.pay)}</dd>
        </div>
        {r.extraIn > 0 && (
          <div>
            <dt>Bonuses and one-time income</dt>
            <dd className="pos">+{money(r.extraIn)}</dd>
          </div>
        )}
        <div>
          <dt>Monthly expenses</dt>
          <dd className="neg">−{money(r.expenses)}</dd>
        </div>
        {r.extraOut > 0 && (
          <div>
            <dt>One-time costs</dt>
            <dd className="neg">−{money(r.extraOut)}</dd>
          </div>
        )}
        <div className="tt">
          <dt>Saved</dt>
          <dd>{money(r.saved)}</dd>
        </div>
      </dl>
      <dl>
        <div>
          <dt>Balance change</dt>
          <dd className={r.change < 0 ? "neg" : "pos"}>{signed(r.change)}</dd>
        </div>
        <div>
          <dt>Lowest cash in chequing</dt>
          <dd className={r.lowest < 0 ? "neg" : undefined}>{money(r.lowest)}</dd>
        </div>
        <div>
          <dt>Emergency cover at the end</dt>
          <dd>{r.cover.toFixed(1)} months of expenses</dd>
        </div>
        {r.events.length > 0 && (
          <div>
            <dt>What happened</dt>
            <dd>{r.events.map((e) => e.label).join(", ")}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

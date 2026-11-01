"use client";

import k from "@/components/knowledge/knowledge.module.css";
import type { ReadMap } from "@/hooks/useKnowledgeProgress";
import { BUSINESS_STEPS, COSTS, NEEDS, STEP_NEED, STOP_FIRST, type Need } from "@/lib/income/business";
import s from "./income.module.css";
import TrackRow, { TextBlock, type Toggle } from "./TrackRow";

const rowId = (id: string) => `rev-${id}`;

const NEED_STYLE: Record<Need, string> = { Mandatory: s.must, "Only if": s.when, "Not mandatory": s.free };

/** Registering in Montreal: what to check first, what it costs, then each step in order. */
export default function BusinessTab({ read, toggle }: { read: ReadMap; toggle: Toggle }) {
  const done = BUSINESS_STEPS.filter((b) => read[rowId(b.id)]).length;
  return (
    <>
      <section className={s.sec}>
        <h2 className="goal-sh">
          What is mandatory <span>to start as a solo developer in Montreal under a brand</span>
        </h2>
        <div className={s.needs}>
          {NEEDS.map((n) => (
            <article key={n.need} className={`${s.need} ${NEED_STYLE[n.need]}`}>
              <header>
                <h3>{n.title}</h3>
                <p>{n.note}</p>
              </header>
              <ul>
                {n.items.map((i) => (
                  <li key={i.name}>
                    <b>{i.name}</b>
                    <span>{i.detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={s.sec}>
        <h2 className="goal-sh">
          Check these first <span>before you register or earn anything</span>
        </h2>
        <div className={s.warnGrid}>
          {STOP_FIRST.map((w) => (
            <article key={w.title} className={s.warn}>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={s.sec}>
        <h2 className="goal-sh">
          What it costs <span>only $41 now and $41 a year is mandatory</span>
        </h2>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>When</th>
                <th>Cost</th>
                <th>Needed</th>
              </tr>
            </thead>
            <tbody>
              {COSTS.map((c) => (
                <tr key={c.item}>
                  <td>{c.item}</td>
                  <td>{c.when}</td>
                  <td>{c.cost}</td>
                  <td>
                    <span className={`${s.tag} ${c.need === "Mandatory" ? s.tagMust : ""}`}>{c.need}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={k.note}>A lean start costs about $60 in the first year: registration plus a domain. Amounts with “about” are estimates. The rest are published 2026 rates.</p>
      </section>

      <section className={s.sec}>
        <h2 className="goal-sh">
          Steps, in order{" "}
          <span>
            {done} of {BUSINESS_STEPS.length} done
          </span>
        </h2>
        <div>
          {BUSINESS_STEPS.map((b) => (
            <TrackRow key={b.id} id={rowId(b.id)} title={b.title} summary={b.summary} tags={[STEP_NEED[b.id]]} steps={b.steps} read={read} toggle={toggle}>
              {b.body.map((x) => (
                <TextBlock key={x.title} title={x.title}>
                  {x.text}
                </TextBlock>
              ))}
            </TrackRow>
          ))}
        </div>
      </section>
    </>
  );
}

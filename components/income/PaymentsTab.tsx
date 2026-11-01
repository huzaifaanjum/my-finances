"use client";

import { useState } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import k from "@/components/knowledge/knowledge.module.css";
import type { ReadMap } from "@/hooks/useKnowledgeProgress";
import { INTEGRATE_STEPS, KEEP_MORE, MOR_EXPLAINED, PICKS, SERVICES } from "@/lib/income/payments";
import FeeCalculator from "./FeeCalculator";
import s from "./income.module.css";
import TrackRow, { StepList, TextBlock, type Toggle } from "./TrackRow";

/** Choosing a service, keeping more of each sale, and a setup checklist for each service in its own tab. */
export default function PaymentsTab({ read, toggle }: { read: ReadMap; toggle: Toggle }) {
  const [tab, setTab] = useState(SERVICES[0].id);
  const service = SERVICES.find((x) => x.id === tab) ?? SERVICES[0];
  const base = `rev-pay-${service.id}`;
  return (
    <>
      <GlossaryScope>
        <section className={s.sec}>
          <h2 className="goal-sh">
            What to use <span>the short answer</span>
          </h2>
          <ul className={s.picks}>
            {PICKS.map((p) => (
              <li key={p.when}>
                <span>{p.when}</span>
                <b>{p.use}</b>
                <em>{p.why}</em>
              </li>
            ))}
          </ul>
          <p className={s.callout}>
            <G>{MOR_EXPLAINED}</G>
          </p>
        </section>
      </GlossaryScope>

      <section className={s.sec}>
        <h2 className="goal-sh">
          Compare what you keep <span>change the sale and watch the order</span>
        </h2>
        <FeeCalculator />
      </section>

      <section className={s.sec}>
        <h2 className="goal-sh">
          Ways to keep more <span>ranked roughly by money saved</span>
        </h2>
        <div>
          {KEEP_MORE.map((t) => (
            <TrackRow key={t.id} id={`rev-${t.id}`} title={t.title} summary={t.summary} tags={t.tags} read={read} toggle={toggle}>
              {t.body.map((x) => (
                <TextBlock key={x.title} title={x.title}>
                  {x.text}
                </TextBlock>
              ))}
            </TrackRow>
          ))}
        </div>
      </section>

      <section className={s.sec}>
        <h2 className="goal-sh">
          Set up each service <span>one tab per service, with a saved checklist</span>
        </h2>
        <div className="ps-tabs" role="tablist" aria-label="Payment services">
          {SERVICES.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)}>
              {x.label}
              <small>{x.note}</small>
            </button>
          ))}
        </div>
        <div role="tabpanel" className={s.servicePanel}>
          <GlossaryScope>
            <TextBlock title="Best for">{service.bestFor}</TextBlock>
            <TextBlock title="Watch out" className={k.ex}>
              {service.watch}
            </TextBlock>
          </GlossaryScope>
          <div className={k.blk}>
            <h4>Prices</h4>
            <dl className={s.rates}>
              {service.rates.map((r) => (
                <div key={r.name}>
                  <dt>{r.name}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={k.blk}>
            <h4>Set up {service.label}</h4>
            <StepList base={base} steps={service.steps} read={read} toggle={toggle} />
          </div>
        </div>
      </section>

      <section className={s.sec}>
        <h2 className="goal-sh">
          Add payments to your app <span>the same safe pattern on any service</span>
        </h2>
        <StepList base="rev-pay-build" steps={INTEGRATE_STEPS} read={read} toggle={toggle} />
      </section>
    </>
  );
}

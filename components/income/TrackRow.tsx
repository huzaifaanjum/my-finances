"use client";

import { useState, type ReactNode } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import k from "@/components/knowledge/knowledge.module.css";
import type { ReadMap } from "@/hooks/useKnowledgeProgress";
import s from "./income.module.css";

export type Toggle = (id: string, value: boolean) => void;

/** A list of steps, each with its own saved tick. */
export function StepList({ base, steps, read, toggle }: { base: string; steps: string[]; read: ReadMap; toggle: Toggle }) {
  return (
    <ul className={s.steps}>
      {steps.map((step, i) => {
        const id = `${base}-${i + 1}`;
        return (
          <li key={id}>
            <label className={read[id] ? s.stepDone : undefined}>
              <input type="checkbox" className={k.check} checked={!!read[id]} onChange={(e) => toggle(id, e.target.checked)} />
              <span>{step}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function TextBlock({ title, className = "", children }: { title: string; className?: string; children: string }) {
  return (
    <div className={`${k.blk} ${className}`}>
      <h4>{title}</h4>
      <p>
        <G>{children}</G>
      </p>
    </div>
  );
}

interface Props {
  id: string;
  title: string;
  summary: string;
  tags?: string[];
  steps?: string[];
  read: ReadMap;
  toggle: Toggle;
  children?: ReactNode;
}

/** One accordion row: a tick for the whole item, details once opened, and a tick for each step. */
export default function TrackRow({ id, title, summary, tags, steps = [], read, toggle, children }: Props) {
  const [open, setOpen] = useState(false);
  const stepsDone = steps.filter((_, i) => read[`${id}-${i + 1}`]).length;
  return (
    <details id={id} className={`${k.rule} ${read[id] ? k.done : ""}`} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className={k.sum}>
        <input
          type="checkbox"
          className={k.check}
          checked={!!read[id]}
          aria-label={`Mark "${title}" as done`}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => toggle(id, e.target.checked)}
        />
        <span>
          <p className={k.rt}>{title}</p>
          <p className={k.rs}>{summary}</p>
          {(tags?.length || steps.length > 0) && (
            <span className={s.tags}>
              {tags?.map((t) => (
                <span key={t} className={`${s.tag} ${t === "Mandatory" ? s.tagMust : ""}`}>
                  {t}
                </span>
              ))}
              {stepsDone > 0 && (
                <span className={s.tag}>
                  {stepsDone} of {steps.length} steps
                </span>
              )}
            </span>
          )}
        </span>
        <span className={k.chev} aria-hidden="true">
          ▶
        </span>
      </summary>
      {open && (
        <GlossaryScope>
          <div className={k.body}>
            {children}
            {steps.length > 0 && (
              <div className={k.blk}>
                <h4>Getting started</h4>
                <StepList base={id} steps={steps} read={read} toggle={toggle} />
              </div>
            )}
          </div>
        </GlossaryScope>
      )}
    </details>
  );
}

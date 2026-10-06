"use client";

import type { Rule } from "@/lib/knowledge/rules";
import { DemoFor } from "./demos";
import s from "./knowledge.module.css";

function Block({ title, className = "", children }: { title: string; className?: string; children: string }) {
  return (
    <div className={`${s.blk} ${className}`}>
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  );
}

/** One rule: a collapsible card with an explanation, a worked example and a live demo. */
export default function RuleItem({ rule, isRead, onToggle }: { rule: Rule; isRead: boolean; onToggle: (read: boolean) => void }) {
  return (
    <details id={rule.id} className={`${s.rule} ${isRead ? s.done : ""}`}>
      <summary className={s.sum}>
        <input
          type="checkbox"
          className={s.check}
          checked={isRead}
          aria-label={`Mark "${rule.title}" as read`}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span>
          <p className={s.rt}>{rule.title}</p>
          <p className={s.rs}>{rule.summary}</p>
        </span>
        <span className={s.chev} aria-hidden="true">
          ▶
        </span>
      </summary>
      <div className={s.body}>
        <Block title="In plain words">{rule.plain}</Block>
        <Block title="How it helps you">{rule.why}</Block>
        <Block title="Example" className={s.ex}>
          {rule.example}
        </Block>
        <DemoFor name={rule.demo} />
        <Block title="For you" className={s.you}>
          {rule.you}
        </Block>
        <button type="button" className={`${s.btn} ${isRead ? s.btnGhost : ""}`} onClick={() => onToggle(!isRead)}>
          {isRead ? "Mark as not read" : "Mark as read"}
        </button>
      </div>
    </details>
  );
}

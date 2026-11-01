"use client";

import Link from "next/link";
import { useState } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { DemoFor } from "@/components/knowledge/demos";
import k from "@/components/knowledge/knowledge.module.css";
import type { Lesson } from "@/lib/education/lessons";
import s from "./education.module.css";

function Block({ title, className = "", children }: { title: string; className?: string; children: string }) {
  return (
    <div className={`${k.blk} ${className}`}>
      <h4>{title}</h4>
      <p>
        <G>{children}</G>
      </p>
    </div>
  );
}

/** One lesson: a collapsible card. The body only renders once opened, so a long course stays quick. */
export default function LessonItem({ lesson, number, isRead, onToggle }: { lesson: Lesson; number: string; isRead: boolean; onToggle: (read: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <details id={lesson.id} className={`${k.rule} ${isRead ? k.done : ""}`} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className={k.sum}>
        <input
          type="checkbox"
          className={k.check}
          checked={isRead}
          aria-label={`Mark "${lesson.title}" as read`}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span>
          <p className={k.rt}>
            <span className={s.num}>{number}</span>
            {lesson.title}
          </p>
          <p className={k.rs}>{lesson.idea}</p>
        </span>
        <span className={k.chev} aria-hidden="true">
          ▶
        </span>
      </summary>
      {open && (
        <GlossaryScope>
          <div className={k.body}>
            <Block title="In plain words">{lesson.explain}</Block>
            <Block title="Example" className={k.ex}>
              {lesson.example}
            </Block>
            {lesson.demo && <DemoFor name={lesson.demo} />}
            <Block title="Remember" className={s.remember}>
              {lesson.remember}
            </Block>
            {lesson.you && (
              <Block title="For you" className={k.you}>
                {lesson.you}
              </Block>
            )}
            {lesson.rule && (
              <Link href={`/knowledge#${lesson.rule.id}`} className={k.link}>
                Put it into action: {lesson.rule.label} →
              </Link>
            )}
            <button type="button" className={`${k.btn} ${isRead ? k.btnGhost : ""}`} onClick={() => onToggle(!isRead)}>
              {isRead ? "Mark as not read" : "Mark as read"}
            </button>
          </div>
        </GlossaryScope>
      )}
    </details>
  );
}

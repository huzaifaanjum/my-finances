"use client";

import { useMemo, useState } from "react";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { CORE_IDEAS, FORMULAS, LESSONS, READING, UNITS } from "@/lib/education/lessons";
import k from "@/components/knowledge/knowledge.module.css";
import s from "./education.module.css";
import LessonItem from "./LessonItem";

type Filter = string | "all";

/** Finance from first principles: the core ideas, twelve units of lessons, then a cheat sheet to keep. */
export default function EducationView() {
  const { read, loading, error, toggle } = useKnowledgeProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const done = LESSONS.filter((l) => read[l.id]).length;
  const pct = Math.round((done / LESSONS.length) * 100);
  const next = LESSONS.find((l) => !read[l.id]);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return UNITS.map((u, at) => ({
      ...u,
      at: at + 1,
      total: LESSONS.filter((l) => l.unit === u.id).length,
      lessons: LESSONS.filter((l) => l.unit === u.id)
        .map((lesson, i) => ({ lesson, number: `${at + 1}.${i + 1}` }))
        .filter(({ lesson: l }) => (filter === "all" || filter === u.id) && (!q || `${l.title} ${l.idea} ${l.explain} ${l.example}`.toLowerCase().includes(q))),
    })).filter((u) => u.lessons.length);
  }, [filter, query]);

  const jump = () => {
    if (!next) return;
    setFilter("all");
    setQuery("");
    requestAnimationFrame(() => {
      const el = document.getElementById(next.id);
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView({ block: "start" });
      }
    });
  };

  return (
    <div className={k.page}>
      <header className={k.head}>
        <div className={k.eyebrow}>Learn finance from the ground up</div>
        <h1 className={k.title}>Financial education</h1>
        <p className={k.lead}>
          How money really works, one small idea at a time. Go in order: each lesson builds on the last, and most take two minutes. Underlined words explain themselves when you tap them.
        </p>
      </header>

      <section className={s.core} aria-labelledby="core-title">
        <h2 id="core-title" className={k.groupTitle}>
          The whole course in six lines
        </h2>
        <ol className={s.coreList}>
          {CORE_IDEAS.map((c) => (
            <li key={c.title}>
              <b>{c.title}</b>
              <span>{c.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className={k.progress}>
        <div className={k.progressTop}>
          <b>
            {done} of {LESSONS.length} lessons done
          </b>
          <span>{pct}%</span>
        </div>
        <div className={k.track} role="progressbar" aria-valuemin={0} aria-valuemax={LESSONS.length} aria-valuenow={done} aria-label="Lessons done">
          <span className={k.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {next && (
        <button type="button" className={k.btn} onClick={jump}>
          {done === 0 ? "Start with lesson one" : `Continue: ${next.title}`}
        </button>
      )}

      <div className={s.filters}>
        <input type="search" className={s.search} placeholder="Search lessons, e.g. bonds or inflation" value={query} aria-label="Search lessons" onChange={(e) => setQuery(e.target.value)} />
        <div className={k.tabs} role="group" aria-label="Unit">
          {[{ id: "all", title: "All units" }, ...UNITS].map((u) => (
            <button key={u.id} type="button" className={k.tab} aria-pressed={filter === u.id} onClick={() => setFilter(u.id)}>
              {u.title}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className={k.err} role="alert">
          {error}
        </p>
      )}

      {loading && Object.keys(read).length === 0 ? (
        <div className={k.skel} aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="sk-b" style={{ height: 64 }} />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <p className={k.note}>No lessons match “{query}”.</p>
      ) : (
        sections.map((u) => (
          <section key={u.id} className={k.group}>
            <div className={s.unitHead}>
              <h2 className={s.unitTitle}>
                <span>Unit {u.at}</span>
                {u.title}
              </h2>
              <span className={s.unitCount}>
                {LESSONS.filter((l) => l.unit === u.id && read[l.id]).length} of {u.total}
              </span>
            </div>
            <p className={s.unitGoal}>{u.goal}</p>
            {u.lessons.map(({ lesson, number }) => (
              <LessonItem key={lesson.id} lesson={lesson} number={number} isRead={!!read[lesson.id]} onToggle={(v) => toggle(lesson.id, v)} />
            ))}
          </section>
        ))
      )}

      <section className={k.group}>
        <h2 className={k.groupTitle}>Cheat sheet</h2>
        <div className={s.formulas}>
          {FORMULAS.map((f) => (
            <div key={f.name} className={s.formula}>
              <b>{f.name}</b>
              <code>{f.formula}</code>
              <span>{f.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={k.group}>
        <h2 className={k.groupTitle}>Keep learning</h2>
        <ul className={s.reading}>
          {READING.map((r) => (
            <li key={r.title}>
              <b>{r.title}</b>
              <span className={s.by}>{r.by}</span>
              <span>{r.why}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className={k.foot}>
        General education, not financial or tax advice. Returns are estimates and never guaranteed. Limits and rules are for 2026 and can change, so confirm with the CRA, Revenu Québec or a licensed
        advisor before you act.
      </p>
    </div>
  );
}

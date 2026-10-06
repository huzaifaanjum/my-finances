"use client";

import { useMemo, useState } from "react";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { GROUPS, RULES } from "@/lib/knowledge/rules";
import s from "./knowledge.module.css";
import RuleItem from "./RuleItem";

type Filter = "all" | "unread" | "read";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Not read yet" },
  { value: "read", label: "Read" },
];

function Progress({ done, total }: { done: number; total: number }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div className={s.progress}>
      <div className={s.progressTop}>
        <b>
          {done} of {total} read
        </b>
        <span>{pct}%</span>
      </div>
      <div className={s.track} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Rules read">
        <span className={s.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className={s.skel} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="sk-b" style={{ height: 64 }} />
      ))}
    </div>
  );
}

export default function KnowledgeView() {
  const { read, loading, error, toggle } = useKnowledgeProgress();
  const [filter, setFilter] = useState<Filter>("all");

  const done = RULES.filter((r) => read[r.id]).length;
  const visible = useMemo(
    () => RULES.filter((r) => (filter === "all" ? true : filter === "read" ? !!read[r.id] : !read[r.id])),
    [filter, read],
  );

  return (
    <div className={s.page}>
      <header className={s.head}>
        <div className={s.eyebrow}>Money rules</div>
        <h1 className={s.title}>Knowledge</h1>
        <p className={s.lead}>
          The rules that matter most, in plain words. Open one, read it, play with the numbers, then tick it off. Your progress is saved to your account.
        </p>
      </header>

      <Progress done={done} total={RULES.length} />

      <div className={s.tabs}>
        {FILTERS.map((f) => (
          <button key={f.value} type="button" className={s.tab} aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className={s.err} role="alert">
          {error}
        </p>
      )}

      {loading && Object.keys(read).length === 0 ? (
        <ListSkeleton />
      ) : (
        GROUPS.map((g) => {
          const items = visible.filter((r) => r.group === g);
          if (items.length === 0) return null;
          return (
            <section key={g} className={s.group}>
              <h2 className={s.groupTitle}>{g}</h2>
              {items.map((r) => (
                <RuleItem key={r.id} rule={r} isRead={!!read[r.id]} onToggle={(v) => toggle(r.id, v)} />
              ))}
            </section>
          );
        })
      )}

      <p className={s.foot}>
        General education, not financial or tax advice. Limits and rules are for 2026 and can change, so confirm with the CRA, Revenu Québec or a licensed advisor
        before you act.
      </p>
    </div>
  );
}

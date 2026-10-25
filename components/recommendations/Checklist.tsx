"use client";

import Link from "next/link";
import { useState } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { SectionHeading } from "@/components/ui/text";
import { money } from "@/lib/format";
import { AREAS, isDone, PRIORITIES, type AreaId, type Priority, type Step } from "@/lib/recommendations";

type Status = "todo" | "done" | "all";

interface Props {
  steps: Step[];
  read: Record<string, number>;
  toggle: (id: string, read: boolean) => void;
  error?: string | null;
}

/** Every recommendation, filterable, grouped Now / Soon / Later. Ticks are saved to your account. */
export default function Checklist({ steps, read, toggle, error }: Props) {
  const [status, setStatus] = useState<Status>("todo");
  const [area, setArea] = useState<AreaId | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const setDone = (s: Step, v: boolean) => {
    toggle(s.id, v);
    // unticking clears merged duplicates too, or the step would stay ticked
    if (!v) s.also?.filter((id) => read[id]).forEach((id) => toggle(id, false));
  };
  const flip = (id: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const q = query.trim().toLowerCase();
  const shown = steps.filter(
    (s) =>
      (area === "all" || s.area === area) &&
      (status === "all" || (status === "done") === isDone(s, read)) &&
      (!q || `${s.title} ${s.body} ${AREAS[s.area].title}`.toLowerCase().includes(q)),
  );
  const areaIds = Object.keys(AREAS) as AreaId[];
  const count = (a: AreaId | "all") => {
    const list = a === "all" ? steps : steps.filter((s) => s.area === a);
    return { done: list.filter((s) => isDone(s, read)).length, total: list.length };
  };

  return (
    <section className="rec-sec">
      <SectionHeading title="Checklist">
        Everything worth doing with your pay, benefits and savings. Tap a row for details; ticks are saved to your account.
      </SectionHeading>
      {error && <p className="note">{error}</p>}
      <div className="ck">
        <aside className="ck-side">
          <input className="ck-search" type="search" placeholder="Search recommendations" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="ps-seg sm ck-status" role="group" aria-label="Show">
            {(["todo", "done", "all"] as const).map((s) => (
              <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
                {s === "todo" ? "To do" : s === "done" ? "Done" : "All"}
              </button>
            ))}
          </div>
          <nav className="ck-areas" aria-label="Areas">
            {(["all", ...areaIds] as const).map((a) => {
              const c = count(a);
              return (
                <button key={a} type="button" aria-pressed={area === a} onClick={() => setArea(a)}>
                  <i style={{ background: a === "all" ? "var(--text)" : AREAS[a].color }} />
                  <span>{a === "all" ? "All areas" : AREAS[a].title}</span>
                  <em>
                    {c.done}/{c.total}
                  </em>
                  <s style={{ width: `${(c.done / (c.total || 1)) * 100}%`, background: a === "all" ? "var(--std)" : AREAS[a].color }} />
                </button>
              );
            })}
          </nav>
        </aside>

        <GlossaryScope>
          <div className="ck-main">
            {(Object.keys(PRIORITIES) as Priority[]).map((p) => {
              const group = shown.filter((s) => s.priority === p);
              if (!group.length) return null;
              return (
                <div key={p} className="ck-grp">
                  <h3>
                    {PRIORITIES[p].title} <span>{PRIORITIES[p].note} · {group.length}</span>
                  </h3>
                  <ul>
                    {group.map((s) => {
                      const done = isDone(s, read);
                      const expanded = open.has(s.id);
                      return (
                        <li key={s.id} className={`ck-row${done ? " done" : ""}${expanded ? " open" : ""}`} style={{ ["--c" as string]: AREAS[s.area].color }}>
                          <input type="checkbox" checked={done} onChange={(e) => setDone(s, e.target.checked)} aria-label={s.title} />
                          <button type="button" className="ck-t" onClick={() => flip(s.id)} aria-expanded={expanded}>
                            <b>
                              <G>{s.title}</G>
                            </b>
                            <span className="ck-tags">
                              <span className="ck-area">{AREAS[s.area].title}</span>
                              {s.when && <span className="ck-when">{s.when}</span>}
                            </span>
                            {!expanded && <span className="ck-peek">{s.body}</span>}
                          </button>
                          {s.impact ? (
                            <span className="ck-val" title="Rough yearly value">
                              {money(s.impact)}
                              <small>/yr</small>
                            </span>
                          ) : (
                            <span />
                          )}
                          <svg className="ck-chev" viewBox="0 0 16 16" aria-hidden="true" onClick={() => flip(s.id)}>
                            <path d="M4 6l4 4 4-4" />
                          </svg>
                          {expanded && (
                            <div className="ck-body">
                              <p>
                                <G>{s.body}</G>
                              </p>
                              {s.steps && (
                                <ol className="ck-steps">
                                  {s.steps.map((x) => (
                                    <li key={x}>
                                      <G>{x}</G>
                                    </li>
                                  ))}
                                </ol>
                              )}
                              {s.link && (
                                <Link href={s.link.href} className="ck-link">
                                  Open {s.link.label} →
                                </Link>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            {!shown.length && (
              <p className="ck-empty">{status === "todo" && !q && area === "all" ? "Everything is done. Nice work." : "Nothing matches these filters."}</p>
            )}
          </div>
        </GlossaryScope>
      </div>
    </section>
  );
}

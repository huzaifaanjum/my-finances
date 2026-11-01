"use client";

import { useMemo, useState } from "react";
import k from "@/components/knowledge/knowledge.module.css";
import type { ReadMap } from "@/hooks/useKnowledgeProgress";
import { EFFORTS, IDEAS, type IdeaKind } from "@/lib/income/ideas";
import s from "./income.module.css";
import TrackRow, { TextBlock, type Toggle } from "./TrackRow";

const rowId = (id: string) => `rev-i-${id}`;

const KINDS: { id: IdeaKind | "all"; label: string }[] = [
  { id: "all", label: "All ideas" },
  { id: "quick", label: "Quick money" },
  { id: "recurring", label: "Recurring" },
];
const STATUS = [
  { id: "all", label: "Any status" },
  { id: "open", label: "Not done" },
  { id: "done", label: "Done" },
] as const;

/** Every idea, grouped by the effort it takes. */
export default function IdeasTab({ read, toggle }: { read: ReadMap; toggle: Toggle }) {
  const [kind, setKind] = useState<IdeaKind | "all">("all");
  const [status, setStatus] = useState<(typeof STATUS)[number]["id"]>("all");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const shown = IDEAS.filter(
      (i) =>
        (kind === "all" || i.kind === kind) &&
        (status === "all" || (status === "done") === !!read[rowId(i.id)]) &&
        (!q || `${i.title} ${i.what}`.toLowerCase().includes(q)),
    );
    return EFFORTS.map((e) => ({ ...e, ideas: shown.filter((i) => i.effort === e.id) })).filter((e) => e.ideas.length);
  }, [kind, status, query, read]);

  const done = IDEAS.filter((i) => read[rowId(i.id)]).length;

  return (
    <section className={s.sec}>
      <p className={k.note}>
        {IDEAS.length} ideas, {done} done. Earnings are rough guesses for comparing ideas, and many people earn nothing from the ones showing $0. Tick an idea once you have tried it.
      </p>
      <div className={s.filters}>
        <input type="search" className={s.search} placeholder="Search ideas, e.g. YouTube" value={query} aria-label="Search ideas" onChange={(e) => setQuery(e.target.value)} />
        <div className={k.tabs} role="group" aria-label="Type of idea">
          {KINDS.map((x) => (
            <button key={x.id} type="button" className={k.tab} aria-pressed={kind === x.id} onClick={() => setKind(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <div className={k.tabs} role="group" aria-label="Status">
          {STATUS.map((x) => (
            <button key={x.id} type="button" className={k.tab} aria-pressed={status === x.id} onClick={() => setStatus(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className={k.note}>No ideas match.</p>}

      {groups.map((g) => (
        <div key={g.id} className={s.effort}>
          <h2 className="goal-sh">
            {g.label} <span>{g.ideas.length} ideas</span>
          </h2>
          <p className={k.note}>{g.note}</p>
          <div className={s.effortList}>
            {g.ideas.map((i) => (
              <TrackRow
                key={i.id}
                id={rowId(i.id)}
                title={i.title}
                summary={i.what}
                tags={[i.kind === "quick" ? "Quick" : "Recurring", i.earn, `First money: ${i.first}`]}
                steps={i.start}
                read={read}
                toggle={toggle}
              >
                {i.watch && (
                  <TextBlock title="Watch out" className={k.ex}>
                    {i.watch}
                  </TextBlock>
                )}
              </TrackRow>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

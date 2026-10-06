"use client";

import { useMemo, useState } from "react";
import { GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryCategory } from "@/lib/glossary";

type Filter = GlossaryCategory | "all";

const byTitle = (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title);

/** Every term the app explains, searchable and grouped by topic. */
export default function GlossaryView() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hit = (t: (typeof GLOSSARY)[number]) => !q || `${t.title} ${t.what} ${t.why}`.toLowerCase().includes(q);
    return GLOSSARY_CATEGORIES.filter((c) => filter === "all" || c.id === filter)
      .map((c) => ({ ...c, terms: GLOSSARY.filter((t) => t.category === c.id && hit(t)).sort(byTitle) }))
      .filter((c) => c.terms.length);
  }, [query, filter]);

  const shown = sections.reduce((n, s) => n + s.terms.length, 0);

  return (
    <div className="gls">
      <div className="gls-bar">
        <input type="search" placeholder="Search terms, e.g. RRSP or bonus" value={query} aria-label="Search the glossary" onChange={(e) => setQuery(e.target.value)} />
        <div className="gls-chips" role="group" aria-label="Topic">
          {[{ id: "all" as const, label: "All" }, ...GLOSSARY_CATEGORIES].map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <span className="gls-count">
          {shown} of {GLOSSARY.length} terms
        </span>
      </div>

      {sections.length === 0 && <p className="note">No terms match “{query}”.</p>}

      {sections.map((s) => (
        <section key={s.id}>
          <h2 className="ih">{s.label}</h2>
          <div className="gls-grid">
            {s.terms.map((t) => (
              <article key={t.title} className="gls-term">
                <h3>{t.title}</h3>
                <p>{t.what}</p>
                <p className="gls-why">
                  <b>Why it matters</b>
                  {t.why}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

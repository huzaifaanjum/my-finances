"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GROUPS, RULES } from "@/lib/rules";
import { DemoFor } from "@/components/knowledge/demos";
import s from "@/components/knowledge/knowledge.module.css";

type ReadMap = Record<string, number>;
type Filter = "all" | "unread" | "read";

const PASS_KEY = "planner_pass";
const CACHE_KEY = "kn_read";

function headers(): HeadersInit {
  let pass = "";
  try {
    pass = localStorage.getItem(PASS_KEY) ?? "";
  } catch {
    /* storage blocked */
  }
  return { "x-passcode": pass, "Content-Type": "application/json" };
}

function toLogin() {
  try {
    localStorage.removeItem(PASS_KEY);
  } catch {
    /* storage blocked */
  }
  window.location.replace("/login?e=1");
}

export default function KnowledgePage() {
  const [read, setRead] = useState<ReadMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setRead(JSON.parse(cached) as ReadMap);
    } catch {
      /* ignore bad cache */
    }
    (async () => {
      try {
        const r = await fetch("/api/knowledge", { cache: "no-store", headers: headers() });
        if (r.status === 401) return toLogin();
        if (!r.ok) throw new Error("bad status");
        const data = (await r.json()) as { read?: ReadMap };
        if (!cancelled) {
          setRead(data.read ?? {});
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.read ?? {}));
          } catch {
            /* storage blocked */
          }
        }
      } catch {
        if (!cancelled) setError("Could not load your saved progress. Showing the last copy on this device.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(
    async (id: string, value: boolean) => {
      setError("");
      setRead((prev) => {
        const next = { ...prev };
        if (value) next[id] = Date.now();
        else delete next[id];
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {
          /* storage blocked */
        }
        return next;
      });
      try {
        const r = await fetch("/api/knowledge", {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({ id, read: value }),
        });
        if (r.status === 401) return toLogin();
        if (!r.ok) throw new Error("bad status");
      } catch {
        setError("Could not save that change. Check your connection and try again.");
        setRead((prev) => {
          const next = { ...prev };
          if (value) delete next[id];
          else next[id] = Date.now();
          return next;
        });
      }
    },
    [],
  );

  const done = RULES.filter((r) => read[r.id]).length;
  const pct = Math.round((done / RULES.length) * 100);
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

      <div className={s.progress}>
        <div className={s.progressTop}>
          <b>
            {done} of {RULES.length} read
          </b>
          <span>{pct}%</span>
        </div>
        <div className={s.track} role="progressbar" aria-valuemin={0} aria-valuemax={RULES.length} aria-valuenow={done} aria-label="Rules read">
          <span className={s.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={s.tabs}>
        {(["all", "unread", "read"] as const).map((f) => (
          <button key={f} type="button" className={s.tab} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "unread" ? "Not read yet" : "Read"}
          </button>
        ))}
      </div>

      {error && (
        <p className={s.err} role="alert">
          {error}
        </p>
      )}

      {loading && Object.keys(read).length === 0 ? (
        <div className={s.skel} aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="sk-b" style={{ height: 64 }} />
          ))}
        </div>
      ) : (
        GROUPS.map((g) => {
          const items = visible.filter((r) => r.group === g);
          if (items.length === 0) return null;
          return (
            <section key={g} className={s.group}>
              <h2 className={s.groupTitle}>{g}</h2>
              {items.map((r) => {
                const isRead = !!read[r.id];
                return (
                  <details key={r.id} id={r.id} className={`${s.rule} ${isRead ? s.done : ""}`}>
                    <summary className={s.sum}>
                      <input
                        type="checkbox"
                        className={s.check}
                        checked={isRead}
                        aria-label={`Mark "${r.title}" as read`}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => toggle(r.id, e.target.checked)}
                      />
                      <span>
                        <p className={s.rt}>{r.title}</p>
                        <p className={s.rs}>{r.summary}</p>
                      </span>
                      <span className={s.chev} aria-hidden="true">
                        ▶
                      </span>
                    </summary>
                    <div className={s.body}>
                      <div className={s.blk}>
                        <h4>In plain words</h4>
                        <p>{r.plain}</p>
                      </div>
                      <div className={s.blk}>
                        <h4>How it helps you</h4>
                        <p>{r.why}</p>
                      </div>
                      <div className={`${s.blk} ${s.ex}`}>
                        <h4>Example</h4>
                        <p>{r.example}</p>
                      </div>
                      <DemoFor name={r.demo} />
                      <div className={`${s.blk} ${s.you}`}>
                        <h4>For you</h4>
                        <p>{r.you}</p>
                      </div>
                      <button type="button" className={`${s.btn} ${isRead ? s.btnGhost : ""}`} onClick={() => toggle(r.id, !isRead)}>
                        {isRead ? "Mark as not read" : "Mark as read"}
                      </button>
                    </div>
                  </details>
                );
              })}
            </section>
          );
        })
      )}

      <p className={s.foot}>
        General education, not financial or tax advice. Limits and rules are for 2026 and can change, so confirm with the CRA, Revenu Québec or a licensed advisor before you act.
      </p>
    </div>
  );
}

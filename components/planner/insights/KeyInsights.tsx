"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { useVault } from "@/components/payslips/PayslipVault";
import { useForecastSettings } from "@/components/payslips/useForecastSettings";
import { usePensionStart } from "@/components/payslips/usePensionStart";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { SectionHeading } from "@/components/ui/text";
import { money } from "@/lib/format";
import { careerInsights, futureInsights, insuranceInsights, offerInsights, payslipInsights, taxInsights, TOPICS, type KeyInsight, type Tone, type Topic } from "@/lib/keyInsights";
import { retirement } from "@/lib/planner/retirement";
import { taxSummary } from "@/lib/taxSummary";

const TONES: Record<Tone, { label: string; icon: string }> = {
  watch: { label: "To watch", icon: "M8 4v5M8 11.5v.5" },
  good: { label: "Good", icon: "M3.5 8.5l3 3 6-7" },
  info: { label: "Good to know", icon: "M8 7v5M8 4.5v.5" },
};
const ORDER: Tone[] = ["watch", "good", "info"];
const TOPIC_ORDER: Topic[] = ["tax", "career", "payslips", "offer", "insurance", "future"];

/** Columns on wide screens with the fewest empty slots in the last row: 5 → 5, 8 → 4×2, 9 → 3×3, 7 → 4+3. */
function columnsFor(n: number): number {
  if (n <= 5) return Math.max(1, n);
  const gaps = (c: number) => (c - (n % c)) % c;
  return [4, 3, 5].reduce((best, c) => (gaps(c) < gaps(best) ? c : best), 4);
}

/** Key insights from Payslips, My offer and Insurance, in one place. */
export default function KeyInsights() {
  const { plan, setNumber } = usePlanner();
  const vault = useVault();
  const [settings] = useForecastSettings();
  const start = usePensionStart();
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [tone, setTone] = useState<Tone | "all">("all");

  const used = useMemo(() => vault.payslips.filter((p) => !p.excluded), [vault.payslips]);
  const unlocked = vault.status === "unlocked";
  const all = useMemo<KeyInsight[]>(
    () => [
      ...(unlocked && used.length ? payslipInsights(used, settings, start.mine + start.match, plan.net) : []),
      ...taxInsights(taxSummary(plan.state)),
      ...careerInsights(),
      ...offerInsights(),
      ...insuranceInsights(plan.net),
      ...(() => {
        const r = retirement(plan, start);
        return futureInsights(r.total, r.replacement, plan.state.numbers.ret_inf);
      })(),
    ],
    [unlocked, used, settings, start, plan],
  );
  const byTopic = (t: Topic) => all.filter((i) => i.topic === t);
  const shown = all.filter((i) => (topic === "all" || i.topic === topic) && (tone === "all" || i.tone === tone));
  const count = (t: Tone) => all.filter((i) => i.tone === t && (topic === "all" || i.topic === topic)).length;
  const payslipGap = !unlocked || !used.length;

  return (
    <section id="key-insights" className="ki">
      <SectionHeading title="Key insights">What your taxes, your job, your payslips, insurance and retirement mean for your money, gathered from every tab.</SectionHeading>

      <div className="ki-bar">
        <div className="ki-topics" role="group" aria-label="Source">
          <button type="button" aria-pressed={topic === "all"} onClick={() => setTopic("all")}>
            All <em>{all.length}</em>
          </button>
          {TOPIC_ORDER.map((t) => (
            <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)}>
              <i style={{ background: TOPICS[t].color }} />
              {TOPICS[t].title} <em>{t === "payslips" && payslipGap ? "locked" : byTopic(t).length}</em>
            </button>
          ))}
        </div>
        <div className="ps-seg sm" role="group" aria-label="Tone">
          <button type="button" aria-pressed={tone === "all"} onClick={() => setTone("all")}>
            All
          </button>
          {ORDER.map((t) => (
            <button key={t} type="button" aria-pressed={tone === t} onClick={() => setTone(t)}>
              {TONES[t].label} {count(t)}
            </button>
          ))}
        </div>
      </div>

      <GlossaryScope>
        <div className="ki-groups">
          {TOPIC_ORDER.filter((t) => topic === "all" || topic === t).map((t) => {
            const items = shown.filter((i) => i.topic === t).sort((a, b) => ORDER.indexOf(a.tone) - ORDER.indexOf(b.tone));
            const locked = t === "payslips" && payslipGap;
            if (!items.length && !locked) return null;
            return (
              <div key={t} className="ki-grp">
                <div className="ki-gh">
                  <h3>
                    <i style={{ background: TOPICS[t].color }} />
                    {TOPICS[t].title}
                  </h3>
                  <Link href={TOPICS[t].href}>Open {TOPICS[t].title} →</Link>
                </div>
                {locked && (
                  <div className="ki-lockbar">
                    <span>
                      <b>{unlocked ? "No payslips yet." : "Locked."}</b>{" "}
                      {unlocked ? "Upload a payslip to see your next deposit, tax rate and pension here." : "Payslip insights come from your encrypted payslips; unlock them to see them here."}
                    </span>
                    <Link href="/payslips" className="ps-btn sm">
                      {unlocked ? "Upload" : "Unlock"}
                    </Link>
                  </div>
                )}
                {items.length > 0 && (
                <div className="ki-grid" style={{ ["--cols" as string]: columnsFor(items.length) }}>
                  {items.map((i) => (
                    <article key={i.id} className={`ki-card ${i.tone}`}>
                      <span className="ki-tone">
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d={TONES[i.tone].icon} />
                        </svg>
                        {TONES[i.tone].label}
                      </span>
                      <h4>
                        <G>{i.title}</G>
                      </h4>
                      <b>{i.value}</b>
                      <p>
                        <G>{i.body}</G>
                      </p>
                      {i.setNet !== undefined && (
                        <button type="button" className="ps-btn sm" onClick={() => setNumber("net", i.setNet!)}>
                          Use {money(i.setNet)} in my plan
                        </button>
                      )}
                    </article>
                  ))}
                </div>
                )}
              </div>
            );
          })}
          {!shown.length && !(topic === "payslips" && payslipGap) && <p className="ki-empty">Nothing here with these filters.</p>}
        </div>
      </GlossaryScope>
    </section>
  );
}

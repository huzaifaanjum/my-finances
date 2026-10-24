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
import { insuranceInsights, offerInsights, payslipInsights, TOPICS, type KeyInsight, type Tone, type Topic } from "@/lib/keyInsights";

const TONES: Record<Tone, { label: string; icon: string }> = {
  watch: { label: "To watch", icon: "M8 4v5M8 11.5v.5" },
  good: { label: "Good", icon: "M3.5 8.5l3 3 6-7" },
  info: { label: "Good to know", icon: "M8 7v5M8 4.5v.5" },
};
const ORDER: Tone[] = ["watch", "good", "info"];
const TOPIC_ORDER: Topic[] = ["payslips", "offer", "insurance"];

/** Columns on wide screens that leave no half-empty last row: 9 cards → 3×3, 8 → 4×2. */
const columnsFor = (n: number) => (n % 4 === 0 ? 4 : n % 3 === 0 ? 3 : n % 4 >= 2 || n < 4 ? 4 : 3);

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
      ...offerInsights(),
      ...insuranceInsights(plan.net),
    ],
    [unlocked, used, settings, start, plan.net],
  );
  const byTopic = (t: Topic) => all.filter((i) => i.topic === t);
  const shown = all.filter((i) => (topic === "all" || i.topic === topic) && (tone === "all" || i.tone === tone));
  const count = (t: Tone) => all.filter((i) => i.tone === t && (topic === "all" || i.topic === topic)).length;
  const payslipGap = !unlocked || !used.length;

  return (
    <section id="key-insights" className="ki">
      <SectionHeading title="Key insights">What your payslips, offer letter and insurance mean for your money, gathered from every tab.</SectionHeading>

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
                <div className="ki-grid" style={{ ["--cols" as string]: columnsFor(items.length + (locked ? 1 : 0)) }}>
                  {locked && (
                    <article className="ki-card ki-locked">
                      <span className="ki-tone">
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" />
                          <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" />
                        </svg>
                        {unlocked ? "No payslips yet" : "Locked"}
                      </span>
                      <h4>{unlocked ? "Upload a payslip to see these" : "Payslip insights are locked"}</h4>
                      <p>
                        {unlocked
                          ? "Your next deposit, plan vs payslip, marginal tax rate, the late-year bump and your pension appear here once a payslip is uploaded."
                          : "They are worked out from your encrypted payslips, so they appear once you unlock the Payslips tab with its password."}
                      </p>
                      <Link href="/payslips" className="ps-btn sm primary">
                        {unlocked ? "Upload on Payslips" : "Unlock on Payslips"}
                      </Link>
                    </article>
                  )}
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
              </div>
            );
          })}
          {!shown.length && !(topic === "payslips" && payslipGap) && <p className="ki-empty">Nothing here with these filters.</p>}
        </div>
      </GlossaryScope>
    </section>
  );
}

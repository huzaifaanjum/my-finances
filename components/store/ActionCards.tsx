"use client";

import Link from "next/link";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import type { LimitMap } from "@/hooks/useBenefitLimits";
import { limitValue } from "@/lib/benefits";
import { money } from "@/lib/format";
import { payMarginal } from "@/lib/pay";

type Kind = "health" | "dental" | "vision" | "lsa";
const KIND: Record<Kind, string> = { health: "Extended health", dental: "Dental", vision: "Vision", lsa: "Spending account" };

interface Action {
  id: string;
  kind: Kind;
  value: number;
  /** "a plan year", "every 24 months", ... */
  per: string;
  title: string;
  steps: string[];
  when: string;
  link?: { href: string; label: string };
}

/** Claims to make to get the most out of your benefits, biggest dollar value first, as a collapsible row of cards you scroll sideways. */
export default function ActionCards({ limits, lsaLeft, onShop }: { limits: LimitMap; lsaLeft: number; onShop: (category: string) => void }) {
  const v = (id: string) => limitValue(id, limits) ?? 0;
  const lsaTax = payMarginal(new Date().getFullYear()).rate;

  const actions: Action[] = [
    {
      id: "physio",
      kind: "health",
      value: v("eh-physio"),
      per: "a plan year",
      title: "Book physio for any running aches",
      steps: ["Book a physio or athletic therapist; ask Manulife if they want a doctor's note first", "Paid at 100%: about 30 sessions at $100"],
      when: "Resets April 1",
    },
    {
      id: "massage",
      kind: "health",
      value: v("eh-massage"),
      per: "a plan year",
      title: "A monthly massage with an RMT",
      steps: ["Pick a registered massage therapist; the receipt needs their number", "Once a month at about $110 still leaves room"],
      when: "Resets April 1",
    },
    {
      id: "osteo-acu",
      kind: "health",
      value: v("eh-osteo") + v("eh-acu"),
      per: "a plan year",
      title: "Try an osteopath and acupuncture",
      steps: ["Each has its own $1,500, separate from physio and massage", "Worth trying for back, neck or recovery after long runs"],
      when: "Resets April 1",
    },
    {
      id: "dental",
      kind: "dental",
      value: v("dent-max"),
      per: "a plan year",
      title: "Two cleanings and checkups",
      steps: ["Book every 6 months; cleanings, fillings and root canals are paid at 100%", "Ask for a cost estimate before any crown, paid at 60%"],
      when: "Resets April 1",
    },
    {
      id: "psych",
      kind: "health",
      value: v("eh-psych"),
      per: "a plan year",
      title: "Therapy sessions for stress or anything else",
      steps: ["A psychologist, psychotherapist or social worker all count", "About 8 to 12 sessions at typical rates"],
      when: "Resets April 1",
    },
    {
      id: "chiro",
      kind: "health",
      value: v("eh-chiro"),
      per: "a plan year",
      title: "See a chiropractor for back or neck pain",
      steps: ["Covered on top of physio and massage", "Includes up to $100 of their x-rays"],
      when: "Resets April 1",
    },
    {
      id: "dietitian",
      kind: "health",
      value: v("eh-dietitian"),
      per: "a plan year",
      title: "A dietitian for training and food",
      steps: ["Build a meal plan around your running or weight goals", "A first visit plus follow-ups fits easily"],
      when: "Resets April 1",
    },
    {
      id: "lsa",
      kind: "lsa",
      value: lsaLeft,
      per: "left this plan year",
      title: "Spend the spending account",
      steps: [`Running shoes, a watch, a gym or a course; about ${money(lsaLeft * (1 - lsaTax))} after tax`, "Carries forward one year, then it's lost"],
      when: "By March 31",
      link: { href: "/store/wishlist", label: "Plan it in your wishlist" },
    },
    {
      id: "glasses",
      kind: "vision",
      value: v("eh-eye-exam") + v("eh-glasses"),
      per: "every 24 months",
      title: "Eye exam, then new glasses or contacts",
      steps: [`The exam (${money(v("eh-eye-exam"))}) gives you the prescription you need`, `Then up to ${money(v("eh-glasses"))} for glasses, prescription sunglasses or contacts`],
      when: "Every 24 months",
      link: { href: "#shop-vision", label: "See glasses in the Store" },
    },
    {
      id: "orthotics",
      kind: "health",
      value: v("eh-orthotics"),
      per: "a plan year",
      title: "Custom orthotics for running",
      steps: ["A podiatrist visit to get the note is covered too", "Casted, custom-made insoles only; store-bought ones don't count"],
      when: "Resets April 1",
    },
    {
      id: "flu",
      kind: "health",
      value: v("drug-flu"),
      per: "a year",
      title: "Get your flu shot at the pharmacy",
      steps: ["Show your drug card and it's paid on the spot", "No appointment needed at most pharmacies"],
      when: "Every fall",
    },
  ];

  const list = actions.filter((a) => a.value > 0).sort((a, b) => b.value - a.value);
  const yearly = list.filter((a) => /year/.test(a.per)).reduce((t, a) => t + a.value, 0);

  return (
    <details className="st-acts">
      <summary>
        <h2>Make the most of it</h2>
        <span>
          {list.length} claims worth up to <b>{money(yearly)}</b> a plan year
        </span>
        <i aria-hidden="true" />
      </summary>
      <p className="st-acts-sub">
        <G>Biggest wins first. Health limits are paid at 100% and reset April 1, the start of each plan year.</G>
      </p>
      <div className="st-acts-row" role="list">
        {list.map((a, i) => (
          <article key={a.id} className={`st-act ${a.kind}`} role="listitem">
            <GlossaryScope>
              <div className="st-act-top">
                <span className="st-act-kind">{KIND[a.kind]}</span>
                <span className="st-act-n">#{i + 1}</span>
              </div>
              <div className="st-act-val">
                <b>{money(a.value)}</b>
                <small>{a.per}</small>
              </div>
              <h3>
                <G>{a.title}</G>
              </h3>
              <ul>
                {a.steps.map((s) => (
                  <li key={s}>
                    <G>{s}</G>
                  </li>
                ))}
              </ul>
              <div className="st-act-f">
                <span>{a.when}</span>
                {a.link &&
                  (a.link.href.startsWith("#shop-") ? (
                    <button type="button" onClick={() => onShop(a.link!.href.slice(6))}>
                      {a.link.label} →
                    </button>
                  ) : (
                    <Link href={a.link.href}>{a.link.label} →</Link>
                  ))}
              </div>
            </GlossaryScope>
          </article>
        ))}
      </div>
    </details>
  );
}

"use client";

import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlanner } from "@/components/providers/PlannerProvider";
import Checkbox from "@/components/ui/Checkbox";
import MoneyInput from "@/components/ui/MoneyInput";
import SeeAlso from "@/components/ui/SeeAlso";
import { COLOR } from "@/lib/colors";
import { money, percent } from "@/lib/format";
import { payMarginal } from "@/lib/pay";
import { useEffect, useState } from "react";
import { GOV_NAME, latestTuitionCarry, paymentsLeft, type FiledReturn } from "@/lib/taxHistory";
import { airCanadaSlip, claimValue, estimateReturn, flexSlip, NO_CLAIMS, SLIP_FIELDS, type Claims, type Slip } from "@/lib/tax2026";

/** Things you can claim, in the order most likely to matter for you. */
const CLAIMS: { key: keyof Claims; title: string; body: string; when?: string; hint?: string; initial?: number }[] = [
  {
    key: "fhsa",
    title: "FHSA contribution",
    body: "Money you put in a First Home Savings Account is taken off your income. Up to $8,000 for 2026, but only if the account is open by Dec 31.",
    when: "Open by Dec 31",
    hint: "Up to $8,000",
  },
  {
    key: "rrsp",
    title: "RRSP contribution",
    body: "Taken off your income too, up to your room from CRA My Account. Contributions made up to Mar 1, 2027 count for 2026.",
    when: "By Mar 1, 2027",
    hint: "Up to your room",
  },
  {
    key: "moving",
    title: "Moving expenses",
    body: "If you moved at least 40 km closer to work to start at Air Canada (for example from the Quebec City area to Montreal): movers, travel, temporary stays, lease cancellation. Only up to what you earned at the new job this year.",
    hint: "Keep the receipts",
  },
  {
    key: "medical",
    title: "Medical and dental costs",
    body: "Anything your plans didn't pay: dentist, glasses, prescriptions, therapy, plus the dental premiums taken from your pay. Only the part above 3% of your income counts, so it helps in a big year.",
    hint: "Your dental premiums so far: about $187",
  },
  {
    key: "donations",
    title: "Donations",
    body: "Gifts to registered charities, with official receipts. Above $200 the credit is much bigger, so combine a couple of years if you give a little.",
  },
  {
    key: "tuition",
    title: "Tuition and exam fees",
    body: "Courses at a college or university, or a professional certification exam, with a T2202 / RL-8 slip. Half the fees come back through the Canada training credit, up to your limit, even if you owe no tax.",
  },
  {
    key: "homeOffice",
    title: "Working from home",
    body: "Only if Air Canada signs a form saying you had to work from home (T2200 and TP-64.3): a share of rent, electricity and internet.",
    hint: "Ask HR for the forms",
  },
  {
    key: "loanInterest",
    title: "Student loan interest",
    body: "Interest paid on a government student loan in 2026.",
  },
];

/** Your 2026 return: the refund to expect from both jobs, and what each claim would add to it. */
export default function TaxView() {
  const { state, setTaxValue, setNumber } = usePlanner();
  const t = state.tax;
  // from CRA My Account, saved with your plan
  const rrspRoom = t["cra.rrsp"] ?? 0;
  const hasFhsa = !!t["cra.fhsaOpen"];
  const tfsaRoom = state.numbers.tfsa;
  const payments = state.govPayments;
  const left = payments.map((p) => ({ p, ...paymentsLeft(p) }));
  const leftTotal = left.reduce((x, l) => x + l.total, 0);
  const marginal = payMarginal(2026).rate;

  // slips: the estimate, with any T4 figure you typed in on top
  const estimates: Record<"flex" | "ac", Slip> = { flex: flexSlip(), ac: airCanadaSlip() };
  const slip = (id: "flex" | "ac"): Slip => Object.fromEntries(SLIP_FIELDS.map((f) => [f.key, t[`${id}.${f.key}`] ?? estimates[id][f.key]])) as unknown as Slip;
  const slips = [slip("flex"), slip("ac")];
  // tuition fees carried forward on your past returns apply automatically unless you switch them off
  const qcCarry = latestTuitionCarry(state.taxHistory, "qc");
  const fedCarry = latestTuitionCarry(state.taxHistory, "fed");
  const useCarry = !t["carry.off"];
  const claims = {
    ...(Object.fromEntries(Object.keys(NO_CLAIMS).map((k) => [k, t[k] ?? 0])) as unknown as Claims),
    qcTuitionCarry: useCarry ? qcCarry.amount : 0,
    fedTuitionCarry: useCarry ? (t["fedTuitionCarry"] ?? fedCarry.amount) : 0,
    ctcLimit: t["cra.ctc"] ?? 0,
  };
  const base = estimateReturn(slips, { ...NO_CLAIMS, qcTuitionCarry: claims.qcTuitionCarry, fedTuitionCarry: claims.fedTuitionCarry, ctcLimit: claims.ctcLimit });
  const carryValue = estimateReturn(slips, claims).refund - estimateReturn(slips, { ...claims, qcTuitionCarry: 0, fedTuitionCarry: 0 }).refund;
  const [tab, setTabState] = useState<Tab>("overview");
  useEffect(() => {
    try {
      const v = localStorage.getItem("tx_tab");
      if (v === "fed" || v === "qc" || v === "overview") setTabState(v);
    } catch {}
  }, []);
  const setTab = (v: Tab) => {
    setTabState(v);
    try {
      localStorage.setItem("tx_tab", v);
    } catch {}
  };
  const r = estimateReturn(slips, claims);
  const fromClaims = r.refund - base.refund;
  const withheld = r.fedWithheld + r.qcWithheld;
  const owed = r.fedTax + r.qcTax;
  const overpaid = r.overpaid.qpp + r.overpaid.ei + r.overpaid.qpip;
  const best = estimateReturn(slips, { ...claims, fhsa: 8_000, rrsp: rrspRoom });
  const edited = (id: string) => SLIP_FIELDS.some((f) => t[`${id}.${f.key}`] !== undefined);

  const employers = [
    { id: "flex" as const, name: "FlexSpring Solutions", when: "Jan 1 to Aug 17", how: "payslips to June 30, then estimated from your net pay" },
    { id: "ac" as const, name: "Air Canada", when: "Aug 17 to Dec 31", how: "payslips to Oct 30, then November and December projected" },
  ];

  return (
    <GlossaryScope>
      <div className="tx">
        <div className="ps-tabs" role="tablist" aria-label="Tax sections">
          <button type="button" role="tab" aria-selected={tab === "overview"} onClick={() => setTab("overview")}>
            Overview
            <small>your 2026 return, so far</small>
          </button>
          <button type="button" role="tab" aria-selected={tab === "fed"} onClick={() => setTab("fed")}>
            Federal
            <small>CRA · {yearsLabel(state.taxHistory, "fed")}</small>
          </button>
          <button type="button" role="tab" aria-selected={tab === "qc"} onClick={() => setTab("qc")}>
            Quebec
            <small>Revenu Québec · {yearsLabel(state.taxHistory, "qc")}</small>
          </button>
        </div>

        {tab === "overview" ? (
          <>
        <section className="ph2 tx-hero">
          <div className="ph2-main">
            <div className="ph2-lead">
              <span>2026 tax year · Jan 1 to Dec 31 · file by Apr 30, 2027</span>
              <b className={r.refund < 0 ? "neg" : undefined}>
                {r.refund >= 0 ? money(r.refund) : `−${money(-r.refund)}`}
              </b>
              <p>
                {r.refund >= 0 ? "estimated refund" : "estimated balance to pay"}: <strong>{money(r.fedRefund)}</strong> federal and <strong>{money(r.qcRefund)}</strong> Quebec
                {carryValue > 0.5 && (
                  <>
                    , including <strong className="pos">{money(carryValue)}</strong> from tuition carried forward
                  </>
                )}
                {fromClaims > 0.5 && (
                  <>
                    {carryValue > 0.5 ? " and " : ", including "}
                    <strong className="pos">{money(fromClaims)}</strong> from your claims below
                  </>
                )}
                .
              </p>
            </div>
            <dl className="ph2-facts">
              <div>
                <dt>Income in 2026</dt>
                <dd>{money(r.gross)}</dd>
                <small>from two employers</small>
              </div>
              <div>
                <dt>Tax already taken</dt>
                <dd>{money(withheld)}</dd>
                <small>from your pay, both jobs</small>
              </div>
              <div>
                <dt>Tax you owe</dt>
                <dd>{money(owed)}</dd>
                <small>
                  {percent(owed / (r.gross || 1))} of income · {Math.round(marginal * 100)}% on your next dollar
                </small>
              </div>
            </dl>
          </div>
          <div className="ph2-split">
            <div className="ph2-sh">
              <h2>Why there&rsquo;s a refund</h2>
            </div>
            <ul className="tx-why">
              <li>
                <span>Tax taken from your pay</span>
                <b>{money(withheld)}</b>
              </li>
              <li>
                <span>Tax you owe on {money(r.netIncome)} of income, after your pension and claims</span>
                <b>−{money(owed)}</b>
              </li>
              {overpaid > 0.5 && (
                <li>
                  <span>QPP, EI and QPIP taken twice by the two employers</span>
                  <b>+{money(overpaid)}</b>
                </li>
              )}
              <li className="tot">
                <span>{r.refund >= 0 ? "Back to you" : "You pay"}</span>
                <b>{money(Math.abs(r.refund))}</b>
              </li>
            </ul>
          </div>
        </section>

        <section className="tx-plain">
          <h2>In plain words</h2>
          <ol>
            <li>
              <b>Your employers already paid tax for you.</b> Every paycheque, FlexSpring and Air Canada sent part of your pay to the governments: {money(withheld)} so far
              this year, counting to December.
            </li>
            <li>
              <b>Your return works out what you really owe.</b> On your {money(r.gross)} of 2026 income, after your pension and the credits you carry from past years, that
              is about {money(owed)}.
            </li>
            <li>
              <b>The difference comes back.</b> {r.refund >= 0 ? `They took about ${money(r.refund)} more than you owe, so that comes back as a refund` : `They took about ${money(-r.refund)} less than you owe, so you pay that`}{" "}
              after you file in spring 2027. Putting money in an FHSA or RRSP before the deadlines makes it bigger.
            </li>
          </ol>
        </section>

        {(qcCarry.amount > 0 || fedCarry.amount > 0 || t["fedTuitionCarry"]) && (
          <section className="tx-sec">
            <h2 className="goal-sh">
              Carried forward <span>credits from past returns that lower your 2026 tax</span>
            </h2>
            <div className="tx-carry">
              {qcCarry.amount > 0 && (
                <div>
                  <span>Quebec tuition fees, unused</span>
                  <b>{money(qcCarry.amount, 2)}</b>
                  <small>
                    From your {qcCarry.year} notice. At Quebec&rsquo;s 8% rate it takes up to <strong>{money(qcCarry.amount * 0.08)}</strong> off your Quebec tax. It never expires.
                  </small>
                </div>
              )}
              <div>
                <span>Federal tuition amount, unused</span>
                <MoneyInput label="Federal unused tuition amount" value={t["fedTuitionCarry"] ?? fedCarry.amount} step={100} onChange={(n) => setTaxValue("fedTuitionCarry", n || null)} />
                <small>
                  {fedCarry.year ? `From your ${fedCarry.year} CRA notice. ` : "On your CRA notice of assessment. "}At the federal 14% rate (less Quebec&rsquo;s abatement) it takes up to{" "}
                  <strong>{money((t["fedTuitionCarry"] ?? fedCarry.amount) * 0.14 * 0.835)}</strong> off. Federally it must be used as soon as you owe tax.
                </small>
              </div>
              <div className="tx-carry-v">
                <span>Worth in 2026</span>
                <b className="pos">+{money(carryValue)}</b>
                <Checkbox label="Count it in the estimate" checked={useCarry} onChange={(v) => setTaxValue("carry.off", v ? null : 1)} />
              </div>
            </div>
          </section>
        )}

        <section className="tx-sec">
          <h2 className="goal-sh">
            Your room <span>from CRA My Account; update it when it changes</span>
          </h2>
          <div className="tx-room">
            <div>
              <span>RRSP room for 2026</span>
              <MoneyInput label="RRSP room for 2026" value={rrspRoom} step={100} onChange={(n) => setTaxValue("cra.rrsp", n)} />
              <small>The most you can deduct for 2026. Contributions up to Mar 1, 2027 count.</small>
            </div>
            <div className={hasFhsa ? undefined : "warn"}>
              <span>FHSA</span>
              <Checkbox label="I have an FHSA" checked={hasFhsa} onChange={(v) => setTaxValue("cra.fhsaOpen", v ? 1 : null)} />
              <small>
                {hasFhsa
                  ? "$8,000 of room for 2026; unused room carries forward one year."
                  : "CRA shows no FHSA yet. Open one by Dec 31 to get $8,000 of room for 2026; open it later and 2026's room is lost."}
              </small>
            </div>
            <div>
              <span>TFSA room</span>
              <MoneyInput label="TFSA room" value={tfsaRoom} step={500} onChange={(n) => setNumber("tfsa", n)} />
              <small>No refund for TFSA deposits, but growth and withdrawals are tax-free. As of Jan 1, 2026.</small>
            </div>
          </div>
          {rrspRoom > 0 && (
            <div className="tx-best">
              <div>
                <b>Up to {money(best.refund)} back</b>
                <span>
                  if you put {money(8_000)} in an FHSA {hasFhsa ? "" : "(opened by Dec 31) "}and use all {money(rrspRoom)} of your RRSP room: {money(8_000 + rrspRoom)} in total. That is a ceiling; any part of it
                  still helps.
                </span>
              </div>
              {(claims.fhsa !== 8_000 || claims.rrsp !== rrspRoom) && (
                <button
                  type="button"
                  className="ps-btn"
                  onClick={() => {
                    setTaxValue("fhsa", 8_000);
                    setTaxValue("rrsp", rrspRoom);
                  }}
                >
                  Fill in both
                </button>
              )}
            </div>
          )}
        </section>

        {payments.length > 0 && (
          <section className="tx-sec">
            <h2 className="goal-sh">
              Payments from governments <span>separate from your refund; {money(leftTotal, 2)} still to come</span>
            </h2>
            <ul className="tx-pay">
              {left.map(({ p, count, total }) => (
                <li key={p.name}>
                  <div>
                    <b>{p.name}</b>
                    <small>
                      {p.gov === "qc" ? "Revenu Québec" : "CRA"} · {money(p.amount, 2)} {p.per === "month" ? "a month" : p.per === "quarter" ? "every 3 months" : "once"} ·{" "}
                      {new Date(`${p.from}T12:00:00`).toLocaleDateString("en-CA", { month: "short", year: "numeric" })} to{" "}
                      {new Date(`${p.to}T12:00:00`).toLocaleDateString("en-CA", { month: "short", year: "numeric" })}
                      {p.basedOn ? ` · set by your ${p.basedOn} income` : ""}
                    </small>
                    {p.notes?.map((n) => (
                      <p key={n}>{n}</p>
                    ))}
                  </div>
                  <span>
                    <b>{money(total, 2)}</b>
                    <small>
                      {count} payment{count === 1 ? "" : "s"} left
                    </small>
                  </span>
                </li>
              ))}
            </ul>
            <p className="tx-note">
              From July 2027 these are worked out from your 2026 income, about {money(r.netIncome)}. Both phase out well below that, so expect them to stop after June 2027 unless your
              income drops.
            </p>
          </section>
        )}

        <section className="tx-sec">
          <h2 className="goal-sh">
            Raise your refund <span>type what you spent or put in; each line shows what it adds</span>
          </h2>
          <ul className="tx-claims">
            {CLAIMS.map((c) => {
              const v = claims[c.key];
              const adds = v ? claimValue(slips, claims, c.key) : claimValue(slips, { ...claims, [c.key]: 1000 }, c.key);
              return (
                <li key={c.key} className={v ? "on" : undefined}>
                  <div className="tx-c-main">
                    <b>
                      <G>{c.title}</G>
                      {c.when && <em>{c.when}</em>}
                    </b>
                    <p>
                      <G>{c.body}</G>
                    </p>
                  </div>
                  <div className="tx-c-in">
                    <MoneyInput
                      label={c.title}
                      value={v}
                      step={100}
                      max={c.key === "rrsp" && rrspRoom ? rrspRoom : c.key === "fhsa" ? 16_000 : undefined}
                      onChange={(n) => setTaxValue(c.key, n || null)}
                    />
                    <small>
                      {c.key === "rrsp" && rrspRoom
                        ? `Your room: ${money(rrspRoom)}`
                        : c.key === "fhsa" && !hasFhsa
                          ? "Open the account first"
                          : c.key === "tuition" && claims.ctcLimit
                            ? `Training credit limit: ${money(claims.ctcLimit)}`
                            : c.hint}
                    </small>
                  </div>
                  <div className="tx-c-out">
                    {v ? (
                      <>
                        <b className={adds > 0.5 ? "pos" : undefined}>+{money(adds)}</b>
                        <small>{adds > 0.5 ? "back" : "below the threshold"}</small>
                      </>
                    ) : (
                      <>
                        <b className="mute">+{money(adds)}</b>
                        <small>per $1,000</small>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="tx-note">
            FHSA, RRSP, moving and home office come off your income, so they save tax at your top rate; the more you claim, the lower that rate gets. Medical, donations, tuition and loan
            interest are credits, and medical only counts above 3% of your income.
          </p>
        </section>

        <section className="tx-sec">
          <h2 className="goal-sh">
            Your 2026 income <span>what each employer will put on your T4 and RL-1</span>
          </h2>
          <div className="tx-emp">
            {employers.map((e) => {
              const s = slip(e.id);
              return (
                <article key={e.id} className="jo-card">
                  <div className="jo-card-h">
                    <div>
                      <h2>{e.name}</h2>
                      <p>
                        {e.when} · {edited(e.id) ? "with figures you entered" : e.how}
                      </p>
                    </div>
                  </div>
                  <dl className="tx-slip">
                    <div className="big">
                      <dt>Income</dt>
                      <dd>{money(s.gross)}</dd>
                    </div>
                    <div>
                      <dt>Federal tax taken</dt>
                      <dd>{money(s.fedTax)}</dd>
                    </div>
                    <div>
                      <dt>Quebec tax taken</dt>
                      <dd>{money(s.qcTax)}</dd>
                    </div>
                    <div>
                      <dt>QPP, EI, QPIP</dt>
                      <dd>{money(s.qpp + s.ei + s.qpip)}</dd>
                    </div>
                    {s.rpp > 0 && (
                      <div>
                        <dt>Pension contributions</dt>
                        <dd>{money(s.rpp)}</dd>
                      </div>
                    )}
                  </dl>
                  <details className="tx-edit">
                    <summary>Enter the real figures from your T4 and RL-1</summary>
                    <div className="tx-edit-g">
                      {SLIP_FIELDS.map((f) => (
                        <label key={f.key}>
                          <span>{f.label}</span>
                          <MoneyInput label={f.label} value={Math.round(s[f.key] * 100) / 100} step={10} onChange={(n) => setTaxValue(`${e.id}.${f.key}`, n)} />
                        </label>
                      ))}
                    </div>
                    {edited(e.id) && (
                      <button type="button" className="bd-link" onClick={() => SLIP_FIELDS.forEach((f) => setTaxValue(`${e.id}.${f.key}`, null))}>
                        Go back to the estimate
                      </button>
                    )}
                  </details>
                </article>
              );
            })}
          </div>
        </section>

        <section className="tx-sec">
          <h2 className="goal-sh">Dates</h2>
          <ul className="tx-dates">
            <li>
              <b>Dec 31, 2026</b>
              <span>Last day to open an FHSA and contribute for 2026, and to make donations count for 2026.</span>
            </li>
            {left
              .filter((l) => l.p.next)
              .map((l) => (
                <li key={l.p.name}>
                  <b>{new Date(`${l.p.next}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</b>
                  <span>
                    {money(l.p.amount, 2)} {l.p.name}.
                  </span>
                </li>
              ))}
            <li>
              <b>End of February 2027</b>
              <span>Your T4 and RL-1 slips arrive from both employers. Enter them above to firm up the estimate.</span>
            </li>
            <li>
              <b>Mar 1, 2027</b>
              <span>Last day for RRSP contributions that count for 2026.</span>
            </li>
            <li>
              <b>Apr 30, 2027</b>
              <span>File both returns (federal and Quebec) and pay anything owing.</span>
            </li>
          </ul>
        </section>

          </>
        ) : (
          <GovReturns key={tab} gov={tab} history={state.taxHistory} />
        )}

        <p className="tx-note">
          An estimate from your payslips and 2026 tax rules, not tax advice. It leaves out credits that don&rsquo;t apply at your income, and anything not entered above. Your RRSP room and FHSA
          status are on CRA My Account.
        </p>

        <div className="seealso-row">
          <SeeAlso href="/payslips" label="Payslips">
            The tax taken from each Air Canada paycheque, line by line
          </SeeAlso>
          <SeeAlso href="/recommendations" label="Action plan">
            Tax steps on your checklist: FHSA, RRSP room, My Account
          </SeeAlso>
        </div>
      </div>
    </GlossaryScope>
  );
}

type Tab = "overview" | "fed" | "qc";

const yearsLabel = (history: FiledReturn[], gov: "fed" | "qc") => {
  const ys = history.filter((r) => r.gov === gov).map((r) => r.year);
  return ys.length ? `${ys.length} year${ys.length === 1 ? "" : "s"} filed` : "none on file yet";
};

/** What each line of a notice means, in a sentence. */
const LINES: { key: keyof FiledReturn; label: string; meaning: string }[] = [
  { key: "income", label: "Total income", meaning: "Everything you earned that year from jobs and scholarships, before anything is taken off." },
  { key: "netIncome", label: "Net income", meaning: "Total income minus a few deductions, such as part of your QPP and the deduction for workers. Benefits like the solidarity credit are based on this." },
  { key: "taxableIncome", label: "Taxable income", meaning: "The amount the tax rates are applied to." },
  { key: "taxPayable", label: "Tax you owed", meaning: "Tax on your taxable income, minus your credits (the basic personal amount, tuition and others). $0 means your credits covered all of it." },
  { key: "withheld", label: "Tax taken from your pay", meaning: "What your employers already sent in for you during the year." },
  { key: "tuitionCarry", label: "Tuition left to use", meaning: "Tuition you paid but haven't used yet. It carries to later years and lowers your tax then." },
];

/** A plain summary of one return, built from its numbers. */
function story(r: FiledReturn): string {
  const gov = r.gov === "qc" ? "Quebec" : "federal";
  const parts: string[] = [];
  if (r.income !== undefined) parts.push(r.income === 0 ? `You had no Canadian income on this ${gov} return.` : `You earned ${money(r.income)} in ${r.year}.`);
  if (r.taxPayable !== undefined && r.withheld !== undefined) {
    if (r.taxPayable === 0 && r.withheld > 0) parts.push(`Your credits covered all the ${gov} tax, so you owed nothing, and every dollar your employers took (${money(r.withheld, 2)}) came back.`);
    else if (r.taxPayable === 0) parts.push(`You owed no ${gov} tax.`);
    else parts.push(`You owed ${money(r.taxPayable, 2)} of ${gov} tax, and your employers had already taken ${money(r.withheld, 2)}.`);
  }
  if (r.refund > 0) parts.push(`Result: a refund of ${money(r.refund, 2)}.`);
  else if (r.refund < 0) parts.push(`Result: you paid ${money(-r.refund, 2)}.`);
  else parts.push("Result: nothing to pay and nothing back.");
  if (r.tuitionCarry) parts.push(`${money(r.tuitionCarry, 2)} of tuition was left over for later years.`);
  return parts.join(" ");
}

/** All returns filed with one government, one sub-tab per year. */
function GovReturns({ gov, history }: { gov: "fed" | "qc"; history: FiledReturn[] }) {
  const list = history.filter((r) => r.gov === gov).sort((a, b) => b.year - a.year);
  const [year, setYear] = useState<number | null>(null);
  const r = list.find((x) => x.year === year) ?? list[0];
  if (!r) return <p className="tx-note">No {GOV_NAME[gov]} returns on file yet. Paste the details from a notice of assessment and they will be stored here.</p>;
  const total = list.reduce((t, x) => t + x.refund, 0);
  const shown = LINES.filter((l) => r[l.key] !== undefined);

  return (
    <div className="tx-gov">
      <div className="tx-gov-bar">
        <div className="ps-seg" role="tablist" aria-label={`${GOV_NAME[gov]} years`}>
          {list.map((x) => (
            <button key={x.year} type="button" role="tab" aria-pressed={x.year === r.year} aria-selected={x.year === r.year} onClick={() => setYear(x.year)}>
              {x.year}
            </button>
          ))}
        </div>
        <span>
          {gov === "qc" ? "Quebec has" : "The federal government has"} sent you <b className="pos">{money(total, 2)}</b> over {list.length} year{list.length === 1 ? "" : "s"}
        </span>
      </div>

      <section className="tx-year">
        <div className="tx-year-h">
          <span>
            {r.year} {gov === "qc" ? "Quebec return · Revenu Québec" : "federal return · CRA"}
          </span>
          <b className={r.refund >= 0 ? "pos" : "neg"}>{r.refund > 0 ? `${money(r.refund, 2)} back` : r.refund < 0 ? `${money(-r.refund, 2)} paid` : "No refund, nothing owed"}</b>
          <p>{story(r)}</p>
        </div>

        {shown.length > 0 && (
          <dl className="tx-lines">
            {shown.map((l) => (
              <div key={l.key}>
                <dt>
                  <b>{l.label}</b>
                  <small>{l.meaning}</small>
                </dt>
                <dd>{money(r[l.key] as number, 2)}</dd>
              </div>
            ))}
          </dl>
        )}

        {r.unclaimed ? (
          <p className="tx-flag">
            <b>Credit left unclaimed: {money(r.unclaimed, 2)}.</b> It was available this year but not used. It carries forward, so it isn&rsquo;t lost; the Overview tab counts it in
            your 2026 estimate.
          </p>
        ) : null}

        {r.notes?.length ? (
          <div className="tx-year-n">
            <h3>Worth knowing</h3>
            <ul>
              {r.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}

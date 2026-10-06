import { SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { KeyValue, LegendRow, Note, SectionHeading } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { EMPLOYER_HEALTH, OFFER } from "@/lib/offer";

const { salary } = OFFER;
const aip = salary * OFFER.aipTarget;
const aipMax = salary * OFFER.aipMax;
const signing = OFFER.signing.reduce((t, s) => t + s.amount, 0);
const match = salary * OFFER.pensionMax;
const health = Math.round(EMPLOYER_HEALTH * 12);
const yearOne = salary + aip + signing + match + health;
const weekly = salary / 52;

const PACKAGE = [
  { label: "Base salary", value: salary, color: "var(--std)" },
  { label: `Annual incentive at target (${percent(OFFER.aipTarget)})`, value: aip, color: "var(--promo)" },
  { label: "Pension match (6%)", value: match, color: "var(--scotia)" },
  { label: "Signing bonus, first year only", value: signing, color: "var(--mix)" },
  { label: "Employer-paid health and dental", value: health, color: "#f472b6" },
];

const FACTS = [
  { k: "Role", v: OFFER.role },
  { k: "Level", v: OFFER.band },
  { k: "Started", v: "Aug 17, 2026" },
  { k: "Base salary", v: money(salary) },
  { k: "Paid", v: "Monthly, last banking day" },
];

interface Insight {
  title: string;
  value: string;
  body: string;
  tone?: "good" | "watch";
}

const INSIGHTS: Insight[] = [
  {
    title: "You get the full pension match",
    value: `${money(match * 2)} a year`,
    body: `You put in 6% of salary, the most allowed, and Air Canada matches it, so ${money(match)} of free money a year goes into your DC pension. Dropping to 3% would raise take-home but cut the match in half.`,
    tone: "good",
  },
  {
    title: "Probation ends Feb 17, 2027",
    value: "6 months",
    body: "Until then your manager can extend probation or end your job, and the severance terms below do not apply yet.",
    tone: "watch",
  },
  {
    title: "The signing bonus has conditions",
    value: `2 × ${money(OFFER.signing[0].amount)}`,
    body: "Paid after 6 months (Feb 2027) and 12 months (Aug 2027), only if you are still employed then. It is taxed like salary, so expect roughly 55 to 60% of it in your account.",
    tone: "watch",
  },
  {
    title: "The incentive is not guaranteed",
    value: `${money(aip)} to ${money(aipMax)}`,
    body: "Target is 8% of salary and the maximum is 16%, depending on company, department and personal results. Air Canada can change the plan at any time, so plan around the target, not the maximum.",
  },
  {
    title: "Severance grows with every year",
    value: `${money(weekly * 3)} to start`,
    body: `After probation: 3 weeks of base pay plus 3 weeks per year of service, up to 60 weeks. A week of base pay is ${money(weekly)}, so after 5 years it would be 18 weeks, about ${money(weekly * 18)}.`,
  },
  {
    title: "Quebec taxes your health benefits",
    value: `${money(health)} a year`,
    body: "The health and dental premiums Air Canada pays count as income for Quebec tax (not federal). You pay a little Quebec tax on money you never see, which is normal in Quebec.",
  },
  {
    title: "Time off",
    value: `${OFFER.vacationWeeks} weeks + ${OFFER.catchUpDays} days`,
    body: "Three weeks of vacation a year plus five catch-up days, both prorated for 2026 because you started in August.",
    tone: "good",
  },
  {
    title: "Perks with a cash value",
    value: `${(OFFER.aeroplanPoints / 1000).toFixed(0)}k Aeroplan a year`,
    body: "Points arrive each January, starting 2027. Travel privileges start after 28 weeks (Mar 1, 2027). The ESOP matches part of what you put into Air Canada shares, and a Group RRSP and TFSA are open to you.",
    tone: "good",
  },
  {
    title: "Fine print worth knowing",
    value: "Arbitration",
    body: "Disputes go to private arbitration in Quebec and you give up class actions. Keeping your work permit valid is your job; if it lapses, employment ends without notice or pay.",
    tone: "watch",
  },
];

/** The offer at a glance: who, what it pays in total, and what to take away from it. */
export default function OfferSummary() {
  return (
    <div className="off-sec">
      <dl className="facts off-facts">
        {FACTS.map((f) => (
          <div key={f.k}>
            <dt>{f.k}</dt>
            <dd>{f.v}</dd>
          </div>
        ))}
      </dl>

      <div className="irow">
        <Card title="Total yearly compensation" description="Everything Air Canada pays for you in year one, at target incentive.">
          <div className="off-big">{money(yearOne)}</div>
          <SegmentBar segments={PACKAGE.map((p) => ({ width: (p.value / yearOne) * 100, color: p.color, title: p.label }))} />
          {PACKAGE.map((p) => (
            <LegendRow key={p.label} label={p.label} value={money(p.value)} color={p.color} style={{ margin: "6px 0" }} />
          ))}
          <KeyValue label="From year two (no signing bonus)" value={money(yearOne - signing)} total />
          <KeyValue label={<em>With the maximum 16% incentive</em>} value={money(yearOne - aip + aipMax)} />
          <Note style={{ marginTop: 8 }}>Profit sharing, ESOP matching, Aeroplan points and travel privileges are not in these totals.</Note>
        </Card>

        <Card title="Base salary, broken down" description="What $95,000 a year works out to before any deductions.">
          <KeyValue label="Per month" value={money(salary / 12, 2)} />
          <KeyValue label="Per two weeks" value={money(salary / 26, 2)} />
          <KeyValue label="Per week" value={money(weekly, 2)} />
          <KeyValue label={<>Per day <em>· 260 workdays</em></>} value={money(salary / 260, 2)} />
          <KeyValue label={<>Per hour <em>· 37.5 h a week</em></>} value={money(weekly / 37.5, 2)} />
          <Note style={{ marginTop: 8 }}>
            Your stub rounds the monthly rate to $7,917.00. Hours are an estimate; the offer points to the Working Hours policy rather than a number.
          </Note>
        </Card>
      </div>

      <div>
        <SectionHeading title="Key takeaways">What the offer letter means for your money and your job, in plain terms.</SectionHeading>
        <div className="off-ins">
          {INSIGHTS.map((i) => (
            <div key={i.title} className={`off-in ${i.tone ?? ""}`}>
              <span>{i.title}</span>
              <b>{i.value}</b>
              <p>{i.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

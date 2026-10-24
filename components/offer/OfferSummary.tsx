import { SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { KeyValue, LegendRow, Note, SectionHeading } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { COMP, OFFER } from "@/lib/offer";

const { salary } = OFFER;
const { aip, signing, match, health, yearOne } = COMP;
const aipMax = salary * OFFER.aipMax;
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

/** The offer at a glance: who it is with and what it pays in total. Its takeaways are on the Insights tab. */
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

    </div>
  );
}

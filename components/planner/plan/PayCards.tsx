import { SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { KeyValue, LegendRow, Note } from "@/components/ui/text";

const STUB = [
  { label: "Take-home", value: "$4,680.90 · 59%", width: 59.1, color: "var(--std)" },
  { label: "Income tax, QPP, EI, QPIP", value: "$2,467.55 · 31%", width: 31.2, color: "var(--scotia)" },
  { label: "Pension (6%)", value: "$475.02 · 6%", width: 6, color: "var(--promo)" },
  { label: "Insurance (life, LTD, STD, dental, AD&D)", value: "$293.53 · 4%", width: 3.7, color: "var(--mix)" },
];

/** Where each paycheque goes, from the September stub. */
export function PayStubCard() {
  return (
    <Card title="Your pay, from the September stub" description="Where each $7,917 monthly paycheque goes.">
      <SegmentBar segments={STUB} />
      {STUB.map((s) => (
        <LegendRow key={s.label} label={s.label} value={s.value} color={s.color} style={{ margin: "4px 0" }} />
      ))}
      <KeyValue label="Employer also pays each month" value="$724.68" total />
      <KeyValue label={<em>Pension match</em>} value="$475.02" />
      <KeyValue label={<em>Extended health and dental</em>} value="$249.66" />
      <Note style={{ marginTop: 8 }}>
        September&apos;s net of $4,387.37 included one-time retro deductions of $293.53. The $4,680.90 above is the recurring figure.
      </Note>
    </Card>
  );
}

/** Total yearly compensation from the offer letter. */
export function PayPackageCard() {
  return (
    <Card title="Yearly pay package" description="Based on your Air Canada offer, at target.">
      <KeyValue label="Base salary" value="$95,000" />
      <KeyValue label={<>Annual incentive <em>· target 8%, max 16%</em></>} value="$7,600" />
      <KeyValue label={<>Signing bonus <em>· 2 × $2,500, taxable</em></>} value="$5,000" />
      <KeyValue label={<>Employer pension match <em>· up to 6%</em></>} value="$5,700" />
      <KeyValue label="Employer-paid health and dental" value="$2,996" />
      <KeyValue label="Total, first year at target" value="$116,296" total />
      <KeyValue
        label={<em>Also: 15,000 Aeroplan points a year, travel privileges after 28 weeks, profit sharing, optional ESOP</em>}
        value=""
      />
      <Note style={{ marginTop: 8 }}>The incentive could be as high as $15,200. Profit sharing and ESOP amounts are not in the total.</Note>
    </Card>
  );
}

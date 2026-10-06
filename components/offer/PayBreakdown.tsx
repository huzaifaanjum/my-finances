import { SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { KeyValue, Note, SectionHeading } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { EMPLOYER_PAID, groupTotal, STUB, STUB_GROUPS, type StubLine } from "@/lib/offer";

const deducted = STUB_GROUPS.reduce((t, g) => t + groupTotal(g), 0);
const takeHome = STUB.gross - deducted;
const employer = EMPLOYER_PAID.reduce((t, l) => t + l.amount, 0);
const share = (v: number) => percent(v / STUB.gross);
const byId = (id: (typeof STUB_GROUPS)[number]["id"]) => groupTotal(STUB_GROUPS.find((g) => g.id === id)!);

const SEGMENTS = [
  { label: "Take-home", value: takeHome, color: "var(--std)" },
  ...STUB_GROUPS.map((g) => ({ label: g.title, value: groupTotal(g), color: g.color })),
];

function Line({ line }: { line: StubLine }) {
  return (
    <div className="off-line">
      <div>
        <span>{line.label}</span>
        {line.note && <em>{line.note}</em>}
      </div>
      <span>{money(line.amount, 2)}</span>
      <span>{money(line.amount * 12)}</span>
    </div>
  );
}

/** Where each monthly paycheque goes, from the September 2026 stub. */
export default function PayBreakdown() {
  return (
    <div className="off-sec">
      <SectionHeading title="Monthly pay, line by line">
        From your {STUB.period} pay stub. Amounts are the recurring monthly ones; the yearly column multiplies by 12.
      </SectionHeading>

      <Card>
        <div className="off-flow">
          <div>
            <span>Gross pay</span>
            <b>{money(STUB.gross, 2)}</b>
          </div>
          <i>−</i>
          <div>
            <span>Deductions</span>
            <b className="neg">{money(deducted, 2)}</b>
          </div>
          <i>=</i>
          <div>
            <span>Take-home</span>
            <b className="pos">{money(takeHome, 2)}</b>
          </div>
        </div>
        <SegmentBar variant="thick" segments={SEGMENTS.map((s) => ({ width: (s.value / STUB.gross) * 100, color: s.color, title: s.label }))} />
        <div className="legend off-legend">
          {SEGMENTS.map((s) => (
            <span key={s.label}>
              <i style={{ background: s.color }} />
              {s.label} <b>{share(s.value)}</b>
            </span>
          ))}
        </div>
      </Card>

      <div className="irow">
        <Card title="What comes off" description="Every deduction on the stub, grouped.">
          <div className="off-line off-head">
            <span />
            <span>Month</span>
            <span>Year</span>
          </div>
          {STUB_GROUPS.map((g) => (
            <div key={g.id} className="off-grp">
              <div className="off-line off-gt">
                <span>
                  <i style={{ background: g.color }} />
                  {g.title}
                </span>
                <span>{money(groupTotal(g), 2)}</span>
                <span>{money(groupTotal(g) * 12)}</span>
              </div>
              {g.lines.map((l) => (
                <Line key={l.label} line={l} />
              ))}
            </div>
          ))}
          <div className="off-line off-gt off-total">
            <span>Take-home</span>
            <span>{money(takeHome, 2)}</span>
            <span>{money(takeHome * 12)}</span>
          </div>
        </Card>

        <div className="stack">
          <Card title="What the numbers say" description="Shares of your gross pay.">
            <KeyValue label="Income tax, federal and Quebec" value={share(byId("tax"))} />
            <KeyValue label="Government plans (QPP, EI, QPIP)" value={share(byId("payroll"))} />
            <KeyValue label="Your pension savings" value={share(byId("pension"))} />
            <KeyValue label="Insurance" value={share(byId("insurance"))} />
            <KeyValue label="You keep" value={share(takeHome)} total />
            <Note style={{ marginTop: 8 }}>
              The pension is not lost: it is your money, invested for retirement, and it lowers your income tax because it comes off before tax.
            </Note>
          </Card>

          <Card title="Paid by Air Canada on top" description="Not in your gross pay, but part of what you earn.">
            {EMPLOYER_PAID.map((l) => (
              <KeyValue key={l.label} label={<>{l.label} {l.note && <em>· {l.note}</em>}</>} value={money(l.amount, 2)} />
            ))}
            <KeyValue label="Total each month" value={money(employer, 2)} total />
            <KeyValue label={<em>Gross plus employer-paid, per month</em>} value={money(STUB.gross + employer, 2)} />
          </Card>

          <Card title="Why September's deposit was lower" description={`You received ${money(STUB.net, 2)}, not ${money(takeHome, 2)}.`}>
            <KeyValue label="Usual take-home" value={money(takeHome, 2)} />
            <KeyValue label={<em>Retro insurance for August, one time</em>} value={`−${money(STUB.retro, 2)}`} />
            <KeyValue label="Deposited Sep 29" value={money(STUB.net, 2)} total />
            <Note style={{ marginTop: 8 }}>
              Insurance started from your first day but was not taken from August&apos;s pay, so September took two months of it. From October the deposit
              should be back to about {money(takeHome, 2)}, and it should rise late in the year once QPP and EI reach their yearly maximums.
            </Note>
          </Card>
        </div>
      </div>

      <Card title="So far this year" description="Year-to-date totals on the September stub, which include your partial August.">
        <KeyValue label="Gross pay" value={money(STUB.ytdGross, 2)} />
        <KeyValue label="Take-home" value={money(STUB.ytdNet, 2)} />
        <KeyValue label="Kept" value={percent(STUB.ytdNet / STUB.ytdGross)} total />
      </Card>
    </div>
  );
}

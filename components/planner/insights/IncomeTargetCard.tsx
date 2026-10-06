"use client";

import { usePlanner } from "@/components/providers/PlannerProvider";
import { ProgressBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { GroupHeader, KeyValue, LegendRow, Note } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import { SLIDERS } from "@/lib/planner/config";
import { automaticIncome, clearedStreams, exampleStreamMix, incomeTarget } from "@/lib/planner/insights";

/** How much take-home would make today's budget fit the guidelines. */
export default function IncomeTargetCard() {
  const { plan, setNumbers } = usePlanner();
  const { net } = plan;
  const t = incomeTarget(plan);
  const grossLabel = (v: number) => money(Math.round(t.grossFor(v) / 1000) * 1000);
  const scale = Math.max(t.target, net);
  const auto = automaticIncome(plan).reduce((s, a) => s + a.monthly, 0);
  const mix = exampleStreamMix(plan, t.gap, auto);

  return (
    <Card
      title="How much you should earn"
      description="The highest of three checks sets the target. Gross pay assumes each extra dollar of salary adds about 50¢ to take-home (41 to 47.5% tax at this level plus 6% to your pension)."
    >
      <div className="itn">
        <span>Target take-home</span>
        <b>{money(t.target)}</b>
        <em>a month · about {grossLabel(t.target)} a year before tax</em>
      </div>
      <div className="itc">
        <div>
          <span>You now</span>
          <b>{money(net)}</b>
          <em>about {grossLabel(net)} gross</em>
        </div>
        <div className={t.gap ? "bad" : "good"}>
          <span>{t.gap ? "Gap" : "Above target by"}</span>
          <b>{money(t.gap || net - t.target)}</b>
          <em>{t.gap ? `+${percent(t.gap / net)} a month` : "you are there"}</em>
        </div>
      </div>
      {t.needs.map((n) => {
        const binding = n === t.binding;
        return (
          <div key={n.label} className={`itr${binding ? " on" : ""}`}>
            <LegendRow
              style={{ margin: "0 0 5px" }}
              label={
                <>
                  {n.label}
                  {binding && <em className="tag">sets the target</em>}
                </>
              }
              value={money(n.amount)}
            />
            <ProgressBar value={n.amount / scale} color={binding ? "var(--text)" : "#52525b"} mark={net / scale} />
          </div>
        );
      })}
      <Note style={{ marginTop: 12 }}>The tick on each bar is your take-home today.</Note>

      {t.gap > 0 && (
        <>
          <GroupHeader label="An example plan" value={money(mix.reduce((s, m) => s + m[1], 0) + auto)} />
          {mix.map(([key, amount]) => (
            <KeyValue key={key} label={SLIDERS[key].label} value={money(amount)} />
          ))}
          <KeyValue label={<em>Interest, cashback and tax refund</em>} value={money(auto)} />
          <div className="itb">
            <button type="button" className="add" onClick={() => setNumbers(Object.fromEntries(mix))}>
              Try this plan
            </button>
            <button type="button" className="add" onClick={() => setNumbers(Object.fromEntries(clearedStreams()))}>
              Clear sliders
            </button>
          </div>
          <Note>No single stream closes a {money(t.gap)} gap. Several small ones together can.</Note>
        </>
      )}
    </Card>
  );
}

import Card from "@/components/ui/Card";
import { Note } from "@/components/ui/text";
import { money } from "@/lib/format";
import type { ForecastMonth } from "@/lib/payslips/forecast";
import { INDEX } from "@/lib/payslips/tax";

/** Same working-time assumptions as the offer page. */
const HOURS_PER_WEEK = 37.5;
const WORKDAYS = 260;

const UNITS: { label: string; per: number; digits: number }[] = [
  { label: "Year", per: 1, digits: 0 },
  { label: "Month", per: 12, digits: 2 },
  { label: "Two weeks", per: 26, digits: 2 },
  { label: "Week", per: 52, digits: 2 },
  { label: `Day · ${WORKDAYS} workdays`, per: WORKDAYS, digits: 2 },
  { label: `Hour · ${HOURS_PER_WEEK} h a week`, per: 52 * HOURS_PER_WEEK, digits: 2 },
  { label: "Minute", per: 52 * HOURS_PER_WEEK * 60, digits: 2 },
];

interface Props {
  salaryNow: number;
  /** the forecast months in the chosen period, oldest first */
  months: ForecastMonth[];
  years: number;
  /** show amounts in today's dollars */
  real: boolean;
}

/** Salary now and at the end of the chosen period, per year down to per minute. */
export default function SalaryBreakdown({ salaryNow, months, years, real }: Props) {
  const working = months.map((m, k) => ({ m, f: real ? Math.pow(1 + INDEX, k / 12) : 1 })).filter((x) => !x.m.retired);
  const last = working.slice(-12);
  if (!last.length) return null;
  const end = last[last.length - 1];
  const salaryThen = (end.m.base * 12) / end.f;
  // last 12 working months, scaled to a full year if fewer remain before retirement
  const scale = 12 / last.length;
  const grossThen = last.reduce((t, x) => t + x.m.gross / x.f, 0) * scale;
  const netThen = last.reduce((t, x) => t + x.m.net / x.f, 0) * scale;
  const retiresFirst = working.length < months.length;
  const then = retiresFirst ? "Final year before 65" : `In ${years} ${years === 1 ? "year" : "years"}`;

  const cols = [
    { head: "Salary now", sub: "base, today", year: salaryNow },
    { head: then, sub: "base salary", year: salaryThen },
    { head: then, sub: "with incentive", year: grossThen },
    { head: then, sub: "take-home", year: netThen, pos: true },
  ];

  return (
    <Card
      title="Your salary, broken down"
      description={`Today's base salary next to what the forecast reaches by ${end.m.year}${real ? ", in today's dollars" : ""}, from per year down to per minute.`}
    >
      <div className="ps-tablewrap">
        <table className="ps-table ps-sal">
          <thead>
            <tr>
              <th>Per</th>
              {cols.map((c, k) => (
                <th key={k}>
                  {c.head}
                  <small>{c.sub}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {UNITS.map((u) => (
              <tr key={u.label} className={u.per === 1 ? "tt" : undefined}>
                <td>{u.label}</td>
                {cols.map((c, k) => (
                  <td key={k} className={c.pos ? "ps-pos" : undefined}>
                    {money(c.year / u.per, u.per === 1 ? 0 : c.year / u.per < 1 ? 4 : 2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note style={{ marginTop: 8 }}>
        Raise of {Math.round((salaryThen / salaryNow - 1) * 100)}% over the period. &quot;With incentive&quot; adds the March bonus{last.some((x) => x.m.year === 2027) ? " (and the 2027 signing bonuses)" : ""} to
        base salary; take-home is after tax, government plans, your 6% pension and insurance. Hours assume {HOURS_PER_WEEK} a week, as on the offer
        page.
      </Note>
    </Card>
  );
}

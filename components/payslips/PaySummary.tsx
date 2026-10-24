import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { money, percent } from "@/lib/format";
import { employerBenefits, employerPension, periodLabel, retroDeductions, shortDate, usualNet } from "@/lib/payslips/analysis";
import type { Payslip, PayslipData } from "@/lib/payslips/types";

/** Headline numbers from the latest payslip and its year-to-date column. */
export default function PaySummary({ used, latest }: { used: Payslip[]; latest: PayslipData }) {
  const c = latest.current;
  const retro = retroDeductions(latest);
  const usual = usualNet(latest);
  const employer = employerPension(latest) + employerBenefits(latest);
  const avgNet = used.reduce((t, p) => t + p.data.current.net, 0) / used.length;

  return (
    <KpiGrid className="ps-kpis">
      <Kpi
        label="Latest deposit"
        value={money(c.net, 2)}
        note={`${periodLabel(latest, true)}, paid ${shortDate(latest.payDate)}`}
        tone="hero"
        tip="Net pay on your most recent included payslip: what landed in your bank account."
      />
      <Kpi
        label="Usual take-home"
        value={money(usual, 2)}
        note={retro ? `without ${money(retro, 2)} of one-time retro deductions` : "no one-time items on this payslip"}
        tip="What a normal month deposits. One-time catch-up (retro) deductions are added back."
      />
      <Kpi
        label="Gross pay"
        value={money(c.gross, 2)}
        note={`${money(latest.payRate * 12)} a year at your current rate`}
        tip="Your pay before anything is taken off."
      />
      <Kpi
        label="Share you keep"
        value={percent(c.net / (c.gross || 1))}
        note="of gross, after tax, government plans, pension and insurance"
        tone="pos"
        tip="Net pay divided by gross pay on the latest payslip. Your pension is still your money, it is just saved for later."
      />
      <Kpi
        label="Take-home this year"
        value={money(latest.ytd.net)}
        note={`of ${money(latest.ytd.gross)} gross, from the year-to-date column`}
        tip="Year-to-date totals printed on your latest payslip."
      />
      <Kpi
        label="Employer adds monthly"
        value={money(employer, 2)}
        note={used.length > 1 ? `on top of gross · average deposit ${money(avgNet)}` : "pension match plus health and dental, on top of gross"}
        tip="What Air Canada pays for you that never shows in gross pay: the pension match and health and dental premiums."
      />
    </KpiGrid>
  );
}

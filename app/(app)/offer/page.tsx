import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import OfferSummary from "@/components/offer/OfferSummary";
import SeeAlso from "@/components/ui/SeeAlso";

export const metadata: Metadata = { title: "My offer" };

export default function OfferPage() {
  return (
    <PageShell
      title="My offer"
      subtitle="Your Air Canada offer from August 3, 2026: what it adds up to and how your pay is put together."
    >
      <div className="off">
        <OfferSummary />
        <div className="seealso-row">
          <SeeAlso href="/insights" label="Insights">
            Key takeaways from the offer letter: probation, signing bonus conditions, severance and the fine print
          </SeeAlso>
          <SeeAlso href="/payslips" label="Payslips">
            Where each paycheque actually goes, line by line, from your real payslips
          </SeeAlso>
          <SeeAlso href="/recommendations" label="Recommendations">
            How to make the most of your benefits, pension and perks, as a checklist
          </SeeAlso>
        </div>
      </div>
    </PageShell>
  );
}

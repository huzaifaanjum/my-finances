import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import OfferSummary from "@/components/offer/OfferSummary";
import PayBreakdown from "@/components/offer/PayBreakdown";

export const metadata: Metadata = { title: "My offer" };

export default function OfferPage() {
  return (
    <PageShell
      title="My offer"
      subtitle="Your Air Canada offer from August 3, 2026, what it adds up to, and where each monthly paycheque goes."
      notes="none"
    >
      <div className="off">
        <OfferSummary />
        <PayBreakdown />
      </div>
    </PageShell>
  );
}

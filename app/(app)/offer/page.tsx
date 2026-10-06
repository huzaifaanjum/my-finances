import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import MakeTheMost from "@/components/offer/MakeTheMost";
import OfferSummary from "@/components/offer/OfferSummary";
import PayBreakdown from "@/components/offer/PayBreakdown";

export const metadata: Metadata = { title: "My offer" };

export default function OfferPage() {
  return (
    <PageShell
      title="My offer"
      subtitle="Your Air Canada offer from August 3, 2026, what it adds up to, where each monthly paycheque goes, and how to get the most out of it."
    >
      <div className="off">
        <OfferSummary />
        <PayBreakdown />
        <MakeTheMost />
      </div>
    </PageShell>
  );
}

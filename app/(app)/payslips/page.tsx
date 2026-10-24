import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PayslipsView from "@/components/payslips/PayslipsView";

export const metadata: Metadata = { title: "Payslips" };

export default function PayslipsPage() {
  return (
    <PageShell
      title="Payslips"
      subtitle="Every payslip, read and encrypted in your browser: where each paycheque goes, what changed, and what you'll earn over the years."
    >
      <PayslipsView />
    </PageShell>
  );
}

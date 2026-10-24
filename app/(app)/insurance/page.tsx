import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import InsuranceView from "@/components/insurance/InsuranceView";

export const metadata: Metadata = { title: "Insurance" };

export default function InsurancePage() {
  return (
    <PageShell
      title="Insurance"
      subtitle="Your Manulife group benefits from Air Canada: what each one pays, what it costs you, and the $500 spending account to use every year."
    >
      <InsuranceView />
    </PageShell>
  );
}

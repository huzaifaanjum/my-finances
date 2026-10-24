import type { Metadata } from "next";
import BenefitsView from "@/components/benefits/BenefitsView";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Benefits" };

export default function BenefitsPage() {
  return (
    <PageShell
      title="Benefits"
      subtitle="Everything Air Canada gives you beyond salary, what each is worth, and a checklist to make sure you use all of it. Ticks are saved to your account."
    >
      <BenefitsView />
    </PageShell>
  );
}

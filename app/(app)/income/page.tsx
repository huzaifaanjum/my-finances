import type { Metadata } from "next";
import IncomeView from "@/components/income/IncomeView";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Revenue streams" };

export default function IncomePage() {
  return (
    <PageShell title="Revenue streams" subtitle="Ideas for earning more, how to register your own business in Montreal, and how to get paid while keeping as much as you can.">
      <IncomeView />
    </PageShell>
  );
}

import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import TaxView from "@/components/tax/TaxView";

export const metadata: Metadata = { title: "Tax" };

export default function TaxPage() {
  return (
    <PageShell title="Tax" subtitle="Your 2026 return from both jobs: the refund to expect, and how much more each claim gets you back.">
      <TaxView />
    </PageShell>
  );
}

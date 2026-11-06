import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import StoreView from "@/components/store/StoreView";

export const metadata: Metadata = { title: "Store" };

export default function StorePage() {
  return (
    <PageShell
      title="Store"
      subtitle="Things from popular brands your benefits pay for: the $500 spending account and your vision cover. See what you can claim on each before you buy."
    >
      <StoreView />
    </PageShell>
  );
}

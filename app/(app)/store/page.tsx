import type { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell";
import StoreView from "@/components/store/StoreView";

export const metadata: Metadata = { title: "Store" };

export default function StorePage() {
  return (
    <PageShell
      title="Store"
      subtitle="Things from popular brands your benefits pay for: the $500 spending account and your vision cover. See what you can claim on each before you buy."
    >
      {/* StoreView reads the category and brand from the URL */}
      <Suspense fallback={null}>
        <StoreView />
      </Suspense>
    </PageShell>
  );
}

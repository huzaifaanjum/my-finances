import type { Metadata } from "next";
import GlossaryView from "@/components/glossary/GlossaryView";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Glossary" };

export default function GlossaryPage() {
  return (
    <PageShell
      title="Glossary"
      subtitle="Plain-language explanations of the money words used across the app. Underlined words on other pages open the same explanations."
    >
      <GlossaryView />
    </PageShell>
  );
}

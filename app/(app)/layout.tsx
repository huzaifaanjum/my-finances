import type { ReactNode } from "react";
import GlossaryProvider from "@/components/glossary/GlossaryProvider";
import Nav from "@/components/layout/Nav";
import { PlannerProvider } from "@/components/providers/PlannerProvider";

/** Shared by every signed-in page. The provider lives here so your numbers survive moving between pages. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PlannerProvider>
      <GlossaryProvider>
        <Nav />
        {children}
      </GlossaryProvider>
    </PlannerProvider>
  );
}

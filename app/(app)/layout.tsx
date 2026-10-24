import type { ReactNode } from "react";
import GlossaryProvider from "@/components/glossary/GlossaryProvider";
import Nav from "@/components/layout/Nav";
import { PayslipVaultProvider } from "@/components/payslips/PayslipVault";
import { PlannerProvider } from "@/components/providers/PlannerProvider";

/** Shared by every signed-in page. The providers live here so your numbers (and an unlocked payslip vault) survive moving between pages. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PlannerProvider>
      <PayslipVaultProvider>
        <GlossaryProvider>
          <Nav />
          {children}
        </GlossaryProvider>
      </PayslipVaultProvider>
    </PlannerProvider>
  );
}

"use client";

import { useMemo } from "react";
import { byPeriod } from "@/lib/payslips/analysis";
import { REFERENCE_PAYSLIP, PAY } from "@/lib/pay";
import type { PayslipData } from "@/lib/payslips/types";
import { useVault } from "./PayslipVault";

/** Your latest included payslip while the Payslips tab is unlocked, otherwise the October 2026 one. */
export function useReferencePayslip(): { data: PayslipData; source: string } {
  const { payslips } = useVault();
  return useMemo(() => {
    const used = payslips.filter((p) => !p.excluded).sort(byPeriod);
    const latest = used[used.length - 1];
    if (!latest) return { data: REFERENCE_PAYSLIP, source: PAY.source };
    const [y, m] = latest.data.periodEnd.split("-");
    const month = new Date(Number(y), Number(m) - 1).toLocaleString("en-CA", { month: "long" });
    return { data: latest.data, source: `your ${month} ${y} payslip` };
  }, [payslips]);
}

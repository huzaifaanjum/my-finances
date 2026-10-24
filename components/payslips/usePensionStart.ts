"use client";

import { useMemo } from "react";
import { pensionStartFrom } from "@/lib/payslips/pension";
import { PENSION_FROM_OCT_PAYSLIP, type PensionStart } from "@/lib/planner/finance";
import { useVault } from "./PayslipVault";

/** The pension starting point from your included payslips when they are unlocked, otherwise from the October 2026 payslip. */
export function usePensionStart(): PensionStart {
  const { payslips } = useVault();
  return useMemo(() => pensionStartFrom(payslips.filter((p) => !p.excluded).map((p) => p.data)) ?? PENSION_FROM_OCT_PAYSLIP, [payslips]);
}

// The headline tax numbers, for pages other than Tax (Insights, Overview). Same rules as the Tax tab.

import type { PlannerState } from "@/lib/planner/types";
import { airCanadaSlip, estimateReturn, flexSlip, NO_CLAIMS, SLIP_FIELDS, type Claims, type Slip } from "@/lib/tax2026";
import { latestTuitionCarry, paymentsLeft } from "@/lib/taxHistory";

export interface TaxSummary {
  refund: number;
  fedRefund: number;
  qcRefund: number;
  /** what tuition carried forward adds to the 2026 refund */
  carryValue: number;
  /** the Quebec part of it, which could be claimed on 2025 instead */
  qcCarryValue: number;
  /** credit left unclaimed on a past return */
  unclaimed: number;
  hasFhsa: boolean;
  /** what $8,000 in an FHSA adds */
  fhsaValue: number;
  rrspRoom: number;
  /** refund with $8,000 FHSA and all RRSP room */
  best: number;
  /** government payments still to come */
  paymentsLeft: number;
  pastRefunds: number;
  income: number;
}

export function taxSummary(s: PlannerState): TaxSummary {
  const t = s.tax;
  const est: Record<"flex" | "ac", Slip> = { flex: flexSlip(), ac: airCanadaSlip() };
  const slip = (id: "flex" | "ac") => Object.fromEntries(SLIP_FIELDS.map((f) => [f.key, t[`${id}.${f.key}`] ?? est[id][f.key]])) as unknown as Slip;
  const slips = [slip("flex"), slip("ac")];
  const useCarry = !t["carry.off"];
  const qc = latestTuitionCarry(s.taxHistory, "qc");
  const fed = latestTuitionCarry(s.taxHistory, "fed");
  const claims: Claims = {
    ...(Object.fromEntries(Object.keys(NO_CLAIMS).map((k) => [k, t[k] ?? 0])) as unknown as Claims),
    qcTuitionCarry: useCarry ? qc.amount : 0,
    fedTuitionCarry: useCarry ? (t["fedTuitionCarry"] ?? fed.amount) : 0,
    ctcLimit: t["cra.ctc"] ?? 0,
  };
  const r = estimateReturn(slips, claims);
  const noCarry = estimateReturn(slips, { ...claims, qcTuitionCarry: 0, fedTuitionCarry: 0 }).refund;
  const noQc = estimateReturn(slips, { ...claims, qcTuitionCarry: 0 }).refund;
  const rrspRoom = t["cra.rrsp"] ?? 0;
  return {
    refund: r.refund,
    fedRefund: r.fedRefund,
    qcRefund: r.qcRefund,
    carryValue: r.refund - noCarry,
    qcCarryValue: r.refund - noQc,
    unclaimed: s.taxHistory.reduce((x, h) => x + (h.unclaimed ?? 0), 0),
    hasFhsa: !!t["cra.fhsaOpen"],
    fhsaValue: estimateReturn(slips, { ...claims, fhsa: claims.fhsa + 8_000 }).refund - r.refund,
    rrspRoom,
    best: estimateReturn(slips, { ...claims, fhsa: 8_000, rrsp: rrspRoom }).refund,
    paymentsLeft: s.govPayments.reduce((x, p) => x + paymentsLeft(p).total, 0),
    pastRefunds: s.taxHistory.reduce((x, h) => x + h.refund, 0),
    income: r.gross,
  };
}

"use client";

import { useEffect, useState } from "react";
import { usePlanner } from "@/components/providers/PlannerProvider";
import type { ForecastSettings } from "@/lib/payslips/forecast";
import { OFFER } from "@/lib/offer";

const SETTINGS_KEY = "ps_forecast";

/**
 * Forecast settings. Raise and pension return are the planner's own (saved to your account), so the
 * Retirement tab and this forecast always agree; the incentive % is remembered on this device.
 */
export function useForecastSettings(): [ForecastSettings, (s: ForecastSettings) => void] {
  const { state, setNumbers } = usePlanner();
  const [bonus, setBonus] = useState<number>(OFFER.aipTarget);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as Partial<ForecastSettings>;
      if (typeof raw.bonus === "number") setBonus(raw.bonus);
    } catch {
      /* storage blocked */
    }
  }, []);
  const settings: ForecastSettings = { raise: state.numbers.ret_sg / 100, growth: state.numbers.ret_pr / 100, bonus };
  const save = (next: ForecastSettings) => {
    if (next.raise !== settings.raise || next.growth !== settings.growth) setNumbers({ ret_sg: next.raise * 100, ret_pr: next.growth * 100 });
    if (next.bonus !== bonus) {
      setBonus(next.bonus);
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ bonus: next.bonus }));
      } catch {
        /* storage blocked */
      }
    }
  };
  return [settings, save];
}

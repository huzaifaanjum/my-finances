"use client";

import { useEffect, useState } from "react";
import { periodLabel } from "@/lib/payslips/analysis";
import type { ForecastSettings } from "@/lib/payslips/forecast";
import { ParseError } from "@/lib/payslips/parse";
import { readPayslip } from "@/lib/payslips/pdf";
import { emptyPayslip, type PayslipData } from "@/lib/payslips/types";
import { OFFER } from "@/lib/offer";
import PayBreakdown from "./PayBreakdown";
import PayForecast from "./PayForecast";
import PayInsights from "./PayInsights";
import PayslipEditor, { type EditRequest, type EditTarget } from "./PayslipEditor";
import PayslipManager from "./PayslipManager";
import PayslipViewer from "./PayslipViewer";
import PaySummary from "./PaySummary";
import SeeAlso from "@/components/ui/SeeAlso";
import SourcesStrip from "./SourcesStrip";
import VaultBar from "./VaultBar";
import VaultGate from "./VaultGate";
import { MAX_FILE_BYTES, useVault } from "./PayslipVault";
import { usePensionStart } from "./usePensionStart";
import { usePlanner } from "@/components/providers/PlannerProvider";

const SETTINGS_KEY = "ps_forecast";
let nextUid = 0;
const queued = (t: EditRequest): EditTarget => ({ ...t, uid: ++nextUid });
/**
 * Forecast settings. Raise and pension return are the planner's own (saved to your account), so the
 * Pension tab and this forecast always agree; the incentive % is remembered on this device.
 */
function useSettings(): [ForecastSettings, (s: ForecastSettings) => void] {
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

export default function PayslipsView() {
  const vault = useVault();
  const [settings, setSettings] = useSettings();
  const pensionStart = usePensionStart();
  const pensionSoFar = pensionStart.mine + pensionStart.match;
  const [viewing, setViewing] = useState<string | null>(null);
  const [queue, setQueue] = useState<EditTarget[]>([]);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);

  if (vault.status !== "unlocked") return <VaultGate />;

  const used = vault.payslips.filter((p) => !p.excluded);
  const latest = used[used.length - 1];

  async function onFiles(files: File[]) {
    setBusy(true);
    const out: string[] = [];
    const review: EditTarget[] = [];
    const known = new Set(vault.payslips.map((p) => p.data.advice).filter(Boolean));
    for (const f of files) {
      if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) {
        out.push(`${f.name}: only PDF payslips can be read.`);
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        out.push(`${f.name}: larger than 3 MB, so it can't be stored.`);
        continue;
      }
      let data: PayslipData;
      let warnings: string[];
      try {
        ({ data, warnings } = await readPayslip(new Uint8Array(await f.arrayBuffer())));
      } catch (e) {
        review.push(queued({ mode: "new", data: emptyPayslip(), file: f, warnings: [e instanceof ParseError ? e.message : "This PDF couldn't be read."] }));
        continue;
      }
      if (data.advice && known.has(data.advice)) {
        out.push(`${f.name}: ${periodLabel(data, true)} is already saved (advice #${data.advice}), so it was skipped.`);
        continue;
      }
      if (warnings.length) {
        review.push(queued({ mode: "new", data, file: f, warnings }));
        continue;
      }
      try {
        await vault.add(data, f);
        known.add(data.advice);
        out.push(`Added ${periodLabel(data, true)}, deposit ${data.current.net.toLocaleString("en-CA", { style: "currency", currency: "CAD" })}.`);
      } catch {
        out.push(`${f.name}: couldn't be saved. Try again.`);
      }
    }
    if (review.length) out.push(`${review.length} ${review.length === 1 ? "payslip needs" : "payslips need"} a quick check before saving.`);
    setNotes(out);
    setQueue((q) => [...q, ...review]);
    setBusy(false);
  }

  return (
    <div className="ps">
      <VaultBar />
      <SourcesStrip used={used} all={vault.payslips} onView={setViewing} onFiles={onFiles} busy={busy} />
      {latest ? (
        <>
          <PaySummary used={used} latest={latest.data} />
          <PayBreakdown used={used} />
          <PayForecast latest={latest.data} settings={settings} onSettings={setSettings} pensionSoFar={pensionSoFar} />
          <PayInsights used={used} settings={settings} pensionSoFar={pensionSoFar} />
          <SeeAlso href="/recommendations" label="Recommendations">
            What to do with it: tax savings, the late-year bump, benefits and your payslip checklist
          </SeeAlso>
        </>
      ) : (
        <div className="card ps-empty">
          <h3>{vault.payslips.length ? "Every payslip is left out" : "Upload your first payslip"}</h3>
          <p className="note">
            {vault.payslips.length
              ? "Tick at least one payslip below to include it, and the summary, forecast and insights will appear."
              : "Drop the PDF pay advice from Air Canada below. It is read in this browser, encrypted with your payslip password, then saved. The summary, forecast and insights build themselves from it."}
          </p>
        </div>
      )}
      <PayslipManager
        onFiles={onFiles}
        busy={busy}
        notes={notes}
        onView={setViewing}
        onEdit={(id) => setQueue((q) => [...q, queued({ mode: "edit", id })])}
        onAdd={() => setQueue((q) => [...q, queued({ mode: "new", data: emptyPayslip(), file: null, warnings: [] })])}
      />
      {viewing && <PayslipViewer id={viewing} onClose={() => setViewing(null)} onSelect={setViewing} />}
      {queue[0] && <PayslipEditor key={queue[0].uid} target={queue[0]} onDone={() => setQueue((q) => q.slice(1))} />}
    </div>
  );
}

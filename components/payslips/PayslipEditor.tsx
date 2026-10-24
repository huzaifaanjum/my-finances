"use client";

import { useState, type FormEvent } from "react";
import { money } from "@/lib/format";
import { periodLabel } from "@/lib/payslips/analysis";
import { LINE_GROUPS, TOTAL_FIELDS, type LineGroup, type PayLine, type PayslipData, type Taxability } from "@/lib/payslips/types";
import Modal from "./Modal";
import { MAX_FILE_BYTES, useVault } from "./PayslipVault";

export type EditRequest = { mode: "new"; data: PayslipData; file: File | null; warnings: string[] } | { mode: "edit"; id: string };
export type EditTarget = EditRequest & { uid: number };

const round2 = (v: number) => Math.round(v * 100) / 100;
const sum = (ls: PayLine[], k: "current" | "ytd") => round2(ls.reduce((t, l) => t + l[k], 0));
const clone = (d: PayslipData): PayslipData => JSON.parse(JSON.stringify(d)) as PayslipData;

/** A number box that lets you type freely and only commits valid numbers. */
function Num({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [text, setText] = useState(value ? String(value) : "");
  return (
    <input
      className="ps-in num"
      inputMode="decimal"
      aria-label={label}
      value={text}
      placeholder="0.00"
      onChange={(e) => {
        setText(e.target.value);
        const v = Number(e.target.value.replace(/[$,\s]/g, ""));
        if (Number.isFinite(v)) onChange(v);
      }}
      onBlur={() => setText(value ? String(value) : "")}
    />
  );
}

/** Review a freshly read payslip, enter one by hand, or fix a saved one. */
export default function PayslipEditor({ target, onDone }: { target: EditTarget; onDone: () => void }) {
  const vault = useVault();
  const saved = target.mode === "edit" ? vault.payslips.find((p) => p.id === target.id) : undefined;
  const [data, setData] = useState<PayslipData>(() => clone(target.mode === "new" ? target.data : saved!.data));
  // undefined = keep the current PDF, null = remove it, File = replace it
  const [file, setFile] = useState<File | null | undefined>(target.mode === "new" ? target.file : undefined);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  // bumped when totals are recalculated, so the number boxes show the new values
  const [rev, setRev] = useState(0);
  const warnings = target.mode === "new" ? target.warnings : [];

  if (target.mode === "edit" && !saved) return null;

  const set = <K extends keyof PayslipData>(k: K, v: PayslipData[K]) => setData((d) => ({ ...d, [k]: v }));
  const setLine = (g: LineGroup, i: number, patch: Partial<PayLine>) =>
    setData((d) => ({ ...d, [g]: d[g].map((l, k) => (k === i ? { ...l, ...patch } : l)) }));
  const addLine = (g: LineGroup) => setData((d) => ({ ...d, [g]: [...d[g], { label: "", current: 0, ytd: 0 }] }));
  const dropLine = (g: LineGroup, i: number) => setData((d) => ({ ...d, [g]: d[g].filter((_, k) => k !== i) }));

  /** Totals worked out from the lines. Federal/Quebec taxable stay as typed. */
  const fromLines = (k: "current" | "ytd") => {
    setRev((r) => r + 1);
    setData((d) => {
      const gross = sum(d.earnings, k);
      const taxes = sum(d.taxes, k);
      const deductions = round2(sum(d.preTax, k) + sum(d.afterTax, k));
      return { ...d, [k]: { ...d[k], gross, taxes, deductions, net: round2(gross - taxes - deductions) } };
    });
  };

  const c = data.current;
  const gap = round2(c.gross - c.taxes - c.deductions - c.net);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.periodEnd)) return setMsg("Add the pay period's end date.");
    if (!(c.gross > 0)) return setMsg("Add the gross pay.");
    if (file && file.size > MAX_FILE_BYTES) return setMsg("That PDF is larger than 3 MB.");
    setBusy(true);
    setMsg("");
    try {
      const clean: PayslipData = {
        ...data,
        ...Object.fromEntries(LINE_GROUPS.map((g) => [g.key, data[g.key].filter((l) => l.label.trim() || l.current || l.ytd)])),
      };
      if (target.mode === "new") await vault.add(clean, file ?? null);
      else await vault.update(target.id, { data: clean, ...(file !== undefined ? { file } : {}) });
      onDone();
    } catch {
      setMsg("Couldn't save. Check your connection and try again.");
      setBusy(false);
    }
  }

  const currentFile = file === undefined ? saved?.file?.name : file?.name;

  return (
    <Modal title={target.mode === "new" ? (data.periodEnd ? `Check ${periodLabel(data, true)}` : "Add a payslip") : `Edit ${periodLabel(data, true)}`} onClose={onDone} wide>
      <form className="ps-form" onSubmit={onSubmit}>
        {warnings.length > 0 && (
          <div className="ps-warn" role="alert">
            <b>Have a look before saving</b>
            <ul>
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <fieldset className="ps-grid">
          <legend>Details</legend>
          <label>
            Employer
            <input className="ps-in" value={data.employer} onChange={(e) => set("employer", e.target.value)} />
          </label>
          <label>
            Job title
            <input className="ps-in" value={data.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
          </label>
          <label>
            Period start
            <input className="ps-in" type="date" value={data.periodStart} onChange={(e) => set("periodStart", e.target.value)} />
          </label>
          <label>
            Period end
            <input className="ps-in" type="date" value={data.periodEnd} required onChange={(e) => set("periodEnd", e.target.value)} />
          </label>
          <label>
            Pay date
            <input className="ps-in" type="date" value={data.payDate} onChange={(e) => set("payDate", e.target.value)} />
          </label>
          <label>
            Advice number
            <input className="ps-in" value={data.advice} onChange={(e) => set("advice", e.target.value)} />
          </label>
          <label>
            Pay rate
            <Num label="Pay rate" value={data.payRate} onChange={(v) => set("payRate", v)} />
          </label>
          <label>
            Paid
            <select className="ps-in" value={data.payFrequency} onChange={(e) => set("payFrequency", e.target.value)}>
              {["Monthly", "Semi-monthly", "Biweekly", "Weekly"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
        </fieldset>

        {LINE_GROUPS.map((g) => (
          <fieldset key={g.key} className="ps-lines">
            <legend>
              {g.title}
              <span>
                {money(sum(data[g.key], "current"), 2)} this period · {money(sum(data[g.key], "ytd"), 2)} YTD
              </span>
            </legend>
            {data[g.key].length > 0 && (
              <div className={`ps-lrow head${g.key === "employerPaid" ? " tx" : ""}`} aria-hidden="true">
                <span>Line</span>
                {g.key === "employerPaid" && <span>Taxable</span>}
                <span>This period</span>
                <span>Year to date</span>
                <span />
              </div>
            )}
            {data[g.key].map((l, i) => (
              <div key={i} className={`ps-lrow${g.key === "employerPaid" ? " tx" : ""}`}>
                <input className="ps-in" aria-label="Line name" value={l.label} onChange={(e) => setLine(g.key, i, { label: e.target.value })} />
                {g.key === "employerPaid" && (
                  <select
                    className="ps-in"
                    aria-label="Taxable"
                    value={l.taxable ?? ""}
                    onChange={(e) => setLine(g.key, i, { taxable: (e.target.value || undefined) as Taxability | undefined })}
                  >
                    <option value="">—</option>
                    <option value="N">No</option>
                    <option value="P">Quebec</option>
                    <option value="F">Federal</option>
                    <option value="FP">Both</option>
                  </select>
                )}
                <Num label="This period" value={l.current} onChange={(v) => setLine(g.key, i, { current: v })} />
                <Num label="Year to date" value={l.ytd} onChange={(v) => setLine(g.key, i, { ytd: v })} />
                <button type="button" className="ps-btn sm" onClick={() => dropLine(g.key, i)} aria-label={`Remove ${l.label || "line"}`}>
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="ps-link" onClick={() => addLine(g.key)}>
              + Add a line
            </button>
          </fieldset>
        ))}

        {(["current", "ytd"] as const).map((k) => (
          <fieldset key={k} className="ps-grid">
            <legend>
              {k === "current" ? "Totals this period" : "Totals year to date"}
              <button type="button" className="ps-link" onClick={() => fromLines(k)}>
                Work out from the lines
              </button>
            </legend>
            {TOTAL_FIELDS.map((f) => (
              <label key={`${k}-${f.key}-${rev}`}>
                {f.label}
                <Num label={f.label} value={data[k][f.key]} onChange={(v) => setData((d) => ({ ...d, [k]: { ...d[k], [f.key]: v } }))} />
              </label>
            ))}
          </fieldset>
        ))}
        {Math.abs(gap) > 0.05 && c.gross > 0 && (
          <p className="ps-msg">
            Gross minus taxes minus deductions is {money(c.gross - c.taxes - c.deductions, 2)}, but net pay says {money(c.net, 2)} ({money(gap, 2)} apart).
          </p>
        )}

        <fieldset className="ps-grid one">
          <legend>PDF and note</legend>
          <div className="ps-filepick">
            <span>{currentFile ? `${currentFile} (encrypted when saved)` : "No PDF attached"}</span>
            <label className="ps-btn sm">
              {currentFile ? "Replace PDF" : "Attach PDF"}
              <input type="file" accept="application/pdf,.pdf" hidden onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            </label>
            {currentFile && (
              <button type="button" className="ps-btn sm" onClick={() => setFile(null)}>
                Remove PDF
              </button>
            )}
          </div>
          <label>
            Note
            <textarea className="ps-in" rows={2} value={data.note} onChange={(e) => set("note", e.target.value)} placeholder="Anything to remember about this payslip" />
          </label>
        </fieldset>

        <div className="ps-form-f">
          <span className="ps-msg" role="alert">
            {msg}
          </span>
          <button type="button" className="ps-btn" onClick={onDone}>
            {target.mode === "new" ? "Skip" : "Cancel"}
          </button>
          <button type="submit" className="ps-btn primary" disabled={busy}>
            {busy ? "Encrypting…" : "Save payslip"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

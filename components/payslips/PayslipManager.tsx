"use client";

import { useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/text";
import { money } from "@/lib/format";
import { periodLabel, shortDate } from "@/lib/payslips/analysis";
import type { Payslip } from "@/lib/payslips/types";
import { useVault } from "./PayslipVault";

interface Props {
  onFiles: (files: File[]) => void;
  busy: boolean;
  notes: string[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
}

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** Upload, include, view, edit and delete payslips. */
export default function PayslipManager({ onFiles, busy, notes, onView, onEdit, onAdd }: Props) {
  const { payslips, update, remove } = useVault();
  const [drag, setDrag] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const newest = [...payslips].reverse();

  async function run(task: () => Promise<unknown>) {
    setErr("");
    try {
      await task();
    } catch {
      setErr("That didn't save. Check your connection and try again.");
    }
  }

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const sel = payslips.filter((p) => selected.has(p.id));

  return (
    <section className="ps-sec" id="payslips">
      <SectionHeading title="Your payslips">
        Upload each PDF as it arrives. It is read in this browser, encrypted, then saved. Untick a payslip to leave it out of the numbers above.
      </SectionHeading>

      <div
        className={`ps-drop${drag ? " on" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const files = [...e.dataTransfer.files];
          if (files.length) onFiles(files);
        }}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
        </svg>
        <div>
          <b>{busy ? "Reading and encrypting…" : "Drop payslip PDFs here"}</b>
          <span>or pick them from your device. PDF, up to 3 MB each.</span>
        </div>
        <div className="ps-row">
          <button type="button" className="ps-btn primary" onClick={() => input.current?.click()} disabled={busy}>
            Choose PDFs
          </button>
          <button type="button" className="ps-btn" onClick={onAdd}>
            Enter by hand
          </button>
        </div>
        <input
          ref={input}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          hidden
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            if (files.length) onFiles(files);
          }}
        />
      </div>
      {notes.length > 0 && (
        <ul className="ps-notes" role="status">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      {err && <p className="ps-msg">{err}</p>}

      {payslips.length > 0 && (
        <>
          <div className="ps-selbar">
            <span>
              {sel.length ? `${sel.length} selected` : `${payslips.length} saved · ${payslips.filter((p) => !p.excluded).length} used in the numbers above`}
            </span>
            {sel.length > 0 && (
              <div className="ps-row">
                <button type="button" className="ps-btn sm" onClick={() => run(() => Promise.all(sel.map((p) => update(p.id, { excluded: false }))))}>
                  Include
                </button>
                <button type="button" className="ps-btn sm" onClick={() => run(() => Promise.all(sel.map((p) => update(p.id, { excluded: true }))))}>
                  Leave out
                </button>
                {confirm === "bulk" ? (
                  <button
                    type="button"
                    className="ps-btn sm danger"
                    onClick={() =>
                      run(async () => {
                        await Promise.all(sel.map((p) => remove(p.id)));
                        setSelected(new Set());
                        setConfirm(null);
                      })
                    }
                  >
                    Delete {sel.length} for good
                  </button>
                ) : (
                  <button type="button" className="ps-btn sm" onClick={() => setConfirm("bulk")}>
                    Delete…
                  </button>
                )}
                <button
                  type="button"
                  className="ps-btn sm"
                  onClick={() => {
                    setSelected(new Set());
                    setConfirm(null);
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <div className="ps-list" role="list">
            {newest.map((p) => (
              <Row
                key={p.id}
                p={p}
                selected={selected.has(p.id)}
                confirming={confirm === p.id}
                onSelect={() => toggleSel(p.id)}
                onInclude={(v) => run(() => update(p.id, { excluded: !v }))}
                onView={() => onView(p.id)}
                onEdit={() => onEdit(p.id)}
                onDelete={() => (confirm === p.id ? run(async () => (await remove(p.id), setConfirm(null))) : setConfirm(p.id))}
                onCancel={() => setConfirm(null)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

interface RowProps {
  p: Payslip;
  selected: boolean;
  confirming: boolean;
  onSelect: () => void;
  onInclude: (v: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

function Row({ p, selected, confirming, onSelect, onInclude, onView, onEdit, onDelete, onCancel }: RowProps) {
  const d = p.data;
  return (
    <div role="listitem" className={`ps-item${selected ? " sel" : ""}${p.excluded ? " off" : ""}`}>
      <input type="checkbox" checked={selected} onChange={onSelect} aria-label={`Select ${periodLabel(d, true)}`} />
      <button type="button" className="ps-item-main" onClick={onView}>
        <b>{periodLabel(d, true)}</b>
        <span>
          {d.employer || "Payslip"} · paid {shortDate(d.payDate)}
          {d.advice && <> · advice #{d.advice}</>}
        </span>
        <span className="ps-item-file">{p.file ? `${p.file.name} · ${kb(p.file.size)} · encrypted` : "No PDF, entered by hand"}</span>
      </button>
      <dl className="ps-item-nums">
        <div>
          <dt>Gross</dt>
          <dd>{money(d.current.gross, 2)}</dd>
        </div>
        <div>
          <dt>Deposit</dt>
          <dd className="ps-pos">{money(d.current.net, 2)}</dd>
        </div>
      </dl>
      <label className="ps-inc">
        <input type="checkbox" checked={!p.excluded} onChange={(e) => onInclude(e.target.checked)} /> Use
      </label>
      <div className="ps-row ps-item-act">
        <button type="button" className="ps-btn sm" onClick={onView}>
          View
        </button>
        <button type="button" className="ps-btn sm" onClick={onEdit}>
          Edit
        </button>
        {confirming ? (
          <>
            <button type="button" className="ps-btn sm danger" onClick={onDelete}>
              Delete for good
            </button>
            <button type="button" className="ps-btn sm" onClick={onCancel}>
              Keep
            </button>
          </>
        ) : (
          <button type="button" className="ps-btn sm" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

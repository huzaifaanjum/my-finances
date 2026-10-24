"use client";

import { useRef } from "react";
import { periodLabel } from "@/lib/payslips/analysis";
import type { Payslip } from "@/lib/payslips/types";

interface Props {
  used: Payslip[];
  all: Payslip[];
  onView: (id: string) => void;
  onFiles: (files: File[]) => void;
  busy: boolean;
}

/** Which payslips every number on this page comes from. */
export default function SourcesStrip({ used, all, onView, onFiles, busy }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const left = all.length - used.length;
  return (
    <div className="ps-src">
      <div>
        <span className="ps-src-k">{used.length ? `Based on ${used.length} ${used.length === 1 ? "payslip" : "payslips"}` : "No payslips yet"}</span>
        <div className="ps-chips">
          {used.map((p, k) => (
            <button key={p.id} type="button" className={`ps-chip${k === used.length - 1 ? " last" : ""}`} onClick={() => onView(p.id)} title="Open this payslip">
              {periodLabel(p.data)}
              {k === used.length - 1 && <em>latest</em>}
            </button>
          ))}
          {left > 0 && <span className="ps-src-x">{left} left out</span>}
        </div>
      </div>
      <button type="button" className="ps-btn primary" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? "Reading…" : "Upload payslip"}
      </button>
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
  );
}

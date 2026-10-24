"use client";

import { useEffect, useRef, useState } from "react";
import { useElementWidth } from "@/hooks/useElementWidth";
import { money } from "@/lib/format";
import { friendly, periodLabel, shortDate } from "@/lib/payslips/analysis";
import { openPdf } from "@/lib/payslips/pdf";
import { LINE_GROUPS, TOTAL_FIELDS, type Payslip } from "@/lib/payslips/types";
import Modal from "./Modal";
import { useVault } from "./PayslipVault";

const ZOOMS = [0.75, 1, 1.25, 1.5, 2];

/** Decrypts the PDF in memory and draws it with pdf.js; the details read from it sit alongside. */
export default function PayslipViewer({ id, onClose, onSelect }: { id: string; onClose: () => void; onSelect: (id: string) => void }) {
  const { payslips, fileBytes } = useVault();
  const k = payslips.findIndex((p) => p.id === id);
  const slip = payslips[k];
  const [tab, setTab] = useState<"pdf" | "details">(slip?.file ? "pdf" : "details");
  const [zoom, setZoom] = useState(1);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setBytes(null);
    setErr("");
    if (!slip?.file) {
      setTab("details");
      return;
    }
    let live = true;
    fileBytes(id)
      .then((b) => live && setBytes(b))
      .catch(() => live && setErr("Couldn't decrypt this PDF."));
    return () => {
      live = false;
    };
  }, [id, slip?.file, fileBytes]);

  if (!slip) return null;
  const older = payslips[k - 1];
  const newer = payslips[k + 1];

  function download(open: boolean) {
    if (!bytes || !slip.file) return;
    const url = URL.createObjectURL(new Blob([bytes.slice()], { type: "application/pdf" }));
    if (open) window.open(url, "_blank", "noopener");
    else {
      const a = document.createElement("a");
      a.href = url;
      a.download = slip.file.name;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <Modal
      title={periodLabel(slip.data, true)}
      onClose={onClose}
      wide
      actions={
        <>
          <button type="button" className="ps-btn sm" disabled={!older} onClick={() => older && onSelect(older.id)} aria-label="Older payslip">
            ←
          </button>
          <button type="button" className="ps-btn sm" disabled={!newer} onClick={() => newer && onSelect(newer.id)} aria-label="Newer payslip">
            →
          </button>
        </>
      }
    >
      <div className="ps-vbar">
        <div className="ps-seg sm" role="group" aria-label="Show">
          <button type="button" aria-pressed={tab === "pdf"} disabled={!slip.file} onClick={() => setTab("pdf")}>
            PDF
          </button>
          <button type="button" aria-pressed={tab === "details"} onClick={() => setTab("details")}>
            Details read from it
          </button>
        </div>
        {tab === "pdf" && slip.file && (
          <div className="ps-row">
            <button type="button" className="ps-btn sm" disabled={zoom <= ZOOMS[0]} onClick={() => setZoom(ZOOMS[Math.max(0, ZOOMS.indexOf(zoom) - 1)])} aria-label="Zoom out">
              −
            </button>
            <span className="ps-zoom">{Math.round(zoom * 100)}%</span>
            <button type="button" className="ps-btn sm" disabled={zoom >= ZOOMS[ZOOMS.length - 1]} onClick={() => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(zoom) + 1)])} aria-label="Zoom in">
              +
            </button>
            <button type="button" className="ps-btn sm" disabled={!bytes} onClick={() => download(true)} title="Opens a decrypted copy in a new tab">
              Open
            </button>
            <button type="button" className="ps-btn sm" disabled={!bytes} onClick={() => download(false)} title="Saves a decrypted copy to this device">
              Download
            </button>
          </div>
        )}
      </div>

      {tab === "pdf" ? (
        err ? (
          <p className="ps-msg">{err}</p>
        ) : bytes ? (
          <PdfPages bytes={bytes} zoom={zoom} />
        ) : (
          <p className="note">Decrypting…</p>
        )
      ) : (
        <Details slip={slip} />
      )}
    </Modal>
  );
}

function PdfPages({ bytes, zoom }: { bytes: Uint8Array; zoom: number }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(800);
  const holder = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    const box = holder.current;
    if (!box) return;
    const docP = openPdf(bytes);
    (async () => {
      const doc = await docP;
      const canvases: HTMLCanvasElement[] = [];
      for (let n = 1; n <= doc.numPages && live; n++) {
        const page = await doc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const scale = (Math.max(280, width - 2) / base.width) * zoom;
        const dpr = window.devicePixelRatio || 1;
        const vp = page.getViewport({ scale: scale * dpr });
        const c = document.createElement("canvas");
        c.width = Math.floor(vp.width);
        c.height = Math.floor(vp.height);
        c.style.width = `${Math.floor(vp.width / dpr)}px`;
        c.style.height = `${Math.floor(vp.height / dpr)}px`;
        c.setAttribute("aria-label", `Page ${n}`);
        await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        canvases.push(c);
      }
      if (live) box.replaceChildren(...canvases);
    })().catch(() => live && setErr("Couldn't draw this PDF."));
    return () => {
      live = false;
      void docP.then((d) => d.destroy()).catch(() => undefined);
    };
  }, [bytes, zoom, width]);

  return (
    <div ref={ref} className="ps-pdf">
      {err && <p className="ps-msg">{err}</p>}
      <div ref={holder} className="ps-pages" />
    </div>
  );
}

function Details({ slip }: { slip: Payslip }) {
  const d = slip.data;
  return (
    <div className="ps-det">
      <dl className="facts">
        {[
          ["Employer", d.employer || "—"],
          ["Job title", d.jobTitle || "—"],
          ["Period", `${shortDate(d.periodStart)} – ${shortDate(d.periodEnd)}`],
          ["Paid", shortDate(d.payDate)],
          ["Pay rate", d.payRate ? `${money(d.payRate, 2)} ${d.payFrequency.toLowerCase()}` : "—"],
          ["Advice #", d.advice || "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="ps-det-grid">
        {LINE_GROUPS.filter((g) => d[g.key].length).map((g) => (
          <table key={g.key} className="ps-table">
            <thead>
              <tr>
                <th>{g.title}</th>
                <th>This period</th>
                <th>Year to date</th>
              </tr>
            </thead>
            <tbody>
              {d[g.key].map((l, i) => (
                <tr key={i}>
                  <td>{friendly(l.label)}</td>
                  <td>{money(l.current, 2)}</td>
                  <td>{money(l.ytd, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
        <table className="ps-table">
          <thead>
            <tr>
              <th>Totals</th>
              <th>This period</th>
              <th>Year to date</th>
            </tr>
          </thead>
          <tbody>
            {TOTAL_FIELDS.map((f) => (
              <tr key={f.key} className={f.key === "net" ? "tt" : undefined}>
                <td>{f.label}</td>
                <td>{money(d.current[f.key], 2)}</td>
                <td>{money(d.ytd[f.key], 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {d.note && <p className="note">Note: {d.note}</p>}
    </div>
  );
}

// pdf.js, loaded only when a payslip is read or viewed. Runs entirely in the browser.
import type { PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import { parsePayslip, type ParseResult, type TextItem } from "./parse";

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let lib: Promise<PdfJs> | null = null;

export function pdfjs(): Promise<PdfJs> {
  lib ??= import("pdfjs-dist/legacy/build/pdf.mjs").then((m) => {
    m.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    return m;
  });
  return lib;
}

/** pdf.js takes ownership of the buffer it is given, so it always gets a copy. */
export async function openPdf(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  const m = await pdfjs();
  return m.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
}

/** Reads the first page's text and parses it as a pay advice. */
export async function readPayslip(bytes: Uint8Array): Promise<ParseResult> {
  const doc = await openPdf(bytes);
  try {
    const content = await (await doc.getPage(1)).getTextContent();
    const items: TextItem[] = [];
    for (const it of content.items) {
      if ("str" in it) items.push({ str: it.str, x: it.transform[4], y: it.transform[5], w: it.width });
    }
    return parsePayslip(items);
  } finally {
    void doc.destroy();
  }
}

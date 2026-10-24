// Reads an Air Canada (PeopleSoft) pay advice from the positioned text pdf.js extracts.
// Column headers ("Description", "Current", "YTD", ...) anchor every value, so lines can be
// added, removed or reordered between payslips without breaking the parser.
// Personal identifiers (address, employee ID, bank account) are skipped on purpose.

import { emptyPayslip, type LineGroup, type PayLine, type PayslipData, type PayTotals, type Taxability } from "./types";

export interface TextItem {
  str: string;
  /** left edge, in PDF points from the left */
  x: number;
  /** baseline, in PDF points from the bottom */
  y: number;
  w: number;
}

export interface ParseResult {
  data: PayslipData;
  /** checks that did not add up, shown so the numbers can be fixed by hand */
  warnings: string[];
}

export class ParseError extends Error {}

const NUM = /^\(?-?\$?\d[\d,]*\.\d{2}\)?-?$/;
const SAME_LINE = 2.5;

export function toNumber(s: string): number {
  const t = s.trim();
  const v = Number(t.replace(/[^\d.]/g, ""));
  return /^-|-$|^\(/.test(t) ? -v : v;
}

const right = (it: TextItem) => it.x + it.w;
const round2 = (v: number) => Math.round(v * 100) / 100;

/** "2026/10/31" -> "2026-10-31" */
function isoDate(s: string | undefined): string {
  const m = s?.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : "";
}

/** Items grouped into lines (top to bottom), each sorted left to right. */
function toLines(items: TextItem[]): TextItem[][] {
  const sorted = items.filter((i) => i.str.trim()).sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: TextItem[][] = [];
  for (const it of sorted) {
    const line = lines[lines.length - 1];
    if (line && Math.abs(line[0].y - it.y) <= SAME_LINE) line.push(it);
    else lines.push([it]);
  }
  for (const l of lines) l.sort((a, b) => a.x - b.x);
  return lines;
}

interface Entry {
  label: string;
  x: number;
  y: number;
  nums: { v: number; r: number }[];
}

/** A line split into label + the numbers that follow it, e.g. "Dental 46.82 93.64". */
function toEntries(line: TextItem[]): Entry[] {
  const out: Entry[] = [];
  for (const it of line) {
    const s = it.str.trim();
    if (NUM.test(s) && out.length) out[out.length - 1].nums.push({ v: toNumber(s), r: right(it) });
    else if (!NUM.test(s)) out.push({ label: s, x: it.x, y: it.y, nums: [] });
  }
  return out;
}

interface Section {
  group: LineGroup;
  /** x of the first value column; labels to the left of it belong here */
  firstX: number;
  /** value columns: right edge and role */
  cols: { r: number; role: "current" | "ytd" | "hours" }[];
}

const TITLES: [RegExp, LineGroup][] = [
  [/BEFORE-TAX/i, "preTax"],
  [/AFTER-TAX/i, "afterTax"],
  [/EMPLOYER/i, "employerPaid"],
  [/EARNINGS/i, "earnings"],
  [/TAXES/i, "taxes"],
];

/** The sections whose "Description" headers sit on this line. */
function sectionsOn(line: TextItem[], all: TextItem[]): Section[] {
  const descs = line.filter((i) => i.str.trim() === "Description");
  const y = line[0].y;
  const titles = all.filter(
    (i) => i.y > y + SAME_LINE && i.y < y + 40 && i.str === i.str.toUpperCase() && TITLES.some(([re]) => re.test(i.str)),
  );
  return descs.map((d, k) => {
    const end = descs[k + 1]?.x ?? Infinity;
    const heads = line.filter((i) => i.x > d.x && i.x < end && /^(Hours|Earnings|Current|YTD)$/.test(i.str.trim()));
    const title = titles.find((t) => {
      const c = t.x + t.w / 2;
      return c >= d.x - 40 && c < end;
    });
    const group = TITLES.find(([re]) => title && re.test(title.str))?.[1];
    const seen = new Set<string>();
    const cols = heads.map((h) => {
      const name = h.str.trim();
      const first = !seen.has(name);
      seen.add(name);
      const role: Section["cols"][number]["role"] =
        name === "Hours" ? "hours" : name === "YTD" ? "ytd" : name === "Current" ? "current" : first ? "current" : "ytd";
      return { r: right(h), role };
    });
    return { group: group ?? (["earnings", "preTax", "taxes"] as LineGroup[])[k] ?? "taxes", firstX: heads[0]?.x ?? d.x + 80, cols };
  });
}

function toLine(e: Entry, s: Section): PayLine {
  let current = 0;
  let ytd = 0;
  for (const n of e.nums) {
    const col = s.cols.reduce((best, c) => (Math.abs(c.r - n.r) < Math.abs(best.r - n.r) ? c : best), s.cols[0]);
    if (col?.role === "current") current = n.v;
    else if (col?.role === "ytd") ytd = n.v;
  }
  const m = e.label.match(/^(FP|N|P|F)-\s*(.*)$/);
  const line: PayLine = { label: m ? m[2] : e.label, current, ytd };
  if (m) line.taxable = m[1] as Taxability;
  return line;
}

const TOTAL_KEYS: [RegExp, keyof PayTotals][] = [
  [/^TOTAL GROSS$/, "gross"],
  [/^CIT TAXABLE/, "citTaxable"],
  [/^QIT TAXABLE/, "qitTaxable"],
  [/^TOTAL TAXES$/, "taxes"],
  [/^TOTAL DEDUCTIONS$/, "deductions"],
  [/^NET PAY$/, "net"],
];

export function parsePayslip(items: TextItem[]): ParseResult {
  const lines = toLines(items);
  const all = lines.flat();
  const data = emptyPayslip();
  const warnings: string[] = [];

  /** the text just to the right of a label on the same line */
  const valueOf = (label: string): string | undefined => {
    const it = all.find((i) => i.str.trim() === label);
    if (!it) return undefined;
    return all
      .filter((i) => Math.abs(i.y - it.y) <= SAME_LINE && i.x >= right(it) - 1 && i !== it)
      .sort((a, b) => a.x - b.x)[0]
      ?.str.trim();
  };

  // the employer's name is the top-left text
  const top = all.reduce((t, i) => Math.max(t, i.y), 0);
  data.employer = all.filter((i) => i.y > top - 12).sort((a, b) => a.x - b.x || b.y - a.y)[0]?.str.trim() ?? "";
  data.periodStart = isoDate(valueOf("Pay Begin Date:"));
  data.periodEnd = isoDate(valueOf("Pay End Date:"));
  data.payDate = isoDate(valueOf("Advice Date:"));
  data.advice = (valueOf("Advice #:") ?? "").replace(/^0+/, "");
  data.jobTitle = valueOf("Job Title:") ?? "";
  const rate = (valueOf("Pay Rate:") ?? "").match(/([\d,]+\.\d{2})\s*(\w+)?/);
  if (rate) {
    data.payRate = toNumber(rate[1]);
    data.payFrequency = rate[2] ?? "Monthly";
  }

  // the two header rows of the tables
  const headerLines = lines.filter((l) => l.some((i) => i.str.trim() === "Description"));
  if (!headerLines.length || !data.periodEnd) {
    throw new ParseError("This PDF doesn't look like an Air Canada pay advice.");
  }
  const upper = sectionsOn(headerLines[0], all);
  const lower = headerLines[1] ? sectionsOn(headerLines[1], all) : [];
  const earnings = upper.find((s) => s.group === "earnings");
  const summaryLine = lines.find((l) => l.some((i) => /^TOTAL GROSS$/.test(i.str.trim())));
  const tableBottom = summaryLine?.[0].y ?? 0;
  const lowerTop = headerLines[1]?.[0].y ?? -Infinity;

  for (const line of lines) {
    const y = line[0].y;
    if (y >= headerLines[0][0].y - SAME_LINE || y <= tableBottom + SAME_LINE) continue;
    if (Math.abs(y - lowerTop) <= SAME_LINE) continue;
    const sections = y > lowerTop ? upper : [...(earnings ? [earnings] : []), ...lower];
    const ordered = [...sections].sort((a, b) => a.firstX - b.firstX);
    for (const e of toEntries(line)) {
      if (!e.nums.length || /^TOTAL/i.test(e.label)) continue;
      const s = ordered.find((sec) => sec.firstX > e.x);
      if (!s) continue;
      data[s.group].push(toLine(e, s));
    }
  }

  // TOTAL GROSS ... NET PAY, then a "Current:" row and a "YTD:" row
  if (summaryLine) {
    const heads = TOTAL_KEYS.map(([re, key]) => ({ key, it: summaryLine.find((i) => re.test(i.str.trim())) })).filter((h) => h.it);
    const fill = (label: string, into: PayTotals) => {
      const entry = lines.flatMap(toEntries).find((e) => e.label === label && e.y < summaryLine[0].y);
      if (!entry) return;
      if (entry.nums.length === heads.length) {
        heads.forEach((h, k) => (into[h.key] = entry.nums[k].v));
        return;
      }
      for (const n of entry.nums) {
        const h = heads.reduce((b, c) => (Math.abs(right(c.it!) - n.r) < Math.abs(right(b.it!) - n.r) ? c : b));
        into[h.key] = n.v;
      }
    };
    fill("Current:", data.current);
    fill("YTD:", data.ytd);
  }

  // cross-checks
  const sum = (ls: PayLine[], k: "current" | "ytd" = "current") => round2(ls.reduce((t, l) => t + l[k], 0));
  const c = data.current;
  const check = (what: string, got: number, want: number) => {
    if (Math.abs(got - want) > 0.05) warnings.push(`${what}: lines add up to ${got.toFixed(2)}, the total says ${want.toFixed(2)}.`);
  };
  if (!c.gross) warnings.push("Couldn't find the totals row.");
  else {
    check("Earnings", sum(data.earnings), c.gross);
    check("Taxes", sum(data.taxes), c.taxes);
    check("Deductions", round2(sum(data.preTax) + sum(data.afterTax)), c.deductions);
    check("Net pay", round2(c.gross - c.taxes - c.deductions), c.net);
  }
  return { data, warnings };
}

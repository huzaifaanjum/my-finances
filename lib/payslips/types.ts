// Shapes for payslips. Everything here is encrypted in the browser before it is saved.

/** Taxability prefix on employer-paid lines: N- non-taxable, P- Quebec only, F- federal only, FP- both. */
export type Taxability = "N" | "P" | "F" | "FP";

export interface PayLine {
  label: string;
  current: number;
  ytd: number;
  taxable?: Taxability;
}

export interface PayTotals {
  gross: number;
  /** federal (CIT) taxable gross */
  citTaxable: number;
  /** Quebec (QIT) taxable gross, which includes taxable benefits */
  qitTaxable: number;
  taxes: number;
  /** before-tax plus after-tax deductions */
  deductions: number;
  net: number;
}

export interface PayslipData {
  employer: string;
  jobTitle: string;
  /** YYYY-MM-DD */
  periodStart: string;
  periodEnd: string;
  payDate: string;
  advice: string;
  payRate: number;
  payFrequency: string;
  earnings: PayLine[];
  preTax: PayLine[];
  taxes: PayLine[];
  afterTax: PayLine[];
  employerPaid: PayLine[];
  current: PayTotals;
  ytd: PayTotals;
  note: string;
}

export type LineGroup = "earnings" | "preTax" | "taxes" | "afterTax" | "employerPaid";

export const LINE_GROUPS: { key: LineGroup; title: string }[] = [
  { key: "earnings", title: "Earnings" },
  { key: "preTax", title: "Before-tax deductions" },
  { key: "taxes", title: "Taxes and government plans" },
  { key: "afterTax", title: "After-tax deductions" },
  { key: "employerPaid", title: "Paid by your employer" },
];

export const TOTAL_FIELDS: { key: keyof PayTotals; label: string }[] = [
  { key: "gross", label: "Total gross" },
  { key: "citTaxable", label: "Federal taxable gross" },
  { key: "qitTaxable", label: "Quebec taxable gross" },
  { key: "taxes", label: "Total taxes" },
  { key: "deductions", label: "Total deductions" },
  { key: "net", label: "Net pay" },
];

export interface FileMeta {
  name: string;
  size: number;
  type: string;
}

/** One saved payslip, decrypted. */
export interface Payslip {
  id: string;
  data: PayslipData;
  file: FileMeta | null;
  /** left out of the summary, forecast and insights */
  excluded: boolean;
  createdAt: number;
  updatedAt: number;
}

const zeroTotals = (): PayTotals => ({ gross: 0, citTaxable: 0, qitTaxable: 0, taxes: 0, deductions: 0, net: 0 });

export function emptyPayslip(): PayslipData {
  return {
    employer: "",
    jobTitle: "",
    periodStart: "",
    periodEnd: "",
    payDate: "",
    advice: "",
    payRate: 0,
    payFrequency: "Monthly",
    earnings: [],
    preTax: [],
    taxes: [],
    afterTax: [],
    employerPaid: [],
    current: zeroTotals(),
    ytd: zeroTotals(),
    note: "",
  };
}

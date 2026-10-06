const currencyFormatters = new Map<number, Intl.NumberFormat>();

/** CAD currency, e.g. money(1234.5) -> "$1,235", money(12.345, 2) -> "$12.35". */
export function money(value: number, digits = 0): string {
  let fmt = currencyFormatters.get(digits);
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    currencyFormatters.set(digits, fmt);
  }
  return fmt.format(value);
}

/** Money with an explicit minus sign in front of the dollar sign. */
export function signedMoney(value: number): string {
  return (value < 0 ? "-" : "") + money(Math.abs(value));
}

/** Money with + or - in front, for differences. */
export function deltaMoney(value: number): string {
  return (value > 0 ? "+" : "-") + money(Math.abs(value));
}

/** A ratio as a whole percentage: 0.236 -> "24%". */
export function percent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** Short money for axes and tiles: $950, $1.2k, $25k, $1.25M. */
export function compactMoney(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e6) return `${sign}$${+(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  return sign + money(abs);
}

/** A month count as "3 yrs 4 mo". null means the goal is never reached. */
export function duration(months: number | null, never = "Not within 50 years"): string {
  if (months === null) return never;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [years ? `${years} yrs` : "", rest ? `${rest} mo` : ""].filter(Boolean);
  return parts.join(" ") || "now";
}

export const pctLabel = (v: number): string => `${v}%`;

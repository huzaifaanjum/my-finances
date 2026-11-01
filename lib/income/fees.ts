// What each payment service keeps from one sale, from their published rates (checked November 2026).

export type Region = "ca" | "us" | "world";

export interface Sale {
  price: number;
  region: Region;
  /** a subscription renewal rather than a one-time sale */
  recurring: boolean;
  /** you convert the money to Canadian dollars at the provider's rate, rather than keeping a USD balance */
  convert: boolean;
}

export interface FeeModel {
  name: string;
  /** handles worldwide sales tax for you as merchant of record */
  mor: boolean;
  /** the rate is an estimate, because part of it depends on the card */
  estimate?: boolean;
  /** percentage and fixed amount kept on this sale */
  rate: (sale: Sale) => { pct: number; fixed: number };
}

const stripe = (s: Sale) => 2.9 + (s.region === "ca" ? 0 : 0.8) + (s.recurring ? 0.7 : 0) + (s.convert ? 2 : 0);

export const FEE_MODELS: FeeModel[] = [
  { name: "Stripe", mor: false, rate: (s) => ({ pct: stripe(s), fixed: 0.3 }) },
  { name: "Stripe Managed Payments", mor: true, rate: (s) => ({ pct: stripe(s) - (s.recurring ? 0.7 : 0) + 3.5, fixed: 0.3 }) },
  { name: "Creem", mor: true, rate: () => ({ pct: 3.9, fixed: 0.4 }) },
  { name: "Paddle", mor: true, rate: () => ({ pct: 5, fixed: 0.5 }) },
  { name: "Polar (Starter)", mor: true, rate: (s) => ({ pct: 5 + (s.region === "us" ? 0 : 1.5), fixed: 0.5 }) },
  { name: "Helcim", mor: false, estimate: true, rate: (s) => ({ pct: 2 + (s.region === "ca" ? 0 : 1), fixed: 0.25 }) },
  { name: "Square", mor: false, rate: (s) => ({ pct: 2.8 + (s.region === "ca" ? 0 : 1.5), fixed: 0.3 }) },
  { name: "PayPal", mor: false, rate: (s) => ({ pct: 2.9 + (s.region === "ca" ? 0 : s.region === "us" ? 0.8 : 1) + (s.convert ? 4 : 0), fixed: 0.3 }) },
  { name: "Gumroad", mor: true, rate: () => ({ pct: 10, fixed: 0.5 }) },
  { name: "App Store or Google Play", mor: true, rate: () => ({ pct: 15, fixed: 0 }) },
];

export function feeOn(model: FeeModel, sale: Sale): number {
  const { pct, fixed } = model.rate(sale);
  return (sale.price * pct) / 100 + fixed;
}

/** Every service for this sale, keeping the most first. */
export function compareFees(sale: Sale) {
  return FEE_MODELS.map((model) => {
    const fee = feeOn(model, sale);
    return { name: model.name, mor: model.mor, estimate: !!model.estimate, fee, keep: sale.price - fee, share: fee / sale.price };
  }).sort((a, b) => a.fee - b.fee);
}

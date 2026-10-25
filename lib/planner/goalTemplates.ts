// Templates for saving goals. Each template asks for the few numbers that drive that kind of cost and adds them up.
// House and car keep their own detailed pages (mortgage and loan); every other template shares one page.
// Typical figures are from Canadian and Quebec sources checked in Oct 2026 (listed per template) and are only a starting point.

import { QC_SALES_TAX } from "./car";
import { SLIDERS } from "./config";
import type { Plan } from "./projection";

export type FieldKind = "money" | "count" | "percent" | "months" | "toggle" | "points";

export interface TemplateField {
  key: string;
  label: string;
  kind: FieldKind;
  initial: number;
  max?: number;
  step?: number;
  hint?: string;
}

export interface CostLine {
  label: string;
  amount: number;
  note?: string;
}

export interface GoalCost {
  /** what you need saved */
  target: number;
  lines: CostLine[];
  /** money that comes back later (tax credits), shown but not taken off the target */
  back?: CostLine;
}

export interface GoalTemplate {
  kind: string;
  name: string;
  /** one line in the picker */
  blurb: string;
  /** a typical total, shown in the picker */
  typical: string;
  /** months until the goal, by default */
  months: number;
  /** house and car have their own page */
  detail?: "house" | "car";
  fields: TemplateField[];
  cost: (v: Record<string, number>, plan: Plan) => GoalCost;
  tips: string[];
  sources: { label: string; url: string }[];
}

const val = (v: Record<string, number>, f: TemplateField) => v[f.key] ?? f.initial;
/** Fills in defaults for any field not set yet. */
export const valuesOf = (t: GoalTemplate, v: Record<string, number>) => Object.fromEntries(t.fields.map((f) => [f.key, val(v, f)]));

const tax = (amount: number, on: number) => (on ? amount * QC_SALES_TAX : 0);
/** Aeroplan points, valued at the typical 1.5¢ on flights */
const POINT_VALUE = 0.015;
/** federal (14% lowest rate in 2026) plus Quebec (8%) tuition credits */
const TUITION_CREDIT = 0.22;

const sliderField = (key: keyof typeof SLIDERS, kind: FieldKind): TemplateField => ({
  key,
  label: SLIDERS[key].label,
  kind,
  initial: SLIDERS[key].initial,
  max: SLIDERS[key].max,
  step: SLIDERS[key].step,
});

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    kind: "house",
    name: "Home",
    blurb: "Down payment, closing costs and mortgage insurance, with the mortgage it leads to.",
    typical: "$450,000 home · about $60,000 cash",
    months: 36,
    detail: "house",
    fields: [sliderField("home", "money"), sliderField("dpp", "percent"), sliderField("hrate", "percent"), sliderField("hamort", "count"), sliderField("hextra", "money"), sliderField("hbuy", "months")],
    cost: () => ({ target: 0, lines: [] }),
    tips: [],
    sources: [],
  },
  {
    kind: "car",
    name: "Car",
    blurb: "Down payment, sales tax and a loan, with how long it takes and what the interest costs.",
    typical: "$40,000 car · $10,000 down",
    months: 12,
    detail: "car",
    fields: [
      sliderField("cprice", "money"),
      { key: "ctax", label: "Add GST and QST (14.975%)", kind: "toggle", initial: 1 },
      sliderField("cdown", "money"),
      sliderField("capr", "percent"),
      sliderField("cterm", "months"),
      sliderField("cextra", "money"),
      sliderField("cbuy", "months"),
    ],
    cost: () => ({ target: 0, lines: [] }),
    tips: [],
    sources: [],
  },
  {
    kind: "trip",
    name: "Trip",
    blurb: "Lodging, food and activities per day, flights and insurance. Aeroplan points can cover flights.",
    typical: "$3,000 to $4,000 for a week in Europe",
    months: 10,
    fields: [
      { key: "people", label: "Travellers", kind: "count", initial: 2, max: 10 },
      { key: "nights", label: "Nights", kind: "count", initial: 7, max: 60 },
      { key: "lodging", label: "Lodging a night (the room, not per person)", kind: "money", initial: 180, step: 10 },
      { key: "daily", label: "Food and activities a day, per person", kind: "money", initial: 110, step: 5, hint: "About $75 budget, $110 to $150 mid-range in Western Europe" },
      { key: "flights", label: "Flights per person, return", kind: "money", initial: 900, step: 25, hint: "Lower for you on standby; others pay the fare" },
      { key: "insurance", label: "Travel insurance per person", kind: "money", initial: 60, step: 5, hint: "Your Manulife plan may already cover medical abroad" },
      { key: "points", label: "Aeroplan points toward flights", kind: "points", initial: 0, step: 1000 },
      { key: "buffer", label: "Buffer for surprises", kind: "percent", initial: 10, max: 30 },
    ],
    cost: (v) => {
      const lodging = v.lodging * v.nights;
      const daily = v.daily * v.people * (v.nights + 1);
      const flights = v.flights * v.people;
      const points = Math.min(flights, v.points * POINT_VALUE);
      const insurance = v.insurance * v.people;
      const sub = lodging + daily + flights - points + insurance;
      const buffer = (sub * v.buffer) / 100;
      return {
        target: sub + buffer,
        lines: [
          { label: "Lodging", amount: lodging, note: `${v.nights} nights` },
          { label: "Food and activities", amount: daily, note: `${v.people} × ${v.nights + 1} days` },
          { label: "Flights", amount: flights, note: `${v.people} return` },
          ...(points ? [{ label: "Aeroplan points", amount: -points, note: `${v.points.toLocaleString("en-CA")} points at 1.5¢` }] : []),
          { label: "Travel insurance", amount: insurance },
          { label: "Buffer", amount: buffer, note: `${v.buffer}%` },
        ],
      };
    },
    tips: [
      "Book lodging with free cancellation, then rebook if prices drop.",
      "Pay in the local currency with a card that has no foreign transaction fee; the usual 2.5% adds up.",
      "Check what your Manulife health plan covers abroad before buying extra insurance.",
    ],
    sources: [
      { label: "Europe daily costs, 2026 (Guidester)", url: "https://www.guidester.com/trip-to-europe-cost/" },
      { label: "Europe on a budget by region, 2026", url: "https://www.europeantourism.org/europe-on-a-budget/" },
    ],
  },
  {
    kind: "wedding",
    name: "Wedding",
    blurb: "Guests times cost per guest, fixed costs like photos and attire, rings, and your share.",
    typical: "$25,000 to $40,000 in Quebec",
    months: 24,
    fields: [
      { key: "guests", label: "Guests", kind: "count", initial: 80, max: 300 },
      { key: "perGuest", label: "Cost per guest (meal, drinks, service)", kind: "money", initial: 200, step: 10, hint: "Quebec benchmark: $150 to $250" },
      { key: "fixed", label: "Fixed costs (venue, photos, music, attire, flowers)", kind: "money", initial: 12000, step: 500 },
      { key: "rings", label: "Wedding bands", kind: "money", initial: 1500, step: 100 },
      { key: "buffer", label: "Buffer for surprises", kind: "percent", initial: 10, max: 30 },
      { key: "share", label: "Your share of the cost", kind: "percent", initial: 50, max: 100, hint: "If it is split with a partner or family" },
    ],
    cost: (v) => {
      const food = v.guests * v.perGuest;
      const sub = food + v.fixed + v.rings;
      const buffer = (sub * v.buffer) / 100;
      const total = sub + buffer;
      const yours = (total * v.share) / 100;
      return {
        target: yours,
        lines: [
          { label: "Guests", amount: food, note: `${v.guests} × ${v.perGuest.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}` },
          { label: "Fixed costs", amount: v.fixed },
          { label: "Wedding bands", amount: v.rings },
          { label: "Buffer", amount: buffer, note: `${v.buffer}%` },
          ...(v.share < 100 ? [{ label: "Others pay", amount: yours - total, note: `${100 - v.share}%` }] : []),
        ],
      };
    },
    tips: [
      "The guest count drives most of the cost: every 10 guests is about $2,000 at $200 a head.",
      "Friday, Sunday and off-season dates are often much cheaper for the same venue.",
      "Set the budget together before booking anything, and keep the money in a separate account.",
    ],
    sources: [
      { label: "Wedding cost in Canada by province, 2026 (WealthNorth)", url: "https://wealthnorth.ca/personal-finance/how-much-does-it-cost/wedding-cost-canada/" },
      { label: "How much a wedding costs in Quebec (Distinction)", url: "https://distinction.qc.ca/en/how-much-does-a-wedding-cost-in-quebec-and-how-much-should-you-budget/" },
    ],
  },
  {
    kind: "ring",
    name: "Engagement ring",
    blurb: "Ring price plus sales tax, sizing and engraving.",
    typical: "$3,500 to $6,000 in Canada",
    months: 8,
    fields: [
      { key: "price", label: "Ring price", kind: "money", initial: 5000, step: 100, hint: "Lab-grown diamonds cost far less for the same look" },
      { key: "tax", label: "Add GST and QST (14.975%)", kind: "toggle", initial: 1 },
      { key: "extras", label: "Sizing, engraving and box", kind: "money", initial: 150, step: 25 },
      { key: "insurance", label: "First year of jewellery insurance", kind: "money", initial: 100, step: 10, hint: "Often added to tenant insurance as a rider" },
    ],
    cost: (v) => {
      const t = tax(v.price, v.tax);
      return {
        target: v.price + t + v.extras + v.insurance,
        lines: [
          { label: "Ring", amount: v.price },
          { label: "Sales tax", amount: t },
          { label: "Sizing and engraving", amount: v.extras },
          { label: "Insurance, first year", amount: v.insurance },
        ],
      };
    },
    tips: ["Pay cash: jewellery financing often charges 20% or more.", "Insure it with a rider on your tenant insurance; the appraisal sets the value."],
    sources: [{ label: "Average engagement ring cost in Canada, 2026 (Deeve)", url: "https://deeve.ca/blogs/diamond-education/average-engagement-ring-cost-canada-2026" }],
  },
  {
    kind: "emergency",
    name: "Emergency fund",
    blurb: "A number of months of your essential costs, taken from your Budget.",
    typical: "3 to 6 months of needs",
    months: 12,
    fields: [
      { key: "months", label: "Months of essential costs", kind: "count", initial: 3, max: 12, hint: "3 is the minimum; 6 if your income is less certain" },
      { key: "extra", label: "Extra cushion", kind: "money", initial: 0, step: 100 },
    ],
    cost: (v, plan) => {
      const base = plan.needs * v.months;
      return {
        target: base + v.extra,
        lines: [
          { label: "Essential costs", amount: base, note: `${v.months} × ${Math.round(plan.needs).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })} a month, from Budget` },
          ...(v.extra ? [{ label: "Extra cushion", amount: v.extra }] : []),
        ],
      };
    },
    tips: ["Keep it in a high-interest savings account or a TFSA you can reach in a day, not invested in stocks.", "Your disability cover pays after a waiting period; the fund carries you through it."],
    sources: [],
  },
  {
    kind: "moving",
    name: "Moving",
    blurb: "Movers by the hour, supplies, and furniture for the new place.",
    typical: "$1,000 to $3,000 for a 1-bedroom",
    months: 6,
    fields: [
      { key: "hours", label: "Hours with movers", kind: "count", initial: 4, max: 16, hint: "3 to 4 hours for a 1-bedroom" },
      { key: "rate", label: "Movers' hourly rate (2 movers and a truck)", kind: "money", initial: 250, step: 10, hint: "About $240 to $330 around July 1; $105 to $130 off-peak" },
      { key: "supplies", label: "Boxes and supplies", kind: "money", initial: 150, step: 10 },
      { key: "furniture", label: "Furniture and setup", kind: "money", initial: 1500, step: 100 },
      { key: "overlap", label: "Overlapping rent", kind: "money", initial: 0, step: 50, hint: "If you pay two places for a month" },
    ],
    cost: (v) => {
      const movers = v.hours * v.rate;
      return {
        target: movers + v.supplies + v.furniture + v.overlap,
        lines: [
          { label: "Movers", amount: movers, note: `${v.hours} h × ${v.rate.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}` },
          { label: "Supplies", amount: v.supplies },
          { label: "Furniture and setup", amount: v.furniture },
          ...(v.overlap ? [{ label: "Overlapping rent", amount: v.overlap }] : []),
        ],
      };
    },
    tips: [
      "Moving a few days after July 1 can halve the hourly rate in Montreal.",
      "In Quebec a landlord can't ask for a security deposit; only the first month's rent.",
      "Get a written quote with the hourly rate, minimum hours and travel time.",
    ],
    sources: [
      { label: "Montreal moving prices, 2026 (Demelina)", url: "https://demelina.com/en/price/" },
      { label: "Hourly rates of movers in Montreal, 2026", url: "https://comparemovers.ca/hourly-rates-movers-montreal/" },
    ],
  },
  {
    kind: "pet",
    name: "Pet",
    blurb: "Adoption, first vet visits and supplies, a year of food and care, and a vet buffer.",
    typical: "$4,000 to $6,000 the first year",
    months: 6,
    fields: [
      { key: "adoption", label: "Adoption or breeder fee", kind: "money", initial: 400, step: 50 },
      { key: "setup", label: "First vet visits, vaccines, spay or neuter, supplies", kind: "money", initial: 1500, step: 50 },
      { key: "monthly", label: "Food, insurance and care a month", kind: "money", initial: 200, step: 10, hint: "Dogs about $300 to $400; cats less" },
      { key: "buffer", label: "Emergency vet buffer", kind: "money", initial: 1000, step: 100 },
    ],
    cost: (v) => ({
      target: v.adoption + v.setup + v.monthly * 12 + v.buffer,
      lines: [
        { label: "Adoption", amount: v.adoption },
        { label: "Setup and first vet visits", amount: v.setup },
        { label: "First year of care", amount: v.monthly * 12, note: "12 months" },
        { label: "Vet buffer", amount: v.buffer },
      ],
    }),
    tips: ["Add the monthly cost to your Budget once the pet arrives.", "Pet insurance is cheapest when the pet is young; compare the deductible and yearly limit."],
    sources: [{ label: "First-year pet costs in Canada, 2026 (Money.ca)", url: "https://money.ca/managing-money/budgeting/what-to-expect-first-year-pet-costs-canada" }],
  },
  {
    kind: "baby",
    name: "Baby",
    blurb: "Gear, monthly baby costs, and the drop in income while you are on leave.",
    typical: "$7,000 to $25,000 the first year",
    months: 12,
    fields: [
      { key: "gear", label: "Gear (crib, stroller, car seat, clothes)", kind: "money", initial: 3000, step: 100, hint: "From about $1,500 secondhand to $6,000 new" },
      { key: "monthly", label: "Diapers, formula and the rest, a month", kind: "money", initial: 350, step: 10 },
      { key: "leave", label: "Months of parental leave", kind: "count", initial: 6, max: 18 },
      { key: "gap", label: "Drop in take-home a month on leave", kind: "money", initial: 1400, step: 50, hint: "QPIP pays part of your pay, up to a maximum" },
    ],
    cost: (v) => ({
      target: v.gear + v.monthly * 12 + v.gap * v.leave,
      lines: [
        { label: "Gear", amount: v.gear },
        { label: "Baby costs, first year", amount: v.monthly * 12, note: "12 months" },
        { label: "Income drop on leave", amount: v.gap * v.leave, note: `${v.leave} months` },
      ],
    }),
    tips: [
      "Quebec daycare (CPE) spaces cost far less than private ones; put your name on the list early.",
      "The Canada Child Benefit and Quebec's family allowance offset some costs; at your income they are partial.",
    ],
    sources: [
      { label: "Cost of raising a child in Canada (RBC)", url: "https://www.rbcroyalbank.com/en-ca/my-money-matters/life-events/finances-and-relationships/parenthood/the-cost-of-raising-a-child-in-canada-what-to-expect-at-every-stage/" },
      { label: "Baby's first year in Canada (Kidizio)", url: "https://kidizio.com/en/guides/baby-first-year-cost-canada/" },
    ],
  },
  {
    kind: "education",
    name: "Course or certification",
    blurb: "Fees, books and exams, minus what work pays. About 22% of fees comes back at tax time.",
    typical: "$1,000 to $5,000",
    months: 8,
    fields: [
      { key: "tuition", label: "Tuition or course fees", kind: "money", initial: 3000, step: 100 },
      { key: "exam", label: "Certification exam fees", kind: "money", initial: 400, step: 25 },
      { key: "books", label: "Books and materials", kind: "money", initial: 200, step: 25 },
      { key: "employer", label: "What Air Canada reimburses", kind: "money", initial: 0, step: 100, hint: "Ask about the training budget first" },
    ],
    cost: (v) => {
      const paid = v.tuition + v.exam + v.books - v.employer;
      const credit = Math.max(0, v.tuition + v.exam - v.employer) * TUITION_CREDIT;
      return {
        target: Math.max(0, paid),
        lines: [
          { label: "Fees", amount: v.tuition },
          { label: "Exam", amount: v.exam },
          { label: "Books and materials", amount: v.books },
          ...(v.employer ? [{ label: "Paid by work", amount: -v.employer }] : []),
        ],
        back: { label: "Back at tax time", amount: credit, note: "14% federal + 8% Quebec on eligible fees" },
      };
    },
    tips: ["Keep the T2202 and RL-8 slips from the school to claim the credits.", "Exam fees for a professional certification count; books don't."],
    sources: [
      { label: "Tuition tax credit (RCGT)", url: "https://www.rcgt.com/en/tax-planning-guide/sections/section-03-education/deductions-and-credits" },
      { label: "Quebec non-refundable credits, 2026 (KPMG)", url: "https://assets.kpmg.com/content/dam/kpmg/ca/pdf/2026/01/ca-quebec-non-refundable-tax-credit-rates-and-amounts-for-2026.pdf" },
    ],
  },
  {
    kind: "tech",
    name: "Laptop or phone",
    blurb: "Price plus sales tax and a protection plan, minus a trade-in.",
    typical: "$1,500 to $3,000",
    months: 6,
    fields: [
      { key: "price", label: "Price", kind: "money", initial: 2000, step: 50 },
      { key: "tax", label: "Add GST and QST (14.975%)", kind: "toggle", initial: 1 },
      { key: "care", label: "Protection plan", kind: "money", initial: 199, step: 10 },
      { key: "tradein", label: "Trade-in or resale of the old one", kind: "money", initial: 0, step: 50 },
    ],
    cost: (v) => {
      const t = tax(v.price, v.tax);
      return {
        target: Math.max(0, v.price + t + v.care - v.tradein),
        lines: [
          { label: "Price", amount: v.price },
          { label: "Sales tax", amount: t },
          { label: "Protection plan", amount: v.care },
          ...(v.tradein ? [{ label: "Trade-in", amount: -v.tradein }] : []),
        ],
      };
    },
    tips: ["Saving first beats 0% financing that turns into 20%+ if a payment is missed.", "Some credit cards double the manufacturer warranty, which can replace the protection plan."],
    sources: [],
  },
  {
    kind: "custom",
    name: "Something else",
    blurb: "Any goal that doesn't fit the others: just a target amount.",
    typical: "You set it",
    months: 12,
    fields: [{ key: "target", label: "Target amount", kind: "money", initial: 1000, step: 100 }],
    cost: (v) => ({ target: v.target, lines: [{ label: "Target", amount: v.target }] }),
    tips: [],
    sources: [],
  },
];

export const templateOf = (kind: string) => GOAL_TEMPLATES.find((t) => t.kind === kind) ?? GOAL_TEMPLATES[GOAL_TEMPLATES.length - 1];

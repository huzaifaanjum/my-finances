// Templates for saving goals. Each template asks for the few numbers that drive that kind of cost and adds them up.
// House and car keep their own detailed pages (mortgage and loan); every other template shares one page.
// Typical figures are from Canadian and Quebec sources checked in Oct 2026 (listed per template) and are only a starting point.

import { LSA_YEARLY } from "@/lib/benefits";
import { PAY, payMarginal } from "@/lib/pay";
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

/** medical expense credits: Quebec 20% above 3% of net income; federal about 12.5% after the Quebec abatement above the lesser of 3% or $2,834 */
const NET_INCOME = PAY.salary * (1 - PAY.pensionRate);
const medicalBack = (outOfPocket: number) =>
  Math.max(0, outOfPocket - NET_INCOME * 0.03) * 0.2 + Math.max(0, outOfPocket - Math.min(NET_INCOME * 0.03, 2834)) * 0.125;
const money0 = (n: number) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

const sliderField = (key: keyof typeof SLIDERS, kind: FieldKind): TemplateField => ({
  key,
  label: SLIDERS[key].label,
  kind,
  initial: SLIDERS[key].initial,
  max: SLIDERS[key].max,
  step: SLIDERS[key].step,
});


interface GadgetExtra {
  key: string;
  label: string;
  initial: number;
  step?: number;
  hint?: string;
}

/**
 * Electronics share one shape: the price, sales tax, the extras that make it usable (games, a second controller,
 * a mount, batteries…), an optional protection plan, minus a trade-in. Each device lists its own extras and tips.
 */
function gadget(o: {
  kind: string;
  name: string;
  blurb: string;
  typical: string;
  price: number;
  priceLabel?: string;
  priceHint: string;
  extras: GadgetExtra[];
  care?: number;
  months?: number;
  tips: string[];
  sources?: { label: string; url: string }[];
}): GoalTemplate {
  const fields: TemplateField[] = [
    { key: "price", label: o.priceLabel ?? "Price", kind: "money", initial: o.price, step: 10, hint: o.priceHint },
    ...o.extras.map((e): TemplateField => ({ key: e.key, label: e.label, kind: "money", initial: e.initial, step: e.step ?? 5, hint: e.hint })),
    { key: "care", label: "Protection plan or extended warranty", kind: "money", initial: o.care ?? 0, step: 10, hint: "Some credit cards double the manufacturer's warranty" },
    { key: "tax", label: "Add GST and QST (14.975%)", kind: "toggle", initial: 1 },
    { key: "tradein", label: "Trade-in or resale of what it replaces", kind: "money", initial: 0, step: 25 },
  ];
  return {
    kind: o.kind,
    name: o.name,
    blurb: o.blurb,
    typical: o.typical,
    months: o.months ?? 4,
    fields,
    cost: (v) => {
      const extras = o.extras.map((e) => ({ label: e.label, amount: v[e.key] })).filter((l) => l.amount);
      const before = v.price + extras.reduce((t, l) => t + l.amount, 0) + v.care;
      const t = tax(before, v.tax);
      return {
        target: Math.max(0, before + t - v.tradein),
        lines: [
          { label: o.priceLabel ?? "Price", amount: v.price },
          ...extras,
          ...(v.care ? [{ label: "Protection plan", amount: v.care }] : []),
          { label: "Sales tax", amount: t },
          ...(v.tradein ? [{ label: "Trade-in", amount: -v.tradein }] : []),
        ],
      };
    },
    tips: [...o.tips, "Black Friday, Boxing Day and Prime Day often take 10 to 25% off; saving until then can make the date and the price."],
    sources: o.sources ?? [],
  };
}

/** Price is my estimate where no current Canadian listing was found; the hint says so. */
const ELECTRONICS: GoalTemplate[] = [
  gadget({
    kind: "ps5",
    name: "PlayStation 5",
    blurb: "The console, a second controller, a couple of games and PlayStation Plus for online play.",
    typical: "$750 to $1,100 console",
    price: 819.99,
    priceLabel: "Console",
    priceHint: "Since Apr 2, 2026: $819.99 disc, $749.99 Digital, $1,099.99 Pro",
    extras: [
      { key: "controller", label: "Second DualSense controller", initial: 95 },
      { key: "games", label: "Games", initial: 180, step: 10, hint: "New games are about $90 each" },
      { key: "plus", label: "PlayStation Plus, one year", initial: 95, hint: "Needed for most online play; higher tiers add a game library" },
    ],
    tips: ["Disc games resell; digital ones don't. The disc model pays off if you buy many games.", "Wait for PlayStation Plus sales instead of renewing at full price."],
    sources: [{ label: "PS5 price increase in Canada, April 2026 (MobileSyrup)", url: "https://mobilesyrup.com/2026/03/27/sony-ps5-ps5-pro-ps-portal-canada-price-increase/" }],
  }),
  gadget({
    kind: "xbox",
    name: "Xbox Series X",
    blurb: "The console, a second controller, and Game Pass, which covers most of your games.",
    typical: "$680 to $1,000 console",
    price: 729.99,
    priceLabel: "Console",
    priceHint: "Sources list $729.99 to $999.99; check the Microsoft Store Canada price",
    extras: [
      { key: "controller", label: "Second controller", initial: 80 },
      { key: "gamepass", label: "Game Pass Ultimate, one year", initial: 312, step: 10, hint: "$25.99 a month since Apr 21, 2026" },
      { key: "storage", label: "Storage expansion card", initial: 0, step: 10 },
    ],
    tips: ["Game Pass replaces most game purchases; cancel in months you don't play.", "Price Game Pass for a year before you buy: it is the real running cost."],
    sources: [
      { label: "Game Pass prices in Canada, April 2026 (MobileSyrup)", url: "https://mobilesyrup.com/2026/04/21/microsoft-lowers-xbox-game-pass-price-canadian-pricing/" },
      { label: "Xbox consoles (Microsoft Store Canada)", url: "https://www.microsoft.com/en-ca/store/b/XBOXconsoles" },
    ],
  }),
  gadget({
    kind: "switch2",
    name: "Nintendo Switch 2",
    blurb: "The console, games, Switch Online, a Pro Controller and a microSD Express card for space.",
    typical: "$680 to $750 console",
    price: 679.99,
    priceLabel: "Console",
    priceHint: "$679.99 from Sep 1, 2026; the Mario Kart World bundle is $749.99",
    extras: [
      { key: "games", label: "Games", initial: 180, step: 10, hint: "About $90 each for new Nintendo games" },
      { key: "online", label: "Nintendo Switch Online, one year", initial: 30 },
      { key: "controller", label: "Pro Controller", initial: 115 },
      { key: "card", label: "microSD Express card", initial: 70, hint: "Older microSD cards don't work for Switch 2 games" },
      { key: "case", label: "Case and screen protector", initial: 40 },
    ],
    tips: ["A bundle with a game is usually cheaper than the console and game apart.", "Nintendo games rarely go on sale, so buy the ones you'll play most."],
    sources: [
      { label: "Switch 2 bundles in Canada (iPhone in Canada)", url: "https://www.iphoneincanada.ca/2026/08/25/nintendo-announces-new-switch-2-discount-bundles-in-canada/" },
      { label: "Switch 2 (Nintendo Canada)", url: "https://www.nintendo.com/en-ca/gaming-systems/switch-2/" },
    ],
  }),
  gadget({
    kind: "handheld",
    name: "Steam Deck or gaming handheld",
    blurb: "A handheld gaming PC, a case or dock, and some games.",
    typical: "$550 to $900",
    price: 739,
    priceHint: "Estimate; check Steam or the retailer for today's price",
    extras: [
      { key: "dock", label: "Dock and case", initial: 100 },
      { key: "games", label: "Games", initial: 100, step: 10, hint: "Steam sales often cut prices by half or more" },
    ],
    tips: ["Your existing Steam library comes with you, so the games cost may be zero."],
  }),
  gadget({
    kind: "gamingpc",
    name: "Gaming PC",
    blurb: "The tower, a monitor and the keyboard, mouse and headset that go with it.",
    typical: "$1,800 to $3,500",
    price: 2200,
    priceLabel: "PC (tower or parts)",
    priceHint: "Estimate; the graphics card is most of the cost",
    extras: [
      { key: "monitor", label: "Monitor", initial: 400, step: 10 },
      { key: "peripherals", label: "Keyboard, mouse and headset", initial: 250, step: 10 },
      { key: "os", label: "Windows licence", initial: 0, step: 10 },
    ],
    tips: ["Building it yourself saves 10 to 20% and makes later upgrades cheap.", "Spend on the graphics card and monitor; that's what you see."],
  }),
  gadget({
    kind: "vr",
    name: "VR headset",
    blurb: "A headset like the Meta Quest, a comfort strap and a few games.",
    typical: "$450 to $700",
    price: 650,
    priceLabel: "Headset",
    priceHint: "Estimate; check Meta or the retailer for today's price",
    extras: [
      { key: "strap", label: "Comfort strap with battery", initial: 90 },
      { key: "games", label: "Games and apps", initial: 100, step: 10 },
    ],
    tips: ["Try one at a store first: some people get motion sick."],
  }),
  gadget({
    kind: "tv",
    name: "TV",
    blurb: "The TV, a wall mount and installation, and Quebec's eco fee on electronics.",
    typical: "$800 to $3,000",
    price: 2200,
    priceLabel: "TV",
    priceHint: "Estimate for a 65-inch OLED; LED and mini-LED cost far less",
    extras: [
      { key: "mount", label: "Wall mount", initial: 120, step: 10 },
      { key: "install", label: "Installation", initial: 150, step: 10 },
      { key: "eco", label: "Environmental handling fee", initial: 25, hint: "Quebec charges a small fee on electronics" },
    ],
    tips: ["New TV models arrive in spring, so last year's model drops in price.", "Skip the extended warranty on TVs; failures after the first year are rare."],
  }),
  gadget({
    kind: "soundbar",
    name: "Soundbar",
    blurb: "A soundbar for the TV, with an optional subwoofer and mount.",
    typical: "$300 to $1,500",
    price: 629,
    priceLabel: "Soundbar",
    priceHint: "Sonos Beam about $509 to $689; Sonos Arc Ultra $1,449; budget bars under $500",
    extras: [
      { key: "sub", label: "Subwoofer", initial: 0, step: 10, hint: "Optional; adds bass for movies" },
      { key: "mount", label: "Wall mount", initial: 0, step: 10 },
    ],
    tips: ["In an apartment, a soundbar without a separate subwoofer keeps the neighbours happier."],
    sources: [{ label: "Best sound bars 2026 (Crutchfield Canada)", url: "https://www.crutchfield.ca/learn/best-sound-bars.html" }],
  }),
  gadget({
    kind: "gopro",
    name: "GoPro or action camera",
    blurb: "The camera, spare batteries, a fast memory card and mounts.",
    typical: "$480 to $700",
    price: 549.99,
    priceLabel: "Camera",
    priceHint: "GoPro Hero 13 Black about $480 to $550",
    extras: [
      { key: "batteries", label: "Spare batteries", initial: 70 },
      { key: "card", label: "Memory card", initial: 50 },
      { key: "mounts", label: "Mounts, grip and case", initial: 80 },
    ],
    tips: ["Bundles with batteries and mounts are often cheaper than buying them later."],
    sources: [{ label: "GoPro cameras (Best Buy Canada)", url: "https://www.bestbuy.ca/en-ca/collection/gopro-cameras/220100" }],
  }),
  gadget({
    kind: "camera",
    name: "Camera",
    blurb: "A mirrorless body with a lens, an extra lens, batteries, cards and a bag.",
    typical: "$1,500 to $4,000",
    price: 2800,
    priceLabel: "Body and kit lens",
    priceHint: "Estimate for a full-frame mirrorless kit; entry models cost much less",
    extras: [
      { key: "lens", label: "Extra lens", initial: 800, step: 25 },
      { key: "kit", label: "Batteries and memory cards", initial: 200 },
      { key: "bag", label: "Bag and strap", initial: 100 },
    ],
    tips: ["Lenses keep their value; bodies don't. Spend on good glass.", "Used and refurbished gear from a camera store usually comes with a warranty."],
  }),
  gadget({
    kind: "drone",
    name: "Drone",
    blurb: "The drone, extra batteries, filters and the Transport Canada registration and pilot exam.",
    typical: "$1,000 to $1,600",
    price: 1059,
    priceLabel: "Drone",
    priceHint: "DJI Mini 5 Pro about $1,059; Fly More Combo $1,279 to $1,529",
    extras: [
      { key: "batteries", label: "Extra batteries and charging hub", initial: 220, step: 10 },
      { key: "filters", label: "ND filters and case", initial: 80 },
      { key: "licence", label: "Registration and basic pilot exam", initial: 15, hint: "Drones of 250 g or more need both in Canada" },
    ],
    tips: ["Check the weight: from 250 g you need to register the drone and pass the basic online exam.", "Many Montreal areas, airports included, are no-fly zones; check the NAV Drone app first."],
    sources: [{ label: "DJI Mini 5 Pro Canada prices (SpeedyDrone)", url: "https://www.speedydrone.ca/blogs/products-overview/dji-mini-5-pro-canada-current-pricing-features-and-what-buyers-should-know" }],
  }),
  gadget({
    kind: "tablet",
    name: "Tablet",
    blurb: "An iPad or other tablet, with a pencil and keyboard if you'll work on it.",
    typical: "$500 to $1,500",
    price: 799,
    priceLabel: "Tablet",
    priceHint: "Estimate for an iPad Air; check apple.com/ca",
    extras: [
      { key: "pencil", label: "Pencil or stylus", initial: 0, step: 10 },
      { key: "keyboard", label: "Keyboard case", initial: 0, step: 10 },
      { key: "case", label: "Case", initial: 60 },
    ],
    tips: ["Apple's education pricing and refurbished store can save 10 to 15%."],
  }),
  gadget({
    kind: "headphones",
    name: "Headphones or earbuds",
    blurb: "Noise-cancelling headphones or earbuds, and a case.",
    typical: "$250 to $550",
    price: 329,
    priceHint: "AirPods Pro 3 $329; over-ear noise-cancelling about $400 to $550",
    extras: [{ key: "case", label: "Case or tips", initial: 30 }],
    tips: ["Last year's model often drops 20 to 30% when a new one launches, and still sounds great."],
    sources: [{ label: "Apple's Canadian pricing, iPhone 17 and AirPods Pro 3 (RottenWiFi)", url: "https://rottenwifi.com/heres-the-canadian-pricing-for-apples-iphone-17-lineup-new-watches-and-airpods-pro-3/" }],
  }),
  gadget({
    kind: "watch",
    name: "Smartwatch",
    blurb: "An Apple Watch or other smartwatch, an extra band and AppleCare if you want it.",
    typical: "$300 to $1,000",
    price: 549,
    priceLabel: "Watch",
    priceHint: "Apple Watch Series 11 from $549; titanium from $999",
    extras: [{ key: "band", label: "Extra band", initial: 59 }],
    care: 0,
    tips: ["A fitness tracker may qualify for your Lifestyle Spending Account; check the plan's list."],
    sources: [{ label: "Apple Canadian pricing, Sept 2025 (MobileSyrup)", url: "https://mobilesyrup.com/2025/09/09/apple-iphone-air-17-pro-canada-pricing/" }],
  }),
];

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
      { key: "price", label: "Price", kind: "money", initial: 2000, step: 50, hint: "iPhone 17 Pro from $1,599; laptops about $1,300 to $2,500" },
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
    kind: "furniture",
    name: "Furniture and home setup",
    blurb: "Sofa, bed, desk and the rest for a new or better place, with tax and delivery.",
    typical: "$2,000 to $5,000",
    months: 6,
    fields: [
      { key: "sofa", label: "Sofa and living room", kind: "money", initial: 1200, step: 50 },
      { key: "bed", label: "Bed and mattress", kind: "money", initial: 1000, step: 50 },
      { key: "desk", label: "Desk and chair", kind: "money", initial: 500, step: 25, hint: "A good chair matters if you work from home" },
      { key: "other", label: "Kitchen, lamps, storage and the rest", kind: "money", initial: 800, step: 50 },
      { key: "tax", label: "Add GST and QST (14.975%)", kind: "toggle", initial: 1 },
      { key: "delivery", label: "Delivery and assembly", kind: "money", initial: 150, step: 25 },
      { key: "used", label: "Bought secondhand", kind: "percent", initial: 0, max: 100, hint: "Share bought used, at about half price" },
    ],
    cost: (v) => {
      const items = v.sofa + v.bed + v.desk + v.other;
      const saving = (items * v.used) / 100 / 2;
      const t = tax(items - saving, v.tax);
      return {
        target: items - saving + t + v.delivery,
        lines: [
          { label: "Sofa and living room", amount: v.sofa },
          { label: "Bed and mattress", amount: v.bed },
          { label: "Desk and chair", amount: v.desk },
          { label: "Everything else", amount: v.other },
          ...(saving ? [{ label: "Bought secondhand", amount: -saving, note: `${v.used}% at half price` }] : []),
          { label: "Sales tax", amount: t },
          { label: "Delivery and assembly", amount: v.delivery },
        ],
      };
    },
    tips: [
      "Marketplace and moving season (late June, early July) are full of good used furniture in Montreal.",
      "Buy the mattress and chair new; most other furniture is fine secondhand.",
    ],
    sources: [],
  },
  {
    kind: "bike",
    name: "Bike or e-bike",
    blurb: "The bike, sales tax, and the lock, helmet and lights you need to ride it in Montreal.",
    typical: "$800 to $3,500",
    months: 6,
    fields: [
      { key: "price", label: "Bike price", kind: "money", initial: 2500, step: 50, hint: "Commuter bikes from about $800; e-bikes about $2,000 to $3,500" },
      { key: "tax", label: "Add GST and QST (14.975%)", kind: "toggle", initial: 1 },
      { key: "gear", label: "Lock, helmet, lights and fenders", kind: "money", initial: 250, step: 10 },
      { key: "lsa", label: "Claimed from your Lifestyle Spending Account", kind: "money", initial: 0, step: 50, hint: `Up to ${money0(LSA_YEARLY)} a year if your plan counts it as fitness` },
    ],
    cost: (v) => {
      const t = tax(v.price, v.tax);
      return {
        target: Math.max(0, v.price + t + v.gear - v.lsa),
        lines: [
          { label: "Bike", amount: v.price },
          { label: "Sales tax", amount: t },
          { label: "Lock, helmet, lights", amount: v.gear },
          ...(v.lsa ? [{ label: "Lifestyle Spending Account", amount: -v.lsa }] : []),
        ],
      };
    },
    tips: [
      "A BIXI season pass (about $115) may be all you need if you mostly ride downtown.",
      "Spend on the lock: bike theft is common in Montreal. A U-lock plus a cable is the usual pair.",
      "Add the bike to your tenant insurance if it is expensive.",
    ],
    sources: [{ label: "Montreal fitness and getting around, 2026 (Cities Insider)", url: "https://citiesinsider.com/country/canada/montreal/fitness-&-exercise/en" }],
  },
  {
    kind: "tires",
    name: "Winter tires",
    blurb: "Quebec requires them from Dec 1 to Mar 15: tires, a second set of rims, installation and storage.",
    typical: "$900 to $1,800",
    months: 4,
    fields: [
      { key: "tires", label: "Four winter tires", kind: "money", initial: 900, step: 25, hint: "About $600 budget to $1,200 premium" },
      { key: "rims", label: "Second set of rims", kind: "money", initial: 350, step: 25, hint: "Steel rims about $280 to $400; makes each swap cheaper" },
      { key: "tax", label: "Add GST and QST (14.975%)", kind: "toggle", initial: 1 },
      { key: "install", label: "Installation and balancing", kind: "money", initial: 100, step: 10 },
      { key: "storage", label: "Storage for the season", kind: "money", initial: 80, step: 10, hint: "Free if you have room at home" },
    ],
    cost: (v) => {
      const t = tax(v.tires + v.rims, v.tax);
      return {
        target: v.tires + v.rims + t + v.install + v.storage,
        lines: [
          { label: "Tires", amount: v.tires },
          { label: "Rims", amount: v.rims },
          { label: "Sales tax", amount: t },
          { label: "Installation", amount: v.install },
          { label: "Storage", amount: v.storage },
        ],
      };
    },
    tips: [
      "All four tires need the three-peak mountain snowflake symbol; the fine is $200 to $300.",
      "Buy in September or October: shops are booked solid by mid-November.",
      "A set usually lasts 4 to 6 winters, so the yearly cost is much smaller.",
    ],
    sources: [{ label: "Winter tires cost in Canada (Cansumer)", url: "https://cansumer.ca/winter-tires-cost/" }],
  },
  {
    kind: "holidays",
    name: "Holidays and gifts",
    blurb: "Gifts per person, travel home, and hosting, so December doesn't land on a credit card.",
    typical: "$800 to $2,000",
    months: 2,
    fields: [
      { key: "people", label: "People you buy for", kind: "count", initial: 10, max: 60 },
      { key: "each", label: "Gift budget per person", kind: "money", initial: 60, step: 5 },
      { key: "travel", label: "Travel to see family", kind: "money", initial: 300, step: 25 },
      { key: "hosting", label: "Hosting, food and outings", kind: "money", initial: 300, step: 25 },
    ],
    cost: (v) => ({
      target: v.people * v.each + v.travel + v.hosting,
      lines: [
        { label: "Gifts", amount: v.people * v.each, note: `${v.people} × ${money0(v.each)}` },
        { label: "Travel", amount: v.travel },
        { label: "Hosting and outings", amount: v.hosting },
      ],
    }),
    tips: ["Saving a little each month from January makes December painless.", "A gift exchange or a family Secret Santa cuts the list a lot."],
    sources: [],
  },
  {
    kind: "visit",
    name: "Visit family abroad",
    blurb: "Flights for everyone going, days away, and gifts to bring.",
    typical: "$2,000 to $5,000",
    months: 8,
    fields: [
      { key: "people", label: "Travellers", kind: "count", initial: 1, max: 10 },
      { key: "flights", label: "Flights per person, return", kind: "money", initial: 1400, step: 50, hint: "Much lower for you on standby; plan a backup date" },
      { key: "nights", label: "Nights away", kind: "count", initial: 14, max: 90 },
      { key: "daily", label: "Spending a day (transport, food out)", kind: "money", initial: 50, step: 5, hint: "Usually low when you stay with family" },
      { key: "gifts", label: "Gifts to bring", kind: "money", initial: 500, step: 50 },
      { key: "points", label: "Aeroplan points toward flights", kind: "points", initial: 0, step: 1000 },
    ],
    cost: (v) => {
      const flights = v.flights * v.people;
      const points = Math.min(flights, v.points * POINT_VALUE);
      return {
        target: flights - points + v.daily * v.nights + v.gifts,
        lines: [
          { label: "Flights", amount: flights, note: `${v.people} return` },
          ...(points ? [{ label: "Aeroplan points", amount: -points, note: `${v.points.toLocaleString("en-CA")} points at 1.5¢` }] : []),
          { label: "Spending", amount: v.daily * v.nights, note: `${v.nights} days` },
          { label: "Gifts", amount: v.gifts },
        ],
      };
    },
    tips: ["Standby is cheapest outside holidays and summer peaks; book a refundable backup if the date matters.", "Your employee travel privileges can cover eligible family members too; check the Employee Travel Site."],
    sources: [],
  },
  {
    kind: "sabbatical",
    name: "Time off without pay",
    blurb: "Months of your usual costs, taken from your Budget, plus what you plan to do with the time.",
    typical: "Your monthly costs × months",
    months: 18,
    fields: [
      { key: "months", label: "Months off", kind: "count", initial: 2, max: 12 },
      { key: "plans", label: "Travel or plans during the time off", kind: "money", initial: 2000, step: 100 },
      { key: "pension", label: "Keep paying into your pension", kind: "toggle", initial: 0, hint: "Some plans let you buy back the missed months" },
    ],
    cost: (v, plan) => {
      const living = plan.exp.total * v.months;
      const pension = v.pension ? PAY.monthlyBase * PAY.pensionRate * v.months : 0;
      return {
        target: living + v.plans + pension,
        lines: [
          { label: "Your usual costs", amount: living, note: `${v.months} × ${money0(plan.exp.total)} from Budget` },
          { label: "Plans", amount: v.plans },
          ...(pension ? [{ label: "Pension contributions", amount: pension, note: "your 6%" }] : []),
        ],
      };
    },
    tips: ["Ask HR how unpaid leave affects benefits, pension and seniority before you plan it.", "Keep your emergency fund separate: this goal is spending money, not a safety net."],
    sources: [],
  },
  {
    kind: "health",
    name: "Health procedure",
    blurb: "Laser eye surgery, braces, dental work: the cost, what your plan pays, and the tax credit.",
    typical: "$2,000 to $7,000",
    months: 8,
    fields: [
      { key: "cost", label: "Total cost", kind: "money", initial: 4000, step: 100, hint: "Laser eye surgery about $2,000 to $5,000; braces or aligners about $5,000 to $8,000" },
      { key: "covered", label: "What your plan reimburses", kind: "percent", initial: 0, max: 100, hint: "Check Insurance; ask Manulife for a predetermination" },
      { key: "max", label: "Plan maximum for this", kind: "money", initial: 0, step: 100, hint: "Leave at $0 if there's no limit" },
    ],
    cost: (v) => {
      const byPlan = Math.min((v.cost * v.covered) / 100, v.max || Infinity);
      const yours = v.cost - byPlan;
      return {
        target: yours,
        lines: [{ label: "Cost", amount: v.cost }, ...(byPlan ? [{ label: "Paid by your plan", amount: -byPlan, note: `${v.covered}%${v.max ? `, up to ${money0(v.max)}` : ""}` }] : [])],
        back: { label: "Back at tax time", amount: medicalBack(yours), note: "medical expense credits, Quebec 20% and federal, above 3% of income" },
      };
    },
    tips: [
      "Medical expenses can be grouped in any 12-month window: bunch them into one tax year to pass the 3% threshold.",
      "Cosmetic procedures don't qualify; laser eye surgery and orthodontics do.",
    ],
    sources: [
      { label: "Medical expenses (Revenu Québec)", url: "https://www.revenuquebec.ca/en/citizens/tax-credits/medical-expenses/" },
      { label: "Medical expense credit (RCGT)", url: "https://www.rcgt.com/en/tax-planning-guide/sections/section-04-health-seniors-and-caregivers/medical-expense-credit/" },
    ],
  },
  {
    kind: "glasses",
    name: "Glasses or contacts",
    blurb: "Frames, lenses or a year of contacts, minus what your vision coverage pays.",
    typical: "$300 to $900",
    months: 3,
    fields: [
      { key: "cost", label: "Glasses or a year of contacts", kind: "money", initial: 600, step: 25 },
      { key: "exam", label: "Eye exam", kind: "money", initial: 120, step: 10 },
      { key: "plan", label: "Your plan pays up to", kind: "money", initial: 0, step: 25, hint: "Usually a fixed amount every 24 months; see Insurance" },
    ],
    cost: (v) => {
      const byPlan = Math.min(v.plan, v.cost + v.exam);
      return {
        target: v.cost + v.exam - byPlan,
        lines: [{ label: "Glasses or contacts", amount: v.cost }, { label: "Eye exam", amount: v.exam }, ...(byPlan ? [{ label: "Paid by your plan", amount: -byPlan }] : [])],
      };
    },
    tips: ["Coverage often resets every 24 months; check when you last claimed.", "Online lens retailers are often far cheaper for the same prescription."],
    sources: [],
  },
  {
    kind: "fitness",
    name: "Fitness and wellness",
    blurb: "A year of gym or classes and some equipment, minus your Lifestyle Spending Account.",
    typical: "$500 to $1,500 a year",
    months: 3,
    fields: [
      { key: "monthly", label: "Gym or classes a month", kind: "money", initial: 55, step: 5, hint: "Montreal mid-range gyms about $40 to $65" },
      { key: "equipment", label: "Equipment, shoes, a tracker", kind: "money", initial: 300, step: 25 },
      { key: "lsa", label: "Claimed from your Lifestyle Spending Account", kind: "money", initial: LSA_YEARLY, step: 50, hint: `${money0(LSA_YEARLY)} a year, taxable` },
    ],
    cost: (v) => ({
      target: Math.max(0, v.monthly * 12 + v.equipment - v.lsa),
      lines: [
        { label: "A year of gym or classes", amount: v.monthly * 12, note: "12 months" },
        { label: "Equipment", amount: v.equipment },
        ...(v.lsa ? [{ label: "Lifestyle Spending Account", amount: -v.lsa }] : []),
      ],
    }),
    tips: ["Claim the LSA before the plan year ends; unused dollars expire.", "Many gyms waive the sign-up fee in January and September."],
    sources: [{ label: "Montreal fitness guide, 2026 (Cities Insider)", url: "https://citiesinsider.com/country/canada/montreal/fitness-&-exercise/en" }],
  },
  {
    kind: "account",
    name: "FHSA, TFSA or RRSP",
    blurb: "Fill a registered account this year. FHSA and RRSP contributions come back partly as a tax refund.",
    typical: "$8,000 FHSA · $7,000 TFSA",
    months: 12,
    fields: [
      { key: "amount", label: "Amount to put in", kind: "money", initial: 8000, step: 100, hint: "FHSA $8,000 a year ($16,000 with one year carried forward); TFSA $7,000 in 2026" },
      { key: "deductible", label: "Tax-deductible (FHSA or RRSP, not TFSA)", kind: "toggle", initial: 1 },
    ],
    cost: (v) => ({
      target: v.amount,
      lines: [{ label: "Contribution", amount: v.amount }],
      back: v.deductible ? { label: "Back as a tax refund", amount: v.amount * payMarginal().rate, note: `at your ${Math.round(payMarginal().rate * 100)}% marginal rate` } : undefined,
    }),
    tips: [
      "Open an FHSA before Dec 31: the $8,000 of room only starts once the account exists.",
      "FHSA first if you may buy a home: deductible going in and tax-free coming out for a first home.",
      "Put the refund back into the account, or into your TFSA, to keep it growing.",
    ],
    sources: [
      { label: "FHSA carry-forward rules (Questrade)", url: "https://www.questrade.com/learning/accounts-taxes/fhsa-carry-forward-rules" },
      { label: "2026 TFSA limit (Fidelity)", url: "https://www.fidelity.ca/en/insights/articles/hit-your-tfsa-limit-every-year" },
    ],
  },
  ...ELECTRONICS,
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

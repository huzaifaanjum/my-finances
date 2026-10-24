// Group insurance and benefits, from the Manulife coverage summary (statement as of Oct 13, 2026)
// and Manulife's list of Lifestyle Spending Account eligible expenses.

export const STATEMENT_DATE = "Oct 13, 2026";
/** Quebec's tax on insurance premiums; it is why each payslip deduction is 9% above the Manulife price. */
export const PREMIUM_TAX = 0.09;

export type BenefitId = "ltd" | "std" | "health" | "drugs" | "dental" | "life" | "add" | "optlife" | "vadd" | "ci" | "hsa" | "lsa";

export interface Benefit {
  id: BenefitId;
  name: string;
  group: "income" | "health" | "life" | "accounts";
  covered: boolean;
  /** plan level as Manulife names it */
  level: string;
  /** monthly price before premium tax */
  price: number;
  /** paid by Air Canada with flex dollars */
  flex: number;
  /** what it pays, if a fixed amount */
  pays?: { amount: number; per: "month" | "week" | "once" };
  /** what it means for you, in plain terms */
  note: string;
}

export const BENEFITS: Benefit[] = [
  {
    id: "ltd",
    name: "Long-term disability",
    group: "income",
    covered: true,
    level: "Premium, 60% of monthly earnings",
    price: 151.89,
    flex: 0,
    pays: { amount: 4_751, per: "month" },
    note: "Replaces income if illness or injury keeps you off work for months or years. You pay all of it, so the benefit is generally tax-free.",
  },
  {
    id: "std",
    name: "Short-term disability",
    group: "income",
    covered: true,
    level: "Premium, 60% of weekly earnings",
    price: 20.84,
    flex: 0,
    pays: { amount: 1_097, per: "week" },
    note: "Pays while you recover from a shorter illness or injury, until long-term disability takes over. Also employee-paid, so generally tax-free.",
  },
  {
    id: "health",
    name: "Extended health",
    group: "health",
    covered: true,
    level: "Premium with leisure travel",
    price: 132.55,
    flex: 132.55,
    note: "Paramedical care (physio, massage, psychologist), vision and more, plus emergency medical cover on personal trips. Fully paid by Air Canada.",
  },
  {
    id: "drugs",
    name: "Prescription drugs",
    group: "health",
    covered: true,
    level: "Premium with leisure travel",
    price: 62.45,
    flex: 62.45,
    note: "Prescription drugs, including while travelling. Fully paid by Air Canada; in Quebec it also replaces RAMQ's public drug plan.",
  },
  {
    id: "dental",
    name: "Dental",
    group: "health",
    covered: true,
    level: "Premium",
    price: 77,
    flex: 34.05,
    note: "Checkups, cleanings and treatment at the top plan level. You pay about 56% of the price; Air Canada pays the rest.",
  },
  {
    id: "life",
    name: "Basic life",
    group: "life",
    covered: true,
    level: "Enhanced, 30× monthly earnings",
    price: 50.4,
    flex: 0,
    pays: { amount: 160_000, per: "once" },
    note: "Paid to your beneficiary if you die. You asked for 30× monthly earnings ($237,600), but the plan caps basic life at $160,000.",
  },
  {
    id: "add",
    name: "Accidental death & dismemberment",
    group: "life",
    covered: true,
    level: "Premium, flat $200,000",
    price: 3.2,
    flex: 0,
    pays: { amount: 200_000, per: "once" },
    note: "Pays on top of life insurance if an accident causes death or a serious injury. Accidents only, not illness.",
  },
  { id: "optlife", name: "Optional life", group: "life", covered: false, level: "Not taken", price: 0, flex: 0, note: "Extra life cover you can buy. Only worth it if someone depends on your income." },
  { id: "vadd", name: "Voluntary AD&D", group: "life", covered: false, level: "Not taken", price: 0, flex: 0, note: "Extra accident cover on top of the $200,000 you already have." },
  {
    id: "ci",
    name: "Critical illness",
    group: "life",
    covered: false,
    level: "Not taken",
    price: 0,
    flex: 0,
    note: "A lump sum if you are diagnosed with a listed illness such as cancer or a heart attack. Your disability cover already replaces income.",
  },
  { id: "hsa", name: "Health Spending Account", group: "accounts", covered: false, level: "$0 flex dollars", price: 0, flex: 0, note: "A tax-free pot for health costs the plan doesn't cover. You put no flex dollars in it this year." },
  {
    id: "lsa",
    name: "Lifestyle Spending Account",
    group: "accounts",
    covered: true,
    level: "$41.67 a month from Air Canada",
    price: 0,
    flex: 0,
    note: "$500 a year from Air Canada for fitness, wellness, education and more. Claim it with receipts on the Manulife app.",
  },
];

/** Extra employer dollars into the Lifestyle Spending Account. */
export const LSA_MONTHLY = 41.67;
export const LSA_YEARLY = Math.round(LSA_MONTHLY * 12);

const r2 = (v: number) => Math.round(v * 100) / 100;

export const COSTS = (() => {
  const price = r2(BENEFITS.reduce((t, b) => t + b.price, 0));
  const flex = r2(BENEFITS.reduce((t, b) => t + b.flex, 0));
  const you = r2(price - flex);
  // tax is rounded per benefit, as on the payslip (165.56 + 22.72 + 46.82 + 54.94 + 3.49)
  const tax = r2(BENEFITS.reduce((t, b) => t + r2((b.price - b.flex) * (1 + PREMIUM_TAX)), 0) - you);
  return {
    price,
    flex,
    you,
    tax,
    /** matches the after-tax insurance deductions on your payslip */
    youTotal: r2(you + tax),
    /** flex dollars plus their premium tax: the "P-" lines on your payslip */
    employerTaxable: r2(flex * (1 + PREMIUM_TAX)),
    employerTotal: r2(flex * (1 + PREMIUM_TAX) + LSA_MONTHLY),
  };
})();

export const benefit = (id: BenefitId) => BENEFITS.find((b) => b.id === id)!;

export interface LsaCategory {
  title: string;
  items: string[];
}

/** Manulife's list of eligible Lifestyle Spending Account expenses (not exhaustive). */
export const LSA_CATEGORIES: LsaCategory[] = [
  {
    title: "Fitness and recreation",
    items: [
      "Gym, health club and fitness classes (yoga, Pilates)",
      "Personal trainer",
      "Fitness equipment, trackers and apps",
      "Running shoes, race and club fees",
      "Ski and snowboard passes and equipment",
      "Racket sports, golf, dance and self-defence lessons",
      "Sports registration, team fees and equipment",
      "Camping, fishing, hiking and water-sports gear",
      "Recreational club memberships",
    ],
  },
  {
    title: "Education",
    items: ["Professional course fees and tuition", "Books and school supplies", "Computer and software", "Foreign language training", "CPR and first aid courses", "Tutor", "Parking to attend school"],
  },
  {
    title: "Healthcare",
    items: [
      "Health costs not covered by the core plan",
      "Vitamins and supplements",
      "Mattress, adjustable bed, massage units",
      "Heating pad, electric blanket, thermometer",
      "Virtual or executive health clinic fees",
      "Vet fees",
      "Maternity expenses (prenatal classes, midwife)",
    ],
  },
  {
    title: "Dental extras",
    items: ["Cosmetic dentistry and whitening", "Toothbrushes, floss, toothpaste, water flosser", "Prefabricated mouth guards", "Dental costs the plan didn't pay"],
  },
  {
    title: "Counselling",
    items: ["Nutritional counselling", "Stress management programs", "Weight loss and smoking cessation programs", "Grief and addiction counselling"],
  },
  {
    title: "Family and home",
    items: ["Childcare, nanny, daycare", "Car seats and baby monitors", "Elder care", "Cleaning service or homemaker"],
  },
  { title: "Long-term care", items: ["Retirement and nursing home fees (not room)", "Meals on Wheels", "Hospital phone and TV rental"] },
];

/** The eligible expenses most likely to fit you right now. */
export const LSA_IDEAS: { what: string; why: string }[] = [
  { what: "Gym or fitness classes", why: "The easiest way to use the full $500 every year." },
  { what: "Running shoes or a fitness tracker", why: "Gear counts, not just memberships." },
  { what: "A course, books or software for work", why: "Education counts, including a computer and software." },
  { what: "Ski pass or sports gear", why: "Montréal winters: lift tickets and equipment are eligible." },
  { what: "A new mattress", why: "Listed under healthcare expenses." },
  { what: "Electric toothbrush or water flosser", why: "Small dental extras add up." },
];

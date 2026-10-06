// Plain-language explanations for finance terms. The first mention of a term in each card is underlined
// and shows this text on hover, focus or tap (see components/glossary).

export type GlossaryCategory = "pay" | "save" | "benefits" | "job" | "plan" | "borrow";

export const GLOSSARY_CATEGORIES: { id: GlossaryCategory; label: string }[] = [
  { id: "pay", label: "Pay and tax" },
  { id: "save", label: "Saving and investing" },
  { id: "benefits", label: "Benefits and insurance" },
  { id: "job", label: "Your job" },
  { id: "plan", label: "Budgeting" },
  { id: "borrow", label: "Buying and borrowing" },
];

export interface GlossaryTerm {
  /** regular expression source, matched case-insensitively */
  pattern: string;
  category: GlossaryCategory;
  title: string;
  what: string;
  why: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { pattern: "annual incentive|\\bAIP\\b", category: "job", title: "Annual incentive (AIP)", what: "A yearly bonus from Air Canada. It depends on how the company and you perform, and it is paid each March.", why: "It can speed up your savings. It is not guaranteed, so treat it as extra and make sure your bills are covered without it." },
  { pattern: "signing (?:bonus|payments?)", category: "job", title: "Signing bonus", what: "A one-time bonus for joining, paid in two parts (Feb and Aug 2027) if you are still employed.", why: "A big boost for your emergency fund or down payment. Tax is taken first, so the planner uses the after-tax amount." },
  { pattern: "take-home", category: "pay", title: "Take-home pay", what: "The money that actually lands in your bank account after tax and deductions.", why: "It is the number to budget with. Your salary is bigger, but you cannot spend what is taken off." },
  { pattern: "\\bgross\\b", category: "pay", title: "Gross", what: "The amount before tax and deductions are taken off.", why: "Gross looks bigger than what you receive. Plan with the net (after-tax) amount." },
  { pattern: "\\bnet\\b", category: "pay", title: "Net", what: "The amount after tax and deductions are taken off.", why: "It is the money you can really spend or save, so every bonus here is shown net." },
  { pattern: "\\bTFSA\\b", category: "save", title: "TFSA (Tax-Free Savings Account)", what: "An account where your savings and any growth are never taxed, and you can take money out any time.", why: "You keep all your gains. Good for flexible goals like a car or an emergency fund." },
  { pattern: "\\bFHSA\\b", category: "save", title: "FHSA (First Home Savings Account)", what: "An account for buying your first home. You can add $8,000 a year, up to $40,000 in total.", why: "What you put in lowers your tax (a bigger refund), and the money is tax-free when used for the home." },
  { pattern: "\\bRRSP\\b", category: "save", title: "RRSP (Registered Retirement Savings Plan)", what: "An account for retirement savings. What you put in is deducted from your income for tax.", why: "It can give you a bigger tax refund now. You pay tax later when you withdraw, usually at a lower rate." },
  { pattern: "\\bQPIP\\b", category: "pay", title: "QPIP (Quebec Parental Insurance Plan)", what: "A small deduction that pays for maternity, paternity and parental leave in Quebec.", why: "It is one reason take-home is lower than pay, and it covers you if you ever take leave." },
  { pattern: "\\bQPP\\b", category: "pay", title: "QPP (Quebec Pension Plan)", what: "A required deduction from your pay that builds your government retirement pension.", why: "It lowers take-home today, but you earn a pension from it later." },
  { pattern: "\\bEI\\b", category: "pay", title: "EI (Employment Insurance)", what: "A small deduction that gives you benefits if you lose your job.", why: "It is part of why take-home is lower than salary, and it acts as a safety net." },
  { pattern: "(?:employer )?pension match|pension \\(6%\\)", category: "save", title: "Pension match", what: "Air Canada adds money to your pension, up to 6% of pay, when you put in 6%.", why: "It is free money. Contributing the full amount is one of the best returns you can get." },
  { pattern: "emergency fund", category: "plan", title: "Emergency fund", what: "Cash set aside for surprises such as a job loss, a repair or a medical cost.", why: "It keeps you out of credit card debt. One to three months of expenses is a common goal." },
  { pattern: "savings rate", category: "plan", title: "Savings rate", what: "The share of your take-home pay that you save each month.", why: "A quick health check. About 20% is a common target, and a higher rate reaches your goals sooner." },
  { pattern: "50/30/20", category: "plan", title: "50/30/20 guideline", what: "A simple budget rule: 50% of pay for needs, 30% for wants and 20% for savings.", why: "It shows at a glance whether your spending is balanced, without tracking every dollar." },
  { pattern: "\\bAPR\\b", category: "borrow", title: "APR (annual percentage rate)", what: "The yearly cost of borrowing, shown as a percentage of the loan.", why: "A lower APR means less interest. Even 1% less can save hundreds on a car loan." },
  { pattern: "down payment", category: "borrow", title: "Down payment", what: "The cash you pay upfront. The rest of the price is borrowed.", why: "A bigger down payment means a smaller loan, a lower monthly payment and less interest." },
  { pattern: "GST and QST", category: "borrow", title: "GST and QST", what: "Sales taxes: 5% federal (GST) plus 9.975% Quebec (QST), 14.975% in total, added to the price.", why: "A $30,000 car really costs about $4,500 more at the till, so include it in your plan." },
  { pattern: "welcome tax", category: "borrow", title: "Welcome tax", what: "A Quebec tax you pay once when you buy property (a land transfer tax).", why: "It is a cost on top of your down payment, so save for it too." },
  { pattern: "closing costs", category: "borrow", title: "Closing costs", what: "Fees paid when you finish buying a home: welcome tax, notary, inspection and more.", why: "They are about 3% of the price on top of your down payment, so you need that cash as well." },
  { pattern: "\\binterest\\b", category: "borrow", title: "Interest", what: "The fee a lender charges you for borrowing money.", why: "Paying a loan off faster, or at a lower rate, means less interest and a cheaper car." },
  { pattern: "probation", category: "job", title: "Probation", what: "The first months of a job when an employer can end it more easily. Yours ends mid-February.", why: "Some bonus payments depend on you still being employed, so the plan treats them as extra." },
  { pattern: "\\bESOP\\b", category: "save", title: "ESOP (employee share ownership plan)", what: "A plan to buy company shares through your pay. The employer may add a match.", why: "It can grow your wealth, but keep it small: your job and your shares would both depend on one airline." },
  { pattern: "T4 and RL-1", category: "pay", title: "T4 and RL-1", what: "Tax slips from your employer showing what you earned and how much tax was already taken.", why: "You need them to file your return, which is when your refund is worked out." },
  { pattern: "Aeroplan points", category: "job", title: "Aeroplan points", what: "Air Canada's loyalty points, which you can use toward flights.", why: "Free value from your job that can lower travel costs. It is not cash, so the plan leaves it out." },
  { pattern: "profit sharing", category: "job", title: "Profit sharing", what: "A payment to employees when the company has a good year.", why: "A possible bonus, but not guaranteed, so it is left out of your plan." },
  { pattern: "investment return", category: "save", title: "Investment return", what: "How much invested money grows in a year, as a percentage.", why: "Growth is what turns steady saving into a million. It is never guaranteed, so use a cautious number." },
  { pattern: "retro deductions", category: "pay", title: "Retro deductions", what: "Catch-up deductions taken from one paycheque for earlier pay periods.", why: "They made September's pay lower than normal, so the plan adds them back to show your usual pay." },
  { pattern: "refund", category: "pay", title: "Tax refund", what: "Money the government returns when more tax was taken from your pay than you owed.", why: "Putting money in an RRSP or FHSA lowers the tax you owe, which can raise your refund." },
  { pattern: "surplus", category: "plan", title: "Surplus", what: "What is left of your pay after expenses.", why: "It is the money you can save each month, so growing it grows your savings." },
  { pattern: "\\bHorizon\\b", category: "plan", title: "Horizon", what: "How far ahead the charts and totals look.", why: "A longer horizon shows bigger long-term results. A shorter one shows near-term cash." },
  { pattern: "DC pension|DC Plan", category: "save", title: "DC pension (defined contribution)", what: "A workplace pension where you and Air Canada each put in a share of your pay, and it is invested in funds you choose.", why: "What you get at retirement depends on how much goes in and how it grows, so the fund you pick matters." },
  { pattern: "Group RRSP", category: "save", title: "Group RRSP and Group TFSA", what: "An RRSP or TFSA run through your employer, with money taken straight from your pay.", why: "Saving happens automatically, fees are often lower, and RRSP deductions can lower the tax on each paycheque." },
  { pattern: "target-date", category: "save", title: "Target-date fund", what: "One fund that holds a mix of stocks and bonds and slowly gets more cautious as your retirement year gets closer.", why: "An easy, hands-off choice for a pension when you do not want to pick and rebalance funds yourself." },
  { pattern: "\\bpremiums?\\b", category: "benefits", title: "Premium", what: "The regular amount paid to keep an insurance policy active.", why: "Premiums come off your pay whether or not you ever claim, so it is worth knowing what they buy." },
  { pattern: "long-term disability|\\bLTD\\b", category: "benefits", title: "Long-term disability (LTD)", what: "Insurance that replaces part of your pay if illness or injury stops you working for months or longer.", why: "It protects your biggest asset, your income. You pay it yourself, so a payout would generally be tax-free." },
  { pattern: "short-term disability|\\bSTD\\b", category: "benefits", title: "Short-term disability (STD)", what: "Insurance that pays part of your salary for a few weeks or months while you recover.", why: "It covers the gap before long-term disability starts." },
  { pattern: "AD&D", category: "benefits", title: "AD&D (accidental death and dismemberment)", what: "Insurance that pays out if an accident causes death or a serious injury such as losing a limb.", why: "Cheap extra cover. It only pays for accidents, not illness." },
  { pattern: "life insurance", category: "benefits", title: "Life insurance", what: "Insurance that pays a sum to the people you name if you die.", why: "Matters most when someone depends on your income. Name a beneficiary so the money goes where you want." },
  { pattern: "beneficiar(?:y|ies)", category: "benefits", title: "Beneficiary", what: "The person you name to receive insurance or pension money if you die.", why: "Without one, the money can be held up in your estate for months." },
  { pattern: "paramedical", category: "benefits", title: "Paramedical care", what: "Health care outside a doctor's office, such as physio, massage, chiropractor or psychologist.", why: "Health plans usually pay part of it up to a yearly limit that resets, so unused coverage is lost." },
  { pattern: "telemedicine", category: "benefits", title: "Telemedicine", what: "Seeing a doctor by video or phone instead of in person.", why: "Quick care without a walk-in clinic wait. LifeWorks gives you this 24/7 at no extra cost." },
  { pattern: "medical expense tax credit", category: "pay", title: "Medical expense tax credit", what: "A tax credit for health costs you paid yourself that your plan did not cover.", why: "Keep receipts. Your share of dental, drugs or glasses can lower your tax." },
  { pattern: "taxable in Quebec|taxable benefits?", category: "pay", title: "Taxable benefit", what: "Something your employer pays for you that counts as income for tax, even though you never get it as cash.", why: "In Quebec, employer-paid health and dental premiums are taxed this way, which slightly raises your Quebec tax." },
  { pattern: "abatement", category: "pay", title: "Quebec abatement", what: "A 16.5% cut to federal income tax for Quebec residents, because Quebec runs some programs itself.", why: "It is already applied on your pay stub. It is why your federal tax looks lower than in other provinces." },
  { pattern: "severance", category: "job", title: "Severance", what: "Money an employer pays if it lets you go without cause.", why: "Yours starts at 3 weeks of pay after probation and grows 3 weeks per year of service, up to 60 weeks." },
  { pattern: "arbitration", category: "job", title: "Arbitration", what: "A private way to settle a dispute: a neutral arbitrator decides instead of a court.", why: "Your offer sends job disputes to arbitration and rules out class actions, which limits how you could challenge a decision." },
  { pattern: "travel privileges", category: "job", title: "Travel privileges", what: "Cheap standby flights for airline employees and eligible family or friends.", why: "Yours start after 28 weeks. Standby means you fly only if there is a free seat, so flexible dates help." },
  { pattern: "catch-up days", category: "job", title: "Catch-up days", what: "Extra paid days off at Air Canada, on top of vacation.", why: "Five a year, prorated for 2026. Check whether they expire so you do not lose them." },
];

/** One capture group per term, so the matching group index is the term index. */
export function glossaryRegex(): RegExp {
  return new RegExp(GLOSSARY.map((t) => `(${t.pattern})`).join("|"), "gi");
}

export type TextPart = string | { term: number; text: string };

/** Splits text into plain runs and glossary matches. */
export function splitGlossary(text: string): TextPart[] {
  const rx = glossaryRegex();
  const parts: TextPart[] = [];
  let last = 0;
  for (let m = rx.exec(text); m; m = rx.exec(text)) {
    const term = m.slice(1).findIndex((g) => g !== undefined);
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ term, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// Plain-language explanations for finance terms. The first mention of a term in each card is underlined
// and shows this text on hover, focus or tap (see components/glossary).

export interface GlossaryTerm {
  /** regular expression source, matched case-insensitively */
  pattern: string;
  title: string;
  what: string;
  why: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { pattern: "annual incentive|\\bAIP\\b", title: "Annual incentive (AIP)", what: "A yearly bonus from Air Canada. It depends on how the company and you perform, and it is paid each March.", why: "It can speed up your savings. It is not guaranteed, so treat it as extra and make sure your bills are covered without it." },
  { pattern: "signing (?:bonus|payments?)", title: "Signing bonus", what: "A one-time bonus for joining, paid in two parts (Feb and Aug 2027) if you are still employed.", why: "A big boost for your emergency fund or down payment. Tax is taken first, so the planner uses the after-tax amount." },
  { pattern: "take-home", title: "Take-home pay", what: "The money that actually lands in your bank account after tax and deductions.", why: "It is the number to budget with. Your salary is bigger, but you cannot spend what is taken off." },
  { pattern: "\\bgross\\b", title: "Gross", what: "The amount before tax and deductions are taken off.", why: "Gross looks bigger than what you receive. Plan with the net (after-tax) amount." },
  { pattern: "\\bnet\\b", title: "Net", what: "The amount after tax and deductions are taken off.", why: "It is the money you can really spend or save, so every bonus here is shown net." },
  { pattern: "\\bTFSA\\b", title: "TFSA (Tax-Free Savings Account)", what: "An account where your savings and any growth are never taxed, and you can take money out any time.", why: "You keep all your gains. Good for flexible goals like a car or an emergency fund." },
  { pattern: "\\bFHSA\\b", title: "FHSA (First Home Savings Account)", what: "An account for buying your first home. You can add $8,000 a year, up to $40,000 in total.", why: "What you put in lowers your tax (a bigger refund), and the money is tax-free when used for the home." },
  { pattern: "\\bRRSP\\b", title: "RRSP (Registered Retirement Savings Plan)", what: "An account for retirement savings. What you put in is deducted from your income for tax.", why: "It can give you a bigger tax refund now. You pay tax later when you withdraw, usually at a lower rate." },
  { pattern: "\\bQPIP\\b", title: "QPIP (Quebec Parental Insurance Plan)", what: "A small deduction that pays for maternity, paternity and parental leave in Quebec.", why: "It is one reason take-home is lower than pay, and it covers you if you ever take leave." },
  { pattern: "\\bQPP\\b", title: "QPP (Quebec Pension Plan)", what: "A required deduction from your pay that builds your government retirement pension.", why: "It lowers take-home today, but you earn a pension from it later." },
  { pattern: "\\bEI\\b", title: "EI (Employment Insurance)", what: "A small deduction that gives you benefits if you lose your job.", why: "It is part of why take-home is lower than salary, and it acts as a safety net." },
  { pattern: "(?:employer )?pension match|pension \\(6%\\)", title: "Pension match", what: "Air Canada adds money to your pension, up to 6% of pay, when you put in 6%.", why: "It is free money. Contributing the full amount is one of the best returns you can get." },
  { pattern: "emergency fund", title: "Emergency fund", what: "Cash set aside for surprises such as a job loss, a repair or a medical cost.", why: "It keeps you out of credit card debt. One to three months of expenses is a common goal." },
  { pattern: "savings rate", title: "Savings rate", what: "The share of your take-home pay that you save each month.", why: "A quick health check. About 20% is a common target, and a higher rate reaches your goals sooner." },
  { pattern: "50/30/20", title: "50/30/20 guideline", what: "A simple budget rule: 50% of pay for needs, 30% for wants and 20% for savings.", why: "It shows at a glance whether your spending is balanced, without tracking every dollar." },
  { pattern: "\\bAPR\\b", title: "APR (annual percentage rate)", what: "The yearly cost of borrowing, shown as a percentage of the loan.", why: "A lower APR means less interest. Even 1% less can save hundreds on a car loan." },
  { pattern: "down payment", title: "Down payment", what: "The cash you pay upfront. The rest of the price is borrowed.", why: "A bigger down payment means a smaller loan, a lower monthly payment and less interest." },
  { pattern: "GST and QST", title: "GST and QST", what: "Sales taxes: 5% federal (GST) plus 9.975% Quebec (QST), 14.975% in total, added to the price.", why: "A $30,000 car really costs about $4,500 more at the till, so include it in your plan." },
  { pattern: "welcome tax", title: "Welcome tax", what: "A Quebec tax you pay once when you buy property (a land transfer tax).", why: "It is a cost on top of your down payment, so save for it too." },
  { pattern: "closing costs", title: "Closing costs", what: "Fees paid when you finish buying a home: welcome tax, notary, inspection and more.", why: "They are about 3% of the price on top of your down payment, so you need that cash as well." },
  { pattern: "\\binterest\\b", title: "Interest", what: "The fee a lender charges you for borrowing money.", why: "Paying a loan off faster, or at a lower rate, means less interest and a cheaper car." },
  { pattern: "probation", title: "Probation", what: "The first months of a job when an employer can end it more easily. Yours ends mid-February.", why: "Some bonus payments depend on you still being employed, so the plan treats them as extra." },
  { pattern: "\\bESOP\\b", title: "ESOP (employee share ownership plan)", what: "A plan to buy company shares through your pay. The employer may add a match.", why: "It can grow your wealth, but keep it small: your job and your shares would both depend on one airline." },
  { pattern: "T4 and RL-1", title: "T4 and RL-1", what: "Tax slips from your employer showing what you earned and how much tax was already taken.", why: "You need them to file your return, which is when your refund is worked out." },
  { pattern: "Aeroplan points", title: "Aeroplan points", what: "Air Canada's loyalty points, which you can use toward flights.", why: "Free value from your job that can lower travel costs. It is not cash, so the plan leaves it out." },
  { pattern: "profit sharing", title: "Profit sharing", what: "A payment to employees when the company has a good year.", why: "A possible bonus, but not guaranteed, so it is left out of your plan." },
  { pattern: "investment return", title: "Investment return", what: "How much invested money grows in a year, as a percentage.", why: "Growth is what turns steady saving into a million. It is never guaranteed, so use a cautious number." },
  { pattern: "retro deductions", title: "Retro deductions", what: "Catch-up deductions taken from one paycheque for earlier pay periods.", why: "They made September's pay lower than normal, so the plan adds them back to show your usual pay." },
  { pattern: "refund", title: "Tax refund", what: "Money the government returns when more tax was taken from your pay than you owed.", why: "Putting money in an RRSP or FHSA lowers the tax you owe, which can raise your refund." },
  { pattern: "surplus", title: "Surplus", what: "What is left of your pay after expenses.", why: "It is the money you can save each month, so growing it grows your savings." },
  { pattern: "\\bHorizon\\b", title: "Horizon", what: "How far ahead the charts and totals look.", why: "A longer horizon shows bigger long-term results. A shorter one shows near-term cash." },
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

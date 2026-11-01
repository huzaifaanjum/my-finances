// Registering as a solo software developer in Montreal under a brand name. Fees checked November 2026.

export interface TrackBlock {
  title: string;
  text: string;
}

/** One accordion row: a tick for the whole item, details, and a tick for each step. */
export interface TrackItem {
  /** short and unique: the item saves as rev-<id>, each step as rev-<id>-<n> */
  id: string;
  title: string;
  summary: string;
  body: TrackBlock[];
  steps: string[];
  /** small labels shown under the title */
  tags?: string[];
}

export const STOP_FIRST: TrackBlock[] = [
  {
    title: "Your work permit",
    text: "Open permits generally allow self-employment. An employer-specific permit generally does not, and working outside its conditions can put your status at risk. Your offer also ends your job if your permit lapses, so confirm this with IRCC or a licensed immigration consultant before you earn anything. Self-employed time generally doesn't count toward the Canadian Experience Class either.",
  },
  {
    title: "Your Air Canada contract",
    text: "Read it for rules on outside work, conflicts of interest, confidentiality and who owns what you build. Use your own laptop, accounts and time. Stay away from aviation tools and anything close to your job, and get a written OK if unsure.",
  },
  {
    title: "No shield in a sole proprietorship",
    text: "You and the business are legally the same. Debts and lawsuits reach your personal savings, which is why the contracts and insurance steps matter.",
  },
];

export type Need = "Mandatory" | "Only if" | "Not mandatory";

export const NEEDS: { need: Need; title: string; note: string; items: { name: string; detail: string }[] }[] = [
  {
    need: "Mandatory",
    title: "Mandatory",
    note: "Needed from day one, using a brand name",
    items: [
      { name: "Permission to be self-employed", detail: "Your work permit must allow it." },
      { name: "Respect your employment contract", detail: "Not a government rule, but breaking it can cost you your job." },
      { name: "Register with the REQ", detail: "$41, within 60 days of starting. Skip it only if you trade under your own first and last name." },
      { name: "A name that follows the French rules", detail: "A French generic word with your brand, such as Studio Nimbus." },
      { name: "Yearly REQ update", detail: "$41 a year. Being late adds a 50% penalty." },
      { name: "Report all income on your tax returns", detail: "Forms T2125 and TP-80, even for small amounts or a loss." },
      { name: "Keep business records", detail: "Sales, costs and receipts, for at least six years." },
      { name: "Don't call yourself an engineer", detail: "That title is reserved in Quebec for members of the Ordre des ingénieurs. Use developer." },
    ],
  },
  {
    need: "Only if",
    title: "Mandatory only if",
    note: "These apply once something happens",
    items: [
      { name: "GST and QST registration", detail: "If taxable sales pass $30,000 over four quarters." },
      { name: "Privacy policy and Law 25 duties", detail: "If you collect personal information, which nearly every app does." },
      { name: "French site, invoices and contracts", detail: "If you serve customers or sign standard-form contracts in Quebec." },
      { name: "Foreign sales tax", detail: "If you sell directly to consumers abroad. A merchant of record can handle this." },
      { name: "Quarterly tax instalments", detail: "If you owe more than about $1,800 at tax time two years running." },
      { name: "Montreal occupancy certificate", detail: "If your borough requires one for a home office. Ask 311." },
      { name: "CNESST and payroll", detail: "If you hire anyone." },
      { name: "Apple or Google developer accounts", detail: "If you publish to their stores." },
    ],
  },
  {
    need: "Not mandatory",
    title: "Not mandatory",
    note: "Useful, but you can start without them",
    items: [
      { name: "Incorporation", detail: "A sole proprietorship is enough to start." },
      { name: "Business bank account", detail: "Strongly recommended, because it keeps your taxes simple." },
      { name: "Trademark", detail: "Worth it once a name has traction." },
      { name: "Website and domain", detail: "Needed for an online product, not to be in business." },
      { name: "Accountant", detail: "Worth it for your first return, but you can file yourself." },
      { name: "Bookkeeping software", detail: "Records are mandatory, but a spreadsheet is fine." },
      { name: "Liability insurance", detail: "Your choice, unless a client's contract requires it." },
      { name: "Software licence or professional membership", detail: "You don't need either to write software." },
    ],
  },
];

/** How each step below is needed. */
export const STEP_NEED: Record<string, Need> = {
  "biz-permit": "Mandatory",
  "biz-contract": "Mandatory",
  "biz-structure": "Not mandatory",
  "biz-name": "Mandatory",
  "biz-req": "Mandatory",
  "biz-bank": "Not mandatory",
  "biz-gst": "Only if",
  "biz-city": "Only if",
  "biz-brand": "Not mandatory",
  "biz-legal": "Only if",
  "biz-books": "Mandatory",
  "biz-insure": "Not mandatory",
  "biz-yearly": "Mandatory",
};

export const COSTS: { item: string; when: string; cost: string; need: Need }[] = [
  { item: "REQ registration", when: "Once", cost: "$41 ($61.50 priority)", need: "Mandatory" },
  { item: "REQ yearly update, including annual fee", when: "Each year", cost: "$41 ($61.50 priority)", need: "Mandatory" },
  { item: "Late yearly update", when: "If late", cost: "50% penalty on the annual fee", need: "Only if" },
  { item: "GST and QST registration", when: "Once", cost: "Free", need: "Only if" },
  { item: "Montreal occupancy certificate", when: "Once, if your borough asks", cost: "Varies by borough", need: "Only if" },
  { item: "Domain name", when: "Each year", cost: "About $20", need: "Not mandatory" },
  { item: "Trademark in Canada, first class, online", when: "Once", cost: "$491.06", need: "Not mandatory" },
  { item: "Each extra trademark class", when: "Once", cost: "$149.04", need: "Not mandatory" },
  { item: "Business bank account", when: "Monthly", cost: "$0 to $20", need: "Not mandatory" },
  { item: "Bookkeeping software", when: "Monthly", cost: "$0 to $30", need: "Not mandatory" },
  { item: "Accountant for your return", when: "Each year", cost: "About $300 to $800", need: "Not mandatory" },
  { item: "Professional liability insurance", when: "Each year", cost: "About $500 to $1,000", need: "Not mandatory" },
  { item: "Apple Developer Program", when: "Each year", cost: "US$99", need: "Not mandatory" },
  { item: "Google Play developer account", when: "Once", cost: "US$25", need: "Not mandatory" },
  { item: "Incorporation, only if you outgrow this", when: "Once", cost: "About $400 in government fees", need: "Not mandatory" },
];

export const BUSINESS_STEPS: TrackItem[] = [
  {
    id: "biz-permit",
    title: "Confirm you are allowed to run a business",
    summary: "Check your work permit before anything else.",
    body: [
      { title: "Why first", text: "Registering is cheap, but earning without permission can cost you far more than money. Everything else on this page depends on this answer." },
    ],
    steps: ["Find the conditions printed on your work permit", "Write down whether it is open or tied to one employer", "Ask IRCC or a licensed consultant if self-employment is allowed", "Keep the answer with your records"],
  },
  {
    id: "biz-contract",
    title: "Check your employment contract",
    summary: "Confirm outside work is allowed and that you keep what you build.",
    body: [
      { title: "What to look for", text: "Outside employment, conflict of interest, confidentiality and intellectual property. In general, an employer owns work done as part of your job, so keep your projects clearly separate." },
    ],
    steps: ["Reread your offer letter and any policy it refers to", "List anything that could overlap with your job", "Ask HR in writing if something is unclear", "Use only your own computer, accounts and time"],
  },
  {
    id: "biz-structure",
    title: "Choose sole proprietorship to start",
    summary: "Cheap and simple. Incorporate later, if profit or risk justifies it.",
    body: [
      { title: "Sole proprietorship", text: "Business profit goes on your personal return at your 36% rate. Losses can lower your other income. Setup costs $41, and you can close it for free." },
      { title: "When to incorporate", text: "Look at it once profit is well beyond what you spend, usually tens of thousands of dollars a year, or when contracts bring real liability. It adds yearly filings and accounting costs." },
    ],
    steps: ["Decide on sole proprietorship for now", "Set a profit level at which you will revisit it"],
  },
  {
    id: "biz-name",
    title: "Choose a brand name that passes Quebec's rules",
    summary: "An English word is fine if a French generic word goes with it.",
    body: [
      { title: "The rule", text: "An enterprise name must be in French. The distinctive part can be in another language if a French generic term goes with it, for example Studio Nimbus or Logiciels Nimbus, where Studio or Logiciels says what you do." },
      { title: "Why it is required", text: "If you operate under anything other than your own first and last name, registration is mandatory, within 60 days of starting. Your brand is the reason you must register." },
      { title: "Your public brand", text: "A product name such as Nimbus can stay in English as a trademark. Since June 1, 2025, a non-French name seen from outside a premises needs French to be clearly predominant nearby. That rarely matters for an online business." },
    ],
    steps: ["List three names with a French generic word", "Search each name in the Registraire des entreprises database", "Search the Canadian trademarks database", "Check that the domain and social handles are free", "Google the name for confusingly similar businesses"],
  },
  {
    id: "biz-req",
    title: "Register with the Registraire des entreprises (REQ)",
    summary: "File online for $41. You receive your NEQ, your Quebec enterprise number.",
    body: [
      { title: "What you need", text: "Your legal name, home address, date of birth, business name, a description of the activity such as software development, your start date, and a clicSÉQUR login." },
      { title: "After filing", text: "You get your NEQ, and the business appears in the public register. Your address may be public, so consider that when you fill it in." },
    ],
    steps: ["Create your clicSÉQUR account", "Complete the declaration of registration online", "Pay $41, or $61.50 for priority", "Save your NEQ and confirmation", "Add the yearly update to your calendar"],
  },
  {
    id: "biz-bank",
    title: "Open a separate bank account",
    summary: "Keep business money apart from day one.",
    body: [
      { title: "Why", text: "It isn't generally a legal requirement for a sole proprietor, but a separate account makes taxes simple and proves your expenses. Payment services also pay out more easily to a business account." },
      { title: "Also open a USD account", text: "Selling to Americans? A USD account lets you avoid Stripe's 2% conversion fee." },
    ],
    steps: ["Compare business accounts, including no-fee options", "Open the account with your NEQ and declaration", "Open a USD account if you plan to sell in USD", "Open a savings account just for taxes", "Get a card just for business costs"],
  },
  {
    id: "biz-gst",
    title: "Decide on GST and QST",
    summary: "Required over $30,000 of sales. Below that, it is your choice.",
    body: [
      { title: "The rule", text: "You are a small supplier if your worldwide taxable sales are $30,000 or less over four calendar quarters, and in any single quarter. Over that, you must register and charge tax." },
      { title: "Registering early", text: "You charge Quebec clients 14.975%, but you can claim back the tax you pay on business costs. Businesses don't mind. Consumers see a higher price, so it usually suits business clients more than consumers." },
      { title: "Where", text: "In Quebec, you register for both with Revenu Québec, in My Account for businesses or with form LM-1-V." },
      { title: "Watch sales outside Canada", text: "Canada's $30,000 limit is not the only rule. The EU has no threshold for sellers from outside the EU selling digital products to consumers. A merchant of record solves this, see Get paid." },
    ],
    steps: ["Add up expected sales for the next 12 months", "Decide to stay small or register voluntarily", "Set an alert at $25,000 of sales", "Register through Revenu Québec when you need to"],
  },
  {
    id: "biz-city",
    title: "Check Montreal's home-office rules",
    summary: "Montreal may require an occupancy certificate, even at home.",
    body: [
      { title: "The rule", text: "Montreal's rules say home activities must not disturb neighbours and call for an occupancy certificate. Rules and fees vary by borough, and a laptop-only business with no clients visiting may be treated simply, so ask." },
      { title: "Your lease", text: "Check that it lets you work from home. Your tenant insurance may not cover business equipment or activity either, so ask your insurer." },
    ],
    steps: ["Call 311 or your borough's permit counter", "Ask if a laptop-only home office needs a certificate", "Get the certificate if it does", "Check your lease and tenant insurance"],
  },
  {
    id: "biz-brand",
    title: "Set up your brand",
    summary: "Domain, email, simple site, and a trademark only if it starts working.",
    body: [
      { title: "A trademark can wait", text: "It costs $491.06 for the first class and takes a long time. Registering with the REQ does not give you trademark rights. For software, class 9 and class 42 are the usual ones. File once the name has traction." },
      { title: "French on your site", text: "If you serve Quebec customers, offer French at least as well as English. That covers your site, invoices and standard contracts." },
    ],
    steps: ["Buy the domain", "Set up an email at the domain", "Publish a simple site with your business name and contact", "Add a French version", "Consider a trademark once you have paying customers"],
  },
  {
    id: "biz-legal",
    title: "Get your contracts and privacy in order",
    summary: "Client contract, terms of service, and a Law 25 privacy policy.",
    body: [
      { title: "Client work", text: "Use a written contract covering scope, payment, who owns the code, liability limits and how it ends. In Quebec, standard-form contracts need a French version first." },
      { title: "Law 25", text: "Quebec's privacy law applies if you collect personal information. You need a person in charge of privacy, which defaults to you, a clear privacy policy, and a process for incidents. Do this before your first user signs up." },
    ],
    steps: ["Get a contract template checked by a lawyer", "Write terms of service and a refund policy", "Publish a privacy policy naming the person in charge", "Limit the personal data you collect"],
  },
  {
    id: "biz-books",
    title: "Set up bookkeeping and tax savings",
    summary: "Put aside 40% of profit and keep every receipt.",
    body: [
      { title: "How you are taxed", text: "Report business income on form T2125 federally and TP-80 in Quebec. Profit is added to your salary, so it is taxed at about 36%. Move 40% of each payment into your tax account." },
      { title: "QPP", text: "Self-employed people pay both shares of QPP, 12.6% for 2026. Your salary is already above the ceiling, so in a full year side profit should add little or no QPP. QPIP is a small amount, and a health services fund contribution may apply." },
      { title: "Instalments", text: "If you owe more than about $1,800 at tax time two years running, expect quarterly instalments to the CRA and Revenu Québec, due March 15, June 15, September 15 and December 15." },
      { title: "What you can deduct", text: "Reasonable business costs, such as software, hosting, equipment, professional fees, payment fees and a share of your home costs if you qualify. Keep receipts for six years." },
    ],
    steps: ["Pick a bookkeeping tool, even a spreadsheet", "Add a line for each sale and each cost", "Transfer 40% of each payment to your tax account", "Save receipts in one folder", "Book an accountant for your first return"],
  },
  {
    id: "biz-insure",
    title: "Protect yourself",
    summary: "Liability insurance is worth considering once you sign client contracts.",
    body: [
      { title: "Professional liability", text: "It covers claims that your work caused a client a loss. It matters more for client work than for a small app, and some clients require it." },
      { title: "CNESST", text: "With no workers, you don't need to register, and optional personal cover is available. Registration becomes mandatory if you hire." },
    ],
    steps: ["Get one or two quotes before signing big contracts", "Add a liability limit to every contract", "Register with the CNESST if you ever hire"],
  },
  {
    id: "biz-yearly",
    title: "Keep it running each year",
    summary: "One yearly checklist keeps you in good standing.",
    body: [
      { title: "Yearly", text: "File the REQ update and pay the annual fee, on time, to avoid the 50% penalty. File your T2125 and TP-80. Sole proprietors have until June 15 to file, but any balance is still due April 30." },
      { title: "If you stop", text: "It is free to close: file a declaration of cancellation with the REQ, and cancel your GST and QST registration if you have one." },
    ],
    steps: ["Add the REQ yearly update to your calendar", "Put aside the tax balance by April 30", "File by June 15", "Review your sales against the $30,000 limit"],
  },
];

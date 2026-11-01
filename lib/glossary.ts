// Plain-language explanations for finance terms. The first mention of a term in each card is underlined
// and shows this text on hover, focus or tap (see components/glossary).

export type GlossaryCategory = "core" | "pay" | "save" | "invest" | "retire" | "benefits" | "job" | "plan" | "borrow" | "business";

export const GLOSSARY_CATEGORIES: { id: GlossaryCategory; label: string }[] = [
  { id: "core", label: "Money basics" },
  { id: "pay", label: "Pay and tax" },
  { id: "save", label: "Saving" },
  { id: "invest", label: "Investing" },
  { id: "retire", label: "Retirement" },
  { id: "benefits", label: "Benefits and insurance" },
  { id: "job", label: "Your job" },
  { id: "plan", label: "Budgeting" },
  { id: "borrow", label: "Buying and borrowing" },
  { id: "business", label: "Running a business" },
];

export interface GlossaryTerm {
  /** regular expression source, matched case-insensitively */
  pattern: string;
  category: GlossaryCategory;
  title: string;
  what: string;
  why: string;
}

// When two patterns match at the same spot the earlier one wins, so longer phrases come before the shorter
// words they start with ("net worth" before "net", "RRSP room" before "RRSP"). Use (?:...) for groups: each term
// must add exactly one capture group.
export const GLOSSARY: GlossaryTerm[] = [
  // running a business
  { pattern: "sole propriet(?:or|orship)s?", category: "business", title: "Sole proprietorship", what: "A business owned and run by one person, with no legal separation from that person.", why: "It is the cheapest way to start, but your personal savings are exposed to business debts and lawsuits." },
  { pattern: "\\bNEQ\\b", category: "business", title: "NEQ", what: "Your Quebec enterprise number, given when you register with the Registraire des entreprises.", why: "Banks and payment services ask for it, and it identifies your business with the government." },
  { pattern: "\\bREQ\\b|registraire des entreprises", category: "business", title: "REQ (Registraire des entreprises)", what: "Quebec's public register of businesses.", why: "You must register here if you operate under any name other than your own first and last name." },
  { pattern: "merchant of record", category: "business", title: "Merchant of record", what: "The company that is legally the seller of your product, which handles tax, fraud and disputes for you.", why: "It costs more per sale, but it takes on the job of collecting sales tax worldwide." },
  { pattern: "\\bchargebacks?\\b", category: "business", title: "Chargeback", what: "When a customer asks their bank to reverse a card payment.", why: "You lose the sale and pay a fee, often $15 to $20, so clear receipts and easy refunds pay off." },
  { pattern: "\\binterchange(?:-plus)?\\b", category: "business", title: "Interchange", what: "The fee a card network sets, paid to the customer's bank on each card sale.", why: "It is the largest part of card fees. Interchange-plus pricing shows it separately from the processor's margin." },
  { pattern: "small supplier", category: "business", title: "Small supplier", what: "A business with $30,000 or less in taxable sales over four quarters.", why: "It doesn't have to charge GST and QST. Pass the limit and you must register." },
  { pattern: "\\bMRR\\b|monthly recurring revenue", category: "business", title: "MRR (monthly recurring revenue)", what: "The subscription income a business can expect each month.", why: "It is the main score for a software business, and the income that keeps coming." },
  { pattern: "\\bchurn\\b", category: "business", title: "Churn", what: "The share of subscribers who cancel each month.", why: "It sets a ceiling on your income. At 5% churn, you lose 1 in 20 customers a month, so growth stalls when new sign-ups only replace them." },
  { pattern: "micro-saas", category: "business", title: "Micro-SaaS", what: "A small subscription software product for a narrow audience, often run by one person.", why: "It can earn recurring income with low costs, but most earn little, so test demand before building much." },
  { pattern: "\\bSaaS\\b", category: "business", title: "SaaS (software as a service)", what: "Software people use online and pay for by subscription.", why: "Income repeats each month, unlike client work that stops when you stop." },
  { pattern: "\\bprofit\\b(?! sharing)|\\brevenue\\b(?! streams?)", category: "business", title: "Revenue and profit", what: "Revenue is all the money customers pay you. Profit is what is left after business costs.", why: "You pay income tax on profit, not revenue, while the $30,000 GST limit looks at sales." },
  { pattern: "self-employ(?:ed|ment)", category: "business", title: "Self-employed", what: "Working for yourself rather than for an employer. No tax comes off your pay.", why: "You set aside your own tax. Your work permit must allow it, and it can affect immigration programs." },
  { pattern: "\\bfreelanc(?:e|er|ers|ing)\\b", category: "business", title: "Freelancing", what: "Selling your skills to clients project by project, as a self-employed person.", why: "It is the fastest way to earn from your skills, but income stops when you stop working." },
  { pattern: "\\bretainers?\\b", category: "business", title: "Retainer", what: "A fixed monthly fee a client pays for your ongoing help.", why: "It turns one-off client work into income you can predict." },
  { pattern: "t2125 and tp-80|\\bT2125\\b|\\bTP-80\\b", category: "business", title: "T2125 and TP-80", what: "The federal and Quebec forms for reporting business income and costs.", why: "Your profit from them is added to your salary on your tax return." },
  { pattern: "\\binstalments?\\b", category: "business", title: "Tax instalments", what: "Quarterly tax payments you make yourself, because no tax is withheld on business income.", why: "They are usually required if you owe more than about $1,800 at tax time two years running. Missing them adds interest." },
  { pattern: "input tax credits?|\\bITCs?\\b", category: "business", title: "Input tax credit", what: "GST you paid on business costs, which a registered business can claim back. The QST version is an input tax refund.", why: "It is the main upside of registering for GST and QST early." },
  { pattern: "occupancy certificate", category: "business", title: "Occupancy certificate", what: "A Montreal permit for running an activity from a location, sometimes including a home.", why: "Rules and fees vary by borough, so ask yours even for a laptop-only business." },
  { pattern: "\\btrademarks?\\b", category: "business", title: "Trademark", what: "A registered right to a name or logo for certain goods or services.", why: "Registering a business name doesn't give you this. It is what protects a brand from copycats." },
  { pattern: "\\bCNESST\\b", category: "business", title: "CNESST", what: "Quebec's workplace health and safety board.", why: "You don't need to register with no workers, and personal cover is optional. Hiring makes registration mandatory." },
  { pattern: "professional liability", category: "business", title: "Professional liability insurance", what: "Insurance for claims that your work caused a client a financial loss. Also called errors and omissions.", why: "A sole proprietor's personal savings are exposed, so it is worth a look once you sign client contracts." },
  { pattern: "clics[ée]qur", category: "business", title: "clicSÉQUR", what: "The Quebec government's login for online services.", why: "You use it to register your business with the REQ." },
  { pattern: "pre-authori[sz]ed debits?", category: "business", title: "Pre-authorised debit", what: "Permission for a business to pull payments straight from a customer's bank account.", why: "On Stripe it is capped at CA$5, so it costs far less than a card on large invoices." },
  { pattern: "e-transfers?", category: "business", title: "Interac e-Transfer", what: "A bank-to-bank payment in Canada, sent by email or text.", why: "It is the cheapest way for Canadian clients to pay you, though bank limits apply." },
  { pattern: "\\bpayouts?\\b", category: "business", title: "Payout", what: "When a payment service sends your balance to your bank account.", why: "Standard payouts are usually free. Instant ones cost extra, often around 1%." },
  { pattern: "currency conversion", category: "business", title: "Currency conversion", what: "Changing money from one currency to another, which services charge for.", why: "It costs 2% on Stripe and 4% on PayPal, so a USD bank account can save real money." },
  { pattern: "\\bwebhooks?\\b", category: "business", title: "Webhook", what: "A message a payment service sends your app when something happens, such as a successful payment.", why: "Your app should unlock paid features from this, not from the page a customer lands on." },
  { pattern: "affiliate (?:links?|programs?)", category: "business", title: "Affiliate program", what: "A company pays you when someone buys through your link.", why: "It is low effort, and you must disclose it. It only pays with an audience that trusts you." },
  { pattern: "\\bIRCC\\b", category: "job", title: "IRCC", what: "Immigration, Refugees and Citizenship Canada, the federal immigration department.", why: "It is the authority on what your work permit allows." },
  { pattern: "open (?:work )?permits?", category: "job", title: "Open work permit", what: "A work permit that lets you work for almost any employer.", why: "It generally allows self-employment, but confirm your own conditions first." },
  { pattern: "employer-specific (?:work )?permits?", category: "job", title: "Employer-specific work permit", what: "A work permit tied to one named employer.", why: "It generally doesn't allow a side business, and working outside it can put your status at risk." },
  { pattern: "canadian experience class", category: "job", title: "Canadian Experience Class", what: "A permanent residence program for people with skilled work experience in Canada.", why: "Self-employed time generally doesn't count, so your salaried work matters for it." },
  { pattern: "law 25", category: "business", title: "Law 25", what: "Quebec's privacy law for organisations that handle personal information.", why: "Even a solo business needs a person in charge of privacy and a clear policy." },

  // money basics
  { pattern: "net worth", category: "core", title: "Net worth", what: "Everything you own minus everything you owe.", why: "It is the truest score of your finances. Income shows what comes in; net worth shows what you have kept." },
  { pattern: "\\bassets?\\b(?! allocation| mix)", category: "core", title: "Asset", what: "Something you own that has value, such as cash, investments, a pension or a home.", why: "Good assets pay you or grow. Building wealth means slowly swapping spending for assets." },
  { pattern: "\\bliabilities\\b", category: "core", title: "Liabilities", what: "Everything you owe: card balances, loans and mortgages.", why: "They take money from you every month, so paying off the costly ones raises your net worth for certain." },
  { pattern: "cash flow", category: "core", title: "Cash flow", what: "The money coming in minus the money going out over a period, usually a month.", why: "Positive cash flow is the fuel for everything else. Without it there is nothing to save or invest." },
  { pattern: "compound (?:growth|interest|returns?)|compounding|compounds", category: "core", title: "Compound growth", what: "Earning returns on your earlier returns, not only on the money you put in.", why: "It is why time matters so much. At 6%, $500 a month grows to about $500,000 in 30 years, of which you paid in $180,000." },
  { pattern: "\\binflation\\b", category: "core", title: "Inflation", what: "The slow rise in prices, which means each dollar buys a little less every year.", why: "Cash left idle loses buying power. Your money has to grow faster than inflation to really get ahead." },
  { pattern: "today['’]s dollars|today['’]s money", category: "core", title: "Today's dollars", what: "A future amount shrunk by inflation, so you see what it would buy now.", why: "It keeps long-range numbers honest. A million in 36 years buys about what $490,000 buys today." },
  { pattern: "real returns?", category: "core", title: "Real return", what: "Your return after inflation. A 6% return with 2% inflation is about a 4% real return.", why: "It is what actually grows your buying power, so it is the number to plan with." },
  { pattern: "nominal (?:returns?|dollars|terms|amounts?)|future dollars", category: "core", title: "Nominal amount", what: "A number as it will really be written on the day, with no adjustment for inflation.", why: "Nominal figures look large far in the future. Compare them with today's dollars before you trust them." },
  { pattern: "opportunity cost", category: "core", title: "Opportunity cost", what: "What you give up by choosing one thing over the next best option.", why: "Every dollar spent is also a dollar not invested. Asking what else it could do leads to better decisions." },
  { pattern: "financial independence", category: "core", title: "Financial independence", what: "Having enough invested that the returns can cover your spending, so work becomes a choice.", why: "A common target is 25 times your yearly spending. It gives the whole plan a finish line." },
  { pattern: "passive income", category: "core", title: "Passive income", what: "Money that arrives without trading your hours for it, such as dividends, interest or rent.", why: "It is what eventually replaces your salary. Nothing is truly hands-free, but some income takes far less time." },
  { pattern: "\\bliquid(?:ity)?\\b", category: "core", title: "Liquidity", what: "How quickly something can become cash without losing value.", why: "A savings account is liquid and a house is not. Keep money you may need soon in liquid places." },
  { pattern: "time value of money", category: "core", title: "Time value of money", what: "The idea that a dollar today is worth more than a dollar later, because today's dollar can start growing now.", why: "It explains interest, investing and why it pays to start early and pay debts sooner." },
  { pattern: "rule of 72", category: "core", title: "Rule of 72", what: "72 divided by a yearly return is roughly how many years money takes to double.", why: "A quick way to compare options in your head. It also shows how fast 20% card debt grows." },

  // pay and tax
  { pattern: "marginal (?:tax )?rates?", category: "pay", title: "Marginal tax rate", what: "The tax on your next dollar of income.", why: "Yours is about 36%. Use it to judge bonuses, raises and RRSP or FHSA contributions." },
  { pattern: "average (?:income )?(?:tax )?rate", category: "pay", title: "Average tax rate", what: "Your total tax divided by your total income.", why: "It is always lower than your marginal rate, and it shows what you really pay overall." },
  { pattern: "tax brackets?", category: "pay", title: "Tax bracket", what: "A slice of income taxed at one rate. Each higher slice has a higher rate.", why: "Only the slice above a line is taxed more, so a raise can never lower your take-home." },
  { pattern: "tax credits?", category: "pay", title: "Tax credit", what: "An amount that comes off the tax you owe, usually a fixed percentage of a cost.", why: "It is worth the same whatever you earn. Tuition, medical and donations are common examples." },
  { pattern: "tax[- ]deductible|\\bdeductible (?:going in|contributions?)", category: "pay", title: "Tax deductible", what: "Allowed to come off your income before tax is worked out.", why: "Each deductible $1,000 saves you tax at your marginal rate, about $360 for you." },
  { pattern: "deductions?", category: "pay", title: "Deduction", what: "On a payslip, an amount taken from your pay. On a tax return, an amount that lowers the income you are taxed on.", why: "Knowing each one explains the gap between salary and deposit, and tax deductions save you the most at a high rate." },
  { pattern: "notice of assessment", category: "pay", title: "Notice of Assessment", what: "The letter the CRA sends after you file, confirming your tax and your RRSP limit.", why: "It holds your exact RRSP room for next year, so keep each one and check it before contributing." },
  { pattern: "year-to-date|\\bYTD\\b", category: "pay", title: "Year-to-date (YTD)", what: "The running total since January 1.", why: "Payslips use it to track when QPP and EI reach their yearly maximums." },
  { pattern: "\\bCRA\\b", category: "pay", title: "CRA (Canada Revenue Agency)", what: "The federal tax agency. It collects federal tax and tracks your RRSP, TFSA and FHSA room.", why: "CRA My Account shows your room, slips and refunds in one place." },
  { pattern: "Revenu Qu[ée]bec", category: "pay", title: "Revenu Québec", what: "Quebec's tax agency. Quebec residents file a second return with it.", why: "You file two returns each year, and refunds or balances come from each one separately." },
  { pattern: "\\bT2202\\b", category: "pay", title: "T2202", what: "The slip from a school showing the tuition you paid.", why: "It gives you tuition credits, and unused credits can carry forward to lower tax in later years." },
  { pattern: "pro-?rated", category: "pay", title: "Prorated", what: "Reduced to match the part of a year or period that applies.", why: "Starting mid-year means bonuses and days off are often a share of the full amount." },

  // saving accounts
  { pattern: "(?:RRSP|TFSA|FHSA|contribution) room", category: "save", title: "Contribution room", what: "How much you are allowed to put into a registered account.", why: "Going over costs a penalty of 1% a month on the excess, so check your room in CRA My Account first." },
  { pattern: "high-interest savings", category: "save", title: "High-interest savings account (HISA)", what: "A bank savings account that pays more interest than chequing and lets you withdraw at any time.", why: "The right home for your emergency fund and short-term goals: safe, reachable and still earning." },
  { pattern: "\\bGICs?\\b", category: "save", title: "GIC (Guaranteed Investment Certificate)", what: "A deposit that locks your money for a set time at a set interest rate.", why: "A safe choice for money with a known date, such as a down payment in two years." },
  { pattern: "\\bCDIC\\b", category: "save", title: "CDIC", what: "Canada's deposit insurer. It protects eligible deposits up to $100,000 per category at each member bank if the bank fails.", why: "It makes savings accounts and most GICs very safe. It does not cover stocks or ETFs." },
  { pattern: "\\bCIPF\\b", category: "save", title: "CIPF", what: "Protects your investments, generally up to $1 million, if your investment dealer goes bankrupt.", why: "It protects you against a failing broker, not against the market falling." },
  { pattern: "non-registered", category: "save", title: "Non-registered account", what: "A regular investment account with no tax shelter.", why: "Use it after your TFSA, RRSP and FHSA are full, because interest, dividends and gains are taxed here." },

  // investing
  { pattern: "index ETFs?|\\bETFs?\\b", category: "invest", title: "ETF (exchange-traded fund)", what: "A basket of many investments that you buy like one stock.", why: "One purchase can spread your money over thousands of companies, usually at a very low fee." },
  { pattern: "index funds?", category: "invest", title: "Index fund", what: "A fund that simply copies a market list, such as the 500 largest US companies, rather than picking winners.", why: "Low fees and wide spread make it hard to beat. Over long periods most stock-pickers trail their index." },
  { pattern: "mutual funds?", category: "invest", title: "Mutual fund", what: "A pool of investors' money run by a manager, often sold through banks.", why: "Many charge about 2% a year, which can take a quarter or more of your final money. Check the MER first." },
  { pattern: "\\bMER\\b", category: "invest", title: "MER (management expense ratio)", what: "The yearly fee a fund charges, as a percentage of your money.", why: "You never see a bill, it just shrinks your return. Lower is almost always better." },
  { pattern: "all-in-one", category: "invest", title: "All-in-one ETF", what: "A single fund that holds a full mix of world stocks and bonds and rebalances itself.", why: "Often the only fund a long-term investor needs: pick your risk level and keep buying." },
  { pattern: "\\bstocks?\\b|company shares|share prices?", category: "invest", title: "Stock (share)", what: "A small piece of ownership in a company.", why: "Owners share in growth and profits. Stocks have the highest long-term returns and the biggest drops." },
  { pattern: "\\bbonds?\\b", category: "invest", title: "Bond", what: "A loan you make to a government or company, which pays interest and returns your money at the end.", why: "Bonds grow less than stocks but usually fall less, which steadies a portfolio." },
  { pattern: "\\bdividends?\\b", category: "invest", title: "Dividend", what: "A share of a company's profit paid out to its owners.", why: "It is a real cash return. Reinvesting dividends is a big part of long-term stock growth." },
  { pattern: "capital gains?", category: "invest", title: "Capital gain", what: "The profit when you sell something for more than you paid.", why: "Only half of a gain is taxed in Canada, and none at all inside a TFSA, RRSP or FHSA." },
  { pattern: "\\bportfolios?\\b", category: "invest", title: "Portfolio", what: "All of your investments taken together.", why: "Judge the whole mix, not one holding. What matters is how it all works toward your goals." },
  { pattern: "diversif(?:y|ied|ication)", category: "invest", title: "Diversification", what: "Spreading your money over many investments so no single failure can hurt you badly.", why: "It is the closest thing to a free lunch in investing: less risk without giving up much return." },
  { pattern: "asset allocation|asset mix", category: "invest", title: "Asset allocation", what: "How your money is split between stocks, bonds and cash.", why: "It is the biggest driver of both your return and how bumpy the ride feels." },
  { pattern: "rebalanc(?:e|es|ing)", category: "invest", title: "Rebalancing", what: "Bringing your mix back to its target by trimming what grew and adding to what lagged.", why: "It keeps your risk where you chose it, and it makes you sell high and buy low by rule." },
  { pattern: "dollar-cost averag(?:e|ing)", category: "invest", title: "Dollar-cost averaging", what: "Investing the same amount on a schedule, whatever the market is doing.", why: "You automatically buy more when prices are low, and you never need to guess the right moment." },
  { pattern: "volatil(?:e|ity)", category: "invest", title: "Volatility", what: "How much and how quickly a price swings up and down.", why: "It feels like risk, but for long-term money the real risk is selling during a drop." },
  { pattern: "bear market", category: "invest", title: "Bear market", what: "A market fall of 20% or more from a recent high. A rising market is a bull market.", why: "They are normal and have always ended so far. Expect several in your lifetime." },
  { pattern: "growth fund", category: "invest", title: "Growth fund", what: "A fund that holds mostly stocks, aiming for higher long-term growth with bigger swings.", why: "Suits retirement money that is decades away, as yours is." },

  // retirement
  { pattern: "\\bOAS\\b|old age security", category: "retire", title: "OAS (Old Age Security)", what: "A federal monthly pension from 65, based on how many years you have lived in Canada, not on work.", why: "A full pension takes 40 years of residence after 18. It is reduced at higher retirement incomes." },
  { pattern: "\\bGIS\\b|guaranteed income supplement", category: "retire", title: "GIS (Guaranteed Income Supplement)", what: "A tax-free top-up to OAS for retirees with low income.", why: "It is a safety net. RRSP withdrawals count as income and can reduce it, while TFSA withdrawals do not." },
  { pattern: "clawbacks?|recovery tax", category: "retire", title: "OAS clawback", what: "Taking back 15 cents of OAS for each dollar of retirement income above a limit, $95,323 for 2026.", why: "TFSA withdrawals do not count toward it, which is one more reason to hold some savings there." },
  { pattern: "\\bRRIF\\b", category: "retire", title: "RRIF (Registered Retirement Income Fund)", what: "What an RRSP turns into for retirement. You must convert by the end of the year you turn 71.", why: "It requires a minimum withdrawal each year, and those withdrawals are taxed as income." },
  { pattern: "pension adjustment", category: "retire", title: "Pension adjustment", what: "The amount your workplace pension contributions reduce your RRSP room by.", why: "It is why your RRSP room is small: your 12% DC pension uses most of the 18% limit." },
  { pattern: "statement of participation", category: "retire", title: "Statement of participation", what: "Your yearly QPP record from Retraite Québec, with your earnings and estimated pension.", why: "Check it every few years so mistakes are caught early." },
  { pattern: "retraite qu[ée]bec", category: "retire", title: "Retraite Québec", what: "The Quebec agency that runs the QPP.", why: "Its online account shows your QPP record and estimate." },
  { pattern: "(?:the )?4% rule", category: "retire", title: "4% rule", what: "A rule of thumb: withdrawing 4% of savings in year one, then rising with inflation, has usually lasted 30 years.", why: "It sets a simple target: yearly spending times 25." },

  // benefits and insurance
  { pattern: "insurance deductible", category: "benefits", title: "Insurance deductible", what: "The part of a claim you pay yourself before insurance starts paying.", why: "A higher deductible lowers your premium. Your emergency fund lets you choose one safely." },
  { pattern: "co-?insurance", category: "benefits", title: "Coinsurance", what: "The share of a covered cost your plan pays, such as 80%, leaving you the rest.", why: "It tells you what a claim will really cost you." },
  { pattern: "liability (?:cover|coverage|insurance)|your liability", category: "benefits", title: "Liability insurance", what: "Cover for damage or injury you cause to other people or their property.", why: "One accident can cost far more than you own. It is the main reason to carry tenant insurance." },

  // your job
  { pattern: "total (?:pay|compensation)\\b", category: "job", title: "Total compensation", what: "Everything a job pays: salary, bonus, pension match, benefits and perks.", why: "Compare jobs on this number, because a lower salary can still be the better offer." },
  { pattern: "cents per point", category: "job", title: "Cents per point", what: "What a loyalty point is worth on one redemption: cash price saved divided by the points used.", why: "It shows which redemptions are good value. Aim above 1.5 cents on flights." },

  // budgeting
  { pattern: "lifestyle creep", category: "plan", title: "Lifestyle creep", what: "When spending rises each time your income does.", why: "It is why high earners can still have nothing saved. Save at least half of every raise." },
  { pattern: "sinking funds?", category: "plan", title: "Sinking fund", what: "Money set aside monthly for a known future cost, such as a trip or car repairs.", why: "Big bills stop being surprises, and they stay off your credit card." },

  // buying and borrowing
  { pattern: "(?:mortgage )?default insurance|\\bCMHC\\b", category: "borrow", title: "Mortgage default insurance (CMHC)", what: "Insurance you must buy with less than 20% down. It protects the lender, not you.", why: "The premium is added to your mortgage, about 4% of the loan at 5% down, so a 20% down payment avoids a real cost." },
  { pattern: "stress test", category: "borrow", title: "Mortgage stress test", what: "A check that you could still pay at a higher rate: the greater of 5.25% or your rate plus 2%.", why: "It sets how much you can borrow, which is usually less than the payment alone suggests." },
  { pattern: "fixed[- ]rate|variable[- ]rate", category: "borrow", title: "Fixed vs variable rate", what: "A fixed rate stays the same for the term. A variable rate moves with the market.", why: "Fixed buys certainty, while variable can cost less but can also rise. Choose based on the payment you could survive." },
  { pattern: "mortgage term", category: "borrow", title: "Mortgage term", what: "How long your rate and contract last, often 5 years. Then you renew.", why: "It differs from amortization. You usually renew several times before the loan is paid off." },
  { pattern: "\\bamortiz(?:ation|ed|e|ing)\\b", category: "borrow", title: "Amortization", what: "The total time a loan is scheduled to take to pay off, often 25 years for a mortgage.", why: "Longer means a lower payment but far more interest. On $360,000 at 5%, 30 years costs about $64,000 more than 25." },
  { pattern: "\\bmortgages?\\b", category: "borrow", title: "Mortgage", what: "A loan to buy property, with the property as security for the lender.", why: "It will likely be your biggest debt, so small rate changes mean thousands of dollars." },
  { pattern: "\\bprincipal\\b", category: "borrow", title: "Principal", what: "The amount you borrowed and still owe, not counting interest.", why: "Only payments toward principal shrink a debt. Early payments are mostly interest." },
  { pattern: "pre-?pay(?:ment|ments|ing)?\\b", category: "borrow", title: "Prepayment", what: "Paying extra on a loan beyond the regular payment.", why: "Extra money goes straight to principal, which saves interest for the rest of the loan. Check the limits first." },
  { pattern: "home buyers['’]? plan", category: "borrow", title: "Home Buyers' Plan", what: "Lets first-time buyers borrow up to $60,000 from their own RRSP for a home, repaid over 15 years.", why: "It adds to your FHSA for a down payment. Missed repayments are taxed as income." },
  { pattern: "credit scores?", category: "borrow", title: "Credit score", what: "A number from 300 to 900 showing how reliably you have handled debt.", why: "A higher score means easier approval and lower rates, which can save thousands on a mortgage." },
  { pattern: "credit utili[sz]ation", category: "borrow", title: "Credit utilization", what: "How much of your credit limit you are using, as a percentage.", why: "Staying under 30% helps your credit score." },
  { pattern: "credit limit", category: "borrow", title: "Credit limit", what: "The most a lender lets you owe on a card or line of credit.", why: "It is not spending money. Using a small share of it helps your score." },
  { pattern: "minimum payments?", category: "borrow", title: "Minimum payment", what: "The smallest amount you must pay on a card each month to avoid a late mark.", why: "Paying only this keeps you in debt for years. Pay the full statement instead." },
  { pattern: "lines? of credit|\\bLOC\\b", category: "borrow", title: "Line of credit", what: "A flexible loan with a limit. You borrow what you need and pay interest only on that.", why: "Usually much cheaper than a credit card, so it can be a tool for clearing one." },
  { pattern: "\\bleverage\\b", category: "borrow", title: "Leverage", what: "Using borrowed money to buy something bigger than your cash alone allows.", why: "It multiplies gains and losses alike. A mortgage is leverage, which is why buying a home feels so powerful and so risky." },
  { pattern: "\\bdepreciat(?:e|es|ion|ing)\\b", category: "borrow", title: "Depreciation", what: "The loss in something's value as it ages. Cars are the classic example.", why: "A new car can lose around half its value in five years, which is a real cost even if you never see a bill." },
  { pattern: "\\bTAL\\b|tribunal administratif du logement", category: "borrow", title: "TAL (Tribunal administratif du logement)", what: "Quebec's housing tribunal. It settles disputes between tenants and landlords, including rent increases.", why: "If you refuse an increase and cannot agree, the TAL sets the rent." },

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
  { pattern: "(?:employer )?pension match|pension \\(6%\\)", category: "retire", title: "Pension match", what: "Air Canada adds money to your pension, up to 6% of pay, when you put in 6%.", why: "It is free money. Contributing the full amount is one of the best returns you can get." },
  { pattern: "emergency fund", category: "plan", title: "Emergency fund", what: "Cash set aside for surprises such as a job loss, a repair or a medical cost.", why: "It keeps you out of credit card debt. One to three months of expenses is a common goal." },
  { pattern: "savings rate", category: "plan", title: "Savings rate", what: "The share of your take-home pay that you save each month.", why: "A quick health check. About 20% is a common target, and a higher rate reaches your goals sooner." },
  { pattern: "50/30/20", category: "plan", title: "50/30/20 guideline", what: "A simple budget rule: 50% of pay for needs, 30% for wants and 20% for savings.", why: "It shows at a glance whether your spending is balanced, without tracking every dollar." },
  { pattern: "\\bAPR\\b", category: "borrow", title: "APR (annual percentage rate)", what: "The yearly cost of borrowing, shown as a percentage of the loan.", why: "A lower APR means less interest. Even 1% less can save hundreds on a car loan." },
  { pattern: "down payment", category: "borrow", title: "Down payment", what: "The cash you pay upfront. The rest of the price is borrowed.", why: "A bigger down payment means a smaller loan, a lower monthly payment and less interest." },
  { pattern: "GST and QST", category: "borrow", title: "GST and QST", what: "Sales taxes: 5% federal (GST) plus 9.975% Quebec (QST), 14.975% in total, added to the price.", why: "A $30,000 car really costs about $4,500 more at the till, so include it in your plan." },
  { pattern: "welcome tax", category: "borrow", title: "Welcome tax", what: "A Quebec tax you pay once when you buy property (a land transfer tax).", why: "It is a cost on top of your down payment, so save for it too." },
  { pattern: "closing costs", category: "borrow", title: "Closing costs", what: "Fees paid when you finish buying a home: welcome tax, notary, inspection and more.", why: "They are about 3% of the price on top of your down payment, so you need that cash as well." },
  { pattern: "(?<!conflicts? of )\\binterest\\b", category: "borrow", title: "Interest", what: "The fee a lender charges you for borrowing money.", why: "Paying a loan off faster, or at a lower rate, means less interest and a cheaper car." },
  { pattern: "probation", category: "job", title: "Probation", what: "The first months of a job when an employer can end it more easily. Yours ends mid-February.", why: "Some bonus payments depend on you still being employed, so the plan treats them as extra." },
  { pattern: "\\bESOP\\b", category: "invest", title: "ESOP (employee share ownership plan)", what: "A plan to buy company shares through your pay. The employer may add a match.", why: "It can grow your wealth, but keep it small: your job and your shares would both depend on one airline." },
  { pattern: "T4 and RL-1|\\bT4\\b|\\bRL-1\\b", category: "pay", title: "T4 and RL-1", what: "Tax slips from your employer showing what you earned and how much tax was already taken.", why: "You need them to file your return, which is when your refund is worked out." },
  { pattern: "Aeroplan points", category: "job", title: "Aeroplan points", what: "Air Canada's loyalty points, which you can use toward flights.", why: "Free value from your job that can lower travel costs. It is not cash, so the plan leaves it out." },
  { pattern: "Star Alliance", category: "job", title: "Star Alliance", what: "A group of airlines, including Air Canada, Lufthansa, United, ANA and Swiss, whose flights you can book with Aeroplan points.", why: "Partner flights use a fixed points chart and often cost fewer points than Air Canada's own seats." },
  { pattern: "Family Sharing", category: "job", title: "Aeroplan Family Sharing", what: "A free way for up to 8 people to pool their Aeroplan points toward one award.", why: "You reach a trip sooner when points from several accounts add up." },
  { pattern: "fuel surcharges", category: "job", title: "Fuel surcharges", what: "Extra fees some airlines add to award tickets on top of taxes.", why: "Aeroplan doesn't add them on most partner flights, which is part of why partner awards are good value." },
  { pattern: "profit sharing", category: "job", title: "Profit sharing", what: "A payment to employees when the company has a good year.", why: "A possible bonus, but not guaranteed, so it is left out of your plan." },
  { pattern: "investment return", category: "invest", title: "Investment return", what: "How much invested money grows in a year, as a percentage.", why: "Growth is what turns steady saving into a million. It is never guaranteed, so use a cautious number." },
  { pattern: "retro deductions", category: "pay", title: "Retro deductions", what: "Catch-up deductions taken from one paycheque for earlier pay periods.", why: "They made September's pay lower than normal, so the plan adds them back to show your usual pay." },
  { pattern: "refund", category: "pay", title: "Tax refund", what: "Money the government returns when more tax was taken from your pay than you owed.", why: "Putting money in an RRSP or FHSA lowers the tax you owe, which can raise your refund." },
  { pattern: "surplus", category: "plan", title: "Surplus", what: "What is left of your pay after expenses.", why: "It is the money you can save each month, so growing it grows your savings." },
  { pattern: "\\bHorizon\\b", category: "plan", title: "Horizon", what: "How far ahead the charts and totals look.", why: "A longer horizon shows bigger long-term results. A shorter one shows near-term cash." },
  { pattern: "DC pension|DC Plan", category: "retire", title: "DC pension (defined contribution)", what: "A workplace pension where you and Air Canada each put in a share of your pay, and it is invested in funds you choose.", why: "What you get at retirement depends on how much goes in and how it grows, so the fund you pick matters." },
  { pattern: "Group RRSP", category: "save", title: "Group RRSP and Group TFSA", what: "An RRSP or TFSA run through your employer, with money taken straight from your pay.", why: "Saving happens automatically, fees are often lower, and RRSP deductions can lower the tax on each paycheque." },
  { pattern: "target-date", category: "invest", title: "Target-date fund", what: "One fund that holds a mix of stocks and bonds and slowly gets more cautious as your retirement year gets closer.", why: "An easy, hands-off choice for a pension when you do not want to pick and rebalance funds yourself." },
  { pattern: "long-term disability|\\bLTD\\b", category: "benefits", title: "Long-term disability (LTD)", what: "Insurance that replaces part of your pay if illness or injury stops you working for months or longer.", why: "It protects your biggest asset, your income. You pay it yourself, so a payout would generally be tax-free." },
  { pattern: "short-term disability|\\bSTD\\b", category: "benefits", title: "Short-term disability (STD)", what: "Insurance that pays part of your salary for a few weeks or months while you recover.", why: "It covers the gap before long-term disability starts." },
  { pattern: "AD&D", category: "benefits", title: "AD&D (accidental death and dismemberment)", what: "Insurance that pays out if an accident causes death or a serious injury such as losing a limb.", why: "Cheap extra cover. It only pays for accidents, not illness." },
  { pattern: "Lifestyle Spending Account|\\bLSA\\b|spending account", category: "benefits", title: "Lifestyle Spending Account (LSA)", what: "Money your employer sets aside each year that you claim back against receipts for fitness, wellness, education and similar costs.", why: "Yours is $500 a year. Unused dollars usually expire, and claims count as taxable income, so spend it on things you would buy anyway." },
  { pattern: "Health Spending Account|\\bHSA\\b", category: "benefits", title: "Health Spending Account (HSA)", what: "A pot of benefit dollars you can use, tax-free, for health and dental costs your plan does not fully cover.", why: "Any spare flex dollars can go here at enrolment instead of being lost." },
  { pattern: "flex dollars?", category: "benefits", title: "Flex dollars", what: "Money your employer gives you to buy benefit coverage. You choose which benefits they pay for at enrolment.", why: "Air Canada's flex dollars cover all of your health and drug plans and part of dental." },
  { pattern: "premium tax", category: "benefits", title: "Insurance premium tax", what: "A 9% Quebec tax on group insurance premiums, added to what you and your employer pay.", why: "It is why each insurance deduction on your payslip is 9% higher than Manulife's price." },
  { pattern: "\\bpremiums?\\b", category: "benefits", title: "Premium", what: "The regular amount paid to keep an insurance policy active.", why: "Premiums come off your pay whether or not you ever claim, so it is worth knowing what they buy." },
  { pattern: "critical illness", category: "benefits", title: "Critical illness insurance", what: "Insurance that pays a lump sum if you are diagnosed with a listed illness, such as cancer, a heart attack or a stroke.", why: "Useful once others depend on you. Disability insurance already replaces your income if you fall ill." },
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

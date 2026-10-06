export type DemoKey =
  | "payFirst"
  | "budget"
  | "emergency"
  | "debt"
  | "credit"
  | "accounts"
  | "compound"
  | "rule72"
  | "fees"
  | "million"
  | "car"
  | "home"
  | "lifestyle"
  | "taxes";

export interface Rule {
  id: string;
  group: string;
  title: string;
  /** one short line shown in the list */
  summary: string;
  /** what it means, in plain words */
  plain: string;
  /** how it helps you */
  why: string;
  /** a worked example with numbers */
  example: string;
  /** how it applies to you right now */
  you: string;
  demo: DemoKey;
}

export const GROUPS = [
  "Start here",
  "Debt and credit",
  "Grow your money",
  "Big purchases",
  "Habits and paperwork",
] as const;

export const RULES: Rule[] = [
  {
    id: "pay-first",
    group: "Start here",
    title: "Pay yourself first",
    summary: "Move savings out the day you are paid, before you can spend it.",
    plain:
      "Most people save what is left at the end of the month, and usually nothing is left. Flip it: set an automatic transfer to savings on payday, then spend what remains.",
    why: "Money you never see in your chequing account is money you do not spend. It also turns saving into a habit that needs no willpower.",
    example:
      "You take home $4,680 a month. An automatic transfer of 20% moves $936 to savings on payday. After one year you have $11,232 saved without making a single decision.",
    you: "Set the transfer for the day after each Air Canada payday. Start with the amount in your Plan page, and raise it whenever your pay goes up.",
    demo: "payFirst",
  },
  {
    id: "budget-50-30-20",
    group: "Start here",
    title: "The 50/30/20 budget",
    summary: "Needs 50%, wants 30%, savings 20% of your take-home pay.",
    plain:
      "Split your take-home pay into three buckets. Needs are things you must pay (rent, groceries, transit, phone, insurance, minimum debt payments). Wants are everything optional (eating out, subscriptions, trips). The rest, at least 20%, goes to savings and extra debt payments.",
    why: "It gives you one simple check instead of tracking every dollar. If needs are far above 50%, you know where the squeeze is.",
    example:
      "On $4,680 a month: $2,340 for needs, $1,404 for wants, $936 for savings. If rent and bills are already $2,900, needs are 62%, so wants have to shrink or savings fall below 20%.",
    you: "Montreal rent can push needs above 50%. That is fine as a short-term reality, as long as savings stay at 20% and wants take the hit.",
    demo: "budget",
  },
  {
    id: "emergency-fund",
    group: "Start here",
    title: "Build an emergency fund",
    summary: "Keep 3 to 6 months of basic expenses in cash you can reach fast.",
    plain:
      "An emergency fund is cash set aside for surprises: a job loss, a broken laptop, a flight home. Count your basic monthly expenses (not your wishes), then multiply by 3 to 6. Keep it in a high-interest savings account, not in the stock market.",
    why: "Without a cushion, an emergency goes on a credit card at about 20% interest or forces you to sell investments at a bad time. With one, a bad month is only an inconvenience.",
    example:
      "Basic expenses of $2,600 a month, times 3, is $7,800. Saving $500 a month gets you there in about 16 months.",
    you: "While your immigration status is still temporary, lean toward 6 months. Losing a job can also put your status at risk, so a bigger buffer buys time.",
    demo: "emergency",
  },
  {
    id: "high-interest-debt",
    group: "Debt and credit",
    title: "Kill high-interest debt first",
    summary: "A credit card at 20% beats almost any investment, so pay it off before investing.",
    plain:
      "Interest on a credit card is about 20% a year. No safe investment pays that. So paying off a card balance is a guaranteed 20% return. Pay the full balance every month, and if you carry a balance, attack it before you invest.",
    why: "Every dollar of interest is a dollar that does not go to your goals. Clearing the card frees the monthly payment for saving.",
    example:
      "A $3,000 balance at 20% with $150 paid a month takes about 25 months and costs about $680 in interest. Paying $200 a month finishes in about 17 months and cuts interest to about $480.",
    you: "Pay the card in full from your first paychecks. If you have a balance now, put it ahead of any extra investing.",
    demo: "debt",
  },
  {
    id: "credit-score",
    group: "Debt and credit",
    title: "Build a strong credit score",
    summary: "Pay the full statement on time, and use under 30% of your limit.",
    plain:
      "In Canada your credit score runs from 300 to 900. Lenders use it to decide if they lend to you and at what rate. The big factors are paying on time, how much of your limit you use, how long your accounts have been open, and how often you apply for new credit.",
    why: "A good score lowers the interest rate on your car loan and mortgage. A difference of one percentage point of interest on a mortgage is thousands of dollars.",
    example:
      "A card with a $3,000 limit and a $600 balance is 20% used, which is healthy. A $2,400 balance is 80% used, which hurts the score even if you pay on time.",
    you: "Credit history from your home country does not carry over, so your file is young. Use one card for small regular purchases, pay it in full, and avoid applying for many cards. Check your score for free with Equifax or TransUnion.",
    demo: "credit",
  },
  {
    id: "tax-accounts",
    group: "Grow your money",
    title: "Use the TFSA, RRSP and FHSA",
    summary: "Registered accounts let your money grow with less or no tax.",
    plain:
      "A TFSA grows tax-free and you can withdraw any time. An RRSP gives a tax refund now, and you pay tax when you withdraw in retirement. An FHSA is for a first home: it gives a refund when you put money in, and withdrawing it to buy your first home is tax-free. These are account types, not investments. Inside each one you still choose what to hold.",
    why: "Legal tax savings are the easiest return there is. A $5,000 RRSP or FHSA contribution can bring back about $1,800 at your tax rate.",
    example:
      "You put $8,000 into an FHSA. At a combined tax rate of about 36%, your refund is about $2,900, and the money can grow tax-free toward a home.",
    you: "At your salary the combined marginal tax rate is roughly 36%, so refunds are worth chasing. For 2026 the TFSA limit is $7,000, the FHSA limit is $8,000 a year ($40,000 for life), and the RRSP limit is 18% of last year's earned income up to $33,810. Your room depends on when you became a tax resident, so confirm it in CRA My Account.",
    demo: "accounts",
  },
  {
    id: "compound-interest",
    group: "Grow your money",
    title: "Start early: compound growth",
    summary: "Growth earns growth, so time matters more than the amount.",
    plain:
      "Compound growth means your earnings start earning too. In the early years it looks slow. In the later years it does most of the work. The most powerful ingredient is time, so starting sooner beats saving more later.",
    why: "Waiting even five years can cost you tens of thousands of dollars at the end, for the same monthly amount.",
    example:
      "Saving $500 a month for 25 years at 6% grows to about $346,000. You paid in $150,000, and growth added about $196,000. Starting 5 years later ends near $231,000.",
    you: "You are starting at the right moment, with a full-time salary. Automating the deposit is more important than finding the perfect investment.",
    demo: "compound",
  },
  {
    id: "rule-of-72",
    group: "Grow your money",
    title: "The Rule of 72",
    summary: "Divide 72 by the yearly return to see how many years it takes to double.",
    plain:
      "A quick mental shortcut. Divide 72 by the annual return in percent. The answer is roughly how many years it takes your money to double.",
    why: "It helps you compare options in seconds, and it works against you too: debt at 20% doubles in about 3.6 years.",
    example:
      "At 6% a year, 72 / 6 = 12 years to double. At 2% (a plain savings account) it is 36 years. At 9% it is 8 years.",
    you: "Use it to sanity check any promise. If something claims 25% a year, it would double your money every 3 years. That is a warning sign, not a bargain.",
    demo: "rule72",
  },
  {
    id: "low-fees",
    group: "Grow your money",
    title: "Watch the fees",
    summary: "A 2% fee sounds small but can eat a quarter of your final money.",
    plain:
      "Funds charge a yearly fee, shown as the MER (management expense ratio). Many bank mutual funds charge about 2% a year. Broad index ETFs often charge 0.2% or less. The fee comes out of your return every single year, and it compounds just like growth does.",
    why: "You cannot control the market, but you can control fees. Lower fees mean more of the return stays with you.",
    example:
      "$500 a month for 25 years at a 6% gross return: with a 0.2% fee you end near $336,000. With a 2.2% fee you end near $250,000. That is about $86,000 lost to fees.",
    you: "Before you buy any fund, find its MER. For long-term money, low-cost index ETFs or index funds are a common starting point. Ask any advisor how they get paid.",
    demo: "fees",
  },
  {
    id: "millionaire-math",
    group: "Grow your money",
    title: "The millionaire math",
    summary: "See the monthly amount that grows into $1,000,000, and why time wins.",
    plain:
      "Becoming a millionaire is mostly arithmetic: how much you save each month, for how many years, at what return. Returns are not guaranteed, so treat the answer as a planning estimate and use a cautious return.",
    why: "It turns a vague dream into a monthly number you can act on, and it shows how much each extra year of time is worth.",
    example:
      "At 6% a year, reaching $1,000,000 takes about $2,160 a month over 20 years, but only about $1,000 a month over 30 years.",
    you: "Try different timelines in the calculator. Raising your savings with each pay raise is how most people close the gap.",
    demo: "million",
  },
  {
    id: "car-20-4-10",
    group: "Big purchases",
    title: "The 20/4/10 car rule",
    summary: "20% down, a loan of 4 years or less, all car costs under 10% of gross pay.",
    plain:
      "Put 20% down. Finance for no more than 4 years. Keep your total monthly car cost (loan, insurance, gas) under 10% of your gross monthly income. Cars lose value fast, so you do not want to owe more than the car is worth.",
    why: "A short loan with a big down payment saves interest, protects you from owing more than the car is worth, and leaves room to keep saving.",
    example:
      "A $30,000 car with $6,000 down and a 4-year loan at 7.5% costs about $580 a month. Add $250 for insurance and gas and you are at about $830, just over 10% of $7,917 gross income.",
    you: "Use the Goals page for your own numbers. A cheaper or used car, or a larger down payment, is the fastest way to pass the 10% test.",
    demo: "car",
  },
  {
    id: "home-rules",
    group: "Big purchases",
    title: "Home buying rules of thumb",
    summary: "Aim for 20% down and keep housing costs near 30% of gross income.",
    plain:
      "In Canada the minimum down payment is 5% on the first $500,000 of the price and 10% on the part from $500,000 to $1.5 million. With less than 20% down you must buy mortgage default insurance, which adds to the cost. Banks also test that you could still pay at a higher rate. A common guide is to keep total housing costs (mortgage, property tax, heat) near 30% of gross income, and lenders cap it at about 39%.",
    why: "A bigger down payment means a smaller mortgage and less interest. Knowing the limits early tells you how long you need to save before you shop.",
    example:
      "A $450,000 home with 20% down ($90,000) borrows $360,000. At 5% over 25 years that is about $2,100 a month. Add $450 for tax and heat and you need roughly $78,600 a year in income at the 39% cap.",
    you: "The FHSA is built for this: the contribution is tax deductible and the home withdrawal is tax-free. Rates and rules change, so check current rates and your lender's rules.",
    demo: "home",
  },
  {
    id: "lifestyle-creep",
    group: "Habits and paperwork",
    title: "Avoid lifestyle creep",
    summary: "When your pay goes up, save at least half of the raise.",
    plain:
      "Lifestyle creep is when spending rises every time income does, so you never get ahead. A simple fix is to split every raise: part goes to a better life now, and at least half goes to savings.",
    why: "Your expenses become your new normal. Keeping them steady while pay rises is the fastest way to grow savings without feeling deprived.",
    example:
      "A $400 a month raise, with half saved at 6% for 10 years, is $200 a month, which grows to about $32,800.",
    you: "You just moved from an internship to a full-time salary. Decide now what you will do with each raise, before the money arrives.",
    demo: "lifestyle",
  },
  {
    id: "file-taxes",
    group: "Habits and paperwork",
    title: "File your taxes every year",
    summary: "File by April 30, even with no income. It also matters for citizenship.",
    plain:
      "In Canada you file one return with the CRA and, in Quebec, a separate one with Revenu Québec. The deadline for most people is April 30. Filing is how you get refunds and credits, and it builds your RRSP and TFSA room records.",
    why: "Filing unlocks refunds and benefits. For citizenship you must have filed taxes for at least 3 of the 5 years before you apply, if you were required to. Missing years can delay you.",
    example:
      "Say you filed for 2023 and 2024 and plan to apply soon. That is 2 of the 3 filings you need, so also filing for 2025 puts you at 3 of the last 5.",
    you: "Keep every tax slip (T4, T2202 for tuition, RRSP receipts) and file on time every year. Tuition credits you earned can lower your tax.",
    demo: "taxes",
  },
];

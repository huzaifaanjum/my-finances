// Units nine to twelve: homes, protection, retirement and the plan that ties it together.

import type { Lesson } from "./lessons";

export const BUILD_LESSONS: Lesson[] = [
  // homes and big purchases
  {
    id: "edu-rent-or-buy",
    unit: "home",
    title: "Rent or buy?",
    idea: "A home is a lifestyle choice first and an investment second.",
    explain:
      "Owners don't pay rent, but they do have lost costs: property tax, upkeep, insurance and interest, plus the return the down payment could have earned. Renters keep flexibility and can invest the difference. Buying tends to win if you stay a long time, and it forces you to save. Renting tends to win if you may move, or if prices are high compared with rents.",
    example: "On a $450,000 home, the lost costs are about $22,500 a year, or $1,875 a month. Compare that with renting a similar place, not with your mortgage payment.",
    remember: "Compare lost costs with rent, and only then decide.",
    demo: "rentBuy",
    rule: { id: "rent-vs-buy", label: "Renting isn't throwing money away" },
  },
  {
    id: "edu-mortgage",
    unit: "home",
    title: "Mortgages in plain words",
    idea: "Term, amortization, rate type and down payment are the four dials.",
    explain:
      "Amortization is the total payoff time, usually 25 years. The term is how long your rate lasts, usually 5 years, after which you renew. A fixed rate gives certainty, and a variable rate moves with the market. Under 20% down you pay for default insurance. You must also pass a stress test, proving that you could pay the higher of 5.25% or your rate plus 2%.",
    example: "$360,000 at 5%: over 25 years the payment is about $2,105 and total interest about $271,000. Over 30 years it is about $1,933 and $336,000.",
    remember: "Longer amortization means a lower payment, but a much higher total cost.",
    demo: "loanSplit",
    rule: { id: "mortgage-basics", label: "How a mortgage really works" },
  },
  {
    id: "edu-true-home-cost",
    unit: "home",
    title: "The true cost of a home",
    idea: "The price is only the start.",
    explain:
      "On top of the down payment, plan for closing costs of about 3%: welcome tax, notary, inspection and moving. Then the yearly costs: property and school tax, insurance, heating, repairs and condo fees. A common guide is to budget 1% of the home's value for upkeep each year. Selling later costs about 5% in agent fees and other expenses.",
    example: "On a $450,000 home: $90,000 down, about $13,500 in closing costs, and about $4,500 a year in upkeep. You need over $100,000 in cash just to get the keys.",
    remember: "Save for the down payment, the closing costs and a repair fund.",
    rule: { id: "home-rules", label: "Home buying rules of thumb" },
  },
  {
    id: "edu-buy-home-accounts",
    unit: "home",
    title: "Saving for a first home",
    idea: "The FHSA is the best account in Canada for this goal.",
    explain:
      "FHSA contributions are deductible, and withdrawals for a first home are tax-free. You can add $8,000 a year, up to $40,000. The RRSP Home Buyers' Plan lets you borrow up to $60,000 more, repaid over 15 years. Keep this money safe as your date gets closer: a market fall the year you buy can delay your plans for years.",
    example: "$8,000 a year for 5 years is $40,000 in, and about $14,400 back in tax refunds at a 36% rate.",
    remember: "Use the tax breaks, and keep the money safe if you will need it within three years.",
    rule: { id: "home-buyers-plan", label: "The FHSA plus the Home Buyers' Plan" },
  },
  {
    id: "edu-cars",
    unit: "home",
    title: "Cars: the wealth leak",
    idea: "A car is a cost, not an asset. Keep it modest.",
    explain:
      "New cars can lose around half their value in five years. On top of that come interest, insurance, gas, repairs and parking. Together, that can be the second-biggest cost in a budget. Buying a reliable car a few years old lets the first owner pay for the steepest drop in value. Paying with long loans just hides the cost.",
    example: "A $45,000 new car falling 15% a year is worth about $20,000 after five years. That is $5,000 a year in lost value before you buy any gas.",
    remember: "Buy used, pay it off quickly, then keep driving it.",
    demo: "car",
    rule: { id: "car-20-4-10", label: "The 20/4/10 car rule" },
  },

  // protecting
  {
    id: "edu-emergency-fund",
    unit: "protect",
    title: "The emergency fund",
    idea: "Cash that stops a bad month from becoming a bad decade.",
    explain:
      "Without a cushion, a surprise goes on a card at 20%, or forces you to sell investments at a bad time. Keep 3 to 6 months of basic costs in a high-interest savings account. It earns little, but it isn't there to earn. It is insurance that lets everything else stay invested.",
    example: "Basic costs of $2,600 a month call for $7,800 to $15,600. At $500 a month, the low end takes about 16 months.",
    remember: "Build this before you invest anything else beyond your pension match.",
    you: "While your immigration status is temporary, lean toward 6 months.",
    demo: "emergency",
    rule: { id: "emergency-fund", label: "Build an emergency fund" },
  },
  {
    id: "edu-how-insurance-works",
    unit: "protect",
    title: "How insurance really works",
    idea: "You pay a small sure cost to avoid a huge possible loss.",
    explain:
      "Many people pool their premiums, and the few who suffer a loss get paid. Since the insurer has costs and profits, you get back less on average. That's fine: you aren't buying a good bet, you are buying survival. So insure what would ruin you, and carry the small risks yourself. The deductible is your share of a claim, and raising it lowers your premium.",
    example: "Tenant insurance at $300 a year covers a $25,000 flood claim. A phone warranty at $150 protects a $900 phone you could replace yourself.",
    remember: "Insure disasters, not inconveniences.",
    rule: { id: "insure-big-risks", label: "Insure disasters, not inconveniences" },
  },
  {
    id: "edu-what-to-insure",
    unit: "protect",
    title: "The insurance that matters",
    idea: "Protect your income first, and then anyone who depends on you.",
    explain:
      "Disability insurance protects your income, which is your biggest asset. Life insurance matters once someone depends on your income. Tenant or home insurance covers your things and your liability. Car insurance is required and needs strong liability limits. Travel medical matters any time you leave your province. Term life is usually better value than whole life for most people.",
    example: "60% of a $7,917 monthly salary is about $4,750 a month from long-term disability, and it is generally tax-free if you pay the premiums yourself.",
    remember: "Start with disability, then liability, then life if people depend on you.",
    rule: { id: "disability-cover", label: "Disability insurance" },
  },
  {
    id: "edu-concentration",
    unit: "protect",
    title: "Don't tie everything to one thing",
    idea: "Your job and your investments shouldn't fail together.",
    explain:
      "If your employer struggles, you could lose your job and your bonus at the same time. If your savings are also in its shares, one event hits you twice. The same goes for your city's housing market or your home country's currency. Keep your long-term money broad and global.",
    example: "Airlines are hit hard in recessions and were nearly shut down in 2020. Pay, perks and ESOP shares can all fall at once.",
    remember: "Hold your savings in things unconnected to your paycheque.",
    you: "Keep any Air Canada ESOP to a small slice of your wealth.",
    rule: { id: "diversify", label: "Don't put all your eggs in one basket" },
  },
  {
    id: "edu-scams",
    unit: "protect",
    title: "Scams and fraud",
    idea: "Urgency, secrecy and guaranteed returns are the warning signs.",
    explain:
      "Fraudsters copy banks, the CRA and investment apps. They rush you, ask for gift cards, crypto or wire transfers, and tell you to keep it quiet. Protect yourself with unique passwords, two-factor login and alerts on your accounts. Check anyone selling investments with the AMF or at aretheyregistered.ca.",
    example: "3% a month guaranteed sounds modest, but it doubles every two years. Nothing legal can promise that.",
    remember: "Slow down. Real institutions don't mind if you hang up and call back.",
    rule: { id: "avoid-scams", label: "Spot a money scam" },
  },
  {
    id: "edu-estate",
    unit: "protect",
    title: "Wills and beneficiaries",
    idea: "Decide now who gets what and who decides for you.",
    explain:
      "A will directs what you own. Beneficiaries on insurance and pensions pass outside the will, so keep them current. In Quebec, a protection mandate names who acts for you if you can't. These aren't only for older people: anyone with savings, a pension or a partner needs them.",
    example: "If you named someone as beneficiary years ago and never updated it, that person may still receive the money, regardless of your will.",
    remember: "Beneficiaries take five minutes. Do those today.",
    rule: { id: "will-mandate", label: "Make a will and a protection mandate" },
  },

  // retirement and freedom
  {
    id: "edu-your-number",
    unit: "freedom",
    title: "Your number",
    idea: "You need about 25 times what you spend in a year.",
    explain:
      "Financial independence means your investments can cover your spending. Studies of past markets found that withdrawing about 4% in the first year, then raising it with inflation, has usually lasted 30 years. Flip that around, and you get 25 times your yearly spending. Government pensions reduce how much you need, because they cover part of the bill.",
    example: "$48,000 a year of spending calls for $1.2 million. If QPP and OAS cover $20,000 of it, you need $28,000 × 25, or $700,000.",
    remember: "Lower spending shrinks your number faster than anything else.",
    demo: "fourPercent",
    rule: { id: "four-percent", label: "The 4% rule" },
  },
  {
    id: "edu-three-pillars",
    unit: "freedom",
    title: "The three pillars of retirement income",
    idea: "Government pensions, workplace pensions and your own savings.",
    explain:
      "Pillar one is the government: QPP based on your contributions, OAS based on years lived in Canada, and GIS for people with low income. Pillar two is your workplace pension. Pillar three is your personal RRSP, TFSA and other savings. Together they replace your paycheque. Few people can rely on only one.",
    example: "QPP's 2026 maximum at 65 is $1,508 a month, though most people get less. Full OAS is a bit over $700 a month, and it needs 40 years of residence after 18.",
    remember: "Know what each pillar will pay, so you know how much you need to build.",
    you: "Your 12% DC pension is a strong second pillar. OAS may be partial if you arrived as an adult.",
    demo: "qppAge",
    rule: { id: "qpp-oas", label: "QPP and OAS" },
  },
  {
    id: "edu-dc-vs-db",
    unit: "freedom",
    title: "DC and DB pensions",
    idea: "One promises a pot of money. The other promises an income.",
    explain:
      "A defined-benefit pension pays a set income for life, and the employer takes the investment risk. A defined-contribution pension is an account: you and your employer pay in, you choose the funds, and you take the risk. With a DC pension, your fund choice and fees really matter, so don't just leave it on the default.",
    example: "On $95,000, 6% from you and 6% from Air Canada is $11,400 a year going in. At 5% a year for 36 years, with raises, that could be about $1.6 million.",
    remember: "With a DC pension you are the investment manager. Pick low-fee funds.",
    rule: { id: "dc-pension-match", label: "How the match works" },
  },
  {
    id: "edu-retirement-withdrawals",
    unit: "freedom",
    title: "Spending your savings",
    idea: "Saving is half the job. Withdrawing wisely is the other half.",
    explain:
      "An RRSP must become a RRIF by the end of the year you turn 71, and a RRIF requires a minimum withdrawal each year, taxed as income. TFSA withdrawals aren't income, so they don't touch OAS or GIS. Having money in both kinds of account lets you choose your taxable income each year. That is called tax diversification.",
    example: "If you need $60,000, you might take $45,000 from a RRIF and $15,000 from a TFSA, keeping your taxable income lower.",
    remember: "Building both taxable and tax-free pots gives you choices later.",
    rule: { id: "oas-clawback", label: "The OAS clawback" },
  },
  {
    id: "edu-sequence-risk",
    unit: "freedom",
    title: "Sequence risk",
    idea: "A crash just before retirement hurts far more than one early in your career.",
    explain:
      "While you save, falling prices help you buy cheaply. Once you withdraw, you are forced to sell at low prices, and that money never recovers. So the order of returns matters in the years around retirement. That's why people shift toward bonds and hold a year or two of cash as they get close. Target-date funds do this for you.",
    example: "A 30% fall on $20,000 at age 30 is $6,000 lost, and your salary replaces it. On $1,000,000 at 65, it is $300,000, just when your salary stops.",
    remember: "Risk comes down as retirement gets closer, not before.",
  },
  {
    id: "edu-freedom",
    unit: "freedom",
    title: "What money is really for",
    idea: "The highest return from money is control over your time.",
    explain:
      "Past a comfortable level, more spending adds little happiness. What money reliably buys is options: to leave a bad job, take a break, care for family, or work on what matters to you. So you don't need to reach your full number to feel the benefit. Six months of savings already gives you more freedom than a new car does.",
    example: "$20,000 in savings means you can turn down a bad job. A $20,000 car upgrade means you need the job more than before.",
    remember: "Enough is a number worth defining. Build toward freedom, not toward more.",
  },

  // putting it together
  {
    id: "edu-order-of-operations",
    unit: "plan",
    title: "The order of operations",
    idea: "Do things in the right order, and each dollar works hardest.",
    explain:
      "1. Budget, so that cash flow is positive. 2. Take the full employer match. 3. Pay off high-interest debt. 4. Build your emergency fund. 5. Fill your FHSA if you plan to buy a home. 6. Fill your TFSA. 7. Use your RRSP, especially at higher tax rates. 8. Then use a taxable account and pay down lower-interest debt.",
    example: "$1,000 to spare: if you have a 20% card balance, it goes there. If not, and your emergency fund is full, it goes to the FHSA, and about $360 comes back in tax.",
    remember: "Match first, costly debt next, safety net next, then tax shelters.",
    you: "Your Action plan shows this ladder with your own numbers.",
  },
  {
    id: "edu-buckets",
    unit: "plan",
    title: "Match money to its time",
    idea: "Each goal has a date, and the date decides where the money goes.",
    explain:
      "Think of three buckets. Now, for under 3 years: emergency fund and short-term goals, in savings and GICs. Soon, for 3 to 7 years: a car or a home, in a mix that gets safer with time. Later, for 7 years or more: retirement and freedom, mostly in stocks. Most costly mistakes come from having the wrong money in the wrong bucket.",
    example: "A trip next year goes in savings. A down payment in five years is a mix. Money for age 65 is mostly stocks.",
    remember: "Ask when you need it. That answers where it goes.",
    rule: { id: "short-term-money", label: "Money you need soon" },
  },
  {
    id: "edu-by-decade",
    unit: "plan",
    title: "What to focus on by age",
    idea: "The job changes as you get older.",
    explain:
      "In your 20s: build skills, clear costly debt, start the habit, and capture every match. In your 30s: raise income and savings rate, buy a home if it makes sense, and insure dependants. In your 40s and 50s: peak earning, pay down the mortgage, and fill every account. In your 60s: reduce risk, plan withdrawals, and decide when to start pensions.",
    example: "Saving 15 to 20% of pay from your late twenties puts most people comfortably on track, with far less strain than starting at 45.",
    remember: "In your twenties and thirties, habits and income matter most.",
    you: "You are 29 with a good salary. This is the decade where habits pay off the most.",
  },
  {
    id: "edu-common-mistakes",
    unit: "plan",
    title: "The ten costliest mistakes",
    idea: "Avoiding big errors beats finding brilliant ideas.",
    explain:
      "1. Starting late. 2. Carrying card debt. 3. Skipping an employer match. 4. Buying too much car or house. 5. Paying high fund fees. 6. Selling in a crash. 7. Chasing hot tips. 8. Having no emergency fund. 9. Letting spending rise with every raise. 10. Having no disability insurance.",
    example: "Starting ten years late, or paying 2% more in fees, can each cost hundreds of thousands of dollars. Neither takes any bad luck.",
    remember: "Wealth is mostly the absence of big mistakes.",
  },
  {
    id: "edu-money-routine",
    unit: "plan",
    title: "A simple money routine",
    idea: "Ten minutes a month and one hour a year are enough.",
    explain:
      "Monthly: check that the automatic transfers ran, look over your spending, and confirm the card is paid. Quarterly: update your net worth. Yearly: review your budget, room, insurance, beneficiaries and fees, rebalance, raise your savings, and file your taxes on time. Otherwise, leave your investments alone.",
    example: "Raising your savings by 1% of pay each year takes you from 20% to 30% in a decade, and you barely notice.",
    remember: "Simple and repeated beats clever and occasional.",
    rule: { id: "yearly-money-review", label: "Do a one-hour money review" },
  },
];

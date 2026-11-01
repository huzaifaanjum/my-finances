// Units one to six: the big picture, earning, keeping, compounding, debt and tax.

import type { Lesson } from "./lessons";

export const CORE_LESSONS: Lesson[] = [
  // how wealth is built
  {
    id: "edu-what-money-is",
    unit: "big-picture",
    title: "What money really is",
    idea: "Money is stored work. You can spend it now or send it out to work for you.",
    explain:
      "You trade your time for pay. Pay is a claim on other people's goods and work, and you can use it today or save it for later. When you spend, the claim is used up. When you invest, your money works in a business, and that business pays you for its use. So every dollar has two possible jobs: buy something now, or earn more dollars later.",
    example: "$100 spent on dinner is gone by morning. $100 invested at 6% is about $574 in 30 years. Both can be good choices, but they are different choices.",
    remember: "Every dollar is either consumed or put to work. Wealth comes from the ones put to work.",
  },
  {
    id: "edu-wealth-formula",
    unit: "big-picture",
    title: "The wealth formula",
    idea: "Wealth = the gap between earning and spending × your return × time.",
    explain:
      "Almost everything in personal finance comes down to three levers. The gap is what you earn minus what you spend. The return is how fast your saved money grows. Time is how long it has to grow. Because they multiply, a weak lever holds back the others: a great return on nothing is still nothing. Early in your career, the gap matters most. Later, return and time take over.",
    example: "Saving $1,000 a month at 6%: 10 years gives about $164,000, 20 years about $462,000, and 30 years about $1 million. The monthly amount never changed. Only time did.",
    remember: "Grow the gap, invest it sensibly, and leave it alone for a long time.",
    you: "You have a strong income and 36 years until 65, so two of the three levers are already in your hands.",
    demo: "million",
  },
  {
    id: "edu-net-worth",
    unit: "big-picture",
    title: "Net worth: your real score",
    idea: "What you own minus what you owe. That is how wealth is measured.",
    explain:
      "Salary measures what flows in. Net worth measures what you have kept. Someone earning $200,000 and spending all of it is not building wealth. Someone earning $70,000 and investing steadily is. Track net worth, not income, and you will start making better decisions by yourself.",
    example: "Own $40,000 in savings and pension, owe $5,000 on a card: your net worth is $35,000. Buy a $3,000 sofa with savings and your net worth falls by about $3,000, since a used sofa is worth little.",
    remember: "Rich is what you spend. Wealthy is what you keep.",
    demo: "netWorth",
    rule: { id: "net-worth", label: "Track your net worth" },
  },
  {
    id: "edu-assets-liabilities",
    unit: "big-picture",
    title: "Assets and liabilities",
    idea: "Assets tend to put money in your pocket. Liabilities take it out.",
    explain:
      "An asset is something you own with value, and the best ones grow or pay you: stocks, bonds, a pension, a rental property. A liability is something you owe: cards, loans, a mortgage. Some things are both, like a home with a mortgage. Some things you own feel like assets but behave like costs. A car loses value every year while it costs you gas, insurance and repairs.",
    example: "A $600 monthly car payment for 10 years buys a car worth little at the end. $600 a month invested at 6% for 10 years grows to about $98,000. Few things show the difference better.",
    remember: "Before a big purchase, ask if it will pay you or cost you every year you own it.",
  },
  {
    id: "edu-ways-money-grows",
    unit: "big-picture",
    title: "The three ways money makes money",
    idea: "You can lend it, own something with it, or build something with it.",
    explain:
      "Lending means earning interest: savings accounts, GICs and bonds. It is safer, but growth is modest. Owning means buying part of something that earns money: stocks, property. It is bumpier, but it has the higher long-run return, because owners get what is left after everyone else is paid. Building means starting a business or a side project, which has the highest risk and the highest potential.",
    example: "Over long periods, cash has roughly kept up with inflation, bonds have done a little better, and stocks have beaten inflation by about 4 to 6% a year.",
    remember: "Lenders get paid first and a fixed amount. Owners get paid last, but they keep the upside.",
  },
  {
    id: "edu-opportunity-cost",
    unit: "big-picture",
    title: "Opportunity cost",
    idea: "The true cost of anything is what you give up to have it.",
    explain:
      "Each dollar can only do one job. Choosing one thing means not choosing another, and that hidden price is the opportunity cost. It doesn't mean you should never spend. It means asking what else the money could do, then choosing on purpose. It also applies to your time: an hour of comparison shopping to save $3 is a poor trade.",
    example: "A $2,000 vacation at age 29, invested instead at 6%, would be about $16,000 at 65. The trip may still be worth it, but now you know its real price and can decide knowingly.",
    remember: "Don't ask if you can afford it. Ask what you are giving up for it.",
  },
  {
    id: "edu-time-value",
    unit: "big-picture",
    title: "The time value of money",
    idea: "A dollar today is worth more than a dollar next year.",
    explain:
      "A dollar you hold today can be invested and become more than a dollar. Prices also rise over time, so a future dollar buys less. That is why lenders charge interest, why investors want a return, and why getting paid sooner is better than getting paid later. The discount rate is simply the return you could have earned elsewhere.",
    example: "If you can earn 5%, then $1,000 a year from now is worth about $952 to you today. $1,000 in ten years is worth only about $614 today.",
    remember: "Money has a time stamp. Compare amounts at the same point in time.",
  },

  // earning
  {
    id: "edu-human-capital",
    unit: "earn",
    title: "You are your biggest asset",
    idea: "Your future earnings are worth more than anything you own today.",
    explain:
      "Economists call this human capital: the value of all your future paycheques. Early in life it dwarfs your savings. So your most valuable investments may be skills, health and career moves rather than stocks. Over time, the job is to slowly convert human capital, which runs out, into financial capital, which keeps working after you stop.",
    example: "$95,000 a year for 36 years is about $3.4 million before any raises. A 10% raise from new skills adds about $340,000 over that span. Few investments can match that.",
    remember: "In your twenties and thirties, investing in yourself often pays the highest return.",
    you: "This is also why your disability insurance matters so much: it protects this asset.",
    rule: { id: "disability-cover", label: "Disability insurance" },
  },
  {
    id: "edu-grow-income",
    unit: "earn",
    title: "Raising your income",
    idea: "There is a floor on spending, but no ceiling on earning.",
    explain:
      "You can only cut so much. Income has much more room to grow. The biggest jumps usually come from changing jobs, building scarce skills, or moving into work that has more impact on revenue. Negotiate at each offer and each review, because every future raise and pension contribution builds on your base. Ask in gross, plan in net.",
    example: "Negotiating $5,000 more at age 29 and saving it after tax, about $250 a month, for 36 years at 6% grows to about $381,000. One awkward conversation can be worth that.",
    remember: "One good negotiation can beat years of cutting small expenses.",
    rule: { id: "raise-math", label: "What a raise is really worth" },
  },
  {
    id: "edu-total-compensation",
    unit: "earn",
    title: "Total compensation",
    idea: "A job pays far more than its salary.",
    explain:
      "Compare jobs on the whole package: salary, bonus, pension match, health and dental, insurance, paid time off and perks. A pension match is pay you only receive if you contribute. Bonuses that are not guaranteed deserve a discount, and benefits only count if you would otherwise buy them.",
    example: "$95,000 plus a 6% match ($5,700) and an 8% target bonus ($7,600) is about $108,000 before you count benefits, so a $105,000 job with no match or bonus pays less.",
    remember: "Never leave a match unclaimed. It is an instant 100% return.",
    rule: { id: "dc-pension-match", label: "How the match works" },
  },
  {
    id: "edu-income-types",
    unit: "earn",
    title: "Active and passive income",
    idea: "Active income needs your time. Passive income needs your capital.",
    explain:
      "Salary stops when you stop. Interest, dividends and rent keep arriving. Most people build wealth the same way: use active income to buy assets until the assets pay the bills. A side income can speed this up, but the pitch of easy passive income online is mostly a way to sell you something. Real passive income usually takes years of savings or work upfront.",
    example: "$1,000,000 in a portfolio paying 3% in dividends gives $30,000 a year without you lifting a finger. Getting that $1,000,000 takes decades of active income.",
    remember: "Passive income is earned in advance. There is no shortcut.",
  },
  {
    id: "edu-side-income",
    unit: "earn",
    title: "Side income and tax",
    idea: "Self-employed income is taxable, and nobody withholds tax for you.",
    explain:
      "Freelance or side-business income goes on your return, and you can deduct real business costs. No tax comes off when you are paid, so set aside money yourself. You also pay both the employee and employer share of QPP on that profit. Registration for GST and QST becomes mandatory once you pass $30,000 in sales over four quarters.",
    example: "$10,000 of side profit at your marginal rate of about 36% costs about $3,600 in income tax, plus QPP. Move about 40% of each payment into a separate account.",
    remember: "Save for the tax the day you are paid. It isn't your money.",
    you: "Check that your work permit allows it first. Some permits limit who you can work for.",
  },

  // keeping
  {
    id: "edu-cash-flow",
    unit: "keep",
    title: "Cash flow: the fuel",
    idea: "Money in minus money out. It must be positive.",
    explain:
      "Cash flow is where wealth starts. If more goes out than comes in, debt grows no matter how high your income is. If more comes in, you have fuel to save, invest and pay down debt. Before any strategy, know these numbers: what lands in your account each month, what leaves it, and what is left.",
    example: "$4,700 comes in, $3,700 goes out: $1,000 of positive cash flow, or $12,000 a year to build with.",
    remember: "You can't invest what you didn't keep. Learn your monthly number first.",
    rule: { id: "budget-50-30-20", label: "The 50/30/20 budget" },
  },
  {
    id: "edu-fixed-variable",
    unit: "keep",
    title: "Fixed and variable costs",
    idea: "Fixed costs decide how much freedom you have.",
    explain:
      "Fixed costs repeat whatever you do: rent, insurance, phone, loan payments. Variable costs change with your choices: food, fun, shopping. A high fixed cost locks in every future month, so it deserves far more thought than a one-time purchase. Low fixed costs give you room to take a better job, survive a layoff or take a risk.",
    example: "Cutting rent by $300 saves $3,600 every year with no further effort. Skipping $5 lattes saves much less, and you notice it every morning.",
    remember: "Keep fixed costs low and you buy yourself options.",
  },
  {
    id: "edu-big-three",
    unit: "keep",
    title: "Win on the big three",
    idea: "Housing, transport and food are most of your spending.",
    explain:
      "Most budgets are decided by a few big choices, not hundreds of small ones. Get housing, transport and food right and the rest barely matters. One good housing or car decision can be worth more than a lifetime of coupon clipping.",
    example: "Buying a $20,000 used car instead of a $45,000 new one keeps $25,000 working for you, plus lower insurance and interest. At 6% over 30 years, that $25,000 alone becomes about $144,000.",
    remember: "Focus on the few big decisions. Relax about the small ones.",
    rule: { id: "car-20-4-10", label: "The 20/4/10 car rule" },
  },
  {
    id: "edu-savings-rate",
    unit: "keep",
    title: "The savings rate",
    idea: "The share of your income you keep is the master number.",
    explain:
      "Your savings rate does two jobs. It sets how much you invest, and it shows how little you need to live on. A higher rate shortens the road from both ends. It matters more than your return in the early years, because a small balance growing fast is still small.",
    example: "On a $10,000 balance, a great 10% year adds $1,000. Raising your savings by $200 a month adds $2,400, with no risk at all.",
    remember: "Early on, how much you save beats how well you invest.",
    demo: "savingsFi",
    rule: { id: "savings-rate-freedom", label: "Your savings rate sets your finish line" },
  },
  {
    id: "edu-automate",
    unit: "keep",
    title: "Systems beat willpower",
    idea: "Set it up once, so good decisions happen by themselves.",
    explain:
      "Willpower runs out, but systems don't. Send money to savings on payday, have investments buy automatically and pay bills by autopay. Keep separate accounts for separate goals, so the balance tells you what you can spend. What remains in chequing is yours to enjoy, guilt-free.",
    example: "$936 moved automatically every payday is $11,232 a year, and you never have to decide anything.",
    remember: "Make saving the default and spending the thing you have to choose.",
    rule: { id: "pay-first", label: "Pay yourself first" },
  },
  {
    id: "edu-lifestyle-creep",
    unit: "keep",
    title: "Lifestyle creep",
    idea: "People adapt to any level of comfort, so more spending doesn't last as a reward.",
    explain:
      "A nicer place feels great for a few months, then it just feels normal. This is called hedonic adaptation. Each upgrade also raises your fixed costs and the amount you would need to retire. Studies of happiness suggest money helps most when it buys security, time and experiences with people, not more stuff.",
    example: "A $500 raise spent on a bigger car payment disappears. Half of it saved at 6% for 20 years is about $116,000, and you still get to spend the other half.",
    remember: "Raise your savings first whenever your pay rises.",
    rule: { id: "lifestyle-creep", label: "Avoid lifestyle creep" },
  },

  // compounding
  {
    id: "edu-simple-compound",
    unit: "compound",
    title: "Simple and compound interest",
    idea: "Simple interest grows in a line. Compound interest grows in a curve.",
    explain:
      "Simple interest is paid only on your original money. Compound interest is paid on the money plus all the interest so far, so each year's growth is bigger than the last. It looks unimpressive at first, then the curve bends upward. Most of the growth arrives at the end, which is why quitting early is so costly.",
    example: "$10,000 at 6% for 30 years. Simple interest: $28,000. Compound: about $57,400. Same money, same rate, and more than twice the result.",
    remember: "Growth on growth. It is slow, then sudden.",
    demo: "compound",
    rule: { id: "compound-interest", label: "Start early" },
  },
  {
    id: "edu-time-beats-amount",
    unit: "compound",
    title: "Why starting early wins",
    idea: "Ten extra years can be worth more than a lot of extra money.",
    explain:
      "In compounding, time is an exponent: it multiplies the result instead of just adding to it. The early dollars are the most valuable because they compound for the longest. This is why saving a small amount now can beat saving a lot more later.",
    example: "$300 a month at 6% until 65: starting at 29 gives about $457,000. Starting at 39 gives about $224,000. Ten years more saving, $36,000 more paid in, and about twice the money at the end.",
    remember: "The best time to start was earlier. The second best is this month.",
    you: "You are 29. Each year you stay invested now is one of the most valuable you will have.",
  },
  {
    id: "edu-rule-72",
    unit: "compound",
    title: "Doubling and the Rule of 72",
    idea: "72 divided by the return tells you how long it takes to double.",
    explain:
      "It takes a few seconds and works on anything that compounds, including prices and debt. Just remember that the doubling keeps going: one doubling turns $100,000 into $200,000, the next adds $200,000 for the same amount of time, and the next adds $400,000.",
    example: "At 6% money doubles in 12 years, so $100,000 at 29 becomes $200,000 at 41, $400,000 at 53, and $800,000 at 65.",
    remember: "Count doublings, not years.",
    demo: "rule72",
    rule: { id: "rule-of-72", label: "The Rule of 72" },
  },
  {
    id: "edu-inflation",
    unit: "compound",
    title: "Inflation: the silent tax",
    idea: "Prices rise, so idle money slowly shrinks.",
    explain:
      "Inflation is why $1,000 buys less each year. The Bank of Canada aims for about 2%. A low, steady rate is normal, and wages usually rise along with it. But cash under the mattress loses value for certain, which is why keeping long-term money only in cash is itself a risk.",
    example: "At 2% inflation, $1,000,000 in 36 years buys what about $490,000 buys today. At 3%, about $345,000.",
    remember: "Holding cash feels safe, but over decades it is a guaranteed slow loss.",
    demo: "inflation",
    rule: { id: "inflation", label: "Think in today's dollars" },
  },
  {
    id: "edu-real-return",
    unit: "compound",
    title: "Nominal and real returns",
    idea: "Only growth above inflation makes you richer.",
    explain:
      "The nominal return is the number on your statement. The real return is what remains after inflation, and it is what actually raises your buying power. After tax, the picture can tighten further. A savings account paying 3% with 2% inflation and 36% tax on the interest really earns close to zero.",
    example: "3% interest minus 36% tax leaves about 1.9%. With 2% inflation, your real return is about zero. The same 3% in a TFSA keeps 1% real.",
    remember: "Judge returns after inflation and after tax.",
  },
  {
    id: "edu-apr-vs-apy",
    unit: "compound",
    title: "How often it compounds matters",
    idea: "A monthly 19.99% is really about 21.9% a year.",
    explain:
      "Rates are quoted per year, but they are often charged monthly. Each month's interest is added to the balance and then charged interest itself. That makes the effective rate higher than the quoted one. The effect works for you on savings and against you on debt.",
    example: "$5,000 on a 19.99% card carried for a year, with no payments, grows by about $1,096, not $1,000.",
    remember: "On debt the real rate is usually higher than the one in the ad.",
  },

  // debt
  {
    id: "edu-good-bad-debt",
    unit: "debt",
    title: "Good debt and bad debt",
    idea: "Borrow for what grows in value, at a low rate. Avoid borrowing for what shrinks.",
    explain:
      "Debt isn't evil, it is a tool. Debt can be useful when it buys something that rises in value or raises your income, at a rate below what that thing returns: a sensible mortgage or a career-building degree. It is harmful when it pays for things that lose value or are already gone: dinners, trips and most car upgrades.",
    example: "A 5% mortgage on a home that rises 3% a year, while saving you rent, can work. A 20% card balance for a vacation means paying $1,000 a year on $5,000 for a memory you already had.",
    remember: "Ask two things: what is the rate, and what is it buying?",
  },
  {
    id: "edu-how-loans-work",
    unit: "debt",
    title: "How a loan works",
    idea: "Each payment pays the interest first. Only the rest reduces your debt.",
    explain:
      "A loan's payment stays the same, but its contents change. At first, interest takes most of it, because the balance is large. As the balance falls, more goes to principal. This is why extra payments early on are so powerful: every dollar of principal removed stops being charged interest for all the remaining years.",
    example: "$360,000 at 5% over 25 years costs about $2,105 a month. Month one: $1,500 of interest and $605 of principal. After five years you have paid about $126,000, but the balance is still about $319,000.",
    remember: "Extra payments go straight to principal, and they do the most good early.",
    demo: "loanSplit",
    rule: { id: "mortgage-basics", label: "How a mortgage really works" },
  },
  {
    id: "edu-credit-cards",
    unit: "debt",
    title: "Credit cards",
    idea: "A great free tool if you pay in full. A terrible loan if you don't.",
    explain:
      "If you pay the full statement by the due date, you pay no interest, and you borrow free for a few weeks. Miss that, and interest is charged at around 20% on your balance. New purchases also stop getting the grace period until the whole balance is cleared. Cards are built to profit from people who carry balances.",
    example: "$3,000 at 20.99%: paying a 5% minimum takes about 9 years and $1,555 of interest. Paying $150 a month takes about 2 years and $724.",
    remember: "Autopay the full statement, always.",
    demo: "minPayment",
    rule: { id: "minimum-payment-trap", label: "The minimum payment trap" },
  },
  {
    id: "edu-debt-payoff",
    unit: "debt",
    title: "Paying off debt is investing",
    idea: "Clearing a debt earns a guaranteed return equal to its interest rate.",
    explain:
      "Paying off a 20% card is the same as earning a risk-free 20%, tax-free. Nothing in the market can promise that. So compare any debt's rate with what your money could earn after tax. Above about 7 or 8%, pay it down first. Below about 4 or 5%, investing usually wins. Between them, do some of both.",
    example: "$1,000 toward a 20% card saves $200 a year for certain. $1,000 invested might earn $60, and it could lose money.",
    remember: "High-interest debt first. It is the best investment you will ever find.",
    you: "The match on your pension is the one exception: 100% beats any debt, so keep contributing.",
    demo: "debtOrder",
    rule: { id: "debt-order", label: "Which debt to pay first" },
  },
  {
    id: "edu-leverage",
    unit: "debt",
    title: "Leverage",
    idea: "Borrowing magnifies your wins and your losses.",
    explain:
      "Leverage means controlling something bigger than your own cash. When its price rises, your gain on your cash is multiplied. When it falls, your loss is multiplied too, and you still owe the full debt. That is why it can make fortunes and also wipe them out. Never borrow to invest in stocks when you are starting out.",
    example: "A $450,000 home with $22,500 down. Prices rise 10%: you gained $45,000, or 200% on your cash. Prices fall 10%: your $22,500 is gone, and you owe more than the home is worth.",
    remember: "Leverage is a magnifying glass. It doesn't care which way things go.",
  },
  {
    id: "edu-credit-score",
    unit: "debt",
    title: "Your credit score",
    idea: "Your reputation as a borrower, in one number.",
    explain:
      "Lenders use a score from 300 to 900 to decide if they will lend to you and at what rate. Paying on time matters most, then how much of your limit you use, how long your accounts have been open, and how often you apply for new credit. Checking your own score doesn't hurt it.",
    example: "On a $400,000 mortgage, being offered 5% rather than 5.5% saves about $2,000 a year in interest early on.",
    remember: "Pay on time, use under 30% of your limit, and don't apply for too much at once.",
    demo: "credit",
    rule: { id: "credit-score", label: "Build a strong credit score" },
  },

  // tax
  {
    id: "edu-tax-brackets",
    unit: "tax",
    title: "How tax brackets work",
    idea: "Each slice of income is taxed at its own rate, not the whole thing.",
    explain:
      "Think of buckets. The first bucket of income has the lowest rate. Once it fills, the next dollars go to a bucket with a higher rate. Earning more never lowers your take-home, because only the top slice is taxed higher. Your marginal rate is the rate on your last dollar. Your average rate is total tax divided by income, and it is always lower.",
    example: "Imagine 15% up to $50,000 and 30% above. On $60,000: $7,500 plus $3,000 is $10,500 of tax. Your marginal rate is 30%, but your average rate is only 17.5%.",
    remember: "A raise can never leave you with less. Only the extra is taxed more.",
    you: "Your marginal rate is about 36%, and your average income tax rate is lower.",
    demo: "marginal",
    rule: { id: "marginal-rate", label: "Marginal vs average tax rate" },
  },
  {
    id: "edu-deduction-credit",
    unit: "tax",
    title: "Deductions and credits",
    idea: "A deduction lowers your income. A credit lowers your tax.",
    explain:
      "A deduction comes off your income before tax is worked out, so it saves tax at your marginal rate. RRSP and FHSA contributions are deductions. A credit comes straight off your tax bill, usually at a fixed percentage, so it is worth the same for everyone. Tuition, medical costs and donations are credits. Non-refundable credits can only bring your tax down to zero.",
    example: "A $1,000 deduction at a 36% rate saves $360. A 15% credit on $1,000 saves $150 at any income.",
    remember: "The higher your income, the more a deduction is worth.",
    rule: { id: "file-taxes", label: "File your taxes every year" },
  },
  {
    id: "edu-refund-myth",
    unit: "tax",
    title: "A refund isn't free money",
    idea: "A refund means you overpaid during the year.",
    explain:
      "Your employer withholds tax from each paycheque. At filing time, your actual tax is compared with what was withheld. If too much was taken, you get the difference, with no interest. A big refund feels nice, but it isn't a bonus. The real gain is the tax you legally avoid with deductions and credits.",
    example: "An $8,000 FHSA contribution at 36% gives back about $2,880. That is real tax saved, not just your own money coming back late.",
    remember: "Know why you got a refund. Invest it rather than treating it as a windfall.",
    rule: { id: "read-payslip", label: "Read your payslip" },
  },
  {
    id: "edu-tax-accounts",
    unit: "tax",
    title: "Tax shelters: TFSA, RRSP and FHSA",
    idea: "They aren't investments. They are protective wrappers around investments.",
    explain:
      "These accounts decide how the tax works, and you choose what goes inside: savings, GICs or funds. TFSA: no deduction, growth and withdrawals are tax-free, and withdrawn room returns the next January. RRSP: deductible now, taxed at withdrawal. FHSA: deductible now, and tax-free for a first home. It is the best of both.",
    example: "Holding a fund in a TFSA for 30 years, you owe no tax on any of the growth. Outside it, tax on dividends and sales takes a slice every step of the way.",
    remember: "First choose the account for the goal, then choose what to hold inside it.",
    you: "For 2026: TFSA $7,000, FHSA $8,000, and RRSP 18% of earned income up to $33,810, less your pension adjustment.",
    demo: "accounts",
    rule: { id: "tax-accounts", label: "Use the TFSA, RRSP and FHSA" },
  },
  {
    id: "edu-tfsa-rrsp-math",
    unit: "tax",
    title: "TFSA and RRSP are mirror images",
    idea: "They differ only in when you pay the tax.",
    explain:
      "Multiplication works in any order. Whether you pay tax now and then grow, or grow and then pay tax, the answer is the same if the rate doesn't change. So the choice depends on your tax rate now compared with later. A higher rate today favours the RRSP. A lower rate today, or a wish for flexibility, favours the TFSA.",
    example: "$1,000 before tax, 36% tax, growth of 5.74 times. TFSA: $640 × 5.74 = $3,676. RRSP: $1,000 × 5.74, less 36%, = $3,676.",
    remember: "Compare your tax rate now with your tax rate later.",
    demo: "tfsaRrsp",
    rule: { id: "tfsa-vs-rrsp", label: "TFSA or RRSP" },
  },
  {
    id: "edu-investment-income",
    unit: "tax",
    title: "How investments are taxed",
    idea: "Outside a shelter, interest is taxed most and gains are taxed least.",
    explain:
      "Interest is fully taxed every year. Eligible Canadian dividends get a credit that lowers their tax. Capital gains are only half taxed, and only when you sell, so you control the timing. Foreign dividends are fully taxed, and the US keeps 15% of dividends in a TFSA, while an RRSP is generally exempt when it holds US-listed funds directly.",
    example: "At a 36% rate: $1,000 of interest keeps $640. $1,000 of capital gains keeps $820.",
    remember: "Shelters first. Then think about what kind of income you earn.",
    rule: { id: "investment-tax", label: "How investment income is taxed" },
  },
];

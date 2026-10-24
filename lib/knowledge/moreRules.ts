// Rules drawn from your payslips, offer, insurance and the recommendations: what each line means and why.

import { benefit, COSTS, LSA_YEARLY } from "@/lib/benefits";
import { money } from "@/lib/format";
import { OFFER } from "@/lib/offer";
import type { Rule } from "./rules";

const ltd = benefit("ltd").pays!.amount;
const life = benefit("life").pays!.amount;
const match = OFFER.salary * OFFER.pensionMax;

export const MORE_RULES: Rule[] = [
  // your pay
  {
    id: "read-payslip",
    group: "Your pay",
    title: "Read your payslip line by line",
    summary: "Gross, minus tax, government plans, pension and insurance, equals your deposit.",
    plain:
      "Every payslip follows the same path. Gross pay is your salary for the period. Before-tax deductions (your pension) come off first, which lowers the income that is taxed. Then income tax (federal and Quebec) and government plans (QPP, EI, QPIP), then after-tax deductions such as insurance. What is left is net pay, the deposit. The year-to-date column adds everything up since January.",
    why: "Payroll mistakes happen, and a new line, a changed rate or a one-time retro charge is easy to miss unless you know what normal looks like.",
    example:
      "October 2026: $7,917.00 gross, minus $475.02 pension, $1,772.58 income tax, $633.09 for QPP, EI and QPIP and $293.53 insurance, leaves $4,742.78 deposited.",
    you: "Upload each payslip to the Payslips tab; it reads the lines for you, compares with the month before and explains anything that moved.",
    demo: "payslip",
    link: { href: "/payslips", label: "Payslips" },
  },
  {
    id: "marginal-rate",
    group: "Your pay",
    title: "Marginal vs average tax rate",
    summary: "Your next dollar is taxed more than your average dollar.",
    plain:
      "Tax brackets apply to slices of income, not the whole thing. Your average rate is total tax divided by income. Your marginal rate is what the next dollar costs. In Quebec you pay both federal tax (reduced by the 16.5% Quebec abatement) and Quebec tax.",
    why: "Decisions at the margin use the marginal rate: a bonus, a raise or side income is taxed at it, and an RRSP or FHSA contribution saves tax at it. A raise never lowers your take-home; only the extra slice is taxed more.",
    example:
      "At $95,000, average income tax is about 24% of taxable income, but each extra $1,000 costs about $360 in tax. That same $1,000 in an RRSP or FHSA saves about $360.",
    you: "Your marginal rate is about 36%. That is why bonuses feel smaller than expected and why FHSA and RRSP contributions pay back so well.",
    demo: "marginal",
    link: { href: "/insights", label: "Insights" },
  },
  {
    id: "payroll-maximums",
    group: "Your pay",
    title: "Why pay rises late in the year",
    summary: "QPP and EI stop once you hit the yearly maximum, then restart in January.",
    plain:
      "QPP and EI are only taken up to a yearly earnings ceiling. Once your year-to-date contributions reach the maximum, payroll stops deducting them, so the last months of the year pay more. On January 1 the count resets.",
    why: "If you know the bump is coming, you can send it straight to savings instead of letting it disappear into spending. It also explains why January's deposit is smaller than December's.",
    example: "At $95,000, EI maxes out around September and QPP around November, adding roughly $600 a month to those deposits.",
    you: "Schedule a transfer for those months now. Your first full year at Air Canada is 2027, so the bump starts then.",
    demo: "payrollMax",
    link: { href: "/payslips", label: "Payslips" },
  },
  {
    id: "raise-math",
    group: "Your pay",
    title: "What a raise is really worth",
    summary: "A raise is taxed at your marginal rate, so roughly 60% reaches your account.",
    plain:
      "A raise adds to gross pay, but the extra is taxed at your marginal rate and also raises your pension contribution. The usual surprise is how little of it shows up in the deposit.",
    why: "Knowing the real number helps you negotiate (ask in gross, plan in net) and decide how much of it to save before lifestyle creep absorbs it.",
    example: "A 3% raise on $95,000 is $2,850 a year gross, about $1,700 after tax and pension: roughly $140 more a month.",
    you: "Raises arrive each year. Save at least half of the extra take-home by raising your automatic transfer the same month.",
    demo: "raise",
    link: { href: "/payslips", label: "Payslips" },
  },

  // grow your money
  {
    id: "fhsa-early",
    group: "Grow your money",
    title: "Open the FHSA early",
    summary: "FHSA room only builds from the year you open the account.",
    plain:
      "The First Home Savings Account gives $8,000 of room a year, up to $40,000 for life. Contributions are deductible like an RRSP, and withdrawals for a first home are tax-free like a TFSA. Room starts the year you open the account, and only $8,000 of unused room carries forward.",
    why: "Opening late loses room you can never get back. Opening with $0 still starts the clock.",
    example: "Open in 2026 and contribute nothing: in 2027 you can put in $16,000. Open in 2027 instead and you can only put in $8,000.",
    you: "Open one before December 31 even if you can't fund it yet. Each $1,000 you put in later saves about $360 of tax.",
    demo: "fhsa",
    link: { href: "/recommendations", label: "Recommendations" },
  },
  {
    id: "inflation",
    group: "Grow your money",
    title: "Think in today's dollars",
    summary: "At 2% inflation, prices double in about 35 years.",
    plain:
      "Inflation slowly raises prices, so a dollar buys less every year. Long-range numbers like a pension at 65 look huge in future dollars but buy much less. Divide by inflation to see what they are worth in today's money.",
    why: "It keeps goals honest. A million dollars in 2062 is closer to half a million in today's money.",
    example: "$1,000,000 in 36 years at 2% inflation buys what about $490,000 buys today.",
    you: "The Pension and Payslips tabs can show amounts in today's dollars. Use that view when you compare with your current spending.",
    demo: "inflation",
    link: { href: "/pension", label: "Pension" },
  },
  {
    id: "stay-invested",
    group: "Grow your money",
    title: "Stay invested through crashes",
    summary: "Drops of 30% happen; selling turns a temporary loss into a permanent one.",
    plain:
      "Stock markets fall sharply every few years and have always recovered over long periods. People who sell in a panic lock in the loss and usually miss the rebound. Investing the same amount every month means you automatically buy more when prices are low.",
    why: "Over 30 years the biggest risk is not a crash, it is your own reaction to one. A plan made in calm times is easier to follow in bad ones.",
    example: "After the 2008 crash, US stocks took about four and a half years, dividends included, to regain their old peak. Someone who kept investing every month got back sooner, because they bought cheap shares near the bottom.",
    you: "Keep the safety net in cash so you never have to sell investments to cover a bill, and let the DC pension and TFSA keep buying.",
  },

  // retirement
  {
    id: "dc-pension-match",
    group: "Retirement",
    title: "How a DC pension and the match work",
    summary: "You put in 6%, Air Canada adds 6%: a 100% return before any growth.",
    plain:
      "A defined-contribution (DC) pension is an investment account with your name on it. You and your employer each put in a percentage of salary, it is invested in funds you choose, and at retirement the balance pays you an income. The amount depends on contributions and investment returns, not on a formula.",
    why: "The employer match doubles every dollar you put in on day one. Nothing else you can buy has a guaranteed 100% return. Fund choice matters next: a growth fund over 35 years can mean hundreds of thousands more.",
    example: `On $95,000, 6% each is $475 a month from you and $475 from Air Canada, ${money(match * 2)} a year. At 5% a year for 36 years, with 2.5% yearly raises, that grows to about $1.6 million by 65.`,
    you: "Keep contributing the full 6% and pick a low-fee growth or target-date fund on the Manulife site instead of leaving it in the default.",
    demo: "match",
    link: { href: "/pension", label: "Pension" },
  },
  {
    id: "pension-adjustment",
    group: "Retirement",
    title: "Why your RRSP room is small",
    summary: "Your DC pension contributions use up RRSP room (the pension adjustment).",
    plain:
      "RRSP room is 18% of last year's earned income, up to a yearly limit. If you are in a workplace pension, the contributions to it (yours and your employer's) are reported as a pension adjustment and subtracted, so people with good pensions get much less RRSP room.",
    why: "It stops you over-contributing (penalty: 1% a month on the excess) and tells you which account to use first. With little RRSP room, the FHSA and TFSA do more of the work.",
    example: "Salary $95,000: 18% is $17,100. The pension adjustment is 12% of salary, $11,400. New RRSP room: about $5,700 a year.",
    you: "Your 2027 room is smaller still, since 2026 was a part year. Check the exact number on your Notice of Assessment after filing.",
    demo: "rrspRoom",
    link: { href: "/recommendations", label: "Recommendations" },
  },
  {
    id: "qpp-oas",
    group: "Retirement",
    title: "QPP and OAS: the government's part",
    summary: "Starting later pays more for life: up to 58.8% more for QPP, 36% for OAS.",
    plain:
      "The Quebec Pension Plan pays a pension based on what you contributed through payroll. Old Age Security is paid to residents with enough years in Canada. QPP can start between 60 and 72: about 0.6% less for each month before 65 and 0.7% more for each month after. OAS starts at 65 and grows 0.6% for each month you delay, up to 70.",
    why: "They are paid for life and rise with inflation, which makes waiting valuable if you are healthy and have other savings to bridge the gap.",
    example: "A QPP pension of $1,450 a month at 65 is about $930 at 60, or about $2,300 at 72.",
    you: "Both depend on how many years you contribute and live in Canada. Your statement of participation from Retraite Québec shows your QPP record.",
    demo: "qppAge",
    link: { href: "/pension", label: "Pension" },
  },
  {
    id: "four-percent",
    group: "Retirement",
    title: "The 4% rule",
    summary: "Withdraw about 4% a year and savings usually last 30 years or more.",
    plain:
      "A common rule of thumb for retirement: take out about 4% of your savings in the first year, then adjust for inflation. Historically that has lasted at least 30 years for a balanced portfolio. Flip it to find your target: yearly spending times 25.",
    why: "It turns a big, abstract balance into a monthly income you can compare with what you live on, and gives a simple savings target.",
    example: "$1,000,000 at 4% is $40,000 a year, about $3,333 a month. To spend $60,000 a year you need about $1.5 million.",
    you: "The Pension tab uses this rule to turn your DC pot into a monthly income at 65, alongside QPP and OAS.",
    demo: "fourPercent",
    link: { href: "/pension", label: "Pension" },
  },

  // benefits and insurance
  {
    id: "disability-cover",
    group: "Benefits and insurance",
    title: "Disability insurance protects your biggest asset",
    summary: "Your future income is worth millions; disability cover is what protects it.",
    plain:
      "Short-term disability pays while you recover from an illness or injury; long-term disability takes over if you are off for months or longer, often until 65. Group plans usually replace about 60% of gross pay. If you pay the premiums yourself, the benefit is generally tax-free.",
    why: "You are far more likely to be off work for a long illness than to die young, and 35 years of salary is worth over three million dollars. Disability cover is the insurance most people undervalue.",
    example: `60% of $7,917 a month is $4,751. Tax-free, that is about the same as a normal take-home of $4,700.`,
    you: `You pay ${money(COSTS.youTotal, 2)} a month for all your insurance, most of it for disability. Keep it: it would pay ${money(ltd)} a month tax-free.`,
    demo: "disability",
    link: { href: "/insurance", label: "Insurance" },
  },
  {
    id: "life-insurance-need",
    group: "Benefits and insurance",
    title: "How much life insurance you need",
    summary: "Enough to cover debts plus the years of income others rely on.",
    plain:
      "Life insurance replaces your income for people who depend on it. Add up debts and final costs, plus the income your family would need for a number of years, then subtract savings and cover you already have. If nobody depends on you, you may need very little.",
    why: "Buying too much wastes premiums; too little leaves a partner or children short. The right number changes with life events: a partner, a mortgage, children.",
    example: "Five years of $60,000 plus a $300,000 mortgage is $600,000. With $160,000 of group cover, the gap is $440,000.",
    you: `You have ${money(life)} of basic life plus $200,000 accidental cover. That is plenty while nobody depends on you; revisit it when that changes.`,
    demo: "lifeNeed",
    link: { href: "/insurance", label: "Insurance" },
  },
  {
    id: "use-benefits",
    group: "Benefits and insurance",
    title: "Use it or lose it: benefit limits",
    summary: "Spending accounts and paramedical limits reset every year.",
    plain:
      "Most benefit plans have yearly limits per type of care (physio, massage, psychologist, glasses) and spending accounts that reset or expire. Money you don't claim is simply gone.",
    why: "You are already paying for this coverage, in premiums and in Quebec tax on the part your employer pays. Not using it is like leaving part of your pay on the table.",
    example: `A $500 Lifestyle Spending Account covers a year of gym fees for many people. Claims are taxable, so at a 36% rate it is worth about $320.`,
    you: `Air Canada gives you ${money(LSA_YEARLY)} a year in a Lifestyle Spending Account. Claim a gym, shoes, a fitness tracker, books or a course before the plan year ends.`,
    demo: "lsa",
    link: { href: "/insurance", label: "Insurance" },
  },
  {
    id: "taxable-benefits",
    group: "Benefits and insurance",
    title: "Taxable benefits in Quebec",
    summary: "Quebec taxes employer-paid health and dental premiums as income.",
    plain:
      "When your employer pays for your health and dental coverage, Quebec counts that amount as income on your RL-1 (the federal government does not). It shows on payslips as a higher Quebec taxable gross. Quebec also adds a 9% tax on insurance premiums.",
    why: "It explains why your Quebec taxable income is higher than your federal one, and why your insurance deductions are 9% above the insurer's price.",
    example: `Air Canada pays ${money(COSTS.employerTaxable, 2)} a month for your health and dental; at your Quebec rate that adds about $47 a month of Quebec tax.`,
    you: "Nothing to do except use the coverage, which is how you get that tax back in value.",
    link: { href: "/insurance", label: "Insurance" },
  },
  {
    id: "tenant-insurance",
    group: "Benefits and insurance",
    title: "Tenant insurance is about liability",
    summary: "Cheap cover for your things, and for damage you cause to others.",
    plain:
      "Tenant insurance covers your belongings against theft or fire and, more importantly, your liability: if water from your bathtub floods the unit below, you can be responsible for the repairs. It usually costs $20 to $30 a month, and many leases require it.",
    why: "Your landlord's insurance covers the building, not your things or your liability. One flood claim can cost far more than years of premiums.",
    example: "A burst washing machine hose damages two units below: repairs of $25,000, covered by a policy costing about $300 a year.",
    you: "Group benefits don't include this. Get quotes from two or three insurers; bundling with car insurance later can lower the price.",
  },

  // big purchases
  {
    id: "home-buyers-plan",
    group: "Big purchases",
    title: "The FHSA plus the Home Buyers' Plan",
    summary: "Two tax breaks for a first home that work together.",
    plain:
      "For a first home you can withdraw your whole FHSA tax-free, and also borrow up to $60,000 from your own RRSP under the Home Buyers' Plan. The FHSA never has to be paid back; the RRSP withdrawal is repaid over 15 years.",
    why: "Together they can fund a down payment with money that got a tax refund going in, which makes a first home much more reachable.",
    example: "$40,000 from a full FHSA plus $25,000 from an RRSP is a $65,000 down payment, most of which earned tax refunds on the way in.",
    you: "The FHSA is your first step; RRSP room is small for you because of the pension, so the FHSA does most of the work.",
    link: { href: "/goals/house", label: "House goal" },
  },
  {
    id: "quebec-lease",
    group: "Big purchases",
    title: "Your rights at lease renewal in Quebec",
    summary: "You can refuse a rent increase; the TAL decides if you can't agree.",
    plain:
      "Most Quebec leases run to June 30. For a 12-month lease, the landlord must send any change, such as a rent increase, 3 to 6 months before it ends. You then have one month to reply. If you refuse, you keep your place and the landlord can ask the Tribunal administratif du logement to set the rent.",
    why: "Rent is usually your biggest expense. Knowing the rules lets you push back on an unreasonable increase instead of accepting it or moving.",
    example: "A notice raising $2,075 rent by 8% is $166 a month, $1,992 a year. If you refuse, the TAL sets the increase from the building's actual costs, which can be lower than what was asked.",
    you: "Watch the mail from January to March. Your rent is 44% of take-home, so this is your biggest lever on the budget.",
    link: { href: "/recommendations", label: "Recommendations" },
  },

  // habits and paperwork
  {
    id: "will-mandate",
    group: "Habits and paperwork",
    title: "Make a will and a protection mandate",
    summary: "Decide who gets your money and who decides for you if you can't.",
    plain:
      "A will says who receives what you own. In Quebec, a protection mandate names who manages your affairs and makes care decisions if you become unable to. A notarial will made with a notary is the most secure kind and is easy to find later.",
    why: "Without them, the law decides, and family may need a court process that is slow and costly. Beneficiaries named on insurance and pension plans skip the will entirely, so keep both up to date.",
    example: "A notary can prepare a will and a protection mandate together, often for a few hundred dollars.",
    you: "Start with beneficiaries on your life insurance and DC pension on the Manulife site; that is free and takes minutes.",
    link: { href: "/recommendations", label: "Recommendations" },
  },
];

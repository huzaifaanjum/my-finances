// Rules the app's numbers rely on but the first lists left out: net worth, debt order, how investing works, and more.

import type { Rule } from "./rules";

export const FOUNDATION_RULES: Rule[] = [
  // start here
  {
    id: "net-worth",
    group: "Start here",
    title: "Track your net worth",
    summary: "What you own minus what you owe. Check it every few months.",
    plain:
      "Add up everything you own: cash, investments, pension and property. Subtract everything you owe: cards, loans and any mortgage. The answer is your net worth. It is the one number that shows whether you are really getting ahead.",
    why: "A big salary can hide a weak position. Net worth shows the result of all your money decisions in one place, and watching it rise is motivating.",
    example: "$10,000 in savings plus $15,000 in a pension, minus a $5,000 card balance, is a net worth of $20,000. Pay off the card from savings and it stays $20,000, but you stop paying 20% interest.",
    you: "Update it four times a year, using your balances on the same date. Early on it moves slowly, then compound growth takes over.",
    demo: "netWorth",
  },

  // debt and credit
  {
    id: "minimum-payment-trap",
    group: "Debt and credit",
    title: "The minimum payment trap",
    summary: "The minimum is designed to keep you paying for years. Pay the full statement.",
    plain:
      "A card's minimum payment is a small percentage of the balance. As the balance falls, so does the minimum, which stretches the debt out for years while interest keeps running. Quebec sets a higher minimum than most provinces, but it is still far from paying the card properly.",
    why: "Holding your payment steady, even when the minimum falls, cuts years off the debt and most of the interest.",
    example: "$3,000 at 20.99%: paying a 5% minimum takes about 9 years and costs about $1,555 in interest. Keeping the payment at $150 clears it in about 2 years for about $724.",
    you: "Set autopay to the full statement balance, not the minimum. If you carry a balance, pick a fixed amount and leave it there.",
    demo: "minPayment",
    link: { href: "/recommendations", label: "Action plan" },
  },
  {
    id: "debt-order",
    group: "Debt and credit",
    title: "Which debt to pay first",
    summary: "Highest interest rate first saves the most. Smallest debt first builds momentum.",
    plain:
      "Pay every minimum, then send all spare money to one debt. The avalanche method targets the highest interest rate. The snowball method targets the smallest balance. When one is gone, its payment rolls into the next.",
    why: "The avalanche always costs less. The snowball gives quick wins, which helps some people keep going. The best plan is the one you finish.",
    example: "On the three sample debts below, an extra $200 a month costs about $2,647 of interest highest-rate-first and $2,768 smallest-first. With no extra at all it is about $5,049, so the extra payment matters far more than the order.",
    you: "A credit card is nearly always first. Keep paying your car or student loan on schedule while you clear it.",
    demo: "debtOrder",
  },

  // investing basics
  {
    id: "asset-allocation",
    group: "Investing basics",
    title: "Pick your mix of stocks and bonds",
    summary: "Your mix drives both your long-run return and how rough the ride feels.",
    plain:
      "Asset allocation is how you split money between stocks and safer things like bonds and cash. More stocks means more growth and bigger drops. The right mix depends on when you need the money and how much of a fall you could live through without selling.",
    why: "This one choice matters more than which fund you pick. A mix you can hold through a crash beats a better one you abandon.",
    example: "$500 a month for 30 years: 80% stocks at an estimated 6.3% ends near $532,000. 40% stocks at about 4.9% ends near $409,000. In a very bad year, though, the first could fall 29% and the second about 17%.",
    you: "For retirement money 35 years away, a mostly stock mix fits your timeline. Down payment money is different, and should get safer as your purchase date gets closer.",
    demo: "allocation",
    link: { href: "/millionaire", label: "Investing" },
  },
  {
    id: "diversify",
    group: "Investing basics",
    title: "Don't put all your eggs in one basket",
    summary: "Own thousands of companies, so no single failure can hurt you much.",
    plain:
      "Any one company can fail, and even a whole country or industry can lag for a decade. Diversification spreads your money widely, across companies, industries and countries, so that one bad result is only a small dent.",
    why: "It lowers risk with almost no cost to your long-term return. A single broad fund does it for you.",
    example: "$10,000 in one stock that falls 90% leaves $1,000. $10,000 spread over 1,000 companies, with that same one in the mix, loses about $9.",
    you: "Your salary, bonus and travel perks all depend on one airline. Keep any ESOP small and hold the rest of your money in broad global funds.",
  },
  {
    id: "index-vs-active",
    group: "Investing basics",
    title: "Why most people should use index funds",
    summary: "Most stock-pickers trail the market after fees. Index funds simply own the market.",
    plain:
      "An active fund pays a manager to try to beat the market. An index fund simply owns the whole market at a low cost. Investors as a group earn the market return before fees, so after fees the average active investor must fall behind. Finding the few winners in advance has proved very hard.",
    why: "You give up the dream of beating the market, and in return you very likely beat most of the people trying to. It also takes minutes a year.",
    example: "A fund charging 2.2% has to beat the market by about 2% every year just to match a 0.2% index fund. Year after year, that is a very high bar.",
    you: "A low-fee target-date or index option in your DC pension, and one all-in-one index ETF in your TFSA, is plenty.",
    link: { href: "/recommendations", label: "Action plan" },
  },
  {
    id: "dollar-cost-average",
    group: "Investing basics",
    title: "Invest on a schedule, not on a feeling",
    summary: "Invest the same amount every payday and forget about timing the market.",
    plain:
      "Dollar-cost averaging means investing a fixed amount on a fixed schedule. When prices are low your money buys more shares, and when prices are high it buys fewer. If you have a lump sum, investing it right away has usually done better, because markets rise more often than they fall.",
    why: "It removes the hardest part of investing: deciding when. Nobody times markets reliably, and waiting for a dip can cost more than the dip saves.",
    example: "$300 a month at share prices of $30, $20 and $25 buys 10, 15 and 12 shares. That is 37 shares at an average cost of about $24.32, below the $25 average price.",
    you: "Your pension already does this every payday. Set your TFSA up the same way, the day after pay lands.",
  },
  {
    id: "rebalance",
    group: "Investing basics",
    title: "Rebalance once a year",
    summary: "Bring your mix back to target so your risk stays where you chose it.",
    plain:
      "As markets move, your mix drifts. After a good run for stocks you hold more stock than you planned, and more risk. Rebalancing means trimming what grew and adding to what lagged. New contributions are the easiest way, since you just buy what is behind.",
    why: "It keeps your risk steady and makes you sell high and buy low by rule, not by feeling.",
    example: "An 80/20 portfolio of $100,000 sees stocks rise 30%. It is now $104,000 in stocks and $20,000 in bonds, about 84/16. Moving $4,800 to bonds restores 80/20.",
    you: "All-in-one ETFs and target-date funds rebalance for you. Only do this yourself if you hold separate funds.",
  },
  {
    id: "short-term-money",
    group: "Investing basics",
    title: "Money you need soon stays out of stocks",
    summary: "Under 3 years: savings or GICs. Over 7 years: mostly investing.",
    plain:
      "Stocks can fall 30% or more and take years to recover, so they suit money with a long runway. Use a high-interest savings account or GICs for needs within about 3 years. Between 3 and 7 years, use a mix. Beyond 7 years, lean toward stocks.",
    why: "Being forced to sell after a fall turns a temporary drop into a real loss. Matching each goal to its timeline prevents that.",
    example: "$40,000 for a down payment in two years: a 30% fall leaves $28,000, a year or more of savings gone. In a savings account at 3% it grows to about $42,400.",
    you: "Hold your safety net and near-term goals in cash, even inside your TFSA or FHSA. Those accounts can hold savings as well as investments.",
    link: { href: "/goals", label: "Saving goals" },
  },
  {
    id: "investment-tax",
    group: "Investing basics",
    title: "How investment income is taxed",
    summary: "Interest is taxed most, capital gains least. Registered accounts avoid it all for now.",
    plain:
      "Outside a registered account, interest is taxed fully at your marginal rate. Canadian dividends are taxed less, thanks to a dividend tax credit. Only half of a capital gain is taxed, and only when you sell. Inside a TFSA there is no tax on any of it, and inside an RRSP or FHSA tax waits until withdrawal, if it applies at all.",
    why: "The same return can leave you very different amounts. Keeping investments in registered accounts first is one of the surest gains available.",
    example: "$10,000 of interest at a 36% rate costs $3,600 in tax. A $10,000 capital gain costs about $1,800, since only half is taxed. In a TFSA, both cost $0.",
    you: "Fill your FHSA and TFSA before using a taxable account. With your room, that could take years.",
    link: { href: "/tax", label: "Tax" },
  },
  {
    id: "tfsa-vs-rrsp",
    group: "Investing basics",
    title: "TFSA or RRSP: the real answer",
    summary: "If your tax rate is lower at withdrawal, the RRSP wins. If not, the TFSA does.",
    plain:
      "The two accounts are mirror images. An RRSP gives the tax break now and taxes withdrawals. A TFSA taxes the money now and leaves withdrawals free. If your tax rate is the same both times, and you reinvest the RRSP refund, the result is identical. The whole decision comes down to your rate now against your rate later.",
    why: "It replaces a confusing debate with one simple question. High earners usually do better with the RRSP. Those with lower income now usually do better with the TFSA.",
    example: "$1,000 of pre-tax income, 6% a year for 30 years, at a 36% rate now. TFSA: $3,676. RRSP withdrawn at 36%: $3,676. RRSP withdrawn at 25%: $4,308.",
    you: "At 36% now, RRSP room is valuable, but your pension uses most of it. Use what you have, and let the TFSA and FHSA do the rest. The TFSA also helps you avoid the OAS clawback later.",
    demo: "tfsaRrsp",
    link: { href: "/recommendations", label: "Action plan" },
  },

  // big purchases
  {
    id: "rent-vs-buy",
    group: "Big purchases",
    title: "Renting isn't throwing money away",
    summary: "Owners have lost costs too, about 5% of the home's price each year.",
    plain:
      "Rent is money you never get back, but owners have the same kind of cost: property tax, upkeep, insurance and mortgage interest, plus the return their down payment could have earned. A common rule of thumb puts these lost costs at about 5% of the home's price a year. Compare that with rent, then invest any difference.",
    why: "It turns an emotional debate into a sum. Buying can be a great choice, but it isn't automatically better. It also ties up money and makes moving costly.",
    example: "A $450,000 home at 5% is $22,500 a year, about $1,875 a month in lost costs. If a similar place rents for $1,800, renting and investing the difference is competitive.",
    you: "Rent is your biggest expense, so the comparison matters. Plan on staying at least five years before buying, since closing and selling costs take years to earn back.",
    demo: "rentBuy",
    link: { href: "/goals/house", label: "House goal" },
  },
  {
    id: "mortgage-basics",
    group: "Big purchases",
    title: "How a mortgage really works",
    summary: "Early payments are mostly interest. A longer amortization costs far more.",
    plain:
      "Each payment covers the month's interest first, and the rest reduces what you owe. Early on, most goes to interest. Amortization is the full payoff time, usually 25 years. The term is how long your rate lasts, usually 5 years, then you renew at whatever rates are then. A fixed rate stays put for the term, and a variable rate moves with the market.",
    why: "Knowing this shows why rate, amortization and prepayments matter so much. Small changes are worth tens of thousands of dollars.",
    example: "$360,000 at 5% over 25 years is about $2,105 a month and $271,000 of interest. In month one, $1,500 is interest and just $605 reduces the debt. Over 30 years the payment falls to $1,933, but interest rises to $336,000.",
    you: "First-time buyers can get 30 years on an insured mortgage, but that lower payment costs a lot more overall. Use the lower payment only if you need it, and prepay when you can.",
    demo: "loanSplit",
    link: { href: "/goals/house", label: "House goal" },
  },

  // retirement
  {
    id: "savings-rate-freedom",
    group: "Retirement",
    title: "Your savings rate sets your finish line",
    summary: "Save 20% and work about 40 years. Save 50% and it is about 17.",
    plain:
      "Saving more does two things at once: you invest more, and you learn to live on less, which shrinks the amount you need. That is why the time to financial independence depends on the share of pay you save, not on how much you earn.",
    why: "It shows what each extra percent buys: years of freedom. That makes saving feel less like giving something up.",
    example: "At a 4% return after inflation, starting from zero: saving 10% takes about 58 years, 20% about 40, 30% about 30, and 50% about 17.",
    you: "Your 12% pension contribution counts too, on top of what you save from take-home, so you are further along than your bank balance suggests.",
    demo: "savingsFi",
    link: { href: "/pension", label: "Retirement" },
  },
  {
    id: "oas-clawback",
    group: "Retirement",
    title: "The OAS clawback",
    summary: "High retirement income reduces OAS. TFSA withdrawals don't count.",
    plain:
      "If your net income in retirement is above a limit, $95,323 for 2026, the government takes back 15 cents of OAS for every extra dollar. RRSP, RRIF and pension income all count. TFSA withdrawals don't. The limit rises with inflation.",
    why: "With a strong pension, this may matter one day. Having some money in a TFSA gives you tax-free income that doesn't touch your OAS.",
    example: "Retirement income of $105,323 is $10,000 over the limit, so $1,500 of that year's OAS is taken back.",
    you: "This is decades away, so there is nothing to do now except keep building your TFSA alongside your pension.",
    link: { href: "/pension", label: "Retirement" },
  },

  // benefits and insurance
  {
    id: "insure-big-risks",
    group: "Benefits and insurance",
    title: "Insure disasters, not inconveniences",
    summary: "Buy insurance for losses you couldn't survive, and cover small ones yourself.",
    plain:
      "Insurers make money, so on average you get back less than you pay. Insurance is still worth it for losses that would ruin you: a disability, a liability claim, a house fire. It is poor value for small losses you could pay from savings, such as a phone screen or a cheap extended warranty. A higher deductible lowers your premium for the same reason.",
    why: "It focuses your money on the risks that matter, and your emergency fund handles the rest.",
    example: "Raising a car insurance deductible from $500 to $1,000 might save $100 a year. If you claim less than once every five years, you come out ahead.",
    you: "Your disability cover is the big one, so keep it. Skip store warranties and phone insurance, and let your emergency fund cover those.",
    link: { href: "/insurance", label: "Insurance" },
  },

  // habits and paperwork
  {
    id: "avoid-scams",
    group: "Habits and paperwork",
    title: "Spot a money scam",
    summary: "Guaranteed high returns, pressure to act and secret tips are the warning signs.",
    plain:
      "Scams promise high returns with no risk, push you to act now, and ask for gift cards, crypto or wire transfers. The CRA doesn't threaten arrest or demand gift cards. Anyone selling investments must be registered: check with the AMF in Quebec or at aretheyregistered.ca before sending anything.",
    why: "A single scam can undo years of saving, and the money is rarely recovered. Scammers target newcomers and people with fresh income.",
    example: "A message offers 3% a month, guaranteed. By the Rule of 72 that doubles every 2 years, which no honest investment can promise.",
    you: "Slow down whenever someone rushes you. Hang up and call the number on the official website, then decide.",
  },
  {
    id: "yearly-money-review",
    group: "Habits and paperwork",
    title: "Do a one-hour money review each year",
    summary: "One hour a year keeps your whole plan on track.",
    plain:
      "Pick a date, such as January when new room opens. Update your net worth, check your contribution room, raise your automatic savings, rebalance if you need to, and review your beneficiaries, insurance, bills and subscriptions.",
    why: "Good plans drift quietly. A yearly review catches problems early, and it keeps your savings growing with your pay.",
    example: "Raising your savings by just 1% of pay each year takes you from 20% to 30% in a decade, and you hardly feel it.",
    you: "January suits you: new TFSA and FHSA room opens, Aeroplan points arrive, and your T4 is on its way.",
    link: { href: "/recommendations", label: "Action plan" },
  },
];

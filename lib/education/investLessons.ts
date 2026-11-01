// Units seven and eight: what investments are, and how markets and people behave.

import type { Lesson } from "./lessons";

export const INVEST_LESSONS: Lesson[] = [
  // investing
  {
    id: "edu-what-investing-is",
    unit: "invest",
    title: "What investing really is",
    idea: "You give up money today to own a share of what the economy produces tomorrow.",
    explain:
      "Investing isn't gambling, and it isn't about clever picks. When you buy a broad fund, you become a part owner of thousands of businesses. Those businesses employ people, sell products and make profits. Their profits are what pay you over time. Gambling is a game where the house wins. Investing is owning the house.",
    example: "If you buy one share of a company, you own a tiny slice of its factories, brands and future profits. Your return comes from what the company earns.",
    remember: "You aren't buying a ticker. You are buying a part of real businesses.",
  },
  {
    id: "edu-stocks",
    unit: "invest",
    title: "Stocks",
    idea: "A stock is a small piece of a company.",
    explain:
      "Stock returns come from two places: dividends, which are profits paid out, and growth, when the company becomes more valuable and its share price rises. Over decades, stocks have had the best returns of the major investments. The cost is bumpiness: prices can fall 30% or more and take years to recover.",
    example: "Buy a share at $100. It pays $3 in dividends and rises to $107 over a year. Your return is $10, or 10%.",
    remember: "Stocks are the growth engine. Expect a rough ride.",
  },
  {
    id: "edu-bonds",
    unit: "invest",
    title: "Bonds",
    idea: "A bond is a loan you make to a government or company.",
    explain:
      "The borrower pays you interest and returns your money at the end. Bonds grow less than stocks but usually fall less, so they steady a portfolio. One thing surprises people: when interest rates rise, existing bond prices fall, because new bonds pay more. When rates fall, existing bond prices rise.",
    example: "You hold a bond paying 3%. New bonds now pay 5%. Nobody will pay full price for your 3% bond, so its market price drops.",
    remember: "Bonds are the shock absorber. Lower return, smoother ride.",
  },
  {
    id: "edu-cash-gics",
    unit: "invest",
    title: "Cash, savings accounts and GICs",
    idea: "Safe places for money you need soon.",
    explain:
      "A high-interest savings account pays interest and lets you withdraw any time. A GIC pays a set rate for locking your money away for a set time. Both are covered by deposit insurance up to $100,000 per category at each member bank, and in Quebec, Desjardins deposits are covered by the AMF. They rarely beat inflation by much, so they are for safety, not for growth.",
    example: "$20,000 in a 3% savings account earns $600 in a year, and it can't fall in value.",
    remember: "Cash is for safety and short-term goals, not for building wealth.",
    rule: { id: "short-term-money", label: "Money you need soon" },
  },
  {
    id: "edu-funds",
    unit: "invest",
    title: "Funds, ETFs and index funds",
    idea: "A fund is a basket holding many investments at once.",
    explain:
      "A fund pools money from many people. A mutual fund is often sold by banks and often has higher fees. An ETF is a fund you buy on the stock exchange, usually at a low cost. An index fund copies a list of companies instead of trying to pick winners. ETF and index aren't opposites: most ETFs are index funds. An all-in-one ETF holds stocks and bonds from around the world in a single purchase.",
    example: "One all-in-one ETF can hold over 10,000 companies from dozens of countries, for around 0.2% a year. That is $20 a year on every $10,000.",
    remember: "For most people, one low-cost, broad fund is enough.",
    rule: { id: "index-vs-active", label: "Why index funds" },
  },
  {
    id: "edu-real-estate-investing",
    unit: "invest",
    title: "Real estate and other assets",
    idea: "Property can build wealth, but it is a job as well as an investment.",
    explain:
      "Rental property pays rent and can rise in value, and a mortgage adds leverage. It also brings repairs, tenants, vacancies, and a big, single, hard-to-sell asset. REITs are funds that hold property and trade like stocks. Gold and crypto produce no income: their price depends only on what the next buyer will pay. Keep those small or skip them.",
    example: "A $500,000 rental at $2,500 a month sounds fine until you take off tax, insurance, repairs, vacancy and interest. Often little or nothing is left in the early years.",
    remember: "Prefer assets that produce something. Be cautious with those that only depend on the next buyer.",
  },
  {
    id: "edu-risk-return",
    unit: "invest",
    title: "Risk and return",
    idea: "Higher return is the payment for accepting more risk.",
    explain:
      "No one takes a bigger risk unless they expect to be paid for it. That is why stocks have returned more than bonds, and bonds more than cash. But the risk that gets paid is market risk. Holding one stock is a risk nobody pays you for, since you can avoid it by diversifying. Be suspicious of any high return said to come with low risk.",
    example: "Historically: cash at about inflation, bonds a little above, and stocks around 4 to 6% above inflation, with far larger swings.",
    remember: "If it promises high returns with no risk, it is either a mistake or a scam.",
    rule: { id: "avoid-scams", label: "Spot a money scam" },
  },
  {
    id: "edu-diversification",
    unit: "invest",
    title: "Diversification",
    idea: "Don't let one failure sink you.",
    explain:
      "Companies fail, industries fade and countries stagnate. Spreading across many of them means the winners make up for the losers. A few huge winners drive most of the market's long-term gains, and nobody knows in advance which ones they will be. Owning everything guarantees you hold them.",
    example: "Canada is about 3% of world stock markets. A portfolio of only Canadian stocks misses most of the world's companies, and it leans heavily on banks and energy.",
    remember: "Own the haystack, instead of hunting for the needle.",
    rule: { id: "diversify", label: "Don't put all your eggs in one basket" },
  },
  {
    id: "edu-asset-allocation",
    unit: "invest",
    title: "Asset allocation",
    idea: "Your mix of stocks and bonds matters more than the funds you pick.",
    explain:
      "Choose your mix from two things: when you need the money and how much of a fall you can stomach. Long timelines can hold mostly stocks. Near-term goals should hold mostly safe things. A good test: imagine your account down 35% and everyone panicking. Would you hold on? If not, take less risk.",
    example: "A common shape: 80 to 100% stocks for money 20 or more years away, 50 to 60% for 5 to 10 years, and little or none for under 3 years.",
    remember: "Pick a mix that you can hold through the worst year.",
    demo: "allocation",
    rule: { id: "asset-allocation", label: "Pick your mix" },
  },
  {
    id: "edu-fees",
    unit: "invest",
    title: "Fees: the sure loss",
    idea: "You can't control returns, but you can control costs.",
    explain:
      "A fund's fee, the MER, is taken from your money every year, whether the fund does well or badly. Because it compounds, a small-looking fee becomes a huge sum. A 2% fee may take a quarter or more of your final amount. Every dollar that doesn't go to fees stays compounding for you.",
    example: "$500 a month for 25 years at a 6% gross return: at a 0.2% fee you get about $336,000. At 2.2%, about $250,000.",
    remember: "Know the fee of everything you own. Under 0.3% is a good target.",
    demo: "fees",
    rule: { id: "low-fees", label: "Watch the fees" },
  },
  {
    id: "edu-how-to-start",
    unit: "invest",
    title: "How to actually start",
    idea: "It takes five steps and about an hour.",
    explain:
      "1. Open a TFSA or FHSA at a low-cost online brokerage. 2. Set up transfers from your bank. 3. Pick one all-in-one index ETF that matches your risk level. 4. Buy it, and check the price and number of shares. 5. Automate monthly deposits, and then buy on a schedule. Cash that sits in the account isn't invested until you buy something, which is the most common beginner mistake.",
    example: "$500 lands in your TFSA on the 1st of each month. On the 2nd you buy as many shares of your ETF as it covers. It takes two minutes.",
    remember: "Depositing isn't investing. You have to buy something.",
    you: "Your emergency fund comes first. Then follow the order in your Action plan.",
    rule: { id: "dollar-cost-average", label: "Invest on a schedule" },
  },
  {
    id: "edu-protections",
    unit: "invest",
    title: "What protects your money",
    idea: "Insurance covers a failing institution, not a falling market.",
    explain:
      "CDIC covers eligible deposits up to $100,000 per category at each member bank. CIPF generally covers up to $1 million if your investment dealer goes bankrupt. Neither covers investment losses, because market falls are the normal risk you accept. Before putting in large sums, check that your bank is a CDIC member and your broker is a CIPF member.",
    example: "If your broker fails, CIPF helps recover your holdings. If your ETF drops 20%, nobody reimburses you.",
    remember: "You are protected from a failing firm, but not from a falling market.",
  },

  // markets and behaviour
  {
    id: "edu-why-prices-move",
    unit: "markets",
    title: "Why prices move",
    idea: "In the short run, mood. In the long run, profits.",
    explain:
      "Each day, the price is whatever buyers and sellers agree on, and that swings with news and emotions. Over decades, prices follow what companies actually earn. Benjamin Graham put it this way: in the short run the market is a voting machine, and in the long run it is a weighing machine. So daily moves tell you almost nothing.",
    example: "A company's share price can fall 40% in a year while its profits barely change. Only the mood changed.",
    remember: "Ignore the daily price. Own the long-term earnings.",
  },
  {
    id: "edu-market-cycles",
    unit: "markets",
    title: "Bull markets, bear markets and crashes",
    idea: "Falls are normal. Plan for them, because they will come.",
    explain:
      "Stock markets rise in about three of every four years. But a 10% drop happens most years, a 20% or worse bear market every several years, and a drop of 30 to 50% a few times in a lifetime. Broad global markets have recovered from every past fall so far, though some took many years. The drop is the price of admission for the long-run return.",
    example: "After a 30% fall, $100,000 is $70,000. Getting back takes a 43% rise. After a 50% fall, it takes a 100% rise.",
    remember: "Expect several big falls in your life. They aren't a sign that something is broken.",
    rule: { id: "stay-invested", label: "Stay invested through crashes" },
  },
  {
    id: "edu-time-in-market",
    unit: "markets",
    title: "Time in the market beats timing it",
    idea: "Nobody reliably predicts markets, so stop trying.",
    explain:
      "To time the market you must be right twice: when to sell and when to buy back. The best days often come right after the worst days, while people are still out. Missing just a handful of them can badly cut a long-term return. Holding cash and waiting for a dip has usually cost more than the dip itself.",
    example: "An investor who buys only at the worst moment each year, the market's yearly peak, has still historically done far better than one who stayed in cash.",
    remember: "The best plan is boring: buy regularly and keep holding.",
    rule: { id: "dollar-cost-average", label: "Invest on a schedule" },
  },
  {
    id: "edu-dca",
    unit: "markets",
    title: "Dollar-cost averaging",
    idea: "Investing the same amount every month turns falling prices into a sale.",
    explain:
      "When prices drop, your fixed amount buys more shares. When they rise, it buys fewer. Over time this smooths out what you pay, and it removes the need to guess. It is what every pension contribution already does. For a young investor, a fall is actually good news, since you will be buying for decades.",
    example: "$300 a month at $30, $20 and $25 buys 10, 15 and 12 shares. That is an average cost of $24.32, below the average price of $25.",
    remember: "You are a buyer for decades. Lower prices help you.",
    rule: { id: "dollar-cost-average", label: "Invest on a schedule" },
  },
  {
    id: "edu-rebalancing",
    unit: "markets",
    title: "Rebalancing",
    idea: "A yearly tidy-up keeps your risk where you set it.",
    explain:
      "Winners grow to take up more of your portfolio, so your risk rises over time. Rebalancing trims what grew and tops up what lagged. It feels wrong, because you are selling what is doing well, and that is exactly why it works. Once a year is plenty, and all-in-one funds do it for you.",
    example: "An 80/20 mix at $100,000: stocks rise 30%, making $104,000 and $20,000, about 84/16. Move $4,800 into bonds to return to 80/20.",
    remember: "Rebalance by the calendar, not by your feelings.",
    rule: { id: "rebalance", label: "Rebalance once a year" },
  },
  {
    id: "edu-behaviour",
    unit: "markets",
    title: "Your brain is the biggest risk",
    idea: "Investing is more about behaviour than about maths.",
    explain:
      "Humans feel losses about twice as strongly as gains, so we sell at the bottom. We chase what recently went up, follow the crowd, and trust our own predictions too much. Checking too often makes it worse. The fix is a written plan, automation, and looking at your balance less often.",
    example: "Studies of fund investors repeatedly find they earn less than the funds they own, because they buy after rises and sell after falls.",
    remember: "Make your plan when you are calm. Follow it when you are not.",
  },
  {
    id: "edu-hype",
    unit: "markets",
    title: "Hype, tips and get-rich-quick",
    idea: "If everyone is talking about it, you are probably late.",
    explain:
      "Hot stocks, meme coins, trading courses and tips from friends all rely on the same feeling: fear of missing out. The stories you hear are the winners. The many who lost stay quiet. Day traders as a group lose money, and the people selling courses earn from the courses. If you want to speculate, cap it at 5% of your portfolio, with money you can afford to lose.",
    example: "A coin up 500% last year tells you nothing about next year. Most such assets have fallen 80% or more at some point.",
    remember: "Getting rich slowly works. Almost nothing else does.",
    rule: { id: "avoid-scams", label: "Spot a money scam" },
  },
];

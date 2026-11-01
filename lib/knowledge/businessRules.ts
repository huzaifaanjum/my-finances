// Earning outside your job: what to check, how it is taxed, and how to keep more. The Revenue streams page has the full steps.

import type { Rule } from "./rules";

const G = "Side income and business";
const INCOME = { href: "/income", label: "Revenue streams" };

export const BUSINESS_RULES: Rule[] = [
  {
    id: "check-before-side-work",
    group: G,
    title: "Check your permit and contract first",
    summary: "Your job and status are worth far more than any side income.",
    plain:
      "Before you earn anything outside your job, check two things. First, does your work permit allow self-employment? An open permit generally does, and an employer-specific permit generally doesn't. Second, does your employment contract limit outside work or claim what you build?",
    why: "Side income might add a few thousand dollars a year. Your salary is $95,000, and your status depends on keeping to your permit. The risk only makes sense once this is confirmed.",
    example: "Earning $5,000 from a project without permission could put a $95,000 salary and your immigration plans at risk: a bad trade at any price.",
    you: "Your offer ends your job if your permit lapses. Ask IRCC or a licensed consultant, and keep all your projects on your own laptop, accounts and time.",
    link: INCOME,
  },
  {
    id: "income-order",
    group: G,
    title: "Choose ideas by what your time earns",
    summary: "Compare ideas by money per hour, and by whether it keeps paying.",
    plain:
      "Income ideas fall into two kinds. Quick ones pay once and stop when you stop. Recurring ones pay slowly at first, and can keep paying after the work is done. Most people should start with something quick that funds and teaches them, then build one recurring stream.",
    why: "Having a long list is motivating, but doing ten things at once earns nothing. One focused try for three months tells you more than a year of planning.",
    example: "Freelancing at $80 an hour pays this month. A micro-SaaS may pay nothing for a year, then $500 a month for years. Surveys at $5 an hour are rarely worth your time.",
    you: "Your highest-paying idea is probably still your job: a promotion compounds through pension and bonus. Rank side ideas against that, and against rest.",
    link: INCOME,
  },
  {
    id: "side-income-tax",
    group: G,
    title: "Set aside 40% of side profit",
    summary: "No tax is withheld, so save it the day you are paid.",
    plain:
      "Business profit is added to your salary, so every dollar is taxed at your top rate. Nobody withholds it for you. The tax comes due at filing time, and it surprises many people in their first year. Move a share of every payment to a separate savings account right away.",
    why: "Spending money that belongs to the tax agencies is how side businesses create debt. A separate account removes the risk and earns interest in the meantime.",
    example: "$10,000 of side profit on top of your salary costs about $3,600 in income tax, so setting aside $4,000 covers it. Above roughly $19,000 of profit, your rate climbs to about 41%, so set aside 45% once profit passes about $40,000.",
    you: "Your salary is already above the QPP ceiling, so in a full year side profit should add little or no QPP. You report it on forms T2125 and TP-80.",
    demo: "sideIncome",
    link: INCOME,
  },
  {
    id: "business-expenses",
    group: G,
    title: "Deduct real business costs",
    summary: "You pay tax on profit, so every genuine cost lowers it.",
    plain:
      "You are taxed on profit, which is revenue minus reasonable business costs. Software, hosting, a domain, equipment, payment fees, accounting, courses and a share of home costs if you qualify can all count. Costs must be for earning income, and mixed personal costs only count for the business share.",
    why: "At a 36% rate, a $100 cost really costs about $64. That doesn't make spending worthwhile, but it does make keeping receipts worthwhile.",
    example: "$12,000 of revenue with $2,000 of costs is $10,000 of profit. Without tracking those costs, you would pay about $720 more tax.",
    you: "Get one business card and one folder for receipts from day one. Keep them for six years. Your first accountant visit will pay for itself.",
    link: INCOME,
  },
  {
    id: "sole-prop-or-incorporate",
    group: G,
    title: "Sole proprietor or incorporate",
    summary: "Start as a sole proprietor. Incorporate when profit or risk justifies it.",
    plain:
      "A sole proprietorship is you, doing business. It costs $41, profit goes on your personal return, and you have no legal shield. A corporation is a separate legal person. It has more costs and paperwork, but it can limit your personal risk and delay some tax on profit you leave in the company.",
    why: "Incorporating early adds cost with little benefit. Tax delay only helps on money you don't need to spend, and you still have to take it out one day.",
    example: "$5,000 of side profit doesn't justify about $400 in government fees plus yearly filings and accounting. Profit you keep in the business, well into five figures every year, might.",
    you: "Start as a sole proprietor, and carry liability insurance if client work adds risk. Revisit it with an accountant if profit grows.",
    link: INCOME,
  },
  {
    id: "brand-name-quebec",
    group: G,
    title: "A brand name means registering",
    summary: "Use anything but your own name and you must register with the REQ.",
    plain:
      "Operating under your own first and last name doesn't need registration. Using a brand does, within 60 days of starting. The name must be in French, though the distinctive part can be in another language when a French generic word goes with it.",
    why: "It is only $41, and banks and payment services want to see it. A registered name doesn't give you trademark rights, so it doesn't stop copycats.",
    example: "Nimbus alone wouldn't pass. Studio Nimbus or Logiciels Nimbus should, since Studio or Logiciels says what you do. Your product can still be called Nimbus.",
    you: "Search the REQ, the Canadian trademarks database and domains before you commit. Add the $41 yearly update to your calendar, since being late adds a 50% penalty.",
    link: INCOME,
  },
  {
    id: "gst-qst-limit",
    group: G,
    title: "The $30,000 GST and QST line",
    summary: "Below it, charging tax is optional. Above it, you must register.",
    plain:
      "You are a small supplier while worldwide taxable sales stay at $30,000 or less over four calendar quarters. Above that, you must register and charge tax. You may register sooner, which lets you claim back the tax you pay on business costs. In Quebec, Revenu Québec handles both.",
    why: "Missing the limit can leave you owing tax you never collected. Registering early is great with business clients, but it raises the price for consumers.",
    example: "A Quebec client pays 14.975% on top of your invoice. On $1,000, that is $149.75, which you send to the government. A business client normally claims it back.",
    you: "Set an alert at $25,000 of sales. The limit looks at sales, not profit, and it covers worldwide sales.",
    link: INCOME,
  },
  {
    id: "merchant-of-record",
    group: G,
    title: "Who handles sales tax around the world",
    summary: "Be the seller and do the tax yourself, or pay a merchant of record to.",
    plain:
      "Selling digital products abroad brings sales tax rules from other countries. The EU has no minimum sales threshold for sellers outside the EU who sell to consumers there. A merchant of record is legally the seller, so it collects and files that tax, handles disputes, and pays you the rest.",
    why: "Tax in dozens of countries is a real job. A merchant of record can cost only a little more per sale, and it lets one person sell worldwide on day one.",
    example: "On a $20 US subscription, Stripe leaves $18.82 and Creem leaves $18.82, with global tax handled. Paddle leaves $18.50. Selling to Canadian businesses, Stripe is cheaper, and the tax is simple.",
    you: "Selling to businesses in Canada and the US? Start with Stripe. Selling to consumers worldwide? Start with a merchant of record.",
    demo: "paymentFees",
    link: INCOME,
  },
  {
    id: "payment-fees",
    group: G,
    title: "Keep more of every sale",
    summary: "The biggest fee savings come from how you are paid, not from the provider.",
    plain:
      "Most fees have a percentage and a fixed part. The fixed part hurts small sales, and the percentage hurts big ones. So use a bank transfer for large invoices, avoid very low prices, offer yearly plans, keep US dollars as US dollars, and skip extras such as instant payouts.",
    why: "Fees come off revenue, not profit, so 3% of revenue can be a far bigger share of what you make. Most fixes take minutes and repeat on every sale.",
    example: "A $5,000 card payment costs about $145, and a bank transfer costs next to nothing. A $5 sale loses 8.9% to fees on Stripe, while a $50 sale loses 3.5%. Converting US$1,000 costs $20 on Stripe and $40 on PayPal.",
    you: "Open a USD account before your first American customer. Put bank transfer first on your invoices.",
    demo: "paymentFees",
    link: INCOME,
  },
  {
    id: "price-your-work",
    group: G,
    title: "Price your freelance work properly",
    summary: "Your rate must cover unpaid hours, costs and tax.",
    plain:
      "An hourly rate isn't the same as a salary divided by hours. You don't get paid for sales, emails or admin, and you have no benefits or paid vacation. Work back from the profit you want, your costs and your real billable hours. Then consider fixed-price work, so you earn more as you get faster.",
    why: "New freelancers usually charge too little, and low prices attract the hardest clients. Raising your rate earns more for the same hours.",
    example: "$20,000 of profit plus $1,500 of costs, at 8 billable hours a week for 44 weeks, needs about $61 an hour. After tax on top of your salary, you keep about $12,700.",
    you: "Your evenings are limited, so a higher rate with fewer clients beats many small jobs. Protect your sleep and your day job.",
    demo: "freelanceRate",
    link: INCOME,
  },
  {
    id: "client-basics",
    group: G,
    title: "Protect yourself on client work",
    summary: "A written contract, a deposit and a clear scope.",
    plain:
      "Before starting, agree in writing on what you will deliver, the price, who owns the code, how changes are handled, and a limit on your liability. Ask for a deposit, often 30 to 50%. In Quebec, standard-form contracts need a French version first.",
    why: "As a sole proprietor, a client's claim can reach your personal savings. Most problems come from unclear scope, and a deposit filters out people who won't pay.",
    example: "On a $3,000 site, a 50% deposit means you are never more than $1,500 at risk. A change-request line stops a small job from turning into twice the work at the same price.",
    you: "Have a lawyer check one template once, then reuse it. Add professional liability insurance before bigger contracts.",
    link: INCOME,
  },
  {
    id: "law-25-basics",
    group: G,
    title: "Law 25: privacy applies to small businesses too",
    summary: "Collect personal data and you have duties, even as one person.",
    plain:
      "Quebec's privacy law applies to anyone in business collecting personal information, such as user emails. You need a person in charge of privacy, which is you by default, a plain privacy policy, a way to respond to requests, and a process if data leaks. Collect only what you need.",
    why: "The easiest data to protect is data you never collected. Good privacy practice also helps you win business clients.",
    example: "A newsletter signup needs an email, not a birthday. Asking for less means less to secure, explain and disclose.",
    you: "Publish a privacy policy naming the person in charge before your first signup. Even a small app needs this.",
    link: INCOME,
  },
  {
    id: "validate-first",
    group: G,
    title: "Get paid before you build much",
    summary: "Most products fail from lack of customers, not from bad code.",
    plain:
      "Developers tend to build first and look for customers later. Do it the other way around. Find a problem people already complain about, talk to them, and ask for money or a pre-order before building the whole thing. A real payment is the only proof that counts.",
    why: "It can save months of evenings. For a solo builder, time is the scarcest resource, and reaching a no quickly is a win.",
    example: "Five people paying $20 up front proves more than 500 people saying it's a nice idea. If nobody pays after 20 conversations, change the idea and save the months.",
    you: "Aim for five paying strangers in your first 90 days. Friends don't count, because they are being kind.",
    link: INCOME,
  },
  {
    id: "recurring-income-math",
    group: G,
    title: "How recurring income really grows",
    summary: "Churn sets a ceiling. Growth stops when cancellations match sign-ups.",
    plain:
      "Subscribers come in the top and leak out the bottom. Churn is the share who cancel each month. With steady sign-ups, income grows quickly, then flattens at a ceiling: new customers per month divided by the churn rate. To grow past it, get more sign-ups, keep more customers or raise your price.",
    why: "It shows where to work. Cutting churn or raising prices often beats chasing more sign-ups, and it costs less.",
    example: "10 new subscribers a month at $20, with 5% churn, gives about $1,840 a month after one year, and a ceiling of $4,000. Halve the churn and the ceiling doubles to $8,000.",
    you: "Before building a subscription, estimate your churn honestly. Yearly plans reduce it, and they reduce your payment fees as well.",
    demo: "subscriptionGrowth",
    link: INCOME,
  },
  {
    id: "build-an-audience",
    group: G,
    title: "Content pays slowly, then compounds",
    summary: "An audience takes a year or more, but it can sell everything else.",
    plain:
      "YouTube, newsletters and blogs rarely pay in the first year. YouTube ads need 1,000 subscribers and 4,000 watch hours, rising to 8,000 hours in February 2027. The real value is an audience you can reach for free, who may buy a product, a course or your services.",
    why: "Marketing is the hardest part of any product. An audience solves it, and old content keeps working while you sleep.",
    example: "A weekly video for a year is 52 pieces of work that can keep bringing viewers. Direct ad income may stay small, but one $200 course sold to 100 viewers is $20,000.",
    you: "Pick one topic you could discuss for years, such as coding or newcomer money. Keep your employer out of it, and check your permit before monetizing.",
    link: INCOME,
  },
  {
    id: "income-tax-calendar",
    group: G,
    title: "Know your self-employed tax dates",
    summary: "File by June 15, but pay by April 30.",
    plain:
      "Self-employed people have until June 15 to file, but any balance owing is still due by April 30, and interest starts after that. If you owe more than about $1,800 at tax time two years running, expect quarterly instalments on March 15, June 15, September 15 and December 15.",
    why: "The June date catches many people out. Paying on April 30 avoids interest, even if you file later.",
    example: "$4,000 owing on side profit is due April 30, even if you file on June 10. The tax account you built during the year covers it.",
    you: "Your year: REQ update, April 30 payment, then June 15 filing. Put all three in your calendar now.",
    link: INCOME,
  },
];

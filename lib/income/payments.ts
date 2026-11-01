// How to take payments and keep the most of each sale. Rates are from each service's own pricing page, November 2026.

import type { TrackItem } from "./business";

export interface PaymentService {
  id: string;
  label: string;
  /** one line under the tab label */
  note: string;
  bestFor: string;
  watch: string;
  /** the prices that matter */
  rates: { name: string; value: string }[];
  steps: string[];
}

export const PICKS: { when: string; use: string; why: string }[] = [
  { when: "Invoicing a client in Canada", use: "Interac e-Transfer or bank transfer", why: "Little or no fee. A $5,000 invoice paid by card costs $145." },
  { when: "Invoicing a business abroad", use: "Wire, or Stripe invoice", why: "Ask them to pay into your USD account." },
  { when: "Web app for Canadian or US businesses", use: "Stripe", why: "Lowest cost that does everything. You handle sales tax yourself." },
  { when: "Web app or download for consumers worldwide", use: "Creem, or Paddle", why: "They take on global tax. Creem can match Stripe on international subscriptions, and Paddle is the longer-established choice at a little more." },
  { when: "Your first digital product, this weekend", use: "Gumroad", why: "No setup at all. Move when sales justify it, since 10% is expensive." },
  { when: "iPhone or Android app", use: "App stores, plus a web option", why: "Often required for in-app digital sales. Sell on the web too, where the rules allow it." },
  { when: "Open source support", use: "GitHub Sponsors", why: "0% on sponsorships from personal accounts." },
];

export const MOR_EXPLAINED =
  "A merchant of record is the legal seller. It charges the customer, collects and files sales tax in each country, and handles fraud and disputes, then pays you what is left. With Stripe, you are the seller, so those jobs are yours. That is the real choice: pay a little more per sale, sometimes nothing extra, or do the tax work yourself.";

export const SERVICES: PaymentService[] = [
  {
    id: "stripe",
    label: "Stripe",
    note: "2.9% + 30¢",
    bestFor: "Web apps and SaaS, especially selling to businesses or mostly in Canada and the US.",
    watch: "You are the seller, so you are responsible for sales tax everywhere. Add-ons stack up: Billing 0.7%, Tax 0.5%. Processing fees usually aren't returned when you give a customer their money back.",
    rates: [
      { name: "Canadian cards", value: "2.9% + CA$0.30" },
      { name: "International cards", value: "+ 0.8%" },
      { name: "Currency conversion", value: "+ 2%" },
      { name: "Subscriptions (Billing)", value: "+ 0.7%" },
      { name: "Pre-authorised debit", value: "1% + CA$0.40, capped at CA$5" },
      { name: "Invoicing", value: "0.4% per paid invoice" },
      { name: "Tax calculation", value: "0.5% per sale, or CA$0.50 by API" },
      { name: "Full tax filing (Tax Complete)", value: "From CA$120 a month" },
      { name: "Disputes", value: "CA$15, returned if you win a countered dispute" },
      { name: "Instant payout", value: "1%, minimum CA$0.60" },
      { name: "Monthly fee", value: "None" },
    ],
    steps: [
      "Create an account and choose sole proprietorship, with your NEQ and business name",
      "Add your bank accounts, CAD and USD",
      "Set the statement name customers will recognise",
      "Create your products and prices in test mode",
      "Add Stripe Checkout, the hosted page, instead of building your own",
      "Add a webhook endpoint for paid, failed and cancelled events",
      "Turn on the customer portal for cards and cancellations",
      "Turn on Smart Retries and failed-payment emails",
      "Test with Stripe's test cards, including a declined card",
      "Switch to live keys and make one real small purchase",
    ],
  },
  {
    id: "paddle",
    label: "Paddle",
    note: "5% + 50¢, tax included",
    bestFor: "Selling SaaS or software to consumers worldwide without thinking about tax.",
    watch: "Paddle reviews your product first, and it is for software and digital products only. Payouts are less flexible than your own Stripe balance.",
    rates: [
      { name: "Per sale", value: "5% + 50¢" },
      { name: "Monthly fee", value: "None" },
      { name: "Included", value: "Global tax, fraud, chargebacks, buyer support" },
    ],
    steps: [
      "Sign up with your business details",
      "Publish your site with pricing, terms, privacy and refund pages for approval",
      "Build in the sandbox first",
      "Add Paddle's checkout overlay to your pricing page",
      "Handle webhooks to unlock paid features",
      "Set your payout account",
      "Go live with one test purchase",
    ],
  },
  {
    id: "creem",
    label: "Creem",
    note: "3.9% + 40¢, tax included",
    bestFor: "The lowest published merchant of record rate, for SaaS and AI apps.",
    watch: "A younger company than Paddle, so read its terms and keep your customer data exportable. Payouts run on the 1st and 15th.",
    rates: [
      { name: "Per sale", value: "3.9% + US$0.40" },
      { name: "Monthly fee", value: "None" },
      { name: "International card fee", value: "None" },
      { name: "Included", value: "Tax in 50+ countries, invoices, chargeback protection" },
    ],
    steps: [
      "Sign up and complete store verification",
      "Create your products",
      "Build in test mode",
      "Add checkout links or the API to your app",
      "Handle webhooks to unlock access",
      "Export your customer list regularly",
    ],
  },
  {
    id: "polar",
    label: "Polar",
    note: "5% + 50¢, or less on plans",
    bestFor: "Developers selling licences, usage-based billing or digital downloads.",
    watch: "Non-US cards add 1.5%, so a Canadian buyer costs you more. The US$20 Pro plan only pays off above about US$1,379 a month in sales. Disputes cost US$15.",
    rates: [
      { name: "Starter", value: "5% + 50¢, free" },
      { name: "Pro", value: "3.8% + 40¢, US$20 a month" },
      { name: "Growth", value: "3.6% + 35¢, US$100 a month" },
      { name: "Non-US cards", value: "+ 1.5%" },
    ],
    steps: ["Create an organisation", "Add your products and prices", "Use the sandbox to test", "Add checkout to your app with the SDK", "Handle webhooks", "Move to Pro when monthly sales pass the break-even"],
  },
  {
    id: "managed",
    label: "Managed Payments",
    note: "Stripe + 3.5%",
    bestFor: "Staying on Stripe while Stripe becomes the merchant of record.",
    watch: "About 6.4% + 30¢ in total, the highest of the main options, and more on international cards. Automated digital products only, not coaching or services. Confirm Canadian eligibility in your dashboard.",
    rates: [
      { name: "Managed Payments", value: "3.5% on top of Stripe's fees" },
      { name: "Included", value: "Tax in 75+ countries, fraud, disputes, support" },
    ],
    steps: ["Set up a normal Stripe account", "Confirm your business and product are eligible", "Enable Managed Payments on your Checkout integration", "Test it", "Compare the cost with Paddle and Creem at your price"],
  },
  {
    id: "paypal",
    label: "PayPal",
    note: "2.9% + 30¢",
    bestFor: "A second option at checkout, for customers who won't enter a card.",
    watch: "Currency conversion costs 4%, the worst here. Keep money in USD, and withdraw to a USD account. Standard disputes cost CA$20.",
    rates: [
      { name: "Domestic", value: "2.9% + CA$0.30" },
      { name: "US buyers", value: "+ 0.8%" },
      { name: "Other countries", value: "+ 1%" },
      { name: "Currency conversion", value: "4% on payments" },
      { name: "Pay Later", value: "4.9% + fixed fee" },
      { name: "Dispute", value: "CA$20" },
    ],
    steps: ["Open a Business account under your business name", "Link your CAD and USD bank accounts", "Hold USD in PayPal rather than auto-converting", "Add PayPal as an option through your main checkout", "Withdraw without conversion"],
  },
  {
    id: "square",
    label: "Square",
    note: "2.8% + 30¢",
    bestFor: "Selling in person, at events, or simple online invoices in Canada.",
    watch: "Cards from outside Canada add 1.5%, so it is expensive for US sales. It is not built for global SaaS.",
    rates: [
      { name: "Online and invoices", value: "2.8% + 30¢" },
      { name: "In person, credit", value: "2.5%" },
      { name: "In person, debit", value: "0.75% + 7¢" },
      { name: "Card on file or keyed", value: "3.3% + 15¢" },
      { name: "Cards from outside Canada", value: "+ 1.5%" },
    ],
    steps: ["Create an account", "Add your bank account", "Send a test invoice", "Get a reader if you sell in person"],
  },
  {
    id: "helcim",
    label: "Helcim",
    note: "Interchange + 0.5% + 25¢",
    bestFor: "Canadian card sales once you have steady volume, since it can beat flat rates.",
    watch: "You pay the card network's actual cost plus a margin, so the total varies by card. Our calculator uses an estimate. Fewer developer tools than Stripe.",
    rates: [
      { name: "Online margin, first tier", value: "Interchange + 0.5% + 25¢" },
      { name: "Monthly fee", value: "None" },
    ],
    steps: ["Apply with your business details", "Add your bank account", "Connect the API or hosted payment page", "Compare your real cost to Stripe after a month"],
  },
  {
    id: "stores",
    label: "App stores",
    note: "15% under US$1M",
    bestFor: "Mobile apps, where the store brings customers and trust.",
    watch: "Enrol in Apple's Small Business Program or you pay 30%. Rules on linking to outside payment change by country and are still shifting in the US. As a sole proprietor, your personal name usually shows as the seller on Apple.",
    rates: [
      { name: "Apple, Small Business Program", value: "15% under US$1M" },
      { name: "Apple, standard", value: "30%, 15% on qualifying subscriptions" },
      { name: "Apple Developer Program", value: "US$99 a year" },
      { name: "Google Play, first US$1M", value: "15%" },
      { name: "Google Play subscriptions", value: "15%" },
      { name: "Google Play account", value: "US$25 once" },
    ],
    steps: ["Enrol in the Apple Developer Program", "Join the Small Business Program", "Create a Google Play account and enrol in the 15% tier", "Set up in-app purchases and subscriptions", "Consider RevenueCat to handle both stores", "Sell on your website too, where the rules allow"],
  },
  {
    id: "direct",
    label: "Bank and Interac",
    note: "Almost free",
    bestFor: "Client invoices. The cheapest way to be paid.",
    watch: "No automation, so it suits a few big payments rather than many small ones. Bank limits apply to e-Transfers, and wires can have fees on both sides.",
    rates: [
      { name: "Interac e-Transfer", value: "Often free, depending on your account" },
      { name: "Bank wire", value: "Your bank's fee" },
      { name: "GitHub Sponsors, personal accounts", value: "0%" },
      { name: "GitHub Sponsors, organisations", value: "Up to 6%" },
    ],
    steps: ["Put your payment details on your invoice template", "Set up e-Transfer autodeposit", "Get your USD account details for foreign clients", "Ask for a deposit before starting work", "Add late-payment terms to your contract"],
  },
];

export const INTEGRATE_STEPS: string[] = [
  "Create the checkout on your server, never trust a price from the browser",
  "Keep secret keys in environment variables, never in client code",
  "Use the hosted checkout page, so card data never touches your server",
  "Treat the webhook as the source of truth, not the success page",
  "Verify every webhook signature",
  "Make webhooks safe to run twice, by storing each event ID",
  "Store customer ID, plan and status against your user",
  "Check that status on the server before giving paid access",
  "Handle failed renewals with a grace period and an email",
  "Give users a way to cancel and update their card",
  "Send receipts with your business name and any tax numbers",
  "Test paid, failed, refunded, disputed and cancelled flows before launch",
];

export const KEEP_MORE: TrackItem[] = [
  { id: "tip-direct", title: "Get big invoices paid by bank", summary: "Save about $140 on every $5,000.", tags: ["Biggest saving"], steps: [], body: [{ title: "How", text: "A $5,000 card payment costs $145 at 2.9% + 30¢. Pre-authorised debit is capped at CA$5, and an e-Transfer or bank transfer often costs nothing. Make bank transfer the default on your invoices." }] },
  { id: "tip-usd", title: "Keep US dollars as US dollars", summary: "Avoid 2% on Stripe and 4% on PayPal.", tags: ["Biggest saving"], steps: [], body: [{ title: "How", text: "On US$1,000 of sales, conversion costs $20 on Stripe and $40 on PayPal. Add a USD bank account, and convert later on your own terms, at a lower-cost service, only when you need CAD." }] },
  { id: "tip-web", title: "Sell on the web, not in the app, where allowed", summary: "Around 4% rather than 15%.", tags: ["Biggest saving"], steps: [], body: [{ title: "How", text: "A $10 sale costs $1.50 in a store and about $0.59 on Stripe. Let people subscribe on your website, then log in to the app. Follow each store's rules on how you may mention that." }] },
  { id: "tip-annual", title: "Offer yearly plans", summary: "Fewer charges, and fewer people leaving.", steps: [], body: [{ title: "How", text: "$10 a month on Stripe with Billing costs $7.92 a year in fees. One $120 yearly payment costs $4.62. You get the money up front, and customers have fewer chances to cancel." }] },
  { id: "tip-price", title: "Avoid very low prices", summary: "The fixed 30¢ eats small sales.", steps: [], body: [{ title: "How", text: "On Stripe, a $5 sale loses 8.9%, and a $50 sale loses 3.5%. Bundle small items or raise the price. Charging more is the strongest fee strategy of all: a 10% price rise is worth far more than any fee cut." }] },
  { id: "tip-pass", title: "Skip add-ons you don't need", summary: "Each one takes a slice of every sale.", steps: [], body: [{ title: "How", text: "Instant payouts cost 1%, so wait for the free standard schedule. Don't offer Klarna, at 5.99% and up. Stripe Tax is unnecessary until you are registered somewhere. For a one-time product, skip Billing's 0.7% altogether." }] },
  { id: "tip-disputes", title: "Prevent disputes", summary: "Each one costs $15 to $20, on top of the lost sale.", steps: [], body: [{ title: "How", text: "Use a statement name people recognise, send receipts, make cancelling easy, and give money back quickly when someone asks. That is cheaper than a dispute." }] },
  { id: "tip-retry", title: "Recover failed renewals", summary: "Failed cards are silent lost income.", steps: [], body: [{ title: "How", text: "Turn on automatic retries and card-update emails. Cards expire every few years, and without this you lose subscribers who never meant to leave." }] },
  { id: "tip-fx", title: "Price in the customer's currency, on purpose", summary: "Choose USD as your main price.", steps: [], body: [{ title: "How", text: "Most software is priced in USD. Pricing in USD and being paid into a USD account means no conversion on the largest market. Canadian customers can see CAD prices that you set yourself." }] },
  { id: "tip-deduct", title: "Claim every fee on your taxes", summary: "A $100 fee really costs about $64.", steps: [], body: [{ title: "How", text: "Payment fees are a business expense, so they lower the profit taxed at about 36%. Keep your monthly fee statements from each service." }] },
  { id: "tip-renegotiate", title: "Ask for a better rate as you grow", summary: "Stripe offers custom pricing at volume.", steps: [], body: [{ title: "How", text: "Once you process serious volume, ask for custom or interchange-plus pricing, and compare it with Helcim for Canadian cards. Don't bother at small volumes." }] },
];

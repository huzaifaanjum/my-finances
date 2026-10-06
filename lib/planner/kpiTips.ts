// Plain-language explanations for stat cards, matched by the start of the card label (longest match wins).
const KPI_TIPS: [prefix: string, text: string][] = [
  ["Saved by", "Your projected savings at the end of the period you picked: what you have now, plus your monthly surplus, plus any bonuses."],
  ["Savings rate", "The share of your take-home pay left after all expenses. Saving 20% or more is a common target."],
  ["Emergency fund", "When your savings cover one month of expenses, and then three. This cushion protects you from a job loss or a surprise bill."],
  ["Next milestone", "The next savings level you will reach, and the month you are expected to get there."],
  ["Bonuses and one-time money", "Signing payments, the yearly incentive and other one-off money in this period, and how much of your savings they make up."],
  ["Lowest balance", "The lowest your bank account gets, usually just before payday. Below $0 means you would be overdrawn."],
  ["Balance by", "Your savings at the end of the period, after every month's deposit."],
  ["Typical month", "The average you save in a month. The first month is left out so this reflects a normal month."],
  ["Best month", "The month you save the most, usually because a bonus arrives then."],
  ["Bonuses and one-time", "All bonus and one-off money in the period, and its share of everything you save. Do not count on it for bills."],
  ["You reach", "The month your invested savings reach your target, if returns match the rate you chose."],
  ["Invest each month", "What goes into your investments each month: your surplus plus any extra you add. It grows each year by the increase you set."],
  ["You put in", "The total of your own money invested by the time you reach the target."],
  ["Growth from returns", "Money your investments earn on their own. Over long periods it can overtake what you put in."],
  ["In today's dollars", "What the target would buy in today's money once prices rise 2% a year. A million in the future buys less than a million today."],
  ["Total pension at 65", "The projected value of your Air Canada pension account when you turn 65: your contributions, Air Canada's match and the growth on both."],
  ["Your contributions", "The 6% of your salary taken from every paycheque and paid into the pension, added up until you turn 65."],
  ["Air Canada adds", "Air Canada matches your 6% with 6% of its own. It is extra pay that goes straight into your pension."],
  ["Investment growth", "What the pension fund earns by investing the contributions. Money that goes in early has the longest time to grow."],
  ["Monthly income at 65", "What you could spend each month in retirement, in today's money, from your pension, your own investments, QPP and OAS."],
  ["Monthly payment", "Your car loan payment each month. Try to keep it under 10 to 15% of take-home pay."],
  ["Extra you pay in interest", "What the loan costs on top of the car's price. A shorter loan or a lower rate cuts it."],
  ["Total cost of the car", "The price, plus sales tax, plus all the interest you pay over the life of the loan."],
  ["You borrow", "The loan amount: the price with tax, minus your down payment."],
  ["Paid off by", "The month you make your last car payment."],
  ["Left over after the payment", "Your monthly surplus after the car payment. This is what you can still save."],
];

export function kpiTip(label: string): string {
  const best = KPI_TIPS.filter(([p]) => label.startsWith(p)).sort((a, b) => b[0].length - a[0].length)[0];
  return best ? best[1] : "";
}

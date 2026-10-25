// Travel, entertainment, subscriptions and everyday spending: enjoying money without derailing the plan.

import { AEROPLAN } from "@/lib/aeroplan";
import { LSA_YEARLY } from "@/lib/benefits";
import { money } from "@/lib/format";
import { OFFER } from "@/lib/offer";
import type { Rule } from "./rules";

const G = "Travel, fun and subscriptions";

export const LIFESTYLE_RULES: Rule[] = [
  {
    id: "fun-budget",
    group: G,
    title: "Give yourself a guilt-free fun budget",
    summary: "Decide your fun money up front, then spend it without guilt.",
    plain:
      "Instead of feeling bad about every concert or dinner out, set a monthly amount for fun after savings and bills are covered. Inside that number, spend freely; when it runs out, wait for next month. It is the 'wants' part of the 50/30/20 budget, made concrete.",
    why: "Budgets fail when they feel like punishment. A fixed fun allowance keeps the plan sustainable, and the savings transfer has already happened, so fun never eats into it.",
    example: "On $4,700 take-home with 20% saved and $3,065 of needs, about $700 is left for fun: roughly $160 a week.",
    you: "Your Budget tab shows wants as subscriptions, eating out, shopping and other. Treat that total as your fun budget and let the automatic savings transfer go first.",
    demo: "funBudget",
    link: { href: "/plan", label: "Budget" },
  },
  {
    id: "sinking-fund",
    group: G,
    title: "Save for trips with a sinking fund",
    summary: "Divide the trip cost by the months until you go, and save that every month.",
    plain:
      "A sinking fund is money set aside each month for a known future cost: a trip, a festival, holiday gifts. Keep it in a separate savings account (or a labelled TFSA) so it is ready when the bill arrives.",
    why: "Trips paid on a credit card and paid off slowly cost 20% more in interest. Trips saved for in advance cost exactly what they cost, and you enjoy them without a bill afterwards.",
    example: "A $3,000 trip next August, 10 months away, is $300 a month. Start two months later and it becomes $375.",
    you: "Your travel privileges make flights cheap, so most of a trip's cost is hotels, food and activities. A small monthly sinking fund covers a lot.",
    demo: "sinkingFund",
  },
  {
    id: "travel-privileges",
    group: G,
    title: "Make the most of airline travel privileges",
    summary: "Standby flights are cheap but not guaranteed: plan with flexibility.",
    plain:
      "Airline employees can fly standby for a fraction of the normal fare, but you only board if a seat is free after paying passengers. Flexible dates, off-peak days, mid-week flights and backup options make the difference.",
    why: "Used well, privileges can cut the biggest cost of a trip close to zero. Used badly, you get stuck at a gate in peak season.",
    example: "Flying out on a Tuesday in shoulder season instead of the Friday before a long weekend makes a free seat far more likely.",
    you: `Your privileges start after 28 weeks, around Mar 1, 2027. You get ${OFFER.vacationWeeks} weeks of vacation plus ${OFFER.catchUpDays} catch-up days a year; read the Employee Travel Site rules before your first trip.`,
    link: { href: "/offer", label: "Job offer" },
  },
  {
    id: "points-value",
    group: G,
    title: "Spend points where they are worth most",
    summary: `Aeroplan points are typically worth about ${AEROPLAN.centsTypical}¢ each on flights, ${AEROPLAN.centsPremium[0]}¢ or more on partner business class, and well under 1¢ on merchandise.`,
    plain:
      "Loyalty points have no fixed value: it depends on what you redeem them for. To compare, work out cents per point: the cash price you would otherwise pay, minus the taxes and fees you still pay, divided by the points. Flights usually beat 1.5¢; gift cards and merchandise often get under 1¢.",
    why: "The same points can be worth two to five times as much with a little planning. Treat them as money and spend them where they stretch furthest.",
    example: `A $450 flight that costs 18,000 points plus $90 in taxes gets 2¢ a point. The same 18,000 points on merchandise are worth about $126.`,
    you: `Air Canada gives you ${(OFFER.aeroplanPoints / 1000).toFixed(0)},000 Aeroplan points each January, starting 2027: about $${Math.round((OFFER.aeroplanPoints * AEROPLAN.centsTypical) / 100)} at ${AEROPLAN.centsTypical}¢. Use them where standby isn't practical: for family, friends, or a guaranteed seat.`,
    demo: "aeroCpp",
    link: { href: "/benefits", label: "Benefits" },
  },
  {
    id: "aeroplan-expiry",
    group: G,
    title: "Keep Aeroplan points from expiring",
    summary: `From Nov 30, 2026, points expire after ${AEROPLAN.expiryMonths} months with no activity. Any small earn resets the clock.`,
    plain: `Aeroplan paused point expiry for a while; the pause ends Nov 29, 2026. From then on, an account with no earning, redeeming, transferring or donating for ${AEROPLAN.expiryMonths} months loses its points. Logging in or checking your balance does not count.`,
    why: "Points left alone are easy to forget. A whole yearly grant could disappear without a single trip.",
    example: `Points granted in January 2027 with no activity afterwards would expire around July 2028. One $${AEROPLAN.starbucks.load} Starbucks load in between resets the ${AEROPLAN.expiryMonths} months.`,
    you: "Your yearly grant counts as activity, so the January deposit keeps the account alive. Still, link Starbucks or Uber so something earns between grants, and check that the grant lands each January.",
    link: { href: "/benefits", label: "Benefits" },
  },
  {
    id: "aeroplan-partners",
    group: G,
    title: "Book partner flights to stretch points",
    summary: "Star Alliance partner flights use a fixed chart with no fuel surcharges, and often cost fewer points than Air Canada's own seats.",
    plain: `Air Canada flights (and a few select partners) have changing, dynamic prices. Most other Star Alliance airlines, such as Lufthansa, ANA, Swiss or United, follow Aeroplan's fixed chart based on distance and region, with no fuel surcharges added. You pay taxes plus a $${AEROPLAN.partnerFee} booking fee per partner ticket. A one-way award can include a stopover for ${AEROPLAN.stopover.toLocaleString("en-CA")} points, so one trip becomes two cities.`,
    why: "Fixed prices make partner awards predictable, and the best sweet spots, like business class to Europe, get several cents per point.",
    example: `Short flights in North America start at ${AEROPLAN.shortHaulFrom.toLocaleString("en-CA")} points one way. Business class from eastern Canada to Europe on a partner is about ${AEROPLAN.europeBusiness.toLocaleString("en-CA")} points one way, a seat that often costs $3,000 or more in cash. The chart changed on ${AEROPLAN.chartChange}, so check the current price before planning.`,
    you: `Four years of your grant (${(OFFER.aeroplanPoints * 4).toLocaleString("en-CA")} points) is a one-way business seat to Europe on a partner, or about ten short one-way flights.`,
    demo: "aeroGoal",
  },
  {
    id: "aeroplan-earn",
    group: G,
    title: "Earn Aeroplan points on what you already buy",
    summary: "Link Starbucks and Uber, shop through the eStore, and pool with family. Same spending, more points.",
    plain: `Link your Aeroplan number in the Starbucks and Uber apps: Starbucks gives ${AEROPLAN.starbucks.points} points when you load $${AEROPLAN.starbucks.load} or more, and Uber rides and Uber Eats earn too. The Aeroplan eStore pays up to ${AEROPLAN.eStoreUpTo} points per $1 at many online shops if you start there. Family Sharing lets up to ${AEROPLAN.poolMax} people pool points toward one award; leaving a pool locks you out for ${AEROPLAN.poolLockoutMonths} months.`,
    why: "None of this costs extra, and small earns also keep your points from expiring.",
    example: "Buying a $300 laptop bag through the eStore at 5 points per $1 adds 1,500 points: a quarter of a short flight.",
    you: `Aeroplan credit cards (Amex, CIBC, TD) earn more, but only help if you pay the balance in full every month; at 20%+ interest one carried balance wipes out a year of points. Elite status now uses Status Qualifying Credits (${AEROPLAN.status25K.toLocaleString("en-CA")} for 25K), and cards can add at most ${AEROPLAN.cardSqcCap.toLocaleString("en-CA")} a year.`,
    link: { href: "/benefits", label: "Benefits" },
  },
  {
    id: "trip-insurance",
    group: G,
    title: "Know what travel insurance you already have",
    summary: "Your group plan covers medical emergencies abroad; cancellation is a separate thing.",
    plain:
      "Travel medical insurance pays for emergency care outside your province. Trip cancellation, interruption and baggage insurance are separate cover that group health plans usually don't include, though some credit cards do.",
    why: "A hospital stay abroad can cost tens of thousands of dollars. Buying a duplicate policy wastes money; having none is a real risk.",
    example: "Before a trip, check: days per trip covered, whether you must call the assistance line first, and whether your credit card covers cancellation.",
    you: "Your extended health and drug plans are 'Premium with leisure travel', so emergency medical abroad is covered. Save Manulife's assistance number in your phone before you fly.",
    link: { href: "/insurance", label: "Insurance" },
  },
  {
    id: "fx-fees",
    group: G,
    title: "Avoid foreign transaction fees",
    summary: "Most cards add 2.5% to every purchase in another currency.",
    plain:
      "When you pay in a foreign currency, most Canadian credit cards add a 2.5% fee on top of the exchange rate. A few cards charge no foreign transaction fee. Also always choose to pay in the local currency when a terminal offers to convert for you; that 'convenience' rate is usually worse.",
    why: "It is invisible on each purchase but adds up over a trip, and it is completely avoidable.",
    example: "Spending $3,000 abroad on a regular card costs about $75 in fees. On a no-FX-fee card it costs $0.",
    you: "If you plan to use travel privileges often, a no-foreign-fee card pays for itself after one or two trips.",
    demo: "fxFees",
  },
  {
    id: "subscription-audit",
    group: G,
    title: "Audit your subscriptions twice a year",
    summary: "Small monthly charges add up to a big yearly number.",
    plain:
      "Streaming, music, apps, cloud storage, gyms: subscriptions renew silently and prices creep up. Twice a year, list every one, cancel what you didn't use last month, rotate streaming services instead of keeping all of them, and switch the keepers to yearly billing when it is cheaper.",
    why: "Cancelling is the only spending cut that keeps saving every month with no further effort.",
    example: "Six subscriptions at $16 each is $96 a month, $1,152 a year. Cancelling two saves $384 a year, about $5,200 over ten years if invested at 6%.",
    you: "Your Budget tab has a subscriptions group, and Insights shows it per year. Check gym fees too: a Lifestyle Spending Account claim can cover them.",
    demo: "subscriptions",
    link: { href: "/plan", label: "Budget" },
  },
  {
    id: "small-spends",
    group: G,
    title: "Small daily spends, honestly",
    summary: "Not a reason for guilt, just worth knowing what they cost a year.",
    plain:
      "Coffees, lunches out, delivery fees and taxis are small one at a time. Multiplied by working days they become one of the bigger lines in a budget. The point isn't to cut all of them, it is to keep the ones you really enjoy and drop the automatic ones.",
    why: "Seeing the yearly number turns a vague habit into a clear choice.",
    example: "A $6 coffee five days a week is about $1,560 a year. Delivery fees of $8 twice a week add another $830.",
    you: "Shopping and eating out are your biggest wants on the Budget tab. Keep the treats you love and drop the ones that are just habit.",
    demo: "smallSpends",
    link: { href: "/insights", label: "Insights" },
  },
  {
    id: "thirty-day-rule",
    group: G,
    title: "The 30-day rule for big wants",
    summary: "Wait 30 days before any unplanned purchase over a set amount.",
    plain:
      "When you want something that isn't in the budget, a new gadget, a festival pass, write it down with the date and wait 30 days. If you still want it and can pay cash from your fun budget or a sinking fund, buy it.",
    why: "Most impulse wants fade within a few weeks. The ones that don't are usually worth buying, and you buy them without regret.",
    example: "Set the threshold at $200. A $1,400 phone upgrade you still want after a month goes into a sinking fund at $350 a month for four months.",
    you: "Pair it with the fun budget: anything under the threshold is fair game, anything over waits.",
  },
  {
    id: "rewards-cards",
    group: G,
    title: "Rewards cards only pay if you pay in full",
    summary: "1 to 2% cash back disappears instantly at 21% interest.",
    plain:
      "Cash-back and points cards return 1 to 2% of what you spend, sometimes more in some categories. That only works if the full balance is paid every month: one month of interest wipes out a year of rewards. An annual fee only makes sense if the extra rewards beat it.",
    why: "Used with autopay of the full balance, a rewards card is free money on spending you'd do anyway. Carried, it's one of the most expensive loans there is.",
    example: "$1,500 a month at 1.5% back is $270 a year. Carrying $1,500 for a year at 20.99% costs about $315.",
    you: "Clear the current card balance first, then set autopay to the full statement. After that, pick a card that matches where you spend most.",
    demo: "rewards",
    link: { href: "/recommendations", label: "Action plan" },
  },
  {
    id: "bills-negotiate",
    group: G,
    title: "Negotiate phone and internet once a year",
    summary: "Promotional prices expire quietly; a phone call usually gets them back.",
    plain:
      "Phone, internet and streaming bundles start with promotional pricing that rises after 12 or 24 months. Once a year, compare current offers from other providers and call your provider's retention or loyalty team. Asking politely whether they can match a competitor's price works more often than not.",
    why: "It's one of the easiest ways to cut a fixed cost, and the saving repeats every month.",
    example: "Bringing a $95 internet bill down to $65 saves $360 a year for a 20-minute call.",
    you: `Put a reminder in your calendar for the month each promotion ends. Fitness extras you pay for might also be claimable from your ${money(LSA_YEARLY)} Lifestyle Spending Account.`,
    demo: "bills",
  },
];

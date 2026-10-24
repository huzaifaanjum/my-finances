// Money and tax dates from the offer letter and Canadian tax rules.

export const KEY_DATES: { date: string; label: string; what: string }[] = [
  { date: "2026-12-31", label: "Dec 31, 2026", what: "Last day to contribute to an FHSA and claim it on your 2026 return (open the account first)" },
  { date: "2027-01-31", label: "Jan 2027", what: "Air Canada's yearly 15,000 Aeroplan points are granted" },
  { date: "2027-02-17", label: "Feb 17, 2027", what: "Probation ends. First $2,500 signing payment (gross), if still employed" },
  { date: "2027-02-28", label: "End Feb 2027", what: "T4 and RL-1 tax slips arrive. Then you can file" },
  { date: "2027-03-01", label: "Mar 1, 2027", what: "RRSP deadline for your 2026 return. Travel privileges start (28 weeks)" },
  { date: "2027-04-30", label: "Apr 30, 2027", what: "File your federal and Quebec returns" },
  { date: "2027-05-31", label: "May 2027", what: "Expected refund of about $1,400 (estimate)" },
  { date: "2027-08-17", label: "Aug 17, 2027", what: "Second $2,500 signing payment (gross)" },
];

const DAY = 864e5;

/** Dates still ahead, with whole days left (0 = today). */
export function upcomingDates(now = Date.now()) {
  return KEY_DATES.map((k) => ({ ...k, days: Math.ceil((new Date(`${k.date}T23:59:59`).getTime() - now) / DAY) })).filter((k) => k.days >= 0);
}

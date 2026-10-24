// The app's pages, grouped for the nav. Paths are unchanged from before the regrouping, so old links still work.

export interface NavPage {
  href: string;
  label: string;
  /** one line under the label in menus */
  note: string;
}

export interface NavGroup {
  label: string;
  pages: NavPage[];
}

/** A top-level nav entry: one page, or a group that opens a menu. */
export type NavItem = NavPage | NavGroup;

export const NAV: NavItem[] = [
  { href: "/", label: "Overview", note: "Everything at a glance" },
  {
    label: "Money",
    pages: [
      { href: "/plan", label: "Budget", note: "Income, expenses and your projection" },
      { href: "/monthly", label: "Cash flow", note: "What you save each month and your balance" },
      { href: "/insights", label: "Insights", note: "Health check and key insights from every tab" },
    ],
  },
  {
    label: "Goals",
    pages: [
      { href: "/goals", label: "Home & car", note: "Saving for a home and a car" },
      { href: "/millionaire", label: "Investing", note: "Your road to a million" },
      { href: "/pension", label: "Retirement", note: "Pension, QPP and OAS at 65" },
    ],
  },
  {
    label: "Work",
    pages: [
      { href: "/payslips", label: "Payslips", note: "Encrypted payslips, breakdown and forecast" },
      { href: "/benefits", label: "Benefits", note: "Checklist to use every benefit" },
      { href: "/insurance", label: "Insurance", note: "Coverage, claim limits and costs" },
      { href: "/offer", label: "Job offer", note: "Your Air Canada offer and total pay" },
    ],
  },
  { href: "/recommendations", label: "Action plan", note: "Next steps, where to put money, checklist" },
  {
    label: "Learn",
    pages: [
      { href: "/knowledge", label: "Knowledge", note: "Money rules with calculators" },
      { href: "/glossary", label: "Glossary", note: "Plain-language money words" },
    ],
  },
];

export const isGroup = (i: NavItem): i is NavGroup => "pages" in i;

/** Every page, flat. */
export const ROUTES: NavPage[] = NAV.flatMap((i) => (isGroup(i) ? i.pages : [i]));

export type RouteHref = string;

/** The page a pathname belongs to (sub-pages such as /goals/house count as their parent). */
export function activeRoute(pathname: string): RouteHref {
  const hit = ROUTES.find((r) => r.href !== "/" && (pathname === r.href || pathname.startsWith(`${r.href}/`)));
  return hit ? hit.href : "/";
}

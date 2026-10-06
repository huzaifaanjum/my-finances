export const ROUTES = [
  { href: "/", label: "Overview" },
  { href: "/plan", label: "Plan" },
  { href: "/insights", label: "Insights" },
  { href: "/monthly", label: "Month by month" },
  { href: "/goals", label: "Goals" },
  { href: "/millionaire", label: "Millionaire" },
  { href: "/pension", label: "Pension" },
  { href: "/offer", label: "My offer" },
  { href: "/knowledge", label: "Knowledge" },
] as const;

export type RouteHref = (typeof ROUTES)[number]["href"];

/** The nav entry a pathname belongs to. */
export function activeRoute(pathname: string): RouteHref {
  const hit = ROUTES.find((r) => r.href !== "/" && (pathname === r.href || pathname.startsWith(`${r.href}/`)));
  return hit ? hit.href : "/";
}

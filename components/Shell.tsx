"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Nav, { routeFor, type RouteKey } from "@/components/Nav";
import PlannerMount from "@/components/PlannerMount";

const HEAD: Record<RouteKey, { title: string; sub: string }> = {
  overview: {
    title: "Overview",
    sub: "Your savings at a glance: the key numbers, how your money grows, and what to do next.",
  },
  plan: {
    title: "Plan",
    sub: "Starts October 2026. Defaults come from your September pay stub: $4,387.37 net plus $293.53 of one-time retro deductions added back, about $4,681 a month (set to $4,680). Change any input and every page updates.",
  },
  insights: {
    title: "Insights",
    sub: "Where your money goes, how it compares with common guidelines, and what stands out.",
  },
  monthly: {
    title: "Month by month",
    sub: "Every month laid out in a table, with short and long term recommendations.",
  },
  goals: {
    title: "Goals",
    sub: "Plan the big purchases you are saving for.",
  },
  knowledge: { title: "Knowledge", sub: "" },
};

export default function Shell({ children }: { children: ReactNode }) {
  const route = routeFor(usePathname() ?? "/");

  useEffect(() => {
    document.body.dataset.route = route;
    const h = HEAD[route];
    const title = document.querySelector<HTMLElement>("header.top h1");
    const sub = document.querySelector<HTMLElement>("header.top .sub");
    if (title && h.title) title.textContent = h.title;
    if (sub && h.sub) sub.textContent = h.sub;
    document.title = `${h.title} · My Finances`;
  }, [route]);

  return (
    <>
      <Nav />
      <PlannerMount />
      {children}
    </>
  );
}

"use client";

import { memo, useEffect, useRef } from "react";
import markup from "@/lib/markup";
import { initPlanner } from "@/lib/planner";

// Mounted once in the shared layout, so the planner keeps its state while you move between pages.
function PlannerMount() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let pass: string | null = null;
    try {
      pass = localStorage.getItem("planner_pass");
    } catch {
      /* storage blocked */
    }
    if (!pass) {
      window.location.replace("/login");
      return;
    }
    initPlanner();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}

export default memo(PlannerMount);

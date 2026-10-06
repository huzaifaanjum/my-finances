"use client";

import { useEffect, useRef } from "react";
import markup from "@/lib/markup";
import { initPlanner } from "@/lib/planner";

export default function Home() {
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

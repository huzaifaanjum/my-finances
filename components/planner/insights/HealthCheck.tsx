"use client";

import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlan } from "@/components/providers/PlannerProvider";
import { SectionHeading } from "@/components/ui/text";
import { healthTiles, type HealthLevel } from "@/lib/planner/insights";

const LEVEL: Record<HealthLevel, { label: string; icon: string }> = {
  ok: { label: "Good", icon: "M3.5 8.5l3 3 6-7" },
  watch: { label: "Watch", icon: "M8 4v5M8 12v.5" },
  act: { label: "Act", icon: "M5 5l6 6M11 5l-6 6" },
};

export default function HealthCheck() {
  const tiles = healthTiles(usePlan());
  return (
    <div>
      <SectionHeading title="Health check">
        Six quick checks against common guidelines. Green is fine, amber is worth watching, red needs action.
      </SectionHeading>
      <div className="hc">
        {tiles.map((t) => (
          <GlossaryScope key={t.title}>
            <div className={`hct ${t.level}`}>
              <div className="hctt">
                <span>
                  <G>{t.title}</G>
                </span>
                <span className="pill">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d={LEVEL[t.level].icon} />
                  </svg>
                  {LEVEL[t.level].label}
                </span>
              </div>
              <div className="hcv">{t.value}</div>
              <div className="hcg">
                <G>{t.guide}</G>
              </div>
              <p>
                <G>{t.text}</G>
              </p>
            </div>
          </GlossaryScope>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Fragment } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/text";
import { guidelineRows, type GuidelineStatus } from "@/lib/planner/insights";

const STATUS: Record<GuidelineStatus, { label: string; icon: string }> = {
  good: { label: "Good", icon: "M3.5 8.5l3 3 6-7" },
  ok: { label: "OK", icon: "M4 8h8" },
  bad: { label: "Off track", icon: "M5 5l6 6M11 5l-6 6" },
};

/** Common rules of thumb next to your numbers. */
export default function GuidelinesSection() {
  const rows = guidelineRows(usePlan());
  const count = (s: GuidelineStatus) => rows.filter((r) => r.status === s).length;

  return (
    <GlossaryScope>
      <div>
        <SectionHeading title="Guidelines vs you">
          Common rules of thumb for your take-home pay, next to your numbers. The white tick on each bar is the guideline.
        </SectionHeading>
        <div className="gvl">
          <span className="good">
            <b>{count("good")}</b> good
          </span>
          <span className="ok">
            <b>{count("ok")}</b> OK, close to the line
          </span>
          <span className="bad">
            <b>{count("bad")}</b> off track
          </span>
        </div>
        <Card className="gvc">
          <div className="gv" role="table" aria-label="Common guidelines compared with your numbers">
            <div className="gvr gvh" role="row">
              <div role="columnheader">Check</div>
              <div role="columnheader">Guideline</div>
              <div role="columnheader">You</div>
              <div role="columnheader">
                <span className="vh">Bar</span>
              </div>
              <div role="columnheader">Status</div>
            </div>
            {rows.map((r, k) => (
              <Fragment key={r.name}>
                {r.group !== rows[k - 1]?.group && <div className="gvg">{r.group}</div>}
                <div className={`gvr ${r.status}`} role="row">
                  <div className="gvn" role="cell">
                    <b>
                      <G>{r.name}</G>
                    </b>
                    {r.sub && <span>{r.sub}</span>}
                  </div>
                  <div className="gvgl" role="cell">
                    <span className="gvk">Guideline</span>
                    {r.guideline}
                  </div>
                  <div className="gvy" role="cell">
                    <span className="gvk">You</span>
                    <b>{r.display}</b>
                  </div>
                  <div className="gvb" role="cell" aria-hidden="true">
                    <i style={{ width: `${r.fill * 100}%` }} />
                    <s style={{ left: `${r.tick * 100}%` }} />
                  </div>
                  <div className="gvs" role="cell">
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d={STATUS[r.status].icon} />
                    </svg>
                    {STATUS[r.status].label}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </Card>
      </div>
    </GlossaryScope>
  );
}

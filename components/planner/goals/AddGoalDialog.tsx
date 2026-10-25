"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/payslips/Modal";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { GOAL_TEMPLATES } from "@/lib/planner/goalTemplates";
import { goalHref, newGoal } from "@/lib/planner/goals";

const GROUPS: { title: string; kinds: string[] }[] = [
  { title: "Big purchases", kinds: ["house", "car", "furniture", "bike", "tires"] },
  { title: "Electronics", kinds: ["tech", "tablet", "headphones", "watch", "tv", "soundbar", "ps5", "xbox", "switch2", "handheld", "gamingpc", "vr", "gopro", "camera", "drone"] },
  { title: "Life events", kinds: ["wedding", "ring", "baby", "moving", "pet"] },
  { title: "Travel and time off", kinds: ["trip", "visit", "holidays", "sabbatical"] },
  { title: "Health and wellbeing", kinds: ["health", "glasses", "fitness"] },
  { title: "Money and safety", kinds: ["emergency", "account", "education"] },
  { title: "Anything else", kinds: ["custom"] },
];

/** Pick a template; the goal is created with typical numbers and opened so you can make it yours. */
export default function AddGoalDialog({ onClose }: { onClose: () => void }) {
  const { plan, addGoal } = usePlanner();
  const router = useRouter();

  return (
    <Modal title="Add a saving goal" onClose={onClose} wide>
      <p className="ag-intro">Each template asks for the numbers that matter for that kind of goal, filled in with typical Quebec costs to start from.</p>
      {GROUPS.map((grp) => (
        <section key={grp.title} className="ag-grp">
          <h3>{grp.title}</h3>
          <div className="ag-grid">
            {grp.kinds.map((k) => {
              const t = GOAL_TEMPLATES.find((x) => x.kind === k)!;
              return (
                <button
                  key={k}
                  type="button"
                  className={`ag-t${k === "custom" ? " custom" : ""}`}
                  onClick={() => {
                    const id = addGoal(newGoal(t, plan));
                    onClose();
                    router.push(goalHref({ id }));
                  }}
                >
                  <b>{t.name}</b>
                  <span>{t.blurb}</span>
                  <em>{t.typical}</em>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </Modal>
  );
}

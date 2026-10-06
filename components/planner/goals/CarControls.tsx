"use client";

import { GlossaryScope, G } from "@/components/glossary/GlossaryText";
import { usePlan } from "@/components/providers/PlannerProvider";
import { PlannerCheckbox, PlannerSlider } from "@/components/planner/shared/controls";
import { Note } from "@/components/ui/text";
import { money } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { carPlan } from "@/lib/planner/car";

/** Whether your savings cover the down payment when you plan to buy. */
function DownPaymentCheck() {
  const plan = usePlan();
  const car = carPlan(plan);
  const when = car.buy === 0 ? "now" : monthLabel(car.buy);
  const ok = car.savedAtBuy >= car.down;
  return (
    <GlossaryScope>
      <div className={`msg ${ok ? "ok" : "no"}`}>
        <G>
          By <b>{when}</b> your savings are projected at <b>{money(car.savedAtBuy)}</b>
          {ok ? (
            <>
              , enough for the <b>{money(car.down)}</b> down payment. After paying it you would have <b>{money(car.savedAtBuy - car.down)}</b> left.
            </>
          ) : (
            <>
              , which is <b>{money(car.down - car.savedAtBuy)}</b> short of the <b>{money(car.down)}</b> down payment.{" "}
              {car.downReady ? (
                <>
                  You would have it by <b>{car.downReady.label}</b>.
                </>
              ) : (
                "Raise your savings or lower the down payment."
              )}
            </>
          )}
        </G>
      </div>
    </GlossaryScope>
  );
}

export default function CarControls() {
  return (
    <div>
      <h3 className="sec">Car</h3>
      <div className="stack">
        <PlannerSlider k="cprice" />
        <PlannerCheckbox k="ctax" label="Add GST and QST (14.975%)" />
        <PlannerSlider k="cdown" />
        <PlannerSlider k="capr" />
        <PlannerSlider k="cterm" />
        <PlannerSlider k="cextra" />
        <PlannerSlider k="cbuy" />
      </div>
      <DownPaymentCheck />
      <Note style={{ marginTop: 12 }}>
        The loan rate is a placeholder. Use the rate in your dealer or bank quote. Insurance, gas, maintenance and dealer fees are not included, so add them to
        your expenses.
      </Note>
    </div>
  );
}

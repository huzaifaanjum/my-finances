"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { investmentPlan } from "@/lib/planner/finance";
import ChartCard from "./ChartCard";
import FasterCard from "./FasterCard";
import MillionaireKpis from "./MillionaireKpis";
import PlanCard from "./PlanCard";
import ReturnsCard from "./ReturnsCard";
import RoadCard from "./RoadCard";
import WhereCard from "./WhereCard";

export default function MillionaireView() {
  const plan = usePlan();
  const invest = investmentPlan(plan);
  return (
    <div className="mil">
      <MillionaireKpis plan={plan} invest={invest} />
      <div className="milg">
        <PlanCard plan={plan} invest={invest} />
        <ChartCard plan={plan} invest={invest} />
      </div>
      <RoadCard plan={plan} invest={invest} />
      <div className="irow">
        <ReturnsCard plan={plan} invest={invest} />
        <FasterCard plan={plan} invest={invest} />
      </div>
      <WhereCard plan={plan} />
    </div>
  );
}

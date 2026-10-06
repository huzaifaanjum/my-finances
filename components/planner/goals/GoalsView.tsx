import { G } from "@/components/glossary/GlossaryText";
import { Panel } from "@/components/ui/text";
import CarControls from "./CarControls";
import CarResults from "./CarResults";
import GoalsCard from "@/components/planner/plan/GoalsCard";

export default function GoalsView() {
  return (
    <Panel title="Goals">
      <p className="sub" style={{ marginBottom: 16 }}>
        <G>When your savings reach a house down payment or a million dollars, and a car: save a down payment, finance the rest, and compare how long it takes and how much extra you pay.</G>
      </p>
      <div className="goal-top">
        <GoalsCard />
      </div>
      <div className="carlay">
        <CarControls />
        <CarResults />
      </div>
    </Panel>
  );
}

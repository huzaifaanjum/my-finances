import { G } from "@/components/glossary/GlossaryText";
import { Panel } from "@/components/ui/text";
import CarControls from "./CarControls";
import CarResults from "./CarResults";

export default function GoalsView() {
  return (
    <Panel title="Goals">
      <p className="sub" style={{ marginBottom: 16 }}>
        <G>One goal for now: a car. Save a down payment, finance the rest, and compare how long it takes and how much extra you pay.</G>
      </p>
      <div className="carlay">
        <CarControls />
        <CarResults />
      </div>
    </Panel>
  );
}

import { Panel, SectionHeading } from "@/components/ui/text";
import GuidelinesSection from "./GuidelinesSection";
import HealthCheck from "./HealthCheck";
import IncomeStreamsCard from "./IncomeStreamsCard";
import IncomeTargetCard from "./IncomeTargetCard";
import PayNeededCard from "./PayNeededCard";
import SeeAlso from "@/components/ui/SeeAlso";
import { MilestonesCard, MoneyMixCard, QuickFacts } from "./SpendingCards";
import WaffleCard from "./WaffleCard";

export default function InsightsView() {
  return (
    <Panel className="flush">
      <div className="ins-wrap">
        <HealthCheck />
        <SeeAlso href="/recommendations" label="Recommendations">
          What to do about it: next steps ranked by what they are worth, where to put your money, and your checklist
        </SeeAlso>
        <div className="irow">
          <WaffleCard />
          <MoneyMixCard />
        </div>
        <GuidelinesSection />
        <div>
          <SectionHeading title="Income target">
            How much take-home pay would make today&apos;s budget fit the guidelines, and which extra income streams could get you there.
          </SectionHeading>
          <div className="irow">
            <IncomeTargetCard />
            <IncomeStreamsCard />
          </div>
          <PayNeededCard />
        </div>
        <div className="cards">
          <MilestonesCard />
        </div>
        <QuickFacts />
      </div>
    </Panel>
  );
}

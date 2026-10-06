import { Panel, SectionHeading } from "@/components/ui/text";
import GuidelinesSection from "./GuidelinesSection";
import HealthCheck from "./HealthCheck";
import IncomeStreamsCard from "./IncomeStreamsCard";
import IncomeTargetCard from "./IncomeTargetCard";
import NextActionsCard from "./NextActionsCard";
import PayNeededCard from "./PayNeededCard";
import { MilestonesCard, MoneyMixCard, QuickFacts, TaxRoomCard } from "./SpendingCards";
import WaffleCard from "./WaffleCard";

export default function InsightsView() {
  return (
    <Panel className="flush">
      <div className="ins-wrap">
        <HealthCheck />
        <div className="irow">
          <WaffleCard />
          <NextActionsCard />
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
          <MoneyMixCard />
          <MilestonesCard />
          <TaxRoomCard />
        </div>
        <QuickFacts />
      </div>
    </Panel>
  );
}

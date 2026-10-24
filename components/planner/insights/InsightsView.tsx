import SeeAlso from "@/components/ui/SeeAlso";
import { Panel, SectionHeading } from "@/components/ui/text";
import GuidelinesSection from "./GuidelinesSection";
import HealthCheck from "./HealthCheck";
import IncomeStreamsCard from "./IncomeStreamsCard";
import IncomeTargetCard from "./IncomeTargetCard";
import KeyInsights from "./KeyInsights";
import PayNeededCard from "./PayNeededCard";
import { MilestonesCard, MoneyMixCard, QuickFacts } from "./SpendingCards";
import WaffleCard from "./WaffleCard";

const SECTIONS: [id: string, label: string][] = [
  ["health", "Health check"],
  ["key-insights", "Key insights"],
  ["budget", "Your budget"],
  ["guidelines", "Guidelines"],
  ["income", "Income target"],
  ["facts", "Milestones and facts"],
];

/** Every insight in the app: budget health, key insights from each tab, and the numbers behind them. */
export default function InsightsView() {
  return (
    <Panel className="flush">
      <nav className="iv-nav" aria-label="On this page">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>
      <div className="ins-wrap">
        <div id="health" className="iv-anchor">
          <HealthCheck />
        </div>
        <KeyInsights />
        <section id="budget" className="iv-anchor">
          <SectionHeading title="Your budget">How your take-home is split, and where the spending goes.</SectionHeading>
          <div className="irow">
            <WaffleCard />
            <MoneyMixCard />
          </div>
        </section>
        <div id="guidelines" className="iv-anchor">
          <GuidelinesSection />
        </div>
        <section id="income" className="iv-anchor">
          <SectionHeading title="Income target">
            How much take-home pay would make today&apos;s budget fit the guidelines, and which extra income streams could get you there.
          </SectionHeading>
          <div className="irow">
            <IncomeTargetCard />
            <IncomeStreamsCard />
          </div>
          <PayNeededCard />
        </section>
        <section id="facts" className="iv-anchor iv-facts">
          <MilestonesCard />
          <QuickFacts />
        </section>
        <SeeAlso href="/recommendations" label="Recommendations">
          What to do about all this: next steps ranked by what they are worth, where to put your money, and your checklist
        </SeeAlso>
      </div>
    </Panel>
  );
}

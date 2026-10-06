import { G } from "@/components/glossary/GlossaryText";
import { Panel } from "@/components/ui/text";

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: "Short term: next 6 months",
    items: [
      ["Automate it.", "Set a transfer on every payday so your surplus leaves chequing before you can spend it."],
      ["Build one month of expenses first.", "This is your emergency fund, and the page shows when you reach it."],
      ["Hold spending at or below your cap.", "Check your first two months against the plan."],
      [
        "Treat bonuses as extra.",
        "Send the signing bonus straight to savings. Probation ends mid-February (6 months from Aug 17). Both signing payments and the incentive depend on you still being employed when they pay out.",
      ],
      ["Keep the full pension match.", "You already contribute the maximum."],
    ],
  },
  {
    title: "Long term: 6 months and beyond",
    items: [
      ["Grow the fund to 3 months of expenses", "before taking investment risk."],
      ["Use a TFSA", "for flexible goals. Check your room in CRA My Account."],
      ["Choose a tax-saving account.", "An FHSA suits a first home, and an RRSP suits a refund."],
      ["Go slowly with ESOP shares.", "Read the match terms on HR Connex first, and keep any amount small to avoid depending on one airline."],
      ["Raise your transfer", "whenever you get a raise or an AIP payout, and review the plan every quarter."],
    ],
  },
];

export default function Recommendations() {
  return (
    <Panel title="Recommendations">
      <div className="recs">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h3>{g.title}</h3>
            <ul>
              {g.items.map(([lead, rest]) => (
                <li key={lead}>
                  <b>{lead}</b> <G>{rest}</G>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

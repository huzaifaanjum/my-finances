import { G } from "@/components/glossary/GlossaryText";
import type { Effort } from "@/lib/planner/retirement";

const EFFORT_LABEL: Record<Effort, string> = {
  auto: "Automatic",
  org: "Grows on its own",
  act: "You must act",
};

export function EffortTag({ effort }: { effort: Effort }) {
  return <span className={`tg ${effort}`}>{EFFORT_LABEL[effort]}</span>;
}

/** One line of a sum: operator, name with effort tag and explanation, amount. */
export default function BreakdownRow({
  op,
  name,
  value,
  effort,
  why,
  total,
}: {
  op: string;
  name: string;
  value: string;
  effort?: Effort;
  why: string;
  total?: boolean;
}) {
  return (
    <div className={`bkr${total ? " tot" : ""}`}>
      <span className="bkop">{op}</span>
      <div className="bkn">
        <b>{name}</b>
        {effort && <EffortTag effort={effort} />}
        <p>
          <G>{why}</G>
        </p>
      </div>
      <div className="bkv">{value}</div>
    </div>
  );
}

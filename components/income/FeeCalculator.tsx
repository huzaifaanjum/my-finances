"use client";

import { useState } from "react";
import k from "@/components/knowledge/knowledge.module.css";
import { Slider } from "@/components/knowledge/ui";
import { money } from "@/lib/format";
import { compareFees, type Region } from "@/lib/income/fees";
import s from "./income.module.css";

const REGIONS: { id: Region; label: string }[] = [
  { id: "ca", label: "Canada" },
  { id: "us", label: "United States" },
  { id: "world", label: "Elsewhere" },
];

function Segment<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="ps-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** What you keep from one sale on each service. */
export default function FeeCalculator() {
  const [price, setPrice] = useState(20);
  const [region, setRegion] = useState<Region>("us");
  const [plan, setPlan] = useState<"once" | "sub">("sub");
  const [cash, setCash] = useState<"keep" | "convert">("keep");
  const rows = compareFees({ price, region, recurring: plan === "sub", convert: cash === "convert" });
  const best = rows[0].fee;
  return (
    <div className={k.demo}>
      <p className={k.demoTitle}>Fee calculator</p>
      <Slider label="Price of one sale" value={price} onChange={setPrice} min={1} max={500} format={(v) => money(v)} />
      <div className={s.segs}>
        <Segment label="Where the customer is" value={region} options={REGIONS} onChange={setRegion} />
        <Segment
          label="Type of sale"
          value={plan}
          options={[
            { id: "once", label: "One-time" },
            { id: "sub", label: "Subscription" },
          ]}
          onChange={setPlan}
        />
        <Segment
          label="Currency"
          value={cash}
          options={[
            { id: "keep", label: "Keep in USD" },
            { id: "convert", label: "Convert to CAD" },
          ]}
          onChange={setCash}
        />
      </div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Service</th>
              <th className={s.num}>You keep</th>
              <th className={s.num}>Fee</th>
              <th className={s.num}>Share</th>
              <th>Global tax</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>
                  {r.name}
                  {r.estimate && " (estimate)"}
                </td>
                <td className={`${s.num} ${r.fee === best ? k.good : ""}`}>{money(r.keep, 2)}</td>
                <td className={s.num}>{money(r.fee, 2)}</td>
                <td className={s.num}>{(r.share * 100).toFixed(1)}%</td>
                <td>{r.mor ? "Handled for you" : "Your job"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={k.note}>
        Compares published rates at one price, and treats dollars as equal across currencies. It doesn&apos;t count disputes, refunds or the cost of doing tax yourself. Subscriptions include Stripe Billing&apos;s 0.7%,
        but not for Managed Payments, where Billing fees may be extra.
      </p>
    </div>
  );
}

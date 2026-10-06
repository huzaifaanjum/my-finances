"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useCloudSync, type SyncStatus } from "@/hooks/useCloudSync";
import type { FlagKey, NumericKey } from "@/lib/planner/config";
import { createDefaultState, ONE_TIME_DEFAULTS } from "@/lib/planner/defaults";
import { buildPlan, type Plan } from "@/lib/planner/projection";
import type { OneTimeItem, OneTimeKind, PlannerState } from "@/lib/planner/types";

interface PlannerActions {
  setNumber: (key: NumericKey, value: number) => void;
  setNumbers: (values: Partial<Record<NumericKey, number>>) => void;
  setFlag: (key: FlagKey, value: boolean) => void;
  setExpense: (group: number, item: number, value: number) => void;
  addOneTime: (kind: OneTimeKind) => void;
  updateOneTime: (kind: OneTimeKind, id: number, patch: Partial<Omit<OneTimeItem, "id">>) => void;
  removeOneTime: (kind: OneTimeKind, id: number) => void;
  /** swap in a whole saved state, e.g. to undo a session of edits */
  replaceState: (state: PlannerState) => void;
}

interface PlannerContextValue extends PlannerActions {
  state: PlannerState;
  plan: Plan;
  sync: SyncStatus;
  /** false until the saved numbers have loaded */
  ready: boolean;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

/** Holds the planner numbers for every page, so they survive navigation, and keeps them synced to the cloud. */
export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlannerState>(createDefaultState);
  const [revision, setRevision] = useState(0);

  const edit = useCallback((fn: (s: PlannerState) => PlannerState) => {
    setState(fn);
    setRevision((r) => r + 1);
  }, []);

  const actions = useMemo<PlannerActions>(
    () => ({
      setNumber: (key, value) => edit((s) => ({ ...s, numbers: { ...s.numbers, [key]: value } })),
      setNumbers: (values) => edit((s) => ({ ...s, numbers: { ...s.numbers, ...values } })),
      setFlag: (key, value) => edit((s) => ({ ...s, flags: { ...s.flags, [key]: value } })),
      setExpense: (group, item, value) =>
        edit((s) => ({
          ...s,
          expenses: s.expenses.map((g, gi) => (gi === group ? g.map((v, ii) => (ii === item ? value : v)) : g)),
        })),
      addOneTime: (kind) =>
        edit((s) => {
          const list = s.oneTime[kind];
          const id = Math.max(0, ...list.map((o) => o.id)) + 1;
          const added: OneTimeItem = { id, ...ONE_TIME_DEFAULTS[kind], month: 0, on: true };
          return { ...s, oneTime: { ...s.oneTime, [kind]: [...list, added] } };
        }),
      updateOneTime: (kind, id, patch) =>
        edit((s) => ({
          ...s,
          oneTime: { ...s.oneTime, [kind]: s.oneTime[kind].map((o) => (o.id === id ? { ...o, ...patch } : o)) },
        })),
      removeOneTime: (kind, id) =>
        edit((s) => ({ ...s, oneTime: { ...s.oneTime, [kind]: s.oneTime[kind].filter((o) => o.id !== id) } })),
      replaceState: (next) => edit(() => next),
    }),
    [edit],
  );

  const { status, ready } = useCloudSync({ state, revision, applyRemote: setState });
  const plan = useMemo(() => buildPlan(state), [state]);

  const value = useMemo<PlannerContextValue>(
    () => ({ ...actions, state, plan, sync: status, ready }),
    [actions, state, plan, status, ready],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used inside <PlannerProvider>");
  return ctx;
}

/** Shortcut for the derived numbers. */
export function usePlan(): Plan {
  return usePlanner().plan;
}

"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useCloudSync, type SyncStatus } from "@/hooks/useCloudSync";
import type { FlagKey, NumericKey } from "@/lib/planner/config";
import { isoDate, planDay, todayIso } from "@/lib/planner/calendar";
import { createDefaultState, nextId, ONE_TIME_DEFAULTS, ONE_TIME_MONTHS } from "@/lib/planner/defaults";
import { buildPlan, currentStep, type Plan } from "@/lib/planner/projection";
import type { CustomGoal, OneTimeItem, OneTimeKind, PayStep, PlannerState, RecurringExpense, RecurringIncome } from "@/lib/planner/types";

interface PlannerActions {
  setNumber: (key: NumericKey, value: number) => void;
  setNumbers: (values: Partial<Record<NumericKey, number>>) => void;
  setFlag: (key: FlagKey, value: boolean) => void;
  /** a new take-home pay from a date on (default today), starting at today's amount */
  addPay: (step?: Partial<Omit<PayStep, "id">>) => void;
  updatePay: (id: number, patch: Partial<Omit<PayStep, "id">>) => void;
  removePay: (id: number) => void;
  /** adds a goal and returns its id */
  addGoal: (goal: Omit<CustomGoal, "id">) => number;
  updateGoal: (id: number, patch: Partial<Omit<CustomGoal, "id">>) => void;
  removeGoal: (id: number) => void;
  /** one template field of a goal */
  setGoalValue: (id: number, key: string, value: number) => void;
  /** a blank row, or a preset such as the incentive */
  addIncome: (preset?: Omit<RecurringIncome, "id">) => void;
  updateIncome: (id: number, patch: Partial<Omit<RecurringIncome, "id">>) => void;
  removeIncome: (id: number) => void;
  addExpense: (group: number) => void;
  updateExpense: (id: string, patch: Partial<Omit<RecurringExpense, "id">>) => void;
  removeExpense: (id: string) => void;
  addOneTime: (kind: OneTimeKind) => void;
  /** changing `date` also moves the item to that plan month */
  updateOneTime: (kind: OneTimeKind, id: number, patch: Partial<Omit<OneTimeItem, "id" | "month">>) => void;
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

/** numbers.net always mirrors the pay step in force today. */
function syncNet(s: PlannerState): PlannerState {
  const step = currentStep(s);
  return step && step.amount !== s.numbers.net ? { ...s, numbers: { ...s.numbers, net: step.amount } } : s;
}

/** Setting "net" edits today's pay step. */
function withNumbers(s: PlannerState, values: Partial<Record<NumericKey, number>>): PlannerState {
  const next = { ...s, numbers: { ...s.numbers, ...values } };
  if (values.net === undefined) return next;
  const id = currentStep(s)?.id;
  return { ...next, pay: s.pay.map((p) => (p.id === id ? { ...p, amount: values.net! } : p)) };
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
      setNumber: (key, value) => edit((s) => withNumbers(s, { [key]: value })),
      setNumbers: (values) => edit((s) => withNumbers(s, values)),
      addPay: (step) =>
        edit((s) => syncNet({ ...s, pay: [...s.pay, { amount: s.numbers.net, date: todayIso(), ...step, id: nextId(s.pay) }] })),
      updatePay: (id, patch) => edit((s) => syncNet({ ...s, pay: s.pay.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePay: (id) => edit((s) => (s.pay.length > 1 ? syncNet({ ...s, pay: s.pay.filter((p) => p.id !== id) }) : s)),
      setFlag: (key, value) => edit((s) => ({ ...s, flags: { ...s.flags, [key]: value } })),
      addGoal: (goal) => {
        // a timestamp id is unique and known right away, so the caller can open the new goal
        const id = Date.now();
        edit((s) => ({ ...s, goals: [...s.goals, { ...goal, id }] }));
        return id;
      },
      updateGoal: (id, patch) => edit((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGoal: (id) => edit((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) })),
      setGoalValue: (id, key, value) =>
        edit((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, values: { ...g.values, [key]: value } } : g)) })),
      addIncome: (preset) =>
        edit((s) => ({ ...s, income: [...s.income, { name: "", amount: 0, every: 1, month: 0, ...preset, id: nextId(s.income) }] })),
      updateIncome: (id, patch) => edit((s) => ({ ...s, income: s.income.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      removeIncome: (id) => edit((s) => ({ ...s, income: s.income.filter((o) => o.id !== id) })),
      addExpense: (group) =>
        edit((s) => {
          const n = Math.max(0, ...s.expenses.map((e) => Number(/^c(\d+)$/.exec(e.id)?.[1] ?? 0))) + 1;
          const added: RecurringExpense = { id: `c${n}`, name: "", amount: 0, every: 1, group, need: group === 0 };
          return { ...s, expenses: [...s.expenses, added] };
        }),
      updateExpense: (id, patch) => edit((s) => ({ ...s, expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      removeExpense: (id) => edit((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) })),
      addOneTime: (kind) =>
        edit((s) => {
          const list = s.oneTime[kind];
          // next month's payday, so a new item shows up on the chart
          const added: OneTimeItem = { id: nextId(list), ...ONE_TIME_DEFAULTS[kind], date: isoDate(1), month: 1 };
          return { ...s, oneTime: { ...s.oneTime, [kind]: [...list, added] } };
        }),
      updateOneTime: (kind, id, patch) =>
        edit((s) => ({
          ...s,
          oneTime: {
            ...s.oneTime,
            [kind]: s.oneTime[kind].map((o) => {
              if (o.id !== id) return o;
              const next = { ...o, ...patch };
              return patch.date ? { ...next, month: planDay(patch.date, ONE_TIME_MONTHS - 1).i } : next;
            }),
          },
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

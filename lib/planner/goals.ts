export const GOALS = [
  { id: "house", name: "House", subtitle: "A first home: the cash you need, when your savings get there, and what the mortgage costs each month." },
  { id: "car", name: "Car", subtitle: "Save a down payment, finance the rest, and compare how long it takes and how much extra you pay." },
] as const;

export type GoalId = (typeof GOALS)[number]["id"];

export const findGoal = (id: string) => GOALS.find((g) => g.id === id);

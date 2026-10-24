// One colour, one meaning, everywhere in the app. The values live as CSS variables in globals.css.
//
// Money you keep is green; extra money on top (bonuses, investment growth) is a lighter green.
// Where gross pay goes has one hue each. Spending is grey. Amber and red are only for warnings and problems.

export const COLOR = {
  /** take-home pay, savings, what's left over */
  keep: "var(--c-keep)",
  /** bonuses (signing, incentive), extra income and investment growth */
  extra: "var(--c-extra)",
  /** income tax */
  tax: "var(--c-tax)",
  /** QPP, EI and QPIP */
  gov: "var(--c-gov)",
  /** Old Age Security and other government benefits in retirement */
  gov2: "var(--c-gov2)",
  /** your pension and retirement savings */
  pension: "var(--c-pension)",
  /** insurance and health cover */
  insurance: "var(--c-ins)",
  /** what Air Canada pays for you */
  employer: "var(--c-employer)",
  /** spending: needs and fixed bills */
  needs: "var(--c-need)",
  /** spending: subscriptions */
  subs: "var(--c-sub)",
  /** spending: wants and day-to-day */
  wants: "var(--c-want)",
  /** status only: needs attention, or a date to act by */
  warn: "var(--promo)",
  /** status only: negative, overdrawn, over budget */
  bad: "var(--neg)",
} as const;

/** Budget groups: fixed bills, subscriptions, day-to-day. */
export const EXPENSE_GROUP_COLORS = [COLOR.needs, COLOR.subs, COLOR.wants] as const;

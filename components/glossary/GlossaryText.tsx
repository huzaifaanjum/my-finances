"use client";

import { Children, cloneElement, createContext, Fragment, isValidElement, useContext, useId, type ReactNode } from "react";
import { splitGlossary } from "@/lib/glossary";
import { useGlossary } from "./GlossaryProvider";

/**
 * A scope is one card, panel or control. Only the first mention of each term inside a scope is underlined.
 * The map records which <G> claimed a term, so a <G> that re-renders on its own keeps its own underline.
 */
const ScopeContext = createContext<Map<number, string> | null>(null);

export function GlossaryScope({ children }: { children: ReactNode }) {
  // A fresh map on every render of the scope: its children then claim terms again, in order.
  const claims = new Map<number, string>();
  return <ScopeContext.Provider value={claims}>{children}</ScopeContext.Provider>;
}

function Term({ term, children }: { term: number; children: string }) {
  const { show, hide } = useGlossary();
  return (
    <span
      className="gl"
      role="button"
      tabIndex={0}
      onMouseEnter={(e) => show(term, e.currentTarget)}
      onMouseLeave={hide}
      onFocus={(e) => show(term, e.currentTarget)}
      onBlur={hide}
      onClick={(e) => {
        e.preventDefault();
        show(term, e.currentTarget);
      }}
    >
      {children}
    </span>
  );
}

/** Elements whose text is never decorated. */
const SKIP = new Set(["button", "option", "select", "input", "textarea", "output", "svg"]);

/** Underlines glossary terms in text children, including text inside inline elements such as <b> or <em>. */
export function G({ children }: { children: ReactNode }) {
  const owner = useId();
  const claims = useContext(ScopeContext);
  const local = new Set<number>();

  const claim = (term: number): boolean => {
    if (local.has(term)) return false;
    local.add(term);
    if (!claims) return true;
    const by = claims.get(term);
    if (by === undefined) claims.set(term, owner);
    return by === undefined || by === owner;
  };

  const walk = (node: ReactNode): ReactNode =>
    Children.map(node, (child) => {
      if (typeof child === "string") {
        return splitGlossary(child).map((part, k) =>
          typeof part === "string" ? part : claim(part.term) ? <Term key={k} term={part.term}>{part.text}</Term> : part.text,
        );
      }
      if (
        isValidElement<{ children?: ReactNode }>(child) &&
        (child.type === Fragment || (typeof child.type === "string" && !SKIP.has(child.type))) &&
        child.props.children !== undefined
      ) {
        return cloneElement(child, undefined, walk(child.props.children));
      }
      return child;
    });

  return <>{walk(children)}</>;
}

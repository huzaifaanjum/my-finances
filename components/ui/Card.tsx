import type { ReactNode } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  wide?: boolean;
  className?: string;
  /** replaces the plain title row, e.g. to put a control next to the title */
  header?: ReactNode;
  children?: ReactNode;
}

export default function Card({ title, description, wide, className = "", header, children }: CardProps) {
  return (
    <GlossaryScope>
      <div className={`card${wide ? " wide" : ""} ${className}`.trim()}>
        {header ?? (
          <>
            {title && (
              <h3>
                <G>{title}</G>
              </h3>
            )}
            {description && (
              <p className="d">
                <G>{description}</G>
              </p>
            )}
          </>
        )}
        {children}
      </div>
    </GlossaryScope>
  );
}

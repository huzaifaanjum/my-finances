import Link from "next/link";
import type { ReactNode } from "react";

/** A one-line pointer to the tab that owns a topic, so pages link instead of repeating each other. */
export default function SeeAlso({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link href={href} className="seealso">
      <span>{children}</span>
      <b>
        {label} <i aria-hidden="true">→</i>
      </b>
    </Link>
  );
}

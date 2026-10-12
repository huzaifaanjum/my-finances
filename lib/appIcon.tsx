import { ImageResponse } from "next/og";

/**
 * The app icon: a green dollar sign on the app's near-black background — same mark as app/icon.svg.
 * `inset` shrinks the mark so it survives the circle/squircle crop of maskable icons.
 */
export function appIcon(size: number, { inset = 0.12 }: { inset?: number } = {}) {
  const mark = size - Math.round(size * inset) * 2;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#09090b" }}>
        <svg width={mark} height={mark} viewBox="0 0 32 32">
          <g fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4.5v23" />
            <path d="M21.5 10.5c0-2.2-2.4-3.5-5.5-3.5s-5.5 1.4-5.5 4.2c0 2.9 2.8 3.6 5.5 4.3s5.5 1.5 5.5 4.5c0 2.8-2.4 4.2-5.5 4.2s-5.5-1.3-5.5-3.5" />
          </g>
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}

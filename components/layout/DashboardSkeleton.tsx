const block = (height: number, width?: string) => ({ height, width });

/** Placeholder shown while the saved numbers load. */
export default function DashboardSkeleton() {
  return (
    <>
      <div className="skel" aria-hidden="true">
        <div className="sk-in">
          <div className="sk-top">
            <div className="sk-b" style={block(34, "min(300px,70%)")} />
            <div className="sk-b" style={block(14, "min(560px,90%)")} />
          </div>
          <div className="sk-kpis">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="sk-b" style={block(92)} />
            ))}
          </div>
          <div className="sk-grid">
            {[
              [70, 70, 300, 240],
              [70, 70, 70, 420],
              [90, 560],
            ].map((col, c) => (
              <div key={c} className="sk-col">
                {col.map((h, i) => (
                  <div key={i} className="sk-b" style={block(h)} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="vh" role="status">
        Loading your numbers
      </span>
    </>
  );
}

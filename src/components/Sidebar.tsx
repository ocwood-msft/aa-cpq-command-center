export type StageId =
  | "overview"
  | "modeling"
  | "contract"
  | "signature"
  | "reconciliation";

const NAV: { id: StageId; label: string; hint: string }[] = [
  { id: "overview", label: "Command Center", hint: "Program KPIs & lifecycle" },
  { id: "modeling", label: "1 · Deal Modeling", hint: "Agencies, RSP, what-if" },
  { id: "contract", label: "2 · Contract Generation", hint: "Fluent / Windward draft" },
  { id: "signature", label: "3 · Signature Routing", hint: "Approval pipeline" },
  { id: "reconciliation", label: "4 · Payout Reconciliation", hint: "Quarter-end close" },
];

export function Sidebar({
  stage,
  onNavigate,
}: {
  stage: StageId;
  onNavigate: (s: StageId) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">AA</div>
        <div>
          <div className="brand-title">Agency CPQ</div>
          <div className="brand-sub">Command Center</div>
        </div>
      </div>
      <nav>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={"nav-item" + (stage === item.id ? " active" : "")}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-label">{item.label}</span>
            <span className="nav-hint">{item.hint}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="footer-label">Source scenario</div>
        <div className="footer-value">American Airlines · Sales &amp; Distribution</div>
        <div className="footer-label" style={{ marginTop: 10 }}>
          Sample data
        </div>
        <div className="footer-value">2026 Programs Model — Midsize TMC.xlsx</div>
      </div>
    </aside>
  );
}

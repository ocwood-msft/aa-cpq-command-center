import { dataset, fmtUSD, fmtPct } from "../data/dataset";
import type { StageId } from "../components/Sidebar";

const LIFECYCLE: {
  id: StageId;
  title: string;
  pain: string;
  desc: string;
}[] = [
  {
    id: "modeling",
    title: "1 · Deal Modeling",
    pain: "Manual · one agency/entity at a time in Excel",
    desc: "~10 analysts model ~700 agencies/yr. Millions of Mosaic rows summarized to ~15 lines per deal. No bonus support, no cross-entity view, no learning loop.",
  },
  {
    id: "contract",
    title: "2 · Contract Generation",
    pain: "Windward / Fluent template fill",
    desc: "Clear automation candidate: an agent that knows the template and drafts the Word contract for review from the modeled terms.",
  },
  {
    id: "signature",
    title: "3 · Signature Routing",
    pain: "Fully manual today",
    desc: "No structured approval flow. Team wants a more sophisticated, DocuSign-style routing and audit trail.",
  },
  {
    id: "reconciliation",
    title: "4 · Payout Reconciliation",
    pain: "~90 days, against the legal payout deadline",
    desc: "Quarter-end: manually compare contract terms to actual flown data and calculate owed commissions. No single source of truth across stages.",
  },
];

export function Overview({ onNavigate }: { onNavigate: (s: StageId) => void }) {
  const k = dataset.program_kpis;
  return (
    <div>
      <h1 className="page-title">American Airlines — Agency CPQ Command Center</h1>
      <p className="page-sub">
        Sales &amp; Distribution / Agency Programs — one pane across deal modeling, contract
        generation, signature routing, and payout reconciliation. Anchored on the job-to-be-done:
        turn a manual, Excel-bound, disconnected lifecycle into a single system that recommends,
        drafts, and learns.
      </p>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-value kpi-accent">{k.channel_revenue_label}</div>
          <div className="kpi-label">Agency channel revenue / year</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{k.one_pct_impact_label}</div>
          <div className="kpi-label">Value of a 1% yield improvement</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{k.agencies_modeled_per_year}</div>
          <div className="kpi-label">Agencies modeled / year by {k.modeling_team_size} analysts</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{k.long_tail_agencies}+</div>
          <div className="kpi-label">Long-tail agencies untouched worldwide</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{k.reconciliation_days} days</div>
          <div className="kpi-label">Quarter-end reconciliation cycle time</div>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-title">CPQ lifecycle — click a stage to open it</h3>
        <div className="lifecycle">
          {LIFECYCLE.map((s) => (
            <div key={s.id} className="lifecycle-step" onClick={() => onNavigate(s.id)}>
              <div className="lifecycle-num">{s.title.split(" ")[0]}</div>
              <div className="lifecycle-title">{s.title.split(" · ")[1]}</div>
              <div className="lifecycle-pain">{s.pain}</div>
              <div className="lifecycle-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-title">
          Sample deal-model coverage — {dataset.generated_from}
        </h3>
        <div className="metric-row">
          <span className="k">Agencies in sample workbook</span>
          <span>{k.sample_agency_count} ({k.sample_bespoke_count} bespoke-tier)</span>
        </div>
        <div className="metric-row">
          <span className="k">Total flown revenue represented</span>
          <span>{fmtUSD(k.sample_total_gross_revenue, false)}</span>
        </div>
        <div className="metric-row">
          <span className="k">Total commission paid (break-even eligible)</span>
          <span>{fmtUSD(k.sample_total_commission_paid, false)}</span>
        </div>
        <div className="metric-row">
          <span className="k">Blended commission rate</span>
          <span>{fmtPct(k.sample_blended_commission_rate_pct)}</span>
        </div>
      </div>
    </div>
  );
}

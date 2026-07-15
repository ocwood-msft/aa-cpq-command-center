import { useMemo, useState } from "react";
import { dataset, fmtUSD, fmtPct } from "../data/dataset";
import type { Agency, EntityRollup } from "../data/types";

function rspPill(rsp: number | null) {
  if (rsp === null) return <span className="pill pill-warn">n/a</span>;
  if (rsp >= 100) return <span className="pill pill-good">{rsp} RSP</span>;
  if (rsp >= 85) return <span className="pill pill-warn">{rsp} RSP</span>;
  return <span className="pill pill-bad">{rsp} RSP</span>;
}

export function DealModeling() {
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"All" | "Bespoke" | "Templated">("All");
  const [selected, setSelected] = useState<Agency | null>(null);

  const rows = useMemo(() => {
    return dataset.agencies.filter((a) => {
      if (tierFilter !== "All" && a.tier !== tierFilter) return false;
      if (query && !a.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, tierFilter]);

  return (
    <div>
      <h1 className="page-title">Deal Modeling</h1>
      <p className="page-sub">
        Model &amp; what-if by agency instead of one entity at a time in Excel — RSP, commission
        rate, and projected payout computed live from the flown-revenue &amp; QSI-performance data.
      </p>

      <div className="tab-row">
        {(["All", "Bespoke", "Templated"] as const).map((t) => (
          <button
            key={t}
            className={"tab-btn" + (tierFilter === t ? " active" : "")}
            onClick={() => setTierFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Search agency…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span style={{ color: "var(--text-dim)", fontSize: 12.5 }}>
          {rows.length} of {dataset.agencies.length} agencies
        </span>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div style={{ maxHeight: 560, overflowY: "auto" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Agency</th>
                <th>Tier</th>
                <th>Flown Revenue</th>
                <th>Commission Paid</th>
                <th>Commission Rate</th>
                <th>Avg RSP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.name} onClick={() => setSelected(a)}>
                  <td>{a.name}</td>
                  <td>
                    <span className={"pill " + (a.tier === "Bespoke" ? "pill-bespoke" : "pill-templated")}>
                      {a.tier}
                    </span>
                  </td>
                  <td>{fmtUSD(a.gross_revenue)}</td>
                  <td>{fmtUSD(a.ttl_be_pmts)}</td>
                  <td>{fmtPct(a.commission_rate_pct)}</td>
                  <td>{rspPill(a.avg_rsp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <AgencyDrawer agency={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AgencyDrawer({ agency, onClose }: { agency: Agency; onClose: () => void }) {
  const marketBaseline = agency.commission_rate_pct;
  const [rate, setRate] = useState(marketBaseline);
  const [entity, setEntity] = useState<EntityRollup>(agency.entities[0]);

  const projectedPayout = (agency.gross_revenue * rate) / 100;
  const roi = agency.be_elig_revenue > 0 ? (projectedPayout / agency.be_elig_revenue) * 100 : 0;
  const delta = rate - marketBaseline;
  const belowMarket = rate < marketBaseline;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <button className="drawer-close" onClick={onClose}>
          Close ✕
        </button>
        <h2 style={{ marginBottom: 4 }}>{agency.name}</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 12.5, marginTop: 0 }}>
          {agency.tier} deal · {agency.entities.length} entities modeled
        </p>

        <div className="panel">
          <h3 className="panel-title">What-if: commission rate</h3>
          <div className="slider-row">
            <label>
              <span>Commission rate override</span>
              <span>{rate.toFixed(2)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={Math.max(3, marketBaseline * 2)}
              step={0.01}
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
            />
          </div>
          <div className="metric-row">
            <span className="k">Market baseline (measured)</span>
            <span>{fmtPct(marketBaseline)}</span>
          </div>
          <div className="metric-row">
            <span className="k">Override delta</span>
            <span>{delta >= 0 ? "+" : ""}{delta.toFixed(2)} pts</span>
          </div>
          <div className="metric-row">
            <span className="k">Projected payout</span>
            <span>{fmtUSD(projectedPayout, false)}</span>
          </div>
          <div className="metric-row">
            <span className="k">Commission rate / ROI on BE-eligible rev</span>
            <span>{roi.toFixed(1)}%</span>
          </div>

          {belowMarket ? (
            <div className="callout callout-warn">
              ⚠ Rate conflict flag: override ({rate.toFixed(2)}%) is below the measured market
              rate ({marketBaseline.toFixed(2)}%) for this agency. Confirm intent before drafting
              the contract.
            </div>
          ) : (
            <div className="callout callout-good">
              ✓ Override is at or above market baseline — no conflict flagged.
            </div>
          )}
        </div>

        <div className="panel">
          <h3 className="panel-title">Entities</h3>
          <div className="tab-row" style={{ flexWrap: "wrap" }}>
            {agency.entities.map((e) => (
              <button
                key={e.entity}
                className={"tab-btn" + (entity.entity === e.entity ? " active" : "")}
                onClick={() => setEntity(e)}
              >
                {e.entity}
              </button>
            ))}
          </div>
          <div className="metric-row">
            <span className="k">Flown revenue</span>
            <span>{fmtUSD(entity.gross_revenue)}</span>
          </div>
          <div className="metric-row">
            <span className="k">Break-even eligible revenue</span>
            <span>{fmtUSD(entity.be_elig_revenue)}</span>
          </div>
          <div className="metric-row">
            <span className="k">Commission paid</span>
            <span>{fmtUSD(entity.ttl_be_pmts)}</span>
          </div>
          <div className="metric-row">
            <span className="k">RSP (actual ÷ QSI share, 100 = fair share)</span>
            <span>{entity.rsp ?? "n/a"}</span>
          </div>

          <h4 style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 16 }}>
            Top markets / ONDs
          </h4>
          <table className="data">
            <thead>
              <tr>
                <th>Market</th>
                <th>Revenue</th>
                <th>Commission</th>
              </tr>
            </thead>
            <tbody>
              {entity.markets.map((m) => (
                <tr key={m.market} style={{ cursor: "default" }}>
                  <td>{m.market}</td>
                  <td>{fmtUSD(m.gross_revenue)}</td>
                  <td>{fmtUSD(m.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

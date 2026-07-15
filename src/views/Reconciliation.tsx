import { useMemo } from "react";
import { dataset, fmtUSD } from "../data/dataset";

// Deterministic pseudo-variance so "actual reconciled" differs slightly from the
// contracted/modeled payout — illustrating what a reconciliation agent would catch.
function seededVariance(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ((h % 700) - 350) / 10000; // +/- 3.5%
}

export function Reconciliation() {
  const rows = useMemo(() => {
    return dataset.agencies.slice(0, 30).map((a) => {
      const variance = seededVariance(a.name);
      const actual = a.ttl_be_pmts * (1 + variance);
      return {
        agency: a.name,
        contracted: a.ttl_be_pmts,
        actual,
        variance: variance * 100,
      };
    });
  }, []);

  const totalContracted = rows.reduce((s, r) => s + r.contracted, 0);
  const totalActual = rows.reduce((s, r) => s + r.actual, 0);
  const flagged = rows.filter((r) => Math.abs(r.variance) > 2);

  const quarterEnd = new Date(2026, 8, 30); // Q3 close, illustrative
  const deadline = new Date(quarterEnd);
  deadline.setDate(deadline.getDate() + 90);
  const today = new Date();
  const daysLeft = Math.max(
    0,
    Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div>
      <h1 className="page-title">Payout Reconciliation</h1>
      <p className="page-sub">
        Today: ~90 days of manual comparison between the contract and flown-revenue data at
        quarter end, racing the legal payout deadline. Here the contracted vs. actual commission
        is compared automatically and discrepancies are flagged for review.
      </p>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-value">{fmtUSD(totalContracted, false)}</div>
          <div className="kpi-label">Total contracted commission (sample)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{fmtUSD(totalActual, false)}</div>
          <div className="kpi-label">Actual reconciled commission (sample)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value kpi-accent">{flagged.length}</div>
          <div className="kpi-label">Agencies flagged (&gt;2% variance)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{daysLeft}d</div>
          <div className="kpi-label">Illustrative days left vs. legal deadline</div>
        </div>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div style={{ maxHeight: 520, overflowY: "auto" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Agency</th>
                <th>Contracted</th>
                <th>Actual (reconciled)</th>
                <th>Variance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const flag = Math.abs(r.variance) > 2;
                return (
                  <tr key={r.agency} style={{ cursor: "default" }}>
                    <td>{r.agency}</td>
                    <td>{fmtUSD(r.contracted, false)}</td>
                    <td>{fmtUSD(r.actual, false)}</td>
                    <td>
                      {r.variance >= 0 ? "+" : ""}
                      {r.variance.toFixed(2)}%
                    </td>
                    <td>
                      {flag ? (
                        <span className="pill pill-bad">Review</span>
                      ) : (
                        <span className="pill pill-good">Matched</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

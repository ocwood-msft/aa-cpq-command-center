import { useMemo, useState } from "react";
import { dataset, fmtUSD, fmtPct } from "../data/dataset";

export function ContractGeneration() {
  const topAgencies = useMemo(() => dataset.agencies.slice(0, 25), []);
  const [agencyName, setAgencyName] = useState(topAgencies[0]?.name ?? "");
  const [generated, setGenerated] = useState(false);

  const agency = dataset.agencies.find((a) => a.name === agencyName) ?? topAgencies[0];
  const today = new Date();
  const effective = new Date(today.getFullYear(), 0, 1).toLocaleDateString();
  const expires = new Date(today.getFullYear(), 11, 31).toLocaleDateString();

  const contractText = `AGENCY INCENTIVE PROGRAM AGREEMENT

Carrier: American Airlines, Inc. ("AA")
Agency: ${agency.name}
Deal Tier: ${agency.tier}
Effective: ${effective}   Expires: ${expires}

1. PROGRAM TERMS
   Entities covered: ${agency.entities.map((e) => e.entity).join(", ")}
   Blended commission rate: ${fmtPct(agency.commission_rate_pct)}
   Break-even eligible revenue basis: ${fmtUSD(agency.be_elig_revenue, false)}

2. RATE SCHEDULE (by entity)
${agency.entities
  .map(
    (e) =>
      `   - Entity ${e.entity}: ${fmtPct(e.commission_rate_pct)} on ${fmtUSD(
        e.gross_revenue,
        false
      )} flown revenue (RSP ${e.rsp ?? "n/a"})`
  )
  .join("\n")}

3. PROJECTED PAYOUT
   Estimated total commission payable for the term: ${fmtUSD(agency.ttl_be_pmts, false)}

4. RECONCILIATION
   Payout reconciled quarterly against actual flown revenue reported via the AA data
   platform. Payment issued within the contractual deadline following quarter close.

5. SIGNATURES
   AA Sales & Distribution: ______________________     Date: __________
   Agency Authorized Signatory: ______________________  Date: __________

--
Drafted from the modeled deal terms. Auto-populated from Deal Modeling stage —
route to Signature for approval before execution.`;

  return (
    <div>
      <h1 className="page-title">Contract Generation</h1>
      <p className="page-sub">
        Replaces the Windward/Fluent template fill: draft the agency contract straight from the
        modeled terms for human review, instead of a separate manual step.
      </p>

      <div className="panel">
        <h3 className="panel-title">Select modeled agency</h3>
        <div className="search-row">
          <select
            className="search-input"
            value={agencyName}
            onChange={(e) => {
              setAgencyName(e.target.value);
              setGenerated(false);
            }}
          >
            {topAgencies.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <button className="btn" onClick={() => setGenerated(true)}>
            Generate contract draft
          </button>
        </div>
        {!generated && (
          <p style={{ color: "var(--text-dim)", fontSize: 12.5 }}>
            Pulls the finalized rate schedule from Deal Modeling and populates the standard
            agency-incentive template — the same document Windward/Fluent produces today, minus
            the manual query wiring.
          </p>
        )}
      </div>

      {generated && (
        <div className="panel">
          <h3 className="panel-title">Draft — {agency.name}</h3>
          <div className="contract-preview">{contractText}</div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button className="btn">Send to Signature Routing →</button>
            <button className="btn secondary">Download .docx (mock)</button>
          </div>
        </div>
      )}
    </div>
  );
}

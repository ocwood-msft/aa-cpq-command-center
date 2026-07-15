import { useMemo } from "react";
import { dataset, fmtUSD } from "../data/dataset";

const STAGES = ["Drafted", "Internal Review", "Sent for Signature", "Executed"] as const;

export function SignatureRouting() {
  const sample = useMemo(() => {
    const agencies = dataset.agencies.slice(0, 16);
    return agencies.map((a, i) => ({
      agency: a.name,
      value: a.ttl_be_pmts,
      stage: STAGES[i % STAGES.length],
      daysInStage: 1 + ((i * 7) % 21),
    }));
  }, []);

  return (
    <div>
      <h1 className="page-title">Signature Routing</h1>
      <p className="page-sub">
        Today this step is fully manual. This board is the DocuSign-style routing &amp; audit
        trail the team wants — one pipeline instead of email/PDF hand-offs, with every contract's
        stage and dwell time visible.
      </p>

      <div className="kanban">
        {STAGES.map((stage) => {
          const items = sample.filter((s) => s.stage === stage);
          return (
            <div key={stage} className="kanban-col">
              <h4>
                {stage} · {items.length}
              </h4>
              {items.map((it) => (
                <div key={it.agency} className="kanban-card">
                  <div className="agency">{it.agency}</div>
                  <div className="meta">
                    {fmtUSD(it.value, false)} · {it.daysInStage}d in stage
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div style={{ color: "var(--text-dim)", fontSize: 12 }}>No contracts</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
